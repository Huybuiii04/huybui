import { spawnSync } from 'node:child_process'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Thiếu DATABASE_URL')
  process.exit(1)
}

const expectedTables = [
  'profiles', 'user_access',
  'content_entries', 'content_translations', 'writing_prompts',
  'essays', 'essay_revisions', 'essay_assets', 'revision_assets',
  'ai_jobs', 'grading_results', 'essay_features', 'ai_tool_results', 'ai_usage',
  'study_cards', 'review_events', 'error_logs', 'guide_progress',
  'donation_settings', 'admin_audit_logs', 'rate_limit_buckets'
]

const expectedFunctions = [
  'save_draft', 'save_study_card', 'review_card', 'complete_guide',
  'claim_ai_job', 'complete_ai_job', 'fail_ai_job'
]

const expectedBuckets = ['essay-images', 'content-media', 'donation-media']

function query(sql) {
  const result = spawnSync('psql', [url, '-t', '-A', '-F', '|', '-c', sql], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || 'psql failed')
  return result.stdout.trim()
}

let failures = 0
function check(label, actual, expected) {
  const ok = String(actual) === String(expected)
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

console.log(failures ? `\n${failures} kiểm tra thất bại.` : '\nTất cả kiểm tra schema đạt.')
process.exit(failures ? 1 : 0)
