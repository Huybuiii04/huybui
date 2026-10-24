/**
 * Bật "auto confirm" cho đăng ký bằng email của dự án Supabase.
 *
 *   node --env-file-if-exists=.env.local supabase/scripts/enable-autoconfirm.mjs
 *
 * - Không có bước xác nhận email: đăng ký xong là đăng nhập được ngay.
 * - Cần `SUPABASE_ACCESS_TOKEN` (quyền project config) trong .env.local.
 * - Cờ này nằm trong cấu hình dự án (không phải trong code) nên script này
 *   giúp dựng lại được sau khi clone hoặc đổi project.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** Đọc .env.local kể cả khi script chạy từ thư mục con. */
function readEnvFile() {
  const candidates = [join(process.cwd(), '.env.local'), resolve(process.cwd(), '..', '.env.local')]
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const values = {}
    for (const line of readFileSync(candidate, 'utf8').split('\n')) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
      if (!match) continue
      values[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
    }
    return values
  }
  return {}
}

const env = { ...readEnvFile(), ...process.env }
const projectUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? ''
const projectRef = env.SUPABASE_PROJECT_REF ?? (/https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(projectUrl) ?? [])[1] ?? ''
const token = env.SUPABASE_ACCESS_TOKEN

if (!projectRef) {
  console.error('Không tìm thấy project ref (cần SUPABASE_URL hoặc SUPABASE_PROJECT_REF trong .env.local).')
  process.exit(1)
}
if (!token) {
  console.error('Thiếu SUPABASE_ACCESS_TOKEN trong .env.local.')
  process.exit(1)
}

const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`

const before = await fetch(endpoint, { headers }).then(async response => {
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`)
  return response.json()
})
console.log(`Trước: mailer_autoconfirm = ${before.mailer_autoconfirm}`)

if (before.mailer_autoconfirm) {
  console.log('Đã bật sẵn — đăng ký không cần xác nhận email.')
} else {
  const after = await fetch(endpoint, { method: 'PATCH', headers, body: JSON.stringify({ mailer_autoconfirm: true }) }).then(async response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    return response.json()
  })
  console.log(`Sau: mailer_autoconfirm = ${after.mailer_autoconfirm}`)
  console.log('\nĐăng ký giờ trả về phiên đăng nhập ngay, không cần bước xác nhận email.')
}
