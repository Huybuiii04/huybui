// Logic thuần cho thư viện từ vựng 25 chủ đề: map hàng DB, lọc, tạo thẻ ôn tập.

export type VocabularyTopic = {
  key: string
  number: number
  title: string
  description: string
}

export type VocabularyEntry = {
  id: string
  topicKey: string
  term: string
  pos: string
  meaning: string
  definition: string
  examples: string[]
  ipa: string | null
}

export type VocabularyEntryRow = {
  id: string
  topic_key: string
  term: string
  pos: string | null
  meaning: string | null
  definition: string | null
  examples: string[] | null
  ipa: string | null
}

export type VocabularyTopicRow = {
  key: string
  number: number
  title: string
  description: string | null
}

export type NotebookCard = { term: string; kind: string }

/** Hàng của bảng `vocabulary_entries` -> mục từ trong app. */
export function entryRowToEntry(row: VocabularyEntryRow): VocabularyEntry {
  return {
    id: row.id,
    topicKey: row.topic_key,
    term: row.term,
    pos: row.pos ?? '',
    meaning: row.meaning ?? '',
    definition: row.definition ?? '',
    examples: row.examples ?? [],
    ipa: row.ipa ?? null,
  }
}

/** Hàng của bảng `vocabulary_topics` -> chủ đề trong app. */
export function topicRowToTopic(row: VocabularyTopicRow): VocabularyTopic {
  return { key: row.key, number: row.number, title: row.title, description: row.description ?? '' }
}

/** Lọc theo từ, nghĩa hoặc ghi chú cách dùng. */
export function filterEntries(entries: VocabularyEntry[], query: string): VocabularyEntry[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return entries
  return entries.filter(entry => `${entry.term} ${entry.meaning} ${entry.definition}`.toLowerCase().includes(needle))
}

/** Mọi mục trong thư viện đều thành thẻ vocabulary (model thẻ của app chỉ có 3 loại). */
export function entryToCard(entry: VocabularyEntry): { term: string; meaning: string; example: string; kind: 'vocabulary'; tags: string[] } {
  return {
    term: entry.term,
    meaning: entry.meaning,
    example: entry.examples[0] ?? '',
    kind: 'vocabulary',
    tags: [entry.topicKey],
  }
}

/** Từ đã có trong sổ cá nhân chưa (không phân biệt hoa thường). */
export function isInNotebook(entry: VocabularyEntry, cards: NotebookCard[]): boolean {
  const term = entry.term.trim().toLowerCase()
  const kind = entryToCard(entry).kind
  return cards.some(card => card.term.trim().toLowerCase() === term && card.kind === kind)
}
