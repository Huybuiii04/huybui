// Logic thuần cho auth + hồ sơ: không phụ thuộc React hay network để test được.

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'same_password'
  | 'password_mismatch'
  | 'network'
  | 'not_configured'
  | 'unknown'

/** Thông điệp song ngữ cho từng mã lỗi. UI dùng c(vi, en). */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, readonly [string, string]> = {
  invalid_credentials: ['Email hoặc mật khẩu không đúng.', 'Incorrect email or password.'],
  email_taken: ['Email này đã được dùng. Hãy thử đăng nhập.', 'That email is already registered. Try signing in.'],
  weak_password: ['Mật khẩu cần ít nhất 8 ký tự.', 'Password must be at least 8 characters.'],
  email_not_confirmed: ['Hãy xác nhận email trước khi đăng nhập.', 'Confirm your email before signing in.'],
  rate_limited: ['Quá nhiều lần thử. Hãy chờ một chút rồi thử lại.', 'Too many attempts. Please wait a moment and try again.'],
  same_password: ['Mật khẩu mới phải khác mật khẩu cũ.', 'The new password must be different from the old one.'],
  password_mismatch: ['Hai mật khẩu không khớp.', 'The two passwords do not match.'],
  network: ['Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.', 'Could not reach the server. Check your connection and try again.'],
  not_configured: ['Ứng dụng chưa được cấu hình kết nối máy chủ.', 'The app is not configured to reach the server yet.'],
  unknown: ['Có lỗi xảy ra. Hãy thử lại.', 'Something went wrong. Please try again.'],
}

/** Chuyển lỗi Supabase về mã thân thiện — không lộ raw error lên UI. */
export function authErrorCode(error: unknown): AuthErrorCode {
  if (!error) return 'unknown'
  const raw = error as { code?: string; message?: string; status?: number }
  const code = (raw.code ?? '').toLowerCase()
  const message = (raw.message ?? '').toLowerCase()
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'invalid_credentials'
  if (code === 'email_exists' || code === 'user_already_exists' || message.includes('already registered') || message.includes('already been registered')) return 'email_taken'
  if (code === 'weak_password' || message.includes('at least 8 characters') || message.includes('should be at least')) return 'weak_password'
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) return 'email_not_confirmed'
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || message.includes('rate limit') || message.includes('too many')) return 'rate_limited'
  if (code === 'same_password' || message.includes('same password')) return 'same_password'
  if (message.includes('failed to fetch') || message.includes('fetch failed') || message.includes('network')) return 'network'
  return 'unknown'
}

/** Lỗi từ RPC/PostgREST của Supabase — mã hoá thành loại lỗi để UI hiển thị. */
export type RemoteErrorKind = 'suspended' | 'conflict' | 'unauthenticated' | 'not_found' | 'invalid' | 'network' | 'unknown'

export const REMOTE_ERROR_MESSAGES: Record<RemoteErrorKind, readonly [string, string]> = {
  suspended: ['Tài khoản đang bị tạm khóa.', 'This account is suspended.'],
  conflict: ['Dữ liệu đã thay đổi ở nơi khác. Hãy tải lại để lấy phiên bản mới.', 'The data changed elsewhere. Reload to get the latest version.'],
  unauthenticated: ['Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.', 'Your session expired. Please sign in again.'],
  not_found: ['Không tìm thấy dữ liệu.', 'The requested data was not found.'],
  invalid: ['Dữ liệu gửi lên không hợp lệ.', 'The submitted data is invalid.'],
  network: ['Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.', 'Could not reach the server. Check your connection and try again.'],
  unknown: ['Có lỗi xảy ra. Hãy thử lại.', 'Something went wrong. Please try again.'],
}

/**
 * PostgREST trả lỗi PGRST với message là JSON do private.raise_http_error() dựng.
 * Hàm này bóc ra mã lỗi thật (suspended, draft_conflict, ...).
 */
export function parseRemotePayload(error: unknown): { code?: string; message?: string; status?: number } {
  const raw = error as { message?: string; details?: string; code?: string } | null
  if (!raw) return {}
  const fromMessage = safeParse(raw.message)
  const fromDetails = safeParse(raw.details)
  const payload = fromMessage ?? fromDetails ?? {}
  const status = typeof payload.status === 'number' ? payload.status : typeof fromDetails?.status === 'number' ? fromDetails.status : undefined
  return { code: typeof payload.code === 'string' ? payload.code : undefined, message: typeof payload.message === 'string' ? payload.message : undefined, status }
}

function safeParse(value: string | undefined): Record<string, unknown> | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed.startsWith('{')) return undefined
  try {
    const parsed = JSON.parse(trimmed) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : undefined
  } catch {
    return undefined
  }
}

/** Phân loại lỗi RPC: 42501 = tài khoản bị suspend, 409 = xung đột phiên bản. */
export function classifyRemoteError(error: unknown): RemoteErrorKind {
  const raw = error as { code?: string; message?: string; status?: number } | null
  if (!raw) return 'unknown'
  const payload = parseRemotePayload(error)
  const code = payload.code ?? ''
  // Mã cụ thể từ private.raise_http_error() được ưu tiên hơn HTTP status.
  if (code === 'suspended') return 'suspended'
  if (code === 'draft_conflict') return 'conflict'
  if (code === 'card_not_due' || code.endsWith('_not_found')) return 'not_found'
  if (code === 'unauthenticated') return 'unauthenticated'
  if (code.startsWith('invalid_')) return 'invalid'
  if (payload.status === 409) return 'conflict'
  if (payload.status === 401) return 'unauthenticated'
  if (payload.status === 404) return 'not_found'
  if (payload.status === 400) return 'invalid'
  const message = (raw.message ?? '').toLowerCase()
  // Thiếu quyền GRANT là lỗi cấu hình, không phải tài khoản bị khoá.
  if (message.includes('permission denied for table') || message.includes('permission denied for column')) return 'invalid'
  if (message.includes('failed to fetch') || message.includes('fetch failed') || message.includes('network')) return 'network'
  if (raw.code === '42501') return 'suspended'
  if (raw.status === 403) return 'suspended'
  return 'unknown'
}

export type ProfileState = { name: string; target: string; feedback: string }

export type ProfileRow = {
  id: string
  display_name: string | null
  ui_locale: string | null
  feedback_locale: string | null
  timezone: string | null
  target_band: number | string | null
}

/** profiles.target_band là numeric(2,1) — chuẩn hoá về chuỗi "7.0". */
export function normalizeBand(value: string | number | null | undefined): string {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : typeof value === 'number' ? value : Number.NaN
  if (!Number.isFinite(parsed)) return '7.0'
  const clamped = Math.min(9, Math.max(0, Math.round(parsed * 10) / 10))
  return clamped.toFixed(1)
}

export function profileFromRow(row: ProfileRow | null | undefined): ProfileState {
  return {
    name: row?.display_name ?? '',
    target: normalizeBand(row?.target_band ?? '7.0'),
    feedback: row?.feedback_locale === 'en' ? 'en' : 'vi',
  }
}

export function profileToRow(id: string, profile: ProfileState, extra: { uiLocale: string; timezone: string }) {
  return {
    id,
    display_name: profile.name.trim(),
    ui_locale: extra.uiLocale === 'en' ? 'en' : 'vi',
    feedback_locale: profile.feedback === 'en' ? 'en' : 'vi',
    timezone: extra.timezone,
    target_band: Number(normalizeBand(profile.target)),
  }
}
