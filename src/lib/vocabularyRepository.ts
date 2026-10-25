// Đọc thư viện từ vựng 25 chủ đề từ PostgREST (bảng public, đọc công khai).

import {
  entryRowToEntry,
  topicRowToTopic,
  type VocabularyEntry,
  type VocabularyEntryRow,
  type VocabularyTopic,
  type VocabularyTopicRow,
} from './vocabularyLogic.ts'

export type VocabularySource = { url: string; key: string }

/** Nguồn mặc định lấy từ biến môi trường Vite (bị inject lúc build). */
export function defaultVocabularySource(): VocabularySource | null {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {}
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  return url && key ? { url, key } : null
}

async function request(source: VocabularySource, path: string, params: URLSearchParams): Promise<unknown[]> {
  try {
    const response = await fetch(`${source.url}/rest/v1/${path}?${params.toString()}`, {
      headers: { apikey: source.key, Authorization: `Bearer ${source.key}` },
    })
    if (!response.ok) return []
    return (await response.json()) as unknown[]
  } catch {
    return []
  }
}

/** 25 chủ đề, sắp theo số thứ tự. */
export async function loadVocabularyTopics(source = defaultVocabularySource()): Promise<VocabularyTopic[]> {
  if (!source) return []
  const rows = await request(source, 'vocabulary_topics', new URLSearchParams({ select: '*', order: 'number.asc' }))
  return (rows as VocabularyTopicRow[]).map(topicRowToTopic)
}

/** Danh sách mục từ của một chủ đề (có thể lọc theo từ khoá). */
export async function loadVocabularyEntries(
  query: { topic?: string; search?: string; limit?: number; offset?: number } = {},
  source = defaultVocabularySource(),
): Promise<VocabularyEntry[]> {
  if (!source) return []
  const params = new URLSearchParams({ select: '*', order: 'sort_order.asc' })
  if (query.topic) params.set('topic_key', `eq.${query.topic}`)
  if (query.search) params.set('or', `(term.ilike.*${query.search}*,meaning.ilike.*${query.search}*)`)
  if (query.limit) params.set('limit', String(query.limit))
  if (query.offset) params.set('offset', String(query.offset))
  const rows = await request(source, 'vocabulary_entries', params)
  return (rows as VocabularyEntryRow[]).map(entryRowToEntry)
}
