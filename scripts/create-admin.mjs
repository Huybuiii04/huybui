/**
 * Tạo (hoặc cấp quyền) tài khoản quản trị.
 *
 *   node --env-file-if-exists=.env.local scripts/create-admin.mjs
 *
 * Idempotent: nếu tài khoản đã tồn tại thì chỉ cập nhật quyền admin.
 */
import { createClient } from '@supabase/supabase-js'

const env = { ...process.env }
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
const key = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY
const email = env.ADMIN_EMAIL ?? 'admin@gmail.com'
const password = env.ADMIN_PASSWORD ?? 'admin123'

if (!url || !key) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.local')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

let userId = ''
const created = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: 'Admin' },
})

if (created.error) {
  const message = created.error.message ?? ''
  if (!/already|registered|exists/i.test(message)) {
    console.error('Không tạo được tài khoản admin:', message)
    process.exit(1)
  }
  console.log('Tài khoản đã tồn tại — dùng lại.')
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) {
    console.error('Không tìm được tài khoản:', error.message)
    process.exit(1)
  }
  const found = data.users.find(user => (user.email ?? '').toLowerCase() === email.toLowerCase())
  if (!found) {
    console.error(`Không thấy tài khoản ${email} trong danh sách.`)
    process.exit(1)
  }
  userId = found.id
} else {
  userId = created.data.user.id
  console.log(`Đã tạo tài khoản ${email}`)
}

const access = await admin.from('user_access').update({ role: 'admin', status: 'active' }).eq('user_id', userId)
if (access.error) {
  console.error('Không cấp quyền admin được:', access.error.message)
  process.exit(1)
}

const profile = await admin.from('profiles').update({ display_name: 'Admin' }).eq('id', userId)
if (profile.error) console.error('Cảnh báo: không cập nhật được hồ sơ:', profile.error.message)

const check = await admin.from('user_access').select('role,status').eq('user_id', userId).maybeSingle()
console.log('Quyền hiện tại:', JSON.stringify(check.data))
console.log(`Sẵn sàng đăng nhập: ${email}`)
