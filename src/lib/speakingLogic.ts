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

/** Số turn của mỗi chế độ: 1 phần = 1 turn, full mock = 4 turn. */
export function buildSessionPlan(
  mode: SpeakingMode,
  pool: { part1: string[]; part2: string[]; part3: string[] },
): SessionPlanTurn[] {
  if (mode === 'mock') {
    return [
      { part: 'part-1', index: 0 },
      { part: 'part-1', index: 1 },
      { part: 'part-2', index: 0 },
      { part: 'part-3', index: 0 },
    ]
  }
  return [{ part: mode, index: 0 }]
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
