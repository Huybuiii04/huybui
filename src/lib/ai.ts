// Tầng gọi Edge Function của Supabase: chấm bài, công cụ AI và trang quản trị.
// Logic thuần (phân loại lỗi, ánh xạ kết quả) nằm trong ./aiLogic.ts.

import { supabase } from './supabase'
import {
  classifyAiError,
  gradingViewFromRow,
  isTerminalJobStatus,
  jobStatusFromRow,
  toolResultLines,
  type GradingRow,
  type GradingView,
  type JobStatus,
  type ToolOperation,
} from './aiLogic.ts'

export type AiResult<T> = { ok: true; value: T } | { ok: false; code: ReturnType<typeof classifyAiError> }

export type SubmitEssayInput = { essayId: string; expectedVersion: number; idempotencyKey: string; mode: string }

export type SubmittedJob = { revisionId: string; jobId: string; status: JobStatus }

export type GradingSnapshot = { status: JobStatus; view: GradingView | null }

const POLL_INTERVAL_MS = 2500
const POLL_TIMEOUT_MS = 180_000

async function invoke<T>(name: string, body: unknown): Promise<AiResult<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(name, { body: body as Record<string, unknown> })
    if (error) return { ok: false, code: classifyAiError(error) }
    return { ok: true, value: (data ?? null) as T }
  } catch (error) {
    return { ok: false, code: classifyAiError(error) }
  }
}

/** Chấm bài: tạo revision bất biến + đẩy job vào hàng đợi. */
export function submitEssay(input: SubmitEssayInput): Promise<AiResult<SubmittedJob>> {
  return invoke<SubmittedJob>('submit-essay', {
    essayId: input.essayId,
    expectedVersion: input.expectedVersion,
    idempotencyKey: input.idempotencyKey,
    mode: input.mode,
  })
}

/** Thử lại một job đã lỗi (chỉ job của chính chủ sở hữu). */
export function retryJob(jobId: string): Promise<AiResult<{ jobId: string; status: JobStatus }>> {
  return invoke('retry-job', { jobId, idempotencyKey: `retry-${jobId}` })
}

async function readJob(jobId: string) {
  const { data, error } = await supabase.from('ai_jobs').select('id,status,revision_id,result_id,operation').eq('id', jobId).maybeSingle()
  if (error) return null
  return data as { id: string; status: string; revision_id: string | null; result_id: string | null; operation: string } | null
}

async function readGrading(revisionId: string): Promise<GradingRow | null> {
  const { data, error } = await supabase.from('grading_results').select('*').eq('revision_id', revisionId).maybeSingle()
  if (error) return null
  return (data as GradingRow | null) ?? null
}

async function readToolResult(jobId: string): Promise<unknown> {
  const { data, error } = await supabase.from('ai_tool_results').select('result').eq('job_id', jobId).maybeSingle()
  if (error) return null
  return (data as { result?: unknown } | null)?.result ?? null
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/**
 * Theo dõi job chấm bài tới khi có kết quả.
 * `onUpdate` được gọi mỗi lần trạng thái đổi để UI hiển thị tiến trình.
 */
export async function pollGrading(
  jobId: string,
  task: string,
  onUpdate?: (snapshot: GradingSnapshot) => void,
): Promise<AiResult<GradingSnapshot>> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  let lastStatus: JobStatus | null = null
  while (Date.now() < deadline) {
    const job = await readJob(jobId)
    if (!job) return { ok: false, code: 'not_found' }
    const status = jobStatusFromRow(job)
    if (status !== lastStatus) {
      lastStatus = status
      const view = job.revision_id ? gradingViewFromRow(await readGrading(job.revision_id), task) : null
      onUpdate?.({ status, view })
    }
    if (status === 'succeeded') {
      const view = job.revision_id ? gradingViewFromRow(await readGrading(job.revision_id), task) : null
      if (!view) return { ok: false, code: 'not_found' }
      return { ok: true, value: { status, view } }
    }
    if (isTerminalJobStatus(status)) return { ok: false, code: status === 'cancelled' ? 'conflict' : 'service_unavailable' }
    await sleep(POLL_INTERVAL_MS)
  }
  return { ok: false, code: 'service_unavailable' }
}

