/**
 * Áp dụng các file migration trong supabase/migrations theo thứ tự.
 *
 *   node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
 *
 * Hai đường chạy:
 *   1. DATABASE_URL có sẵn  → dùng psql trực tiếp (nhanh nhất).
 *   2. Không có DATABASE_URL → gọi Management API của Supabase bằng
 *      SUPABASE_ACCESS_TOKEN. Token chỉ cần quyền đọc/ghi SQL.
 *
 * Mỗi file chạy trong một transaction (nếu file có `begin;`/`commit;` thì giữ nguyên).
 * File đã áp dụng được ghi vào bảng public.schema_migrations nên chạy lại không lỗi.
 */
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../migrations', import.meta.url))

/** Thứ tự file: 001, 002, ... 010 (số ở đầu tên). */
function listMigrations() {
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
  return files
}

const files = listMigrations()
const rawUrl = process.env.DATABASE_URL

// ---------------------------------------------------------------- psql

if (rawUrl) {
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
  if (!config.password) {
    console.error('DATABASE_URL không chứa mật khẩu. Migration cần mật khẩu DB.')
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
  process.exit(0)
}

// ---------------------------------------------------------------- Management API

const token = process.env.SUPABASE_ACCESS_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF ?? (/https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '') ?? [])[1] ?? ''
if (!token || !projectRef) {
  console.error('Cần DATABASE_URL, hoặc SUPABASE_ACCESS_TOKEN + project ref để chạy migration.')
  console.error('  - DATABASE_URL lấy từ Supabase Dashboard → Project Settings → Database → Connection string')
  console.error('  - SUPABASE_ACCESS_TOKEN lấy từ https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

async function runSql(sql) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`)
  return text
}

const ensureLedger = `
create table if not exists public.schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);`
await runSql(ensureLedger)

const applied = new Set(
  (JSON.parse(await runSql(`select name from public.schema_migrations;`)) ?? []).map(row => row.name),
)

for (const file of files) {
  if (applied.has(file)) {
    console.log(`\n=== ${file} ===\n(bỏ qua: đã áp dụng)`)
    continue
  }
  console.log(`\n=== ${file} ===`)
  const sql = readFileSync(join(dir, file), 'utf8')
  try {
    await runSql(sql)
  } catch (error) {
    console.error(`Migration thất bại: ${file}`)
    console.error(String(error.message).slice(0, 2000))
    process.exit(1)
  }
  // Ghi vào sổ sau khi file chạy thành công (file đã tự commit nếu có begin/commit).
  await runSql(`insert into public.schema_migrations (name) values ('${file.replaceAll("'", "''")}') on conflict do nothing;`)
  console.log('  đã áp dụng')
}

console.log('\nĐã áp dụng tất cả migration.')
