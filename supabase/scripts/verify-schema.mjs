import { spawnSync, execFileSync } from 'node:child_process'

const url = process.env.DATABASE_URL
const accessToken = process.env.SUPABASE_ACCESS_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF ?? (/https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '') ?? [])[1] ?? ''

if (!url && !(accessToken && projectRef)) {
  console.error('Thiếu DATABASE_URL, hoặc SUPABASE_ACCESS_TOKEN + project ref.')
  process.exit(1)
}

const expectedTables = [
  'profiles', 'user_access',
  'content_entries', 'content_translations',
  'prompts', 'prompt_topics', 'prompt_chart_types',
  'essays', 'essay_revisions', 'essay_assets', 'revision_assets',
  'ai_jobs', 'grading_results', 'essay_features', 'ai_tool_results', 'ai_usage',
  'study_cards', 'review_events', 'error_logs', 'guide_progress',
  'donation_settings', 'admin_audit_logs', 'rate_limit_buckets',
  'ai_pricing', 'user_prompts',
  'skill_tests', 'skill_sections', 'skill_question_groups', 'skill_questions', 'skill_attempts'
]

const expectedFunctions = [
  'save_draft', 'save_study_card', 'review_card', 'complete_guide',
  'claim_ai_job', 'complete_ai_job', 'fail_ai_job', 'get_prompt',
  'submit_essay_job', 'estimate_ai_cost'
]

const expectedBuckets = ['essay-images', 'content-media', 'donation-media', 'prompt-media', 'user-prompt-media', 'skill-audio']

/** Chạy SQL và trả về chuỗi kết quả (phân tách bằng |). */
function query(sql) {
  if (url) {
    const result = spawnSync('psql', [url, '-t', '-A', '-F', '|', '-c', sql], { encoding: 'utf8' })
    if (result.status !== 0) throw new Error(result.stderr || 'psql failed')
    return result.stdout.trim()
  }
  const response = execFileSync(process.execPath, ['-e', `
    const sql = process.argv[1]
    const res = await fetch('https://api.supabase.com/v1/projects/${projectRef}/database/query', {
      method: 'POST',
      headers: { Authorization: 'Bearer ${accessToken}', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql }),
    })
    const text = await res.text()
    if (!res.ok) { console.error(text); process.exit(1) }
    const rows = JSON.parse(text)
    const flat = rows.map(r => Object.values(r).join('|')).join('\\n')
    process.stdout.write(flat)
  `, sql], { encoding: 'utf8' })
  return response.trim()
}

let failures = 0
function check(label, actual, expected) {
  // psql trả 't'/'f', Management API trả true/false — chuẩn hoá về một dạng.
  const normalize = value => String(value).toLowerCase().replace(/^true$/, 't').replace(/^false$/, 'f')
  const ok = normalize(actual) === normalize(expected)
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`)
}

const tables = query(`select count(*) from information_schema.tables where table_schema='public' and table_name in (${expectedTables.map(t => `'${t}'`).join(',')})`)
check('table count', tables, expectedTables.length)

const rls = query(`select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity and c.relname in (${expectedTables.map(t => `'${t}'`).join(',')})`)
check('tables with RLS enabled', rls, expectedTables.length)

const funcs = query(`select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname in (${expectedFunctions.map(f => `'${f}'`).join(',')})`)
check('public functions', funcs, expectedFunctions.length)

const buckets = query(`select count(*) from storage.buckets where id in (${expectedBuckets.map(b => `'${b}'`).join(',')})`)
check('storage buckets', buckets, expectedBuckets.length)

const anonLeak = query(`select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and has_table_privilege('anon', c.oid, 'SELECT') and c.relname in ('profiles','essays','study_cards','ai_jobs')`)
check('anon SELECT on private tables (must be 0)', anonLeak, 0)

const usageLeak = query(`select has_table_privilege('authenticated', 'public.ai_usage', 'SELECT')`)
check('authenticated SELECT on ai_usage (must be false)', usageLeak, 'f')

const promptWrite = query(`select has_table_privilege('anon', 'public.prompts', 'INSERT')::text || has_table_privilege('anon', 'public.prompts', 'UPDATE')::text || has_table_privilege('anon', 'public.prompts', 'DELETE')::text`)
check('anon write on prompts (must be falsefalsefalse)', promptWrite, 'falsefalsefalse')

const promptRead = query(`select has_table_privilege('anon', 'public.prompts', 'SELECT')::text || has_table_privilege('anon', 'public.prompt_topics', 'SELECT')::text`)
check('anon read on prompts/topics (must be truetrue)', promptRead, 'truetrue')

// Đáp án của skill_questions phải KHÔNG đọc được bởi client (chấm ở Edge Function).
// has_table_privilege KHÔNG tính quyền cấp ở mức cột, nên từng quyền được kiểm riêng.
// Thứ tự: anon table | anon answer_key | anon prompt | authenticated answer_key | authenticated prompt
const skillQuestionPrivileges = query(`select has_table_privilege('anon', 'public.skill_questions', 'SELECT')::text || has_column_privilege('anon', 'public.skill_questions', 'answer_key', 'SELECT')::text || has_column_privilege('anon', 'public.skill_questions', 'prompt', 'SELECT')::text || has_column_privilege('authenticated', 'public.skill_questions', 'answer_key', 'SELECT')::text || has_column_privilege('authenticated', 'public.skill_questions', 'prompt', 'SELECT')::text`)
check('read on skill_questions (must be falsefalsetruefalsetrue)', skillQuestionPrivileges, 'falsefalsetruefalsetrue')

const attemptsInsert = query(`select has_table_privilege('authenticated', 'public.skill_attempts', 'INSERT')::text`)
check('authenticated INSERT on skill_attempts (must be false)', attemptsInsert, 'false')

const dropped = query(`select count(*) from information_schema.tables where table_schema='public' and table_name='writing_prompts'`)
check('writing_prompts removed (must be 0)', dropped, '0')

const concurrencyTrigger = query(`select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relname='ai_jobs' and t.tgname='ai_jobs_concurrency_guard' and not t.tgisinternal`)
check('ai job concurrency trigger (must be 1)', concurrencyTrigger, '1')

const leaseRecovery = query(`select case when pg_get_functiondef(p.oid) like '%lease_until <= now()%' then 'yes' else 'no' end from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='claim_ai_job'`)
check('claim_ai_job reclaims expired leases (must be yes)', leaseRecovery, 'yes')

const costUnknown = query(`select case when public.estimate_ai_cost('v1', 'no-such-model', 100, 100) is null then 'null' else 'value' end`)
check('cost is null for unconfigured models (must be null)', costUnknown, 'null')

console.log(failures ? `\n${failures} kiểm tra thất bại.` : '\nTất cả kiểm tra schema đạt.')
process.exit(failures ? 1 : 0)
