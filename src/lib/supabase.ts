import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

/** True khi đã cấu hình đủ biến môi trường để gọi Supabase. */
export const isConfigured = Boolean(url && key)

/**
 * Env thiếu thì client vẫn được tạo (dùng URL giả) để app không sập lúc khởi động;
 * mọi lời gọi sẽ báo lỗi mạng và UI hiển thị thông báo "chưa cấu hình".
 */
export const supabase: SupabaseClient = createClient(url || 'https://not-configured.supabase.co', key || 'not-configured-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
