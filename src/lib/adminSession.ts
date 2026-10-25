// Phiên quản trị lớp 2: token HMAC lưu trong sessionStorage, gọi Edge Function kèm token.

import { supabase } from './supabase'

const STORAGE_KEY = 'ielts-admin-session'
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000

export type AdminSession = { token: string; expiresAt: number }

export function getAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminSession
    if (!parsed.token || parsed.expiresAt <= Date.now()) {
      clearAdminSession()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage bị chặn: phiên chỉ sống trong RAM */
  }
}

/** Đổi mật khẩu quản trị lấy token. Trả null khi sai mật khẩu hoặc chưa đăng nhập. */
export async function unlockAdmin(password: string): Promise<AdminSession | null> {
  const { data, error } = await supabase.functions.invoke('admin-session', { body: { password } })
  if (error || !data) return null
  const session = data as AdminSession
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    /* bỏ qua */
  }
  return session
}

/** Gọi `admin-data` kèm token quản trị. */
export async function adminAction<T>(action: string, payload: Record<string, unknown> = {}): Promise<{ ok: true; value: T } | { ok: false; code: string }> {
  const session = getAdminSession()
  if (!session) return { ok: false, code: 'invalid_admin_token' }
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  if (!base || !key) return { ok: false, code: 'not_connected' }
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const response = await fetch(`${base}/functions/v1/admin-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${sessionData.session?.access_token ?? ''}`,
        'x-admin-token': session.token,
      },
      body: JSON.stringify({ action, ...payload }),
    })
    if (!response.ok) return { ok: false, code: response.status === 401 ? 'invalid_admin_token' : response.status === 403 ? 'forbidden' : 'unknown' }
    return { ok: true, value: (await response.json()) as T }
  } catch {
    return { ok: false, code: 'unknown' }
  }
}
