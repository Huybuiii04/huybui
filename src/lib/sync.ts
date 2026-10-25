// Logic thuần để ánh xạ dữ liệu Supabase <-> mô hình của app. Không phụ thuộc React/network.

import { normalizeBand } from './authLogic.ts'

export type Task = 'task2' | 'academic_task1' | 'general_task1'

export type TaskImage = { name: string; url: string; synced?: boolean; path?: string; assetId?: string }

export type Draft = {
  id: string
  title: string
  task: Task
  subtype: string
  prompt: string
  text: string
  reference: string
  images: TaskImage[]
  target: string
  updatedAt: number
}

export type Card = {
  id: string
  term: string
  meaning: string
  example: string
  kind: 'vocabulary' | 'structure' | 'error'
  level: number
  dueAt: number
}

export type CustomPrompt = {
  id: string
  task: Task
  title: string
  text: string
  reference: string
  file?: { name: string; kind: 'image' | 'pdf'; url: string; path?: string }
  createdAt: number
}

export type ProfileState = { name: string; target: string; feedback: string }

export type EssayRow = {
  id: string
  title: string
  task_type: string
  subtype: string
  prompt_text: string
  body_text: string
  reference_data: string
  target_band: number | string | null
  draft: unknown
  draft_version: number
  updated_at: string
}

export type StudyCardRow = {
  id: string
  kind: string
  front: string
  back: string
  example: string
  level: number
  due_at: string
}

/** Hàng của bảng `user_prompts` — đề bài do chính người dùng nhập. */
export type UserPromptRow = {
  id: string
  task_type: string
  title: string
  prompt_text: string
  reference_data: string
  file_path: string | null
  file_name: string | null
  file_kind: string | null
  created_at: string
}

export const USER_PROMPT_BUCKET = 'user-prompt-media'

/** Hàng user_prompts -> đề của bạn trong app. */
export function userPromptRowToPrompt(row: UserPromptRow, fileUrl = ''): CustomPrompt {
  const kind = row.file_kind === 'pdf' ? 'pdf' : 'image'
  return {
    id: row.id,
    task: toTask(row.task_type),
    title: row.title,
    text: row.prompt_text,
    reference: row.reference_data,
    file: row.file_path && row.file_name ? { name: row.file_name, kind, url: fileUrl, path: row.file_path } : undefined,
    createdAt: Date.parse(row.created_at) || Date.now(),
  }
}

/** Đường dẫn trong Storage cho tệp đính kèm của đề tự nhập. */
export function userPromptFilePath(userId: string, promptId: string, fileName: string): string {
  const safe = fileName.replace(/[^A-Za-z0-9._-]/g, '_')
  return `${userId}/${promptId}/${safe}`
}

const TASKS: Task[] = ['task2', 'academic_task1', 'general_task1']

export function toTask(value: string): Task {
  return TASKS.includes(value as Task) ? (value as Task) : 'task2'
}

/** client_id lưu trong cột jsonb `draft` để giữ nguyên URL /app/write?id=... giữa các phiên. */
export function draftClientId(row: EssayRow): string {
  const payload = row.draft as { client_id?: unknown } | null
  return typeof payload?.client_id === 'string' && payload.client_id ? payload.client_id : row.id
}

/** Ảnh đã nằm trong Storage — khai báo theo path, URL ký sẽ tạo sau. */
export function syncedImages(row: EssayRow): { name: string; path: string; assetId?: string }[] {
  const payload = row.draft as { images?: unknown } | null
  if (!Array.isArray(payload?.images)) return []
  return payload.images.flatMap(item => {
    const entry = item as { name?: unknown; path?: unknown; assetId?: unknown }
    if (typeof entry.name !== 'string' || typeof entry.path !== 'string') return []
    return [typeof entry.assetId === 'string'
      ? { name: entry.name, path: entry.path, assetId: entry.assetId }
      : { name: entry.name, path: entry.path }]
  })
}

export function essayRowToDraft(row: EssayRow): Draft {
  return {
    id: draftClientId(row),
    title: row.title ?? '',
    task: toTask(row.task_type),
    subtype: row.subtype ?? '',
    prompt: row.prompt_text ?? '',
    text: row.body_text ?? '',
    reference: row.reference_data ?? '',
    images: syncedImages(row).map(image => ({ name: image.name, url: '', synced: true, path: image.path, assetId: image.assetId })),
    target: normalizeBand(row.target_band),
    updatedAt: Date.parse(row.updated_at) || Date.now(),
  }
}

/** Tham số cho RPC save_draft. */
export function draftToSaveArgs(draft: Draft, version: number | null, feedbackLocale: string) {
  return {
    p_essay_id: null,
    p_expected_version: version,
    p_task_type: draft.task,
    p_subtype: draft.subtype,
    p_title: draft.title,
    p_prompt_text: draft.prompt,
    p_body_text: draft.text,
    p_reference_data: draft.reference,
    p_target_band: Number(draft.target) || 7,
    p_feedback_locale: feedbackLocale,
    p_draft: { client_id: draft.id },
  }
}

export function dbCardKindToCard(kind: string): Card['kind'] {
  if (kind === 'structure' || kind === 'error') return kind
  return 'vocabulary'
}

export function cardKindToDb(kind: Card['kind']): 'vocabulary' | 'collocation' | 'structure' | 'error' {
  return kind
}

export function studyCardRowToCard(row: StudyCardRow): Card {
  return {
    id: row.id,
    term: row.front,
    meaning: row.back,
    example: row.example ?? '',
    kind: dbCardKindToCard(row.kind),
    level: row.level ?? 0,
    dueAt: Date.parse(row.due_at) || Date.now(),
  }
}

/** Khoá so sánh để biết ảnh đã thử đồng bộ chưa. */
export function imageKey(image: TaskImage): string {
  return `${image.name}:${image.url.length}:${image.synced ? 1 : 0}`
}

/**
 * Ảnh chưa đồng bộ được giữ trong IndexedDB với nhãn "chưa đồng bộ".
 * Edge Function prepare-upload chưa tồn tại nên ảnh chỉ nằm ở bộ nhớ đệm cục bộ.
 */
export const UNSYNCED_IMAGE_LABEL = { vi: 'chưa đồng bộ', en: 'not synced' }

/** Tách ảnh đã đồng bộ (có path trong Storage) và ảnh còn nằm ở IndexedDB. */
export function splitImages(images: TaskImage[]) {
  const synced: { name: string; path: string; assetId?: string }[] = []
  const local: TaskImage[] = []
  for (const image of images) {
    if (image.synced && image.path) {
      synced.push(image.assetId ? { name: image.name, path: image.path, assetId: image.assetId } : { name: image.name, path: image.path })
    } else local.push({ ...image, synced: false })
  }
  return { synced, local }
}

/**
 * Giữ lại ảnh chưa đồng bộ từ bộ nhớ đệm cục bộ khi nạp lại từ database:
 * ảnh đã đồng bộ lấy từ Storage, ảnh chưa đồng bộ vẫn nằm trong IndexedDB.
 */
export function mergeImages(remote: TaskImage[], local: TaskImage[]): TaskImage[] {
  const localByName = new Map(local.map(image => [image.name, image]))
  const merged = remote.map(image => {
    const cached = localByName.get(image.name)
    if (!cached) return image
    localByName.delete(image.name)
    return cached
  })
  return [...merged, ...localByName.values()]
}
