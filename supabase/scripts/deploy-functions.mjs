/**
 * Deploy 13 Edge Function lên Supabase và set secrets.
 *
 *   node --env-file-if-exists=.env.local supabase/scripts/deploy-functions.mjs
 *   node --env-file-if-exists=.env.local supabase/scripts/deploy-functions.mjs --secrets-only
 *
 * Cần:
 *   - SUPABASE_ACCESS_TOKEN  (personal access token của Supabase: https://supabase.com/dashboard/account/tokens)
 *   - SUPABASE_PROJECT_REF   (mặc định lấy từ VITE_SUPABASE_URL)
 *   - ANTHROPIC_API_KEY     (để set secret, không in ra màn hình)
 *   - WORKER_SECRET         (để set secret cho worker)
 *
 * Không deploy `process-ai-jobs` nếu chưa có WORKER_SECRET.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const FUNCTIONS = [
  'submit-essay',
  'prepare-upload',
  'retry-job',
  'run-writing-tool',
  'delete-essay',
  'delete-account',
  'admin-content',
  'admin-users',
  'admin-usage',
  'admin-session',
  'admin-data',
  'process-ai-jobs',
  'grade-skill',
]

const args = process.argv.slice(2)
const secretsOnly = args.includes('--secrets-only')
const skipWorker = args.includes('--skip-worker')

/** Đọc .env.local (không dùng --env-file vì file nằm ở thư mục cha của script). */
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
const projectUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? ''
const projectRef = env.SUPABASE_PROJECT_REF ?? (/https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(projectUrl) ?? [])[1] ?? ''
const accessToken = env.SUPABASE_ACCESS_TOKEN ?? ''

if (!projectRef) {
  console.error('Không tìm thấy project ref. Đặt SUPABASE_PROJECT_REF hoặc VITE_SUPABASE_URL trong .env.local.')
  process.exit(1)
}
if (!accessToken) {
  console.error('Thiếu SUPABASE_ACCESS_TOKEN. Tạo personal access token tại https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

const childEnv = { ...env, SUPABASE_ACCESS_TOKEN: accessToken, SUPABASE_PROJECT_REF: projectRef }

/** Chạy lệnh supabase CLI, trả về true khi thành công. */
function run(label, commandArgs) {
  console.log(`\n=== ${label} ===`)
  const result = spawnSync('npx', ['--yes', 'supabase@2.122.0', ...commandArgs], {
    stdio: 'inherit',
    env: childEnv,
    shell: true,
  })
  if (result.status !== 0) {
    console.error(`Thất bại: ${label}`)
    return false
  }
  return true
}

if (!secretsOnly) {
  const targets = skipWorker ? FUNCTIONS.filter(name => name !== 'process-ai-jobs') : FUNCTIONS
  for (const name of targets) {
    if (!run(`deploy ${name}`, ['functions', 'deploy', name, '--project-ref', projectRef])) {
      console.error(`\nDừng vì deploy ${name} thất bại.`)
      process.exit(1)
    }
  }
  console.log(`\nĐã deploy ${targets.length} function.`)
}

// Secrets: chỉ truyền những biến có giá trị trong môi trường.
const secretValues = [
  ['ANTHROPIC_API_KEY', env.ANTHROPIC_API_KEY],
  ['AI_API_BASE_URL', env.AI_API_BASE_URL],
  ['AI_API_KEY', env.AI_API_KEY],
  ['AI_API_PROTOCOL', env.AI_API_PROTOCOL],
  ['AI_STRUCTURED_MODE', env.AI_STRUCTURED_MODE],
  ['WORKER_SECRET', env.WORKER_SECRET],
  ['ADMIN_PASSWORD', env.ADMIN_PASSWORD],
  ['AI_MODEL_GRADING', env.AI_MODEL_GRADING],
  ['AI_MODEL_EXTRACTION', env.AI_MODEL_EXTRACTION],
  ['ALLOWED_ORIGINS', env.ALLOWED_ORIGINS],
].filter(([, value]) => Boolean(value))

if (secretValues.length) {
  const pairs = secretValues.map(([name, value]) => `${name}=${value}`)
  console.log('\n=== set secrets ===')
  console.log(`Đang set: ${secretValues.map(([name]) => name).join(', ')}`)
  if (!run('secrets set', ['secrets', 'set', '--project-ref', projectRef, ...pairs])) {
    console.error('Set secrets thất bại.')
    process.exit(1)
  }
} else {
  console.log('\nKhông có biến secret nào trong .env.local — bỏ qua bước set secrets.')
}

if (!env.ANTHROPIC_API_KEY && !env.AI_API_KEY) {
  console.log('\nCẢNH BÁO: chưa có ANTHROPIC_API_KEY hoặc AI_API_KEY. Các function gọi AI sẽ trả lỗi cấu hình.')
}
if (!env.WORKER_SECRET && !skipWorker) {
  console.log('\nCẢNH BÁO: chưa có WORKER_SECRET. Worker process-ai-jobs sẽ từ chối mọi lời gọi.')
}

console.log('\nXong.')
