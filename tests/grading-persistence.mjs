/**
 * Kiểm chứng: chấm bài xong thì kết quả + góp ý PHẢI còn lại.
 *
 * Trước đây có 4 lỗi khiến người dùng thấy "chấm xong mà mất kết quả":
 *   1. Không gian viết không nạp lại kết quả đã lưu.
 *   2. Model trả `needs_reference` cho Task 2 vì tưởng thiếu band descriptor.
 *   3. `errors` trả về dạng chuỗi JSON nên bị bỏ mất.
 *   4. Quote lệch nhẹ (hoa thường/khoảng trắng) nên bị lọc khỏi error_logs.
 *
 *   node --env-file-if-exists=.env.local tests/grading-persistence.mjs
 *
 * Cần dev server ở http://127.0.0.1:5173 (hoặc đặt TEST_URL).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'

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
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY
const anonKey = env.SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY
const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'

const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'content-type': 'application/json' }
const email = `persistence-${Date.now()}@example.com`
const password = 'Persistence123!'
const TITLE = `Persistence check ${Date.now()}`

const ESSAY = `The rise of remote work has transformed the modern workplace. In my view, this development is largely beneficial, although it is not without its drawbacks.

To begin with, the benefits of remote work are significant for both employees and employers. Workers no longer need to spend hours travelling to an office every day, which means they have more time for rest, family and exercise. This change has improved job satisfaction for many people and has allowed companies to recruit talented individuals who live far away from major cities. Furthermore, because employees can work from wherever they are most comfortable, they tend to be more productive and take fewer sick days.

However, there are also clear disadvantages. The main problem is that remote workers find it much harder to build relationships with their colleagues. As a result, many people report feeling isolated and lonely, and new employees in particular struggle to learn how the organisation actually works. Another concern is that some companies have noticed a decline in the creativity of their staff, since brainstorming and informal conversations that happen in a physical office are difficult to reproduce online.

On balance, I believe that the advantages outweigh the drawbacks, provided that employers take deliberate steps to address the problems. For example, a company could organise regular team meetings in person and use chat tools during the working day so that staff who are at home do not feel left out. If companies manage remote work carefully rather than treating it as a simple cost-cutting measure, then it can be a positive change for both workers and organisations.`

const PROMPT = 'Some people think that working from home is more beneficial than working in an office. To what extent do you agree or disagree?'

async function api(path, options = {}) {
  const res = await fetch(`${url}${path}`, options)
  const text = await res.text()
  try { return { status: res.status, body: JSON.parse(text) } } catch { return { status: res.status, body: text } }
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const problems = []
page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))

try {
  // 1. Tạo tài khoản + bài viết.
  const created = await api('/auth/v1/admin/users', {
    method: 'POST', headers: serviceHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  const userId = created.body.id
  const session = await api('/auth/v1/token?grant_type=password', {
    method: 'POST', headers: { apikey: anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const userHeaders = { apikey: anonKey, Authorization: `Bearer ${session.body.access_token}`, 'content-type': 'application/json' }

  const saved = await api('/rest/v1/rpc/save_draft', {
    method: 'POST', headers: userHeaders,
    body: JSON.stringify({
      p_essay_id: null, p_expected_version: null, p_task_type: 'task2', p_subtype: 'opinion',
      p_title: TITLE, p_prompt_text: PROMPT, p_body_text: ESSAY, p_reference_data: '',
      p_target_band: 7, p_feedback_locale: 'vi', p_draft: { client_id: crypto.randomUUID() },
    }),
  })
  const essayId = saved.body.essay_id

  // 2. Nộp bài để chấm.
  const submitted = await api('/functions/v1/submit-essay', {
    method: 'POST', headers: userHeaders,
    body: JSON.stringify({ essayId, expectedVersion: saved.body.draft_version, idempotencyKey: `persist-${Date.now()}`, mode: 'grade' }),
  })
  if (submitted.status !== 202) throw new Error(`submit-essay thất bại: ${JSON.stringify(submitted.body)}`)
  const revisionId = submitted.body.revisionId

  // 3. Chạy worker tới khi cả hai job xong.
  const deadline = Date.now() + 600_000
  let jobs = []
  while (Date.now() < deadline) {
    await api('/functions/v1/process-ai-jobs', { method: 'POST', headers: serviceHeaders, body: '{}' })
    const rows = await api(`/rest/v1/ai_jobs?select=operation,status,error_code&revision_id=eq.${revisionId}`, { headers: serviceHeaders })
    jobs = rows.body ?? []
    if (jobs.length >= 2 && jobs.every(job => ['succeeded', 'failed', 'cancelled'].includes(job.status))) break
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  const failed = jobs.filter(job => job.status !== 'succeeded')
  if (failed.length) throw new Error(`job AI thất bại: ${JSON.stringify(failed)}`)

  // 4. Dữ liệu phải có trong DB.
  const grading = await api(`/rest/v1/grading_results?select=overall_display,feedback&revision_id=eq.${revisionId}`, { headers: userHeaders })
  const gradingRow = grading.body?.[0]
  if (!gradingRow) throw new Error('grading_results không có dòng')
  if (gradingRow.overall_display === null) throw new Error('grading_results có điểm null')
  if (gradingRow.feedback?.status !== 'ok') throw new Error(`feedback.status = ${gradingRow.feedback?.status}`)

  const errorRows = await api(`/rest/v1/error_logs?select=id,quote&revision_id=eq.${revisionId}`, { headers: userHeaders })
  if (!(errorRows.body ?? []).length) {
    const jobRows = await api(`/rest/v1/ai_jobs?select=operation,status,cache_key&revision_id=eq.${revisionId}`, { headers: serviceHeaders })
    throw new Error(`error_logs rỗng — mất góp ý. jobs: ${JSON.stringify(jobRows.body)}`)
  }

  // 5. UI phải hiện lại kết quả đã lưu.
  await page.goto(`${base}/auth`)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel(/^Mật khẩu|^Password/).fill(password)
  await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
  await page.waitForURL(target => !target.pathname.startsWith('/auth'), { timeout: 30000 })

  // Đường dẫn của app dùng client_id (lưu trong cột jsonb `draft`), không phải
  // essay_id — lấy từ danh sách bài viết.
  await page.goto(`${base}/app/essays`)
  await page.getByText(TITLE, { exact: false }).first().waitFor()
  await page.getByText(TITLE, { exact: false }).first().click()
  await page.waitForTimeout(1500)
  const clientId = new URL(page.url()).searchParams.get('id')
  if (!clientId) throw new Error(`không lấy được client_id từ URL: ${page.url()}`)

  await page.goto(`${base}/app/write?id=${clientId}`)
  await page.waitForTimeout(4000)
  if (await page.locator('.overall-score strong').count() === 0) throw new Error('không gian viết không hiện điểm đã lưu')
  if (await page.getByText(/Mistakes to fix|Lỗi sai cần sửa/i).count() === 0) throw new Error('không gian viết không hiện khối lỗi')

  await page.goto(`${base}/app/essays/${clientId}`)
  await page.waitForTimeout(2500)
  if (await page.locator('.overall-score strong').count() === 0) throw new Error('trang chi tiết không hiện điểm')

  console.log(`PASS: chấm xong → điểm ${gradingRow.overall_display}, ${errorRows.body.length} góp ý, UI nạp lại được cả hai.`)
} catch (error) {
  console.log('VẤN ĐỀ:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await browser.close()
  // Dọn tài khoản test.
  const users = await api('/auth/v1/admin/users?per_page=200', { headers: serviceHeaders })
  for (const user of users.body?.users ?? []) {
    if (user.email !== email) continue
    await api(`/auth/v1/admin/users/${user.id}`, { method: 'DELETE', headers: serviceHeaders })
  }
}
