import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { scheduleReview } from './learning'
import { supabase } from './supabase'
import { useSession } from './session'
import { classifyRemoteError, parseRemotePayload, profileFromRow, type ProfileState } from './authLogic'
import { saveProfileRow } from './profile'
import { deleteEssay, deleteEssayDirect } from './ai'
import {
  draftToSaveArgs,
  essayRowToDraft,
  mergeImages,
  splitImages,
  studyCardRowToCard,
  userPromptFilePath,
  userPromptRowToPrompt,
  USER_PROMPT_BUCKET,
  type Card,
  type CustomPrompt,
  type Draft,
  type EssayRow,
  type StudyCardRow,
  type Task,
  type TaskImage,
  type UserPromptRow,
} from './sync'

export type { Card, CustomPrompt, Draft, Task, TaskImage }

type State = { drafts: Draft[]; cards: Card[]; prompts: CustomPrompt[]; profile: ProfileState }
const initial: State = { drafts: [], cards: [], prompts: [], profile: { name: '', target: '7.0', feedback: 'en' } }

/** Mỗi bản nháp: client id -> essay id + draft_version (optimistic concurrency). */
type RemoteMeta = { essayId: string; version: number }

type Store = {
  state: State
  ready: boolean
  error: string
  suspended: boolean
  signedIn: boolean
  update: (fn: (state: State) => State) => Promise<void>
  saveDraft: (draft: Draft, expected: number) => Promise<number>
  addCard: (card: Pick<Card, 'term' | 'meaning' | 'example' | 'kind'> & { tags?: string[] }) => Promise<void>
  review: (id: string, remembered: boolean) => Promise<void>
  addPrompt: (prompt: Omit<CustomPrompt, 'id' | 'createdAt'>) => Promise<CustomPrompt>
  removePrompt: (id: string) => Promise<void>
  removeDraft: (id: string) => Promise<void>
  /** Tham chiếu bài trong database: cần cho Edge Function (submit-essay, prepare-upload). */
  remoteRef: (draftId: string) => { essayId: string; version: number } | null
}

const Context = createContext<Store | null>(null)

let database: Promise<IDBDatabase> | undefined
function db() {
  return database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('ielts-studio', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('state')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transact(update?: (state: State) => State): Promise<State> {
  const database = await db()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('state', update ? 'readwrite' : 'readonly')
    const store = transaction.objectStore('state')
    const request = store.get('app')
    let state: State
    let failure: unknown
    request.onsuccess = () => {
      try {
        state = { ...structuredClone(initial), ...(request.result ?? {}) }
        if (update) { state = update(state); store.put(state, 'app') }
      } catch (error) { failure = error; transaction.abort() }
    }
    transaction.oncomplete = () => resolve(state)
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error('Storage unavailable'))
    transaction.onerror = () => reject(transaction.error)
  })
}

/** Ghi toàn bộ state xuống IndexedDB — dùng làm cache offline. */
async function cache(state: State) {
  await transact(() => state)
}

function dataUrlToBytes(url: string): { bytes: Uint8Array; mime: string } | null {
  const match = /^data:([^;,]+);base64,(.*)$/.exec(url)
  if (!match) return null
  const binary = atob(match[2])
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return { bytes, mime: match[1] }
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer)
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

