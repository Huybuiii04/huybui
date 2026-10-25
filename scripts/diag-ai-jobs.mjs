/** Trạng thái hàng đợi AI + cron + lỗi gần nhất. */
const t = process.env.SUPABASE_ACCESS_TOKEN
const ref = 'fjlyjaomuxotqqjvugtv'

async function q(sql) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const text = await r.text()
  if (!r.ok) throw new Error(text.slice(0, 400))
  return JSON.parse(text)
}

console.log('--- job theo status ---')
console.log(JSON.stringify(await q('select status, count(*)::int as n, max(created_at) as last from ai_jobs group by status order by n desc')))

console.log('\n--- 6 job loi gan nhat ---')
console.log(JSON.stringify(await q("select operation, error_code, attempts, created_at, updated_at from ai_jobs where status = 'failed' order by created_at desc limit 6")))

console.log('\n--- 6 job thanh cong gan nhat ---')
console.log(JSON.stringify(await q("select operation, error_code, attempts, created_at from ai_jobs where status = 'succeeded' order by created_at desc limit 6")))

console.log('\n--- cron ---')
console.log(JSON.stringify(await q("select jobname, schedule, active from cron.job where jobname like 'process-ai%'")))