export type WritingToolInput = {
  operation: ToolOperation
  revisionId?: string
  text?: string
  prompt?: string
  assetIds?: string[]
}

/** Chạy một công cụ AI (magic rewrite, stress test, critical thinking, đọc ảnh). */
export function runWritingTool(input: WritingToolInput): Promise<AiResult<{ jobId: string; status: JobStatus }>> {
  return invoke('run-writing-tool', {
    operation: input.operation,
    revisionId: input.revisionId,
    text: input.text,
    prompt: input.prompt,
    assetIds: input.assetIds,
    idempotencyKey: `tool-${input.operation}-${crypto.randomUUID()}`,
  })
}

/** Chờ kết quả công cụ AI rồi trả về các dòng để hiển thị. */
export async function pollToolResult(jobId: string, operation: ToolOperation, onUpdate?: (status: JobStatus) => void): Promise<AiResult<string[]>> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  let lastStatus: JobStatus | null = null
  while (Date.now() < deadline) {
    const job = await readJob(jobId)
    if (!job) return { ok: false, code: 'not_found' }
    const status = jobStatusFromRow(job)
    if (status !== lastStatus) {
      lastStatus = status
      onUpdate?.(status)
    }
    if (status === 'succeeded') {
      const result = await readToolResult(jobId)
      return { ok: true, value: toolResultLines(operation, result) }
    }
    if (isTerminalJobStatus(status)) return { ok: false, code: 'service_unavailable' }
    await sleep(POLL_INTERVAL_MS)
  }
  return { ok: false, code: 'service_unavailable' }
}

export type AdminUsageRow = {
  model: string
  input_tokens: number
  output_tokens: number
  cache_creation_tokens: number
  cache_read_tokens: number
  latency_ms: number
  status: string
  created_at: string
  estimated_cost_usd: number | null
}

export type AdminUsage = { rows: AdminUsageRow[]; totals: { jobs: number; inputTokens: number; outputTokens: number; estimatedCostUsd: number | null } }

export async function fetchAdminUsage(from: string, to: string): Promise<AiResult<AdminUsage>> {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
  if (!base) return { ok: false, code: 'not_connected' }
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const response = await fetch(`${base}/functions/v1/admin-usage?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) return { ok: false, code: classifyAiError({ message: await response.text(), status: response.status }) }
    return { ok: true, value: (await response.json()) as AdminUsage }
  } catch (error) {
    return { ok: false, code: classifyAiError(error) }
  }
}

export async function adminUserAction(action: 'suspend' | 'restore' | 'make_admin' | 'remove_admin', userId: string): Promise<AiResult<unknown>> {
  return invoke('admin-users', { action, userId })
}

export async function adminContentAction(action: 'upsert' | 'publish' | 'hide' | 'delete', entry: Record<string, unknown>, translations?: Record<string, unknown>[]): Promise<AiResult<unknown>> {
  return invoke('admin-content', { action, entry, translations })
}

/** Xoá bài viết (tombstone → huỷ job → xoá Storage → xoá DB). */
export async function deleteEssay(essayId: string): Promise<AiResult<unknown>> {
  return invoke('delete-essay', { essayId })
}

/** Xoá bài viết khi Edge Function chưa sẵn sàng: xoá thẳng trong database. */
export async function deleteEssayDirect(essayId: string): Promise<AiResult<unknown>> {
  const { error } = await supabase.from('essays').delete().eq('id', essayId)
  if (error) return { ok: false, code: classifyAiError(error) }
  return { ok: true, value: null }
}

/** Lấy kết quả chấm gần nhất của một bài (nếu đã có). */
export async function fetchLatestGrading(essayId: string, task: string): Promise<GradingView | null> {
  const { data: revision, error: revisionError } = await supabase
    .from('essay_revisions')
    .select('id')
    .eq('essay_id', essayId)
    .order('revision_no', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (revisionError || !revision) return null
  const row = await readGrading((revision as { id: string }).id)
  return gradingViewFromRow(row, task)
}
