import { supabase } from './supabase'
import type { SpeakingMode, SpeakingPart } from './speakingLogic.ts'

export type SpeakingCueCard = {
  topic: string
  bullets: string[]
  time_limit_seconds: number
  explain?: string
}

export type SpeakingTurnPlan = {
  turnId: string
  orderIndex: number
  part: SpeakingPart
  promptText: string
  questions: string[]
  cueCard: SpeakingCueCard | null
  maxDurationMs: number
  uploadUrl: string
  token: string
  objectPath: string
}

export type SpeakingAttempt = {
  attemptId: string
  mode: SpeakingMode
  turns: SpeakingTurnPlan[]
}

export type SpeakingCriterionFeedback = {
  criterion: string
  score: number
  rationale: string
  evidence: string[]
  improvements: string[]
}

export type SpeakingTurnFeedback = {
  turnId: string
  criteria: SpeakingCriterionFeedback[]
  summary: string
  strengths: string[]
  priority_actions: string[]
}

export type SpeakingAudioTurn = {
  turnId: string
  part: string
  transcript?: string
  fillerWords?: string[]
  mispronounced?: Array<{ word: string; issue: string }>
  intonationNotes?: string[]
  estimatedWpm?: number | null
  confidence?: string
}

export type SpeakingResultView = {
  attemptId: string
  overallDisplay: number
  overallRaw: number
  scores: Record<string, number | null>
  transcript: string
  feedback: {
    turns?: SpeakingTurnFeedback[]
    overall?: { summary: string; priority_actions: string[] }
  }
  audioAnalysis: { turns?: SpeakingAudioTurn[] }
}

export type SpeakingApiError = { code: string }

async function invoke<T>(
  name: string,
  body: unknown,
): Promise<{ ok: true; value: T } | { ok: false; code: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body: body as Record<string, unknown>,
    })
    if (error) {
      const context = (error as { context?: { code?: string; error?: { code?: string } } }).context
      return { ok: false, code: context?.error?.code ?? context?.code ?? 'unknown_error' }
    }
    return { ok: true, value: (data ?? null) as T }
  } catch {
    return { ok: false, code: 'unknown_error' }
  }
}

/** Mở một phiên luyện nói: server sinh kế hoạch turn và cấp signed upload URL. */
export function prepareSpeaking(input: {
  mode: SpeakingMode
  bookNumber?: number | null
  testNumber?: number | null
  questionId?: string | null
  question?: string | null
  targetBand?: number | null
  feedbackLocale: 'vi' | 'en'
}): Promise<{ ok: true; value: SpeakingAttempt } | { ok: false; code: string }> {
  return invoke<SpeakingAttempt>('submit-speaking', { action: 'prepare', ...input })
}

/** Báo đã upload xong 1 turn. Chỉ khi đủ turn, server mới enqueue job chấm. */
export function commitSpeakingTurn(input: {
  attemptId: string
  turnId: string
  mimeType: string
  byteSize: number
  durationMs: number
}): Promise<
  { ok: true; value: { committed: boolean; jobId: string | null } } | { ok: false; code: string }
> {
  return invoke('submit-speaking', { action: 'commit', ...input })
}

/** Đẩy audio thẳng lên Storage bằng signed URL do server cấp. */
export async function uploadSpeakingAudio(
  turn: SpeakingTurnPlan,
  audio: { blob: Blob; mimeType: string },
): Promise<{ ok: true } | { ok: false; code: string }> {
  try {
    const response = await fetch(turn.uploadUrl, {
      method: 'PUT',
      headers: { 'content-type': audio.mimeType },
      body: audio.blob,
    })
    if (!response.ok) return { ok: false, code: 'upload_failed' }
    return { ok: true }
  } catch {
    return { ok: false, code: 'upload_failed' }
  }
}

const POLL_INTERVAL_MS = 2_500
const POLL_TIMEOUT_MS = 180_000

export async function pollSpeakingResult(
  attemptId: string,
  onUpdate?: (status: string) => void,
): Promise<{ ok: true; value: SpeakingResultView } | { ok: false; code: string }> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  let lastStatus = ''
  while (Date.now() < deadline) {
    const { data, error } = await supabase
      .from('speaking_attempts')
      .select('id,status,error_code,speaking_results(*)')
      .eq('id', attemptId)
      .maybeSingle()
    if (error || !data) return { ok: false, code: 'not_found' }

    const row = data as unknown as {
      status?: string | null
      error_code?: string | null
      speaking_results?: Record<string, unknown>[]
    }
    const status = String(row.status ?? '')
    if (status !== lastStatus) {
      lastStatus = status
      onUpdate?.(status)
    }
    if (status === 'succeeded') {
      const result = row.speaking_results?.[0]
      if (!result) return { ok: false, code: 'not_found' }
      return { ok: true, value: speakingResultView(attemptId, result) }
    }
    if (status === 'failed' || status === 'cancelled') {
      return { ok: false, code: String(row.error_code ?? 'failed') }
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
  return { ok: false, code: 'service_unavailable' }
}

export function speakingResultView(
  attemptId: string,
  row: Record<string, unknown>,
): SpeakingResultView {
  const numberOrNull = (value: unknown): number | null =>
    value === null || value === undefined ? null : Number(value)
  return {
    attemptId,
    overallDisplay: Number(row.overall_display ?? 0),
    overallRaw: Number(row.overall_raw ?? 0),
    scores: {
      fluency: numberOrNull(row.fluency),
      lexical_resource: numberOrNull(row.lexical_resource),
      grammatical_range: numberOrNull(row.grammatical_range),
      pronunciation: numberOrNull(row.pronunciation),
    },
    transcript: String(row.transcript ?? ''),
    feedback: (row.feedback ?? {}) as SpeakingResultView['feedback'],
    audioAnalysis: (row.audio_analysis ?? {}) as SpeakingResultView['audioAnalysis'],
  }
}

export type SpeakingQuestion = {
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

/** Nạp toàn bộ đề Cambridge 12–20 (mỗi test = 1 Part 1 + 1 Part 2 + 2 Part 3). */
export async function loadSpeakingTests(): Promise<SpeakingQuestion[]> {
  const { data } = await supabase
    .from('speaking_questions')
    .select(
      'id,part,slug,topic,prompt_text,questions,cue_card,related_part3_slug,sub_index,book_number,test_number,source_label',
    )
    .eq('is_active', true)
    .not('book_number', 'is', null)
    .order('book_number', { ascending: true })
    .order('test_number', { ascending: true })
    .order('part', { ascending: true })
    .order('sub_index', { ascending: true })
  return (data ?? []) as unknown as SpeakingQuestion[]
}
