/**
 * Bật cron gọi worker `process-ai-jobs` mỗi 10 giây.
 *
 *   node --env-file-if-exists=.env.local supabase/scripts/setup-cron.mjs
 *
 * - Secret worker được lưu trong Vault (không ghi plaintext vào lịch cron).
 * - Cần `SUPABASE_ACCESS_TOKEN` (quyền database_write) hoặc `DATABASE_URL`.
 * - Cần `WORKER_SECRET` trong .env.local — phải khớp secret đã set cho Edge Function.
 */
import { spawnSync } from 'node:child_process'
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
const workerSecret = env.WORKER_SECRET
const projectUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? ''
const projectRef = env.SUPABASE_PROJECT_REF ?? (/https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(projectUrl) ?? [])[1] ?? ''

if (!workerSecret) {
  console.error('Thiếu WORKER_SECRET trong .env.local. Nó phải khớp secret đã set cho Edge Function.')
  process.exit(1)
}
if (!projectRef) {
  console.error('Không tìm thấy project ref.')
  process.exit(1)
}

const secretLiteral = workerSecret.replaceAll("'", "''")
const functionUrl = `https://${projectRef}.supabase.co/functions/v1/process-ai-jobs`

const statements = [
  `create extension if not exists pg_cron;`,
  `create extension if not exists pg_net;`,
  `create table if not exists private.worker_secrets (
     name text primary key,
     value text not null,
     updated_at timestamptz not null default now()
   );`,
  `revoke all on private.worker_secrets from anon, authenticated;`,
  `grant select, insert, update on private.worker_secrets to service_role;`,
  `insert into private.worker_secrets (name, value, updated_at)
   values ('worker_secret', '${secretLiteral}', now())
   on conflict (name) do update set value = excluded.value, updated_at = now();`,
  `select cron.unschedule(jobid) from cron.job where jobname = 'process-ai-jobs';`,
  `select cron.schedule(
     'process-ai-jobs',
     '10 seconds',
     $cron$
     select net.http_post(
       url := '${functionUrl}',
       headers := jsonb_build_object(
         'content-type', 'application/json',
         'x-worker-secret', (select value from private.worker_secrets where name = 'worker_secret')
       ),
       body := '{}'::jsonb
     );
     $cron$
   );`,
]

// ---------------------------------------------------------------- chạy SQL

async function runViaApi(sql) {
  const token = env.SUPABASE_ACCESS_TOKEN
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`)
  return text
}

async function runViaPsql(sql) {
  const rawUrl = env.DATABASE_URL
  if (!rawUrl) throw new Error('Thiếu DATABASE_URL')
  const parsed = new URL(rawUrl)
  const args = [
    '-h', parsed.hostname,
    '-p', parsed.port || '5432',
    '-U', decodeURIComponent(parsed.username),
    '-d', decodeURIComponent(parsed.pathname.replace(/^\//, '')),
    '-w', '-v', 'ON_ERROR_STOP=1', '-c', sql,
  ]
  const result = spawnSync('psql', args, {
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: decodeURIComponent(parsed.password) },
  })
  if (result.status !== 0) throw new Error(result.stderr || 'psql failed')
  return result.stdout
}

const useApi = Boolean(env.SUPABASE_ACCESS_TOKEN)
if (!useApi && !env.DATABASE_URL) {
  console.error('Cần SUPABASE_ACCESS_TOKEN hoặc DATABASE_URL.')
  process.exit(1)
}

for (const statement of statements) {
  const label = statement.split('\n')[0].slice(0, 70)
  try {
    if (useApi) await runViaApi(statement)
    else await runViaPsql(statement)
    console.log(`OK  ${label}`)
  } catch (error) {
    console.error(`LỖI ${label}`)
    console.error(String(error.message).slice(0, 1200))
    process.exit(1)
  }
}

console.log('\nĐã bật cron process-ai-jobs (mỗi 10 giây).')
console.log('Worker sẽ báo lỗi cấu hình cho tới khi ANTHROPIC_API_KEY được set trong Supabase.')
