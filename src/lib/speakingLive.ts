/**
 * API client của chế độ luyện nói TRỰC TIẾP.
 *
 * Mọi lời gọi đi qua Edge Function `speaking-live`: API key của provider không
 * bao giờ tới trình duyệt, và mỗi phiên đều gắn với một token ngắn hạn.
 */

import { supabase } from './supabase'
import type { LiveVoiceAccent } from './liveAudio.ts'
import type { SpeakingMode, SpeakingPart } from './speakingLogic.ts'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

export type LiveStep = {
  index: number
  text: string
  isCueCard: boolean
}

export type LiveTurnPlan = {
  turnId: string
  orderIndex: number
  part: SpeakingPart
  prepMs: number
  maxAnswerMs: number
  steps: LiveStep[]
}

export type LiveSession = {
  sessionId: string
  token: string
  expiresAt: number
  voice: LiveVoiceAccent
  mode: SpeakingMode
  limits: {
    maxDurationMs: number
    maxBrainCalls: number
    maxVoiceCalls: number
  }
  plan: LiveTurnPlan[]
}

export type LiveBrainReply = {
  ack: string
  followUp: string | null
  advance: boolean
  nextStepIndex: number | null
}

export type LiveTranscriptEntry = {
  role: 'examiner' | 'candidate'
  text: string
  at: number
}

export type LiveApiError = { ok: false; code: string }
export type LiveApiOk<T> = { ok: true; value: T }

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function postJson<T>(body: Record<string, unknown>): Promise<LiveApiOk<T> | LiveApiError> {
  try {
    const { data, error } = await supabase.functions.invoke('speaking-live', {
      body: body as Record<string, unknown>,
    })
    if (error) {
      const context = (error as { context?: unknown }).context
      const body = (context instanceof Response ? await context.json().catch(() => null) : context) as { code?: string; error?: { code?: string } } | null
      return { ok: false, code: body?.error?.code ?? body?.code ?? 'unknown_error' }
    }
    return { ok: true, value: (data ?? null) as T }
  } catch {
    return { ok: false, code: 'unknown_error' }
  }
}

/** Mở phiên live: trả token ngắn hạn + kế hoạch câu hỏi theo đề Cambridge. */
export function startLiveSession(input: {
  attemptId: string
  voice: LiveVoiceAccent
}): Promise<LiveApiOk<LiveSession> | LiveApiError> {
  return postJson<LiveSession>({ action: 'start', attemptId: input.attemptId, voice: input.voice })
}

/** Hỏi "AI examiner" câu tiếp theo (kèm follow-up tuỳ chọn). */
export async function requestBrain(input: {
  sessionId: string
  token: string
  turnIndex: number
  stepIndex: number
  candidateAnswer: string
  allowFollowUp: boolean
  audio?: Blob | null
}): Promise<LiveApiOk<LiveBrainReply> | LiveApiError> {
  const { audio, ...body } = input
  if (!body.candidateAnswer.trim() && audio?.size) {
    if (audio.size > 4 * 1024 * 1024) return { ok: false, code: 'body_too_large' }
    try {
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(audio)
      })
      return postJson<LiveBrainReply>({ action: 'brain', ...body, audioBase64, mimeType: audio.type })
    } catch { return { ok: false, code: 'recording_failed' } }
  }
  return postJson<LiveBrainReply>({ action: 'brain', ...body })
}

/** Chép lời người học từ audio (dự phòng khi trình duyệt không có Web Speech). */
export function transcribeLiveAudio(input: {
  sessionId: string
  token: string
  audioBase64: string
  mimeType: string
}): Promise<LiveApiOk<{ transcript: string }> | LiveApiError> {
  return postJson<{ transcript: string }>({ action: 'transcribe', ...input })
}

/** Kết thúc phiên và lưu transcript. */
export function finishLiveSession(input: {
  sessionId: string
  token: string
  transcript: LiveTranscriptEntry[]
}): Promise<LiveApiOk<{ status: string }> | LiveApiError> {
  return postJson<{ status: string }>({ action: 'finish', ...input })
}

/** Tổng hợp giọng giám khảo — trả về blob audio để phát. */
export async function requestVoice(input: {
  sessionId: string
  token: string
  text: string
  accent: LiveVoiceAccent
}): Promise<LiveApiOk<Blob> | LiveApiError> {
  try {
    const token = await accessToken()
    if (!token) return { ok: false, code: 'unauthenticated' }
    const response = await fetch(`${supabaseUrl}/functions/v1/speaking-live`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'voice', ...input }),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { code?: string }
      } | null
      return { ok: false, code: body?.error?.code ?? 'voice_failed' }
    }
    const blob = await response.blob()
    return { ok: true, value: blob }
  } catch {
    return { ok: false, code: 'voice_failed' }
  }
}
