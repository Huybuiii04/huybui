// Logic thuần cho tầng AI: phân loại lỗi Edge Function, trạng thái job và
// ánh xạ kết quả chấm về model hiển thị. Không phụ thuộc React hay network.

export type AiErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'invalid_request'
  | 'essay_empty'
  | 'text_required'
  | 'image_not_ready'
  | 'server_misconfigured'
  | 'service_unavailable'
  | 'not_connected'
  | 'network'
  | 'unknown'

/** Thông điệp song ngữ cho từng mã lỗi. UI dùng c(vi, en). */
export const AI_ERROR_MESSAGES: Record<AiErrorCode, readonly [string, string]> = {
  unauthenticated: ['Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.', 'Your session expired. Please sign in again.'],
  forbidden: ['Tài khoản này không được phép dùng chức năng đó.', 'This account is not allowed to use that feature.'],
  not_found: ['Không tìm thấy dữ liệu.', 'The requested data was not found.'],
  conflict: ['Bài đã thay đổi ở nơi khác. Hãy lưu lại rồi thử lại.', 'The essay changed elsewhere. Save it and try again.'],
  rate_limited: ['Quá nhiều yêu cầu AI. Hãy chờ một chút rồi thử lại.', 'Too many AI requests. Please wait a moment and try again.'],
  invalid_request: ['Dữ liệu gửi lên không hợp lệ.', 'The submitted data is invalid.'],
  essay_empty: ['Bài viết còn trống, chưa thể chấm.', 'The essay is still empty and cannot be graded.'],
  text_required: ['Cần có nội dung để công cụ này hoạt động.', 'This tool needs some text to work on.'],
  image_not_ready: ['Ảnh chưa tải xong lên máy chủ. Hãy thử lại sau.', 'The image has not finished uploading. Please try again shortly.'],
  server_misconfigured: ['Máy chủ chưa cấu hình mô hình AI.', 'The server has not configured an AI model yet.'],
  service_unavailable: ['Dịch vụ AI đang bận hoặc tạm thời không khả dụng. Hãy thử lại.', 'The AI service is busy or temporarily unavailable. Please try again.'],
  not_connected: ['Chưa kết nối được dịch vụ AI. Bài viết của bạn vẫn được lưu.', 'Could not reach the AI service. Your writing is still saved.'],
  network: ['Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.', 'Could not reach the server. Check your connection and try again.'],
  unknown: ['Có lỗi xảy ra. Hãy thử lại.', 'Something went wrong. Please try again.'],
}

/**
 * Edge Function trả lỗi dạng `{ error: { code, message } }`.
 * supabase-js bọc lại thành FunctionsHttpError nên `message` là chuỗi JSON.
 */
export function parseAiErrorPayload(error: unknown): { code?: string; message?: string; status?: number } {
  const raw = error as { message?: string; context?: unknown; code?: string; status?: number } | null
  if (!raw) return {}
  const candidates: string[] = []
  if (typeof raw.message === 'string') candidates.push(raw.message)
  const context = raw.context as { error?: { code?: string; message?: string }; body?: unknown } | undefined
  if (context && typeof context.error === 'object' && context.error) {
    return {
      code: typeof context.error.code === 'string' ? context.error.code : undefined,
      message: typeof context.error.message === 'string' ? context.error.message : undefined,
      status: raw.status,
    }
  }
  for (const candidate of candidates) {
    const trimmed = candidate.trim()
    if (!trimmed.startsWith('{')) continue
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (!parsed || typeof parsed !== 'object') continue
      const payload = parsed as { error?: { code?: string; message?: string }; code?: string; message?: string }
      const nested = payload.error
      if (nested && typeof nested === 'object') {
        return {
          code: typeof nested.code === 'string' ? nested.code : undefined,
          message: typeof nested.message === 'string' ? nested.message : undefined,
          status: raw.status,
        }
      }
      return {
        code: typeof payload.code === 'string' ? payload.code : undefined,
        message: typeof payload.message === 'string' ? payload.message : undefined,
        status: raw.status,
      }
    } catch {
      // Không phải JSON — thử candidate tiếp theo.
    }
  }
  return { status: raw.status }
}

