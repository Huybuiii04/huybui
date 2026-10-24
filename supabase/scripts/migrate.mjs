import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rawUrl = process.env.DATABASE_URL
if (!rawUrl) {
  console.error('Thiếu DATABASE_URL. Chạy: npm run db:migrate (hoặc: node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs)')
  process.exit(1)
}

let config
try {
  const parsed = new URL(rawUrl)
  config = {
    host: parsed.hostname,
    port: parsed.port || '5432',
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
  }
} catch {
  console.error('DATABASE_URL không phải một URL hợp lệ.')
  process.exit(1)
}

if (!config.host || !config.user) {
  console.error('DATABASE_URL thiếu host hoặc user.')
  process.exit(1)
}

if (!config.password) {
  console.error('DATABASE_URL không chứa mật khẩu. Migration cần mật khẩu DB.')
  process.exit(1)
}

const dir = fileURLToPath(new URL('../migrations', import.meta.url))
let files = []
try {
  files = readdirSync(dir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

if (!files.length) {
  console.error(`Không tìm thấy file .sql trong ${dir}`)
  process.exit(1)
}

const childEnv = { ...process.env, PGPASSWORD: config.password, PGCONNECT_TIMEOUT: '10' }
delete childEnv.DATABASE_URL

for (const file of files) {
  console.log(`\n=== ${file} ===`)
  const args = ['-h', config.host, '-p', config.port, '-U', config.user]
  if (config.database) args.push('-d', config.database)
  args.push('-w', '-v', 'ON_ERROR_STOP=1', '-f', join(dir, file))
  const result = spawnSync('psql', args, { stdio: 'inherit', env: childEnv })
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
