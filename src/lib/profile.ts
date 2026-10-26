import { supabase } from './supabase'
import { profileToRow, type ProfileRow, type ProfileState } from './authLogic'
import { languageStorageKey } from '../agent/language'

export type { ProfileRow, ProfileState }

export function detectLocale(): 'vi' | 'en' {
  try {
    return localStorage.getItem(languageStorageKey) === 'en' ? 'en' : 'vi'
  } catch {
    return 'vi'
  }
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh'
  } catch {
    return 'Asia/Ho_Chi_Minh'
  }
}

/** Đọc hồ sơ từ bảng profiles (RLS chỉ cho chính chủ xem). */
export async function loadProfileRow(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return (data as ProfileRow | null) ?? null
}

/**
 * Đồng bộ hồ sơ bằng upsert (onConflict 'id').
 * profiles chỉ cấp quyền SELECT/UPDATE cho authenticated (không có INSERT),
 * nên upsert có thể bị từ chối → fallback sang UPDATE cho hàng đã tồn tại.
 */
export async function saveProfileRow(userId: string, profile: ProfileState): Promise<void> {
  const row = profileToRow(userId, profile, { uiLocale: detectLocale(), timezone: detectTimezone() })
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
  if (!error) return
  const { id: _id, ...columns } = row
  const { data, error: updateError } = await supabase.from('profiles').update(columns).eq('id', userId).select('id')
  if (updateError) throw updateError
  if (!data?.length) {
    const { error: insertError } = await supabase.from('profiles').insert(row)
    if (insertError) throw insertError
  }
}