/** Tạo signed URL ngắn hạn cho tệp đính kèm của đề tự nhập. */
async function hydrateUserPrompts(rows: UserPromptRow[]): Promise<CustomPrompt[]> {
  return Promise.all(rows.map(async row => {
    if (!row.file_path) return userPromptRowToPrompt(row)
    const { data } = await supabase.storage.from(USER_PROMPT_BUCKET).createSignedUrl(row.file_path, 3600)
    return userPromptRowToPrompt(row, data?.signedUrl ?? '')
  }))
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const { session, loading: sessionLoading } = useSession()
  const [state, setState] = useState<State>(initial)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [suspended, setSuspended] = useState(false)
  const current = useRef<State>(initial)
  const meta = useRef(new Map<string, RemoteMeta>())
  const migrated = useRef('')
  const userId = session?.user.id ?? null

  const commit = useCallback((next: State) => {
    current.current = next
    setState(next)
  }, [])

  const announce = useCallback(() => {
    const channel = new BroadcastChannel('ielts-studio')
    channel.postMessage('changed')
    channel.close()
  }, [])

  const fail = useCallback((failure: unknown): never => {
    if (failure instanceof Error && failure.message === 'conflict') {
      setError('conflict')
      throw failure
    }
    setError('storage')
    throw failure
  }, [])

  // Nguồn sự thật: Supabase khi đã đăng nhập, IndexedDB khi chưa.
  const loadRemote = useCallback(async (local?: State): Promise<State> => {
    const [essayRows, cardRows, profileRow, promptRows] = await Promise.all([
      supabase.from('essays').select('*').then(({ data }) => (data ?? []) as EssayRow[]),
      supabase.from('study_cards').select('*').then(({ data }) => (data ?? []) as StudyCardRow[]),
      supabase.from('profiles').select('*').eq('id', userId ?? '').maybeSingle().then(({ data }) => data),
      supabase.from('user_prompts').select('*').then(({ data }) => (data ?? []) as UserPromptRow[]),
    ])
    const nextMeta = new Map<string, RemoteMeta>()
    const drafts = essayRows.map(row => {
      const draft = essayRowToDraft(row)
      nextMeta.set(draft.id, { essayId: row.id, version: row.draft_version })
      return draft
    })
    meta.current = nextMeta
    // Ảnh chưa đồng bộ chỉ có trong IndexedDB → giữ lại khi nạp từ database.
    if (local) {
      const localById = new Map(local.drafts.map(draft => [draft.id, draft]))
      for (const draft of drafts) {
        const cached = localById.get(draft.id)
        if (cached) draft.images = mergeImages(draft.images, cached.images)
      }
    }
    const cards = cardRows.map(studyCardRowToCard)
    const profile = profileFromRow(profileRow as Parameters<typeof profileFromRow>[0])
    const prompts = await hydrateUserPrompts(promptRows)
    return { drafts, cards, prompts, profile }
  }, [userId])

  /** Đẩy dữ liệu chỉ có trong IndexedDB lên Supabase (chạy một lần khi đăng nhập). */
  const migrateLocal = useCallback(async (local: State, remote: State) => {
    const remoteDraftIds = new Set(remote.drafts.map(draft => draft.id))
    for (const draft of local.drafts.filter(item => !remoteDraftIds.has(item.id))) {
      const { data, error: failure } = await supabase.rpc('save_draft', {
        ...draftToSaveArgs(draft, null, local.profile.feedback),
        p_essay_id: null,
        p_draft: { client_id: draft.id },
      })
      if (failure) continue
      const result = data as { essay_id: string; draft_version: number }
      meta.current.set(draft.id, { essayId: result.essay_id, version: result.draft_version })
    }
    const remoteTerms = new Set(remote.cards.map(card => `${card.term.trim().toLocaleLowerCase()}::${card.kind}`))
    for (const card of local.cards.filter(item => !remoteTerms.has(`${item.term.trim().toLocaleLowerCase()}::${item.kind}`))) {
      await supabase.rpc('save_study_card', {
        p_kind: card.kind,
        p_front: card.term,
        p_back: card.meaning,
        p_example: card.example,
        p_dedupe_key: null,
        p_tags: [],
      })
    }
    // Đề tự nhập chỉ có trong IndexedDB → đẩy lên bảng user_prompts.
    const remotePromptIds = new Set(remote.prompts.map(prompt => prompt.id))
    for (const prompt of local.prompts.filter(item => !remotePromptIds.has(item.id))) {
      await addPrompt(prompt).catch(() => {})
    }
  }, [userId])

  const load = useCallback(async () => {
    if (!userId) {
      const value = await transact()
      commit(value)
      setReady(true)
      return
    }
    try {
      const local = await transact()
      const remote = await loadRemote(local)
      if (migrated.current !== userId) {
        migrated.current = userId
        await migrateLocal(local, remote)
      }
      const merged = await loadRemote(local)
      commit(merged)
      setReady(true)
    } catch {
      const value = await transact()
      commit(value)
      setError('storage')
      setReady(true)
    }
  }, [userId, commit, loadRemote, migrateLocal])

  useEffect(() => {
    if (sessionLoading) return
    void load()
  }, [sessionLoading, load])

  // Đồng bộ nhiều tab: nguồn sự thật vẫn là database.
  useEffect(() => {
    const channel = new BroadcastChannel('ielts-studio')
    channel.onmessage = () => { void load() }
    return () => channel.close()
  }, [load])

  // Realtime: thay đổi từ thiết bị khác được nạp lại từ database.
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`ielts-studio-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'essays', filter: `user_id=eq.${userId}` }, () => { void load() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_cards', filter: `user_id=eq.${userId}` }, () => { void load() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_prompts', filter: `user_id=eq.${userId}` }, () => { void load() })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [userId, load])

  const handleRemoteError = useCallback((failure: unknown): never => {
    const kind = classifyRemoteError(failure)
    if (kind === 'suspended') {
      setSuspended(true)
      setError('')
      throw new Error('suspended')
    }
    if (kind === 'conflict') {
      setError('conflict')
      throw new Error('conflict')
    }
    setError('storage')
    throw new Error('storage')
  }, [])

  async function update(fn: (state: State) => State) {
    if (!userId) {
      // Chưa đăng nhập: đọc–ghi atomic trong IndexedDB như bản cũ.
      try {
        const value = await transact(fn)
        commit(value)
        setError('')
        announce()
      } catch (failure) {
        fail(failure)
      }
      return
    }
    const previous = current.current
    const next = fn(previous)
    if (next === previous) return
    commit(next)
    try {
      await cache(next)
    } catch (failure) {
      fail(failure)
    }
    try {
      await syncDiff(previous, next)
      const refreshed = await loadRemote(next)
      commit(refreshed)
      setError('')
      announce()
    } catch (failure) {
      handleRemoteError(failure)
    }
  }

  /** Đẩy phần thay đổi của state lên Supabase (dùng cho route không có RPC riêng). */
  async function syncDiff(previous: State, next: State) {
    if (next.profile.name !== previous.profile.name || next.profile.target !== previous.profile.target || next.profile.feedback !== previous.profile.feedback) {
      try {
        await saveProfileRow(userId ?? '', next.profile)
      } catch (failure) {
        handleRemoteError(failure)
      }
    }
    for (const draft of previous.drafts.filter(item => !next.drafts.some(keep => keep.id === item.id))) {
      const remote = meta.current.get(draft.id)
      if (!remote) continue
      const { error: failure } = await supabase.from('essays').delete().eq('id', remote.essayId)
      if (failure) handleRemoteError(failure)
      meta.current.delete(draft.id)
    }
    for (const card of previous.cards.filter(item => !next.cards.some(keep => keep.id === item.id))) {
      const { error: failure } = await supabase.from('study_cards').delete().eq('id', card.id)
      if (failure) handleRemoteError(failure)
    }
  }

  async function saveDraft(draft: Draft, expected: number) {
    const timestamp = Math.max(Date.now(), expected + 1)
    if (!userId) {
      const existing = current.current.drafts.find(item => item.id === draft.id)
      if ((existing?.updatedAt ?? 0) !== expected) {
        setError('conflict')
        throw new Error('conflict')
      }
      const next = { ...current.current, drafts: [{ ...draft, updatedAt: timestamp }, ...current.current.drafts.filter(item => item.id !== draft.id)] }
      commit(next)
      try { await cache(next) } catch (failure) { fail(failure) }
      announce()
      return timestamp
    }
    let remote = meta.current.get(draft.id)
    // Bài mới chưa có hàng trong DB mà đang có ảnh chưa đồng bộ: tạo hàng trước
    // để ảnh có essayId để gắn vào. Không có bước này, lần lưu đầu tiên sẽ
    // bỏ mất ảnh và Task 1 không chấm được.
    if (!remote?.essayId && draft.images.some(image => !image.synced)) {
      const created = await createRemote(draft)
      remote = { essayId: created.essay_id, version: created.draft_version }
      meta.current.set(draft.id, remote)
    }
    const images = await syncImages(draft, remote?.essayId)
    const { data, error: failure } = await supabase.rpc('save_draft', {
      ...draftToSaveArgs(draft, remote?.version ?? null, current.current.profile.feedback),
      p_essay_id: remote?.essayId ?? null,
      p_draft: { client_id: draft.id, images: images.synced },
    })
    if (failure) handleRemoteError(failure)
    const result = data as { essay_id: string; draft_version: number }
    meta.current.set(draft.id, { essayId: result.essay_id, version: result.draft_version })
    const next = { ...current.current, drafts: [{ ...draft, images: images.all, updatedAt: timestamp }, ...current.current.drafts.filter(item => item.id !== draft.id)] }
    commit(next)
    try { await cache(next) } catch (problem) { fail(problem) }
    announce()
    return timestamp
  }

  /** Tạo hàng bài viết mới trong DB — chỉ dùng để lấy essay_id cho ảnh gắn vào. */
  async function createRemote(draft: Draft): Promise<{ essay_id: string; draft_version: number }> {
    const { data, error: failure } = await supabase.rpc('save_draft', {
      ...draftToSaveArgs(draft, null, current.current.profile.feedback),
      p_essay_id: null,
      p_draft: { client_id: draft.id, images: [] },
    })
    if (failure) handleRemoteError(failure)
    return data as { essay_id: string; draft_version: number }
  }

  /**
   * Ảnh đề bài đi qua Edge Function prepare-upload. Hiện function chưa tồn tại nên
   * mọi lời gọi đều thất bại → ảnh được giữ ở IndexedDB với nhãn "chưa đồng bộ".
   */
  async function syncImages(draft: Draft, essayId: string | undefined): Promise<{ synced: { name: string; path: string; assetId?: string }[]; all: TaskImage[] }> {
    const pending = draft.images.filter(image => !image.synced)
    if (!pending.length) {
      const split = splitImages(draft.images)
      return { synced: split.synced, all: draft.images }
    }
    const synced: { name: string; path: string; assetId?: string }[] = []
    const all: TaskImage[] = []
    for (const image of draft.images) {
      if (image.synced) {
        if (image.path) synced.push({ name: image.name, path: image.path, assetId: image.assetId })
        all.push(image)
        continue
      }
      const decoded = dataUrlToBytes(image.url)
      // Chưa có Edge Function prepare-upload → giữ ảnh trong IndexedDB (chưa đồng bộ).
      all.push({ ...image, synced: false })
      if (!decoded || !essayId) continue
      try {
        const { data, error: failure } = await supabase.functions.invoke('prepare-upload', {
          body: { essayId, mimeType: decoded.mime, byteSize: decoded.bytes.byteLength, sha256: await sha256(decoded.bytes) },
        })
        if (failure || !data) continue
        const prepared = data as { assetId?: string; objectPath?: string; token?: string }
        if (!prepared.objectPath) continue
        const { error: uploadFailure } = await supabase.storage.from('essay-images').uploadToSignedUrl(prepared.objectPath, prepared.token ?? '', new Blob([decoded.bytes as unknown as BlobPart], { type: decoded.mime }))
        if (uploadFailure) continue
        synced.push({ name: image.name, path: prepared.objectPath, assetId: prepared.assetId })
        all[all.length - 1] = { ...image, synced: true, path: prepared.objectPath, assetId: prepared.assetId }
      } catch {
        // Edge Function chưa tồn tại → giữ ảnh trong IndexedDB (chưa đồng bộ).
      }
    }
    return { synced, all }
  }

  async function addCard(card: Pick<Card, 'term' | 'meaning' | 'example' | 'kind'> & { tags?: string[] }) {
    const tags = card.tags ?? []
    if (!userId) {
      const next = { ...current.current, cards: current.current.cards.some(item => item.term.trim().toLocaleLowerCase() === card.term.trim().toLocaleLowerCase() && item.kind === card.kind) ? current.current.cards : [...current.current.cards, { ...card, tags, term: card.term.trim(), id: crypto.randomUUID(), level: 0, dueAt: Date.now() }] }
      commit(next)
      try { await cache(next) } catch (failure) { fail(failure) }
      announce()
      return
    }
    const { data, error: failure } = await supabase.rpc('save_study_card', {
      p_kind: card.kind,
      p_front: card.term,
      p_back: card.meaning,
      p_example: card.example,
      p_dedupe_key: null,
      p_tags: tags,
    })
    if (failure) handleRemoteError(failure)
    const result = data as { card_id: string; level: number; due_at: string }
    const incoming: Card = {
      id: result.card_id,
      term: card.term.trim(),
      meaning: card.meaning,
      example: card.example,
      kind: card.kind,
      tags,
      level: result.level ?? 0,
      dueAt: Date.parse(result.due_at) || Date.now(),
    }
    const duplicate = current.current.cards.find(item => item.term.trim().toLocaleLowerCase() === incoming.term.toLocaleLowerCase() && item.kind === incoming.kind)
    const cards = duplicate ? current.current.cards.map(item => (item.id === duplicate.id ? incoming : item)) : [incoming, ...current.current.cards]
    const next = { ...current.current, cards }
    commit(next)
    try { await cache(next) } catch (problem) { fail(problem) }
    announce()
  }

  async function review(id: string, remembered: boolean) {
    if (!userId) {
      const next = { ...current.current, cards: current.current.cards.map(card => card.id === id && card.dueAt <= Date.now() ? { ...card, ...scheduleReview(card.level, remembered) } : card) }
      commit(next)
      try { await cache(next) } catch (failure) { fail(failure) }
      announce()
      return
    }
    const { data, error: failure } = await supabase.rpc('review_card', {
      p_card_id: id,
      p_remembered: remembered,
      p_request_id: crypto.randomUUID(),
    })
    if (failure) {
      // card_not_due = thẻ chưa đến hạn ôn, không phải xung đột phiên bản.
      if (parseRemotePayload(failure).code === 'card_not_due') return
      handleRemoteError(failure)
    }
    const result = data as { level: number; due_at: string; replayed: boolean }
    const next = {
      ...current.current,
      cards: current.current.cards.map(card => card.id === id ? { ...card, level: result.level, dueAt: Date.parse(result.due_at) || card.dueAt } : card),
    }
    commit(next)
    try { await cache(next) } catch (problem) { fail(problem) }
    announce()
  }

  async function addPrompt(prompt: Omit<CustomPrompt, 'id' | 'createdAt'>) {
    if (!userId) {
      const created: CustomPrompt = { ...prompt, id: crypto.randomUUID(), createdAt: Date.now() }
      const next = { ...current.current, prompts: [created, ...current.current.prompts] }
      commit(next)
      try { await cache(next) } catch (failure) { fail(failure) }
      announce()
      return created
    }
    const id = crypto.randomUUID()
    let filePath: string | null = null
    if (prompt.file?.url) {
      const decoded = dataUrlToBytes(prompt.file.url)
      if (decoded) {
        filePath = userPromptFilePath(userId, id, prompt.file.name)
        const { error: failure } = await supabase.storage.from(USER_PROMPT_BUCKET).upload(filePath, new Blob([decoded.bytes as unknown as BlobPart], { type: decoded.mime }))
        if (failure) filePath = null
      }
    }
    const { data, error: failure } = await supabase
      .from('user_prompts')
      .insert({
        id,
        task_type: prompt.task,
        title: prompt.title,
        prompt_text: prompt.text,
        reference_data: prompt.reference,
        file_path: filePath,
        file_name: filePath ? prompt.file?.name ?? null : null,
        file_kind: filePath ? prompt.file?.kind ?? null : null,
      })
      .select('*')
      .maybeSingle()
    if (failure) handleRemoteError(failure)
    const row = (data ?? { id, task_type: prompt.task, title: prompt.title, prompt_text: prompt.text, reference_data: prompt.reference, file_path: filePath, file_name: prompt.file?.name ?? null, file_kind: prompt.file?.kind ?? null, created_at: new Date().toISOString() }) as UserPromptRow
    const created = userPromptRowToPrompt(row, prompt.file?.url ?? '')
    const next = { ...current.current, prompts: [created, ...current.current.prompts] }
    commit(next)
    try { await cache(next) } catch (problem) { fail(problem) }
    announce()
    return created
  }

  async function removePrompt(id: string) {
    if (!userId) {
      const next = { ...current.current, prompts: current.current.prompts.filter(item => item.id !== id) }
      commit(next)
      try { await cache(next) } catch (failure) { fail(failure) }
      announce()
      return
    }
    const target = current.current.prompts.find(item => item.id === id)
    const { error: failure } = await supabase.from('user_prompts').delete().eq('id', id)
    if (failure) handleRemoteError(failure)
    if (target?.file?.path) {
      await supabase.storage.from(USER_PROMPT_BUCKET).remove([target.file.path])
    }
    const next = { ...current.current, prompts: current.current.prompts.filter(item => item.id !== id) }
    commit(next)
    try { await cache(next) } catch (problem) { fail(problem) }
    announce()
  }

  /**
   * Xoá bài viết. Khi đã đăng nhập: gọi Edge Function delete-essay để huỷ job,
   * dọn Storage rồi xoá bản ghi. Nếu function lỗi thì xoá thẳng trong database.
   */
  async function removeDraft(id: string) {
    const remote = meta.current.get(id)
    if (userId && remote) {
      const result = await deleteEssay(remote.essayId)
      if (!result.ok) await deleteEssayDirect(remote.essayId)
      meta.current.delete(id)
    }
    const next = { ...current.current, drafts: current.current.drafts.filter(item => item.id !== id) }
    commit(next)
    try { await cache(next) } catch (failure) { fail(failure) }
    announce()
  }

  /** Tham chiếu bài trong database theo client id — dùng cho Edge Function. */
  const remoteRef = useCallback((draftId: string) => meta.current.get(draftId) ?? null, [])

  return <Context.Provider value={{ state, ready, error, suspended, signedIn: Boolean(userId), update, saveDraft, addCard, review, addPrompt, removePrompt, removeDraft, remoteRef }}>{children}</Context.Provider>
}

/** Tham chiếu bài trong database (essay id + phiên bản) theo client id của nháp. */
export function useRemoteRef() {
  const { remoteRef } = useStore()
  return remoteRef
}

export function useStore() {
  const value = useContext(Context)
  if (!value) throw new Error('StoreProvider missing')
  return value
}