/** Đổi lỗi Edge Function thành mã thân thiện — không lộ raw error lên UI. */
export function classifyAiError(error: unknown): AiErrorCode {
  if (!error) return 'unknown'
  const raw = error as { code?: string; message?: string; status?: number; name?: string } | null
  const payload = parseAiErrorPayload(error)
  const code = payload.code ?? ''
  if (code === 'unauthenticated') return 'unauthenticated'
  if (code === 'forbidden' || code === 'admin_required' || code === 'not_admin') return 'forbidden'
  if (code === 'essay_not_found' || code === 'revision_not_found' || code === 'asset_not_found' || code.endsWith('_not_found')) return 'not_found'
  if (code === 'draft_conflict' || code === 'idempotency_conflict' || code === 'revision_conflict') return 'conflict'
  if (code === 'rate_limited') return 'rate_limited'
  if (code === 'invalid_request' || code.startsWith('invalid_')) return 'invalid_request'
  if (code === 'essay_empty') return 'essay_empty'
  if (code === 'text_required') return 'text_required'
  if (code === 'image_not_ready') return 'image_not_ready'
  if (code === 'server_misconfigured') return 'server_misconfigured'
  const status = payload.status ?? raw?.status
  if (status === 401) return 'unauthenticated'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rate_limited'
  if (status === 400) return 'invalid_request'
  if (status === 503) return 'service_unavailable'
  const message = (raw?.message ?? payload.message ?? '').toLowerCase()
  // Edge Function chưa deploy: Supabase trả 404 "Function not found".
  if (message.includes('function not found') || message.includes('requested function was not found')) return 'not_connected'
  if (message.includes('failed to fetch') || message.includes('fetch failed') || message.includes('network')) return 'network'
  return 'unknown'
}

export type JobStatus = 'queued' | 'processing' | 'retry_wait' | 'succeeded' | 'failed' | 'cancelled'

export function jobStatusFromRow(row: { status?: string | null } | null | undefined): JobStatus {
  const value = String(row?.status ?? '').toLowerCase()
  if (value === 'queued' || value === 'processing' || value === 'retry_wait' || value === 'succeeded' || value === 'failed' || value === 'cancelled') return value
  return 'queued'
}

/** Job đã dừng — không cần poll thêm. */
export function isTerminalJobStatus(status: JobStatus): boolean {
  return status === 'succeeded' || status === 'failed' || status === 'cancelled'
}

export type CriterionName = 'task_achievement' | 'task_response' | 'coherence_ability' | 'lexical_resource' | 'grammatical_range'

export type CriterionFeedback = {
  score: number
  rationale: string
  evidence: string[]
  improvements: string[]
}

export type TaskCheck = { requirement: string; status: 'met' | 'partial' | 'not_met' | 'not_applicable'; note: string }

export type GradingView = {
  status: 'ok' | 'needs_reference'
  overallDisplay: number | null
  overallRaw: number | null
  scores: Partial<Record<CriterionName, number | null>>
  criteria: Partial<Record<CriterionName, CriterionFeedback>>
  summary: string
  strengths: string[]
  priorityActions: string[]
  taskChecks: TaskCheck[]
  missingReference: string[]
  model: string
  createdAt: string | null
}

export type GradingRow = {
  task_achievement: number | null
  task_response: number | null
  coherence_ability: number | null
  lexical_resource: number | null
  grammatical_range: number | null
  overall_raw: number | null
  overall_display: number | null
  feedback: unknown
  model: string
  created_at: string | null
}

/** Bốn tiêu chí hiển thị theo loại bài. */
export function criteriaForTask(task: string): CriterionName[] {
  const first: CriterionName = task === 'task2' ? 'task_response' : 'task_achievement'
  return [first, 'coherence_ability', 'lexical_resource', 'grammatical_range']
}

export const CRITERION_LABELS: Record<CriterionName, readonly [string, string]> = {
  task_achievement: ['Đạt yêu cầu đề bài', 'Task Achievement'],
  task_response: ['Trả lời đề bài', 'Task Response'],
  coherence_ability: ['Mạch lạc & liên kết', 'Coherence & Cohesion'],
  lexical_resource: ['Vốn từ', 'Lexical Resource'],
  grammatical_range: ['Ngữ pháp & độ chính xác', 'Grammar & Accuracy'],
}

export const CRITERION_SHORT: Record<CriterionName, string> = {
  task_achievement: 'TA',
  task_response: 'TR',
  coherence_ability: 'CC',
  lexical_resource: 'LR',
  grammatical_range: 'GRA',
}

