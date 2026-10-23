import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { scheduleReview } from './learning'

export type Task = 'task2' | 'academic_task1' | 'general_task1'
export type Draft = { id: string; title: string; task: Task; subtype: string; prompt: string; text: string; reference: string; images: { name: string; url: string }[]; target: string; updatedAt: number }
export type Card = { id: string; term: string; meaning: string; example: string; kind: 'vocabulary' | 'structure' | 'error'; level: number; dueAt: number }
type State = { drafts: Draft[]; cards: Card[]; completed: string[]; profile: { name: string; target: string; feedback: string } }
const initial: State = { drafts: [], cards: [], completed: [], profile: { name: '', target: '7.0', feedback: 'vi' } }
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
        state = request.result ?? structuredClone(initial)
        if (update) { state = update(state); store.put(state, 'app') }
      } catch (error) { failure = error; transaction.abort() }
    }
    transaction.oncomplete = () => resolve(state)
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error('Storage unavailable'))
    transaction.onerror = () => reject(transaction.error)
  })
}
type Store = { state: State; ready: boolean; error: string; update: (fn: (state: State) => State) => Promise<void>; saveDraft: (draft: Draft, expected: number) => Promise<number>; addCard: (card: Pick<Card, 'term' | 'meaning' | 'example' | 'kind'>) => Promise<void>; review: (id: string, remembered: boolean) => Promise<void> }
const Context = createContext<Store | null>(null)
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const load = () => { void transact().then(value => { setState(value); setReady(true) }).catch(() => setError('storage')) }
    load()
    const channel = new BroadcastChannel('ielts-studio')
    channel.onmessage = load
    return () => channel.close()
  }, [])
  async function update(fn: (state: State) => State) {
    try {
      const value = await transact(fn)
      setState(value); setError('')
      const channel = new BroadcastChannel('ielts-studio'); channel.postMessage('changed'); channel.close()
    } catch (failure) { setError(failure instanceof Error && failure.message === 'conflict' ? 'conflict' : 'storage'); throw failure }
  }
  async function saveDraft(draft: Draft, expected: number) {
    const timestamp = Math.max(Date.now(), expected + 1)
    await update(current => {
      const existing = current.drafts.find(item => item.id === draft.id)
      if ((existing?.updatedAt ?? 0) !== expected) throw new Error('conflict')
      return { ...current, drafts: [{ ...draft, updatedAt: timestamp }, ...current.drafts.filter(item => item.id !== draft.id)] }
    })
    return timestamp
  }
  async function addCard(card: Pick<Card, 'term' | 'meaning' | 'example' | 'kind'>) {
    await update(current => current.cards.some(item => item.term.trim().toLocaleLowerCase() === card.term.trim().toLocaleLowerCase() && item.kind === card.kind) ? current : { ...current, cards: [...current.cards, { ...card, term: card.term.trim(), id: crypto.randomUUID(), level: 0, dueAt: Date.now() }] })
  }
  async function review(id: string, remembered: boolean) {
    await update(current => ({ ...current, cards: current.cards.map(card => card.id === id && card.dueAt <= Date.now() ? { ...card, ...scheduleReview(card.level, remembered) } : card) }))
  }
  return <Context.Provider value={{ state, ready, error, update, saveDraft, addCard, review }}>{children}</Context.Provider>
}
export function useStore() {
  const value = useContext(Context)
  if (!value) throw new Error('StoreProvider missing')
  return value
}
