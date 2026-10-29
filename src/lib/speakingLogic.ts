export type SpeakingMode = 'part-1' | 'part-2' | 'part-3' | 'mock'
export type SpeakingPart = 'part-1' | 'part-2' | 'part-3'
export type SpeakingCriterion = 'fluency' | 'lexical_resource' | 'grammatical_range' | 'pronunciation'

export const SPEAKING_CRITERIA: SpeakingCriterion[] = [
  'fluency',
  'lexical_resource',
  'grammatical_range',
  'pronunciation',
]

export const MAX_AUDIO_BYTES = 4 * 1024 * 1024

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
] as const

/** Thời lượng tối đa của một turn, khớp giới hạn thời lượng IELTS Speaking. */
export function maxDurationMs(part: SpeakingPart): number {
  if (part === 'part-2') return 120_000
  if (part === 'part-3') return 90_000
  return 60_000
}

export type AudioValidation =
  | { ok: true }
  | { ok: false; reason: 'too_long' | 'too_large' | 'empty' }

export function validateAudio(input: {
  part: SpeakingPart
  byteSize: number
  durationMs: number
}): AudioValidation {
  if (input.byteSize <= 0) return { ok: false, reason: 'empty' }
  if (input.byteSize > MAX_AUDIO_BYTES) return { ok: false, reason: 'too_large' }
  // Chấp nhận thêm 2 giây vì bộ ghi âm có thể vượt ngưỡng trước khi client kịp dừng.
  if (input.durationMs > maxDurationMs(input.part) + 2_000) return { ok: false, reason: 'too_long' }
  return { ok: true }
}

export function computeOverallBand(scores: number[]): { raw: number; display: number } {
  if (!scores.length) return { raw: 0, display: 0 }
  const raw = scores.reduce((total, score) => total + score, 0) / scores.length
  return { raw, display: Math.round(raw * 2) / 2 }
}

export type TurnCriterionScore = { criterion: SpeakingCriterion; score: number }

/**
 * Band mỗi tiêu chí = trung bình điểm của tiêu chí đó qua mọi turn (làm tròn nửa band),
 * rồi overall = trung bình 4 band tiêu chí. Đúng luật IELTS "average performance across
 * all parts of the test".
 */
export function aggregateTurnScores(turns: TurnCriterionScore[][]): {
  scores: Record<SpeakingCriterion, number>
  overallRaw: number
  overallDisplay: number
} {
  const scores = {} as Record<SpeakingCriterion, number>
  for (const criterion of SPEAKING_CRITERIA) {
    const values = turns
      .map((turn) => turn.find((item) => item.criterion === criterion)?.score)
      .filter((value): value is number => typeof value === 'number')
    const average = values.length
      ? values.reduce((total, value) => total + value, 0) / values.length
      : 0
    scores[criterion] = Math.round(average * 2) / 2
  }
  const overall = computeOverallBand(SPEAKING_CRITERIA.map((criterion) => scores[criterion]))
  return { scores, overallRaw: overall.raw, overallDisplay: overall.display }
}

export type SessionPlanTurn = { part: SpeakingPart; index: number }

/**
 * Số turn của mỗi chế độ: 1 phần = 1 turn, full 3 phần = 4 turn
 * (Part 1 → Part 2 → Part 3 chủ đề A → Part 3 chủ đề B).
 */
export function buildSessionPlan(mode: SpeakingMode): SessionPlanTurn[] {
  if (mode === 'mock') {
    return [
      { part: 'part-1', index: 0 },
      { part: 'part-2', index: 0 },
      { part: 'part-3', index: 0 },
      { part: 'part-3', index: 1 },
    ]
  }
  return [{ part: mode, index: 0 }]
}

export type SpeakingCueCard = {
  topic: string
  bullets: string[]
  time_limit_seconds: number
  explain?: string
}

/** Một dòng câu hỏi trong kho (mỗi test có 1 Part 1, 1 Part 2, 2 Part 3). */
export type SpeakingTestRow = {
  id: string
  part: SpeakingPart
  slug: string
  topic: string
  prompt_text: string
  questions: string[]
  cue_card: SpeakingCueCard | null
  related_part3_slug: string | null
  sub_index: number
  book_number: number | null
  test_number: number | null
  source_label: string
}

/** Một test Cambridge đã gom: Part 1 + Part 2 + 2 chủ đề Part 3. */
export type SpeakingTestGroup = {
  bookNumber: number
  testNumber: number
  label: string
  sourceLabel: string
  part1: SpeakingTestRow | null
  part2: SpeakingTestRow | null
  part3: SpeakingTestRow[]
}

/** Số hiển thị; giữ nguyên số gốc để truy vấn đề và bài làm cũ. */
export function speakingDisplayTestNumber(bookNumber: number, testNumber: number): number {
  return bookNumber === 12 && testNumber >= 5 && testNumber <= 8 ? testNumber - 4 : testNumber
}

/** Nhãn hiển thị của một test Cambridge. */
export function speakingTestLabel(bookNumber: number, testNumber: number): string {
  return `Cambridge ${bookNumber} · Test ${speakingDisplayTestNumber(bookNumber, testNumber)}`
}

/**
 * Gom các dòng câu hỏi theo cuốn Cambridge và số test.
 * Dòng không thuộc Cambridge (book_number = null) bị bỏ qua.
 */
export function groupSpeakingTests(rows: SpeakingTestRow[]): SpeakingTestGroup[] {
  const groups = new Map<string, SpeakingTestGroup>()
  for (const row of rows) {
    if (row.book_number === null || row.test_number === null) continue
    const key = `${row.book_number}-${row.test_number}`
    let group = groups.get(key)
    if (!group) {
      group = {
        bookNumber: row.book_number,
        testNumber: row.test_number,
        label: speakingTestLabel(row.book_number, row.test_number),
        sourceLabel: row.source_label ?? '',
        part1: null,
        part2: null,
        part3: [],
      }
      groups.set(key, group)
    }
    if (!group.sourceLabel && row.source_label) group.sourceLabel = row.source_label
    if (row.part === 'part-1') group.part1 = row
    else if (row.part === 'part-2') group.part2 = row
    else group.part3.push(row)
  }
  for (const group of groups.values()) {
    group.part3.sort((a, b) => a.sub_index - b.sub_index)
  }
  return [...groups.values()].sort(
    (a, b) => a.bookNumber - b.bookNumber || a.testNumber - b.testNumber,
  )
}

export function formatBand(band: number): string {
  return band.toFixed(1)
}

export function audioMimeForFile(name: string): string | null {
  const extension = name.toLowerCase().split('.').pop() ?? ''
  const map: Record<string, string> = {
    webm: 'audio/webm',
    mp4: 'audio/mp4',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    mpeg: 'audio/mpeg',
    mp3: 'audio/mp3',
  }
  return map[extension] ?? null
}

/** Nhãn tiêu chí hiển thị cho UI. */
export const SPEAKING_CRITERION_LABELS: Record<SpeakingCriterion, readonly [string, string]> = {
  fluency: ['Trôi chảy & Mạch lạc', 'Fluency & Coherence'],
  lexical_resource: ['Vốn từ', 'Lexical Resource'],
  grammatical_range: ['Ngữ pháp', 'Grammatical Range & Accuracy'],
  pronunciation: ['Phát âm', 'Pronunciation'],
}