/** Chuyển hàng `grading_results` thành model hiển thị. */
export function gradingViewFromRow(row: GradingRow | null | undefined, _task = 'task2'): GradingView | null {
  if (!row) return null
  const feedback = (row.feedback && typeof row.feedback === 'object' ? row.feedback : {}) as Record<string, unknown>
  const criteria = (feedback.criteria && typeof feedback.criteria === 'object' ? feedback.criteria : {}) as Record<string, CriterionFeedback>
  const scores: Partial<Record<CriterionName, number | null>> = {
    task_achievement: row.task_achievement,
    task_response: row.task_response,
    coherence_ability: row.coherence_ability,
    lexical_resource: row.lexical_resource,
    grammatical_range: row.grammatical_range,
  }
  const status = feedback.status === 'needs_reference' ? 'needs_reference' : 'ok'
  return {
    status,
    overallDisplay: row.overall_display ?? null,
    overallRaw: row.overall_raw ?? null,
    scores,
    criteria,
    summary: typeof feedback.summary === 'string' ? feedback.summary : '',
    strengths: stringArray(feedback.strengths),
    priorityActions: stringArray(feedback.priority_actions),
    taskChecks: taskCheckArray(feedback.task_checks),
    missingReference: stringArray(feedback.missing_reference),
    model: row.model,
    createdAt: row.created_at ?? null,
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function taskCheckArray(value: unknown): TaskCheck[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const check = item as Record<string, unknown>
    if (typeof check.requirement !== 'string' || typeof check.note !== 'string') return []
    const status = check.status
    if (status !== 'met' && status !== 'partial' && status !== 'not_met' && status !== 'not_applicable') return []
    return [{ requirement: check.requirement, status, note: check.note }]
  })
}

export type ToolOperation = 'magic-rewrite' | 'argument-stress-test' | 'critical-thinking' | 'read-image'

/** Câu viết chưa hợp lý / lặp ý / thiếu căn cứ trong bài. */
export type UnnaturalPoint = { quote: string; issue: string; suggestion: string; severity: 'minor' | 'major' }

/** Từ vựng nên học cho chủ đề bài ở band mục tiêu. */
export type VocabularySuggestion = { word: string; meaning: string; example: string; why: string }

/** Một bước trong lộ trình nâng band. */
export type BandPlanStep = { title: string; detail: string; criterion: string; expectedGain: string }

/** Phản hồi sâu của một bài viết — đọc từ bảng `essay_features`. */
export type EssayFeatures = {
  structure: Array<{ index: number; role: string; summary: string; linkToNext: string }>
  lexical: Array<{ term: string; meaning: string; evidence: string; correction: string }>
  grammar: Array<{ error: string; correction: string }>
  unnatural: UnnaturalPoint[]
  vocabularyPlan: { topic: string; words: VocabularySuggestion[] }
  bandPlan: { currentBand: number | null; targetBand: number | null; steps: BandPlanStep[] }
}

/** Một lỗi AI ghi nhận — đọc từ bảng `error_logs`. */
export type ErrorLogEntry = {
  id: string
  criterion: string
  category: string
  quote: string
  correction: string
  explanation: string
  skillTags: string[]
}

/** Đọc hàng `essay_features` thành model hiển thị — field hỏng thì bỏ qua, không throw. */
export function featuresFromRow(row: unknown): EssayFeatures | null {
  if (!row || typeof row !== 'object') return null
  const record = row as Record<string, unknown>
  const structure = (record.structure as Record<string, unknown> | undefined)?.paragraphs
  const lexical = (record.lexical as Record<string, unknown> | undefined)?.examples
  const grammar = (record.grammar as Record<string, unknown> | undefined)?.examples
  const vocabularyPlan = (record.vocabulary_plan as Record<string, unknown> | undefined) ?? {}
  const bandPlan = (record.band_plan as Record<string, unknown> | undefined) ?? {}
  return {
    structure: Array.isArray(structure)
      ? structure.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.role !== 'string' || typeof entry.summary !== 'string') return []
        return [{
          index: typeof entry.index === 'number' ? entry.index : 0,
          role: entry.role,
          summary: entry.summary,
          linkToNext: typeof entry.link_to_next === 'string' ? entry.link_to_next : '',
        }]
      })
      : [],
    lexical: Array.isArray(lexical)
      ? lexical.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.term !== 'string' || typeof entry.correction !== 'string') return []
        return [{
          term: entry.term,
          meaning: typeof entry.meaning === 'string' ? entry.meaning : '',
          evidence: typeof entry.evidence === 'string' ? entry.evidence : '',
          correction: entry.correction,
        }]
      })
      : [],
    grammar: Array.isArray(grammar)
      ? grammar.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.error !== 'string' || typeof entry.correction !== 'string') return []
        return [{ error: entry.error, correction: entry.correction }]
      })
      : [],
    unnatural: Array.isArray(record.unnatural)
      ? record.unnatural.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.quote !== 'string' || typeof entry.issue !== 'string') return []
        return [{
          quote: entry.quote,
          issue: entry.issue,
          suggestion: typeof entry.suggestion === 'string' ? entry.suggestion : '',
          severity: entry.severity === 'minor' ? 'minor' : 'major',
        }]
      })
      : [],
    vocabularyPlan: {
      topic: typeof vocabularyPlan.topic === 'string' ? vocabularyPlan.topic : '',
      words: Array.isArray(vocabularyPlan.words)
        ? vocabularyPlan.words.flatMap(item => {
          const entry = item as Record<string, unknown>
          if (typeof entry.word !== 'string') return []
          return [{
            word: entry.word,
            meaning: typeof entry.meaning === 'string' ? entry.meaning : '',
            example: typeof entry.example === 'string' ? entry.example : '',
            why: typeof entry.why === 'string' ? entry.why : '',
          }]
        })
        : [],
    },
    bandPlan: {
      currentBand: typeof bandPlan.current_band === 'number' ? bandPlan.current_band : null,
      targetBand: typeof bandPlan.target_band === 'number' ? bandPlan.target_band : null,
      steps: Array.isArray(bandPlan.steps)
        ? bandPlan.steps.flatMap(item => {
          const entry = item as Record<string, unknown>
          if (typeof entry.title !== 'string' || typeof entry.detail !== 'string') return []
          return [{
            title: entry.title,
            detail: entry.detail,
            criterion: typeof entry.criterion === 'string' ? entry.criterion : '',
            expectedGain: typeof entry.expected_gain === 'string' ? entry.expected_gain : '',
          }]
        })
        : [],
    },
  }
}

