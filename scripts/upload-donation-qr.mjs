/**
 * Nạp mã QR ủng hộ vào bucket `donation-media` và bật cấu hình donate.
 *
 *   node --env-file-if-exists=.env.local scripts/upload-donation-qr.mjs [duong-dan-anh]
 *
 * Mặc định lấy ảnh trong `public/donate-qr.png`.
 * Script idempotent: upload lại đè file cũ, cập nhật donation_settings.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const env = { ...process.env }
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
const key = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.local')
  process.exit(1)
}

const source = process.argv[2] ?? join('public', 'donate-qr.png')
const bytes = readFileSync(source)
const name = basename(source)

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const upload = await admin.storage.from('donation-media').upload(name, bytes, {
  contentType: 'image/png',
  upsert: true,
})
if (upload.error) {
  console.error('Không upload được ảnh QR:', upload.error.message)
  process.exit(1)
}

const publicUrl = `${url}/storage/v1/object/public/donation-media/${name}`

const settings = {
  id: true,
  methods: [
    { label: 'MB Bank · VietQR', value: '88882822222', note: 'BUI DINH ANH HUY' },
  ],
  instructions: {
    vi: 'Mở ứng dụng ngân hàng, chọn quét mã QR và kiểm tra đúng số tài khoản trước khi chuyển. Mọi đóng góp đều tự nguyện.',
    en: 'Open your banking app, scan the QR code and check the account number before sending. Every contribution is voluntary.',
  },
  qr_path: publicUrl,
  is_configured: true,
  updated_at: new Date().toISOString(),
}

const { error } = await admin.from('donation_settings').upsert(settings, { onConflict: 'id' })
if (error) {
  console.error('Không lưu được donation_settings:', error.message)
  process.exit(1)
}

console.log('Da upload:', name, `(${(bytes.length / 1024).toFixed(0)} KB)`)
console.log('QR cong khai:', publicUrl)
console.log('Da bat cau hinh donate.')
