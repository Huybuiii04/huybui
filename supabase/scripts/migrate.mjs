import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Thiếu DATABASE_URL. Chạy: node --env-file=.env.local supabase/scripts/migrate.mjs')
  process.exit(1)
}

const dir = join(process.cwd(), 'supabase', 'migrations')
const files = readdirSync(dir).filter(file => file.endsWith('.sql')).sort()

if (!files.length) {
  console.error(`Không tìm thấy file .sql trong ${dir}`)
  process.exit(1)
}

for (const file of files) {
  console.log(`\n=== ${file} ===`)
  const result = spawnSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-f', join(dir, file)], { stdio: 'inherit' })
  if (result.error) {
    console.error(`Không chạy được psql: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status !== 0) {
    console.error(`Migration thất bại: ${file}`)
    process.exit(result.status ?? 1)
  }
}

console.log('\nĐã áp dụng tất cả migration.')