/** Đọc các hàng `error_logs` — bỏ qua hàng thiếu field bắt buộc. */
export function errorLogsFromRows(rows: unknown): ErrorLogEntry[] {
  if (!Array.isArray(rows)) return []
  return rows.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const entry = item as Record<string, unknown>
    if (typeof entry.quote !== 'string' || typeof entry.correction !== 'string') return []
    return [{
      id: typeof entry.id === 'string' ? entry.id : '',
      criterion: typeof entry.criterion === 'string' ? entry.criterion : '',
      category: typeof entry.category === 'string' ? entry.category : '',
      quote: entry.quote,
      correction: entry.correction,
      explanation: typeof entry.explanation === 'string' ? entry.explanation : '',
      skillTags: stringArray(entry.skill_tags),
    }]
  })
}
export const TOOL_OPERATIONS: ToolOperation[] = ['magic-rewrite', 'argument-stress-test', 'critical-thinking', 'read-image']

/** Kết quả công cụ AI về dạng danh sách dòng để hiển thị. */
export function toolResultLines(operation: ToolOperation, result: unknown): string[] {
  if (!result || typeof result !== 'object') return []
  const value = result as Record<string, unknown>
  if (operation === 'magic-rewrite') {
    const text = typeof value.rewritten_text === 'string' ? value.rewritten_text : ''
    const changes = stringArray(value.changes)
    const cautions = stringArray(value.cautions)
    return [text, ...changes.map(item => `• ${item}`), ...cautions.map(item => `! ${item}`)].filter(Boolean)
  }
  if (operation === 'argument-stress-test') {
    const claims = Array.isArray(value.claims) ? value.claims : []
    const lines = claims.flatMap(item => {
      if (!item || typeof item !== 'object') return []
      const claim = item as Record<string, unknown>
      return [
        typeof claim.claim === 'string' ? claim.claim : '',
        typeof claim.counterargument === 'string' ? `↳ ${claim.counterargument}` : '',
        typeof claim.strength === 'string' ? `(${claim.strength})` : '',
        typeof claim.question === 'string' ? `? ${claim.question}` : '',
      ].filter(Boolean)
    })
    return [...lines, ...stringArray(value.weaknesses).map(item => `• ${item}`), typeof value.summary === 'string' ? value.summary : ''].filter(Boolean)
  }
  if (operation === 'critical-thinking') {
    return [
      ...stringArray(value.questions).map(item => `? ${item}`),
      ...stringArray(value.assumptions).map(item => `= ${item}`),
      ...stringArray(value.counterarguments).map(item => `↳ ${item}`),
      typeof value.summary === 'string' ? value.summary : '',
    ].filter(Boolean)
  }
  const rows = Array.isArray(value.extracted_data) ? value.extracted_data : []
  const lines = rows.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    return [typeof row.label === 'string' ? `${row.label}: ${String(row.value ?? '')} ${String(row.unit ?? '')}`.trim() : ''].filter(Boolean)
  })
  return [...lines, ...stringArray(value.unreadable).map(item => `? ${item}`), typeof value.notes === 'string' ? value.notes : ''].filter(Boolean)
}
