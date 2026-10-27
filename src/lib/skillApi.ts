// Gọi Edge Function `grade-skill` và đọc lịch sử làm bài.
//
// Client KHÔNG tự chấm điểm và không đọc cột đáp án từ Postgres: việc chấm
// nằm trong Edge Function (service role), giải thích chỉ về sau khi nộp bài.

import { supabase } from './supabase'

export type SkillResultItem = {
  order: number
  isCorrect: boolean
  correctAnswer: string
  userAnswer: string
  explanation: string
}

export type SkillGrade = {
  attemptId: string | null
  skill: 'reading' | 'listening'
  title: string
  correctCount: number
  totalCount: number
  band: number | null
  results: SkillResultItem[]
}

export type SkillAttempt = {
  id: string
  skill: 'reading' | 'listening'
  testId: string
  correctCount: number
  totalCount: number
  band: number | null
  createdAt: string
}

export type GradeResult = { ok: true; value: SkillGrade } | { ok: false; code: string }

/**
 * Mã lỗi do Edge Function trả về; mất thì dùng 'unknown_error'.
 *
 * `_shared/http.ts` trả lỗi dạng `{ error: { code, message } }` và supabase-js
 * gói body đó vào `error.context`, nên đọc cả `context.code` lẫn
 * `context.error.code` cho chắc.
 */
function errorCode(error: unknown): string {
  const context = (error as { context?: { code?: string; error?: { code?: string } } } | null)?.context
  return context?.error?.code ?? context?.code ?? 'unknown_error'
}

/** Nộp bài để chấm. Server chấm và lưu lịch sử, client không tự tính điểm. */
export async function gradeSkill(input: {
  testId: string
  answers: Record<string, string>
  timeSpentSeconds: number
}): Promise<GradeResult> {
  try {
    const { data, error } = await supabase.functions.invoke('grade-skill', {
      body: { testId: input.testId, answers: input.answers, timeSpentSeconds: input.timeSpentSeconds },
    })
    if (error) return { ok: false, code: errorCode(error) }
    return { ok: true, value: (data ?? null) as SkillGrade }
  } catch {
    return { ok: false, code: 'unknown_error' }
  }
}

/** Xem lại một lần làm bài đã lưu (server chấm lại từ đáp án đã lưu). */
export async function loadSkillGrade(attemptId: string): Promise<SkillGrade | null> {
  try {
    const { data, error } = await supabase.functions.invoke('grade-skill', {
      method: 'GET',
      headers: { 'x-attempt-id': attemptId },
    })
    if (error || !data) return null
    return data as SkillGrade
  } catch {
    return null
  }
}

/** Lịch sử làm bài của người dùng, mới nhất trước. */
export async function loadSkillAttempts(skill?: 'reading' | 'listening'): Promise<SkillAttempt[]> {
  try {
    const query = supabase
      .from('skill_attempts')
      .select('id,skill,test_id,correct_count,total_count,band,created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    const { data, error } = skill ? await query.eq('skill', skill) : await query
    if (error) return []
    return (data ?? []).map(row => ({
      id: row.id as string,
      skill: row.skill as 'reading' | 'listening',
      testId: row.test_id as string,
      correctCount: row.correct_count as number,
      totalCount: row.total_count as number,
      band: row.band === null || row.band === undefined ? null : Number(row.band),
      createdAt: row.created_at as string,
    }))
  } catch {
    return []
  }
}
