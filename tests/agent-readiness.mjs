/**
 * Smoke test HTTP cho agent trên bản deploy Vercel preview.
 *
 *   TEST_URL=https://<preview>.vercel.app node tests/agent-readiness.mjs
 *
 * Không set TEST_URL thì test bỏ qua (giống tests/production.mjs).
 *
 * Bản preview có thể bật Vercel Authentication (deployment protection). Khi đó
 * đặt TEST_BYPASS_TOKEN bằng "protection bypass secret" của project để mọi
 * request kèm header x-vercel-protection-bypass và đọc được bản deploy:
 *
 *   TEST_URL=https://<preview>.vercel.app TEST_BYPASS_TOKEN=<secret> node tests/agent-readiness.mjs
 *
 * Chỉ dùng `fetch` sẵn có của Node (>= 18) và `node:assert/strict`:
 * không thêm dependency nào. Mỗi check in một dòng PASS/FAIL, cuối cùng in
 * tổng kết và exit code khác 0 nếu có check hỏng.
 *
 * Kiểm tra (theo thứ tự):
 *  1. GET / (text/html) → 200, text/html, có <h1> và nội dung hero.
 *  2. GET / (text/markdown) → 200, text/markdown; charset=utf-8, Vary: Accept,
 *     body bắt đầu bằng "# " và dài hơn 500 ký tự.
 *  3. GET / (text/markdown;q=0, wildcard q=1) → 200 HTML (q=0 của Markdown thắng).
 *  4. GET / (application/json) → 406.
 *  5. Đường dẫn lạ (text/html) → 404, text/html, link /, /llms.txt, /sitemap.xml.
 *  6. Đường dẫn lạ (text/markdown) → 404, text/markdown, nhắc 404 và link
 *     /llms.txt, /sitemap.xml.
 *  7. /app/essays/does-not-exist → 200 (route động hợp lệ không được 404).
 *  8. /auth/callback?code=...&state=... → 200 (query string phải còn nguyên).
 *  9. /assets/does-not-exist.js → 404 và body không phải HTML của SPA.
 * 10. /favicon.svg → 200 image/svg+xml; asset build có hash (URL lấy từ trang đang
 *     phục vụ, đối chiếu với dist/index.html local) → 200 kiểu JS.
 * 11. /robots.txt, /llms.txt, /sitemap.xml, /og-image.png → 200 đúng kiểu file.
 * 12. /api/does-not-exist → 404 JSON có error.code/hint/message/status.
 * 13. /about, /contact, /privacy → 200 text/html với <h1> có chữ.
 * 14. Trộn cache CDN: HTML → Markdown → HTML, response thứ ba phải là HTML.
 * 15. HEAD / → 200 có content-type, body rỗng; HEAD đường dẫn lạ → 404, body rỗng.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = (process.env.TEST_URL ?? '').trim().replace(/\/+$/, '')
if (!base) {
  console.log('SKIP: đặt TEST_URL để kiểm tra bản deploy (ví dụ https://<preview>.vercel.app)')
  process.exit(0)
}

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const distIndexPath = join(repoRoot, 'dist', 'index.html')
const ogImagePath = join(repoRoot, 'public', 'og-image.png')

// Secret bypass của Vercel Deployment Protection (tuỳ chọn): chỉ dùng khi bản
// deploy bật Vercel Authentication. Không ghi secret này vào repo.
const bypassToken = (process.env.TEST_BYPASS_TOKEN ?? '').trim()

// Đường dẫn không tồn tại, dùng làm mẫu cho cả bản HTML lẫn bản Markdown.
const UNKNOWN_PATH = '/agent-audit-missing-20261026'
// Một đoạn chữ chỉ có trong hero của landing (bản HTML), không có trong Markdown.
const HERO_TEXT = 'Practise IELTS Writing'
// Dấu hiệu bản Markdown: bắt đầu bằng một heading cấp 1.
const MARKDOWN_HEADING = '# '
// Dấu hiệu bản HTML của SPA (dùng để phân biệt với trang lỗi).
const SPA_MARKERS = ['id="root"', 'class="landing"']

const results = []

function summarize(response, body = '') {
  const contentType = response.headers.get('content-type') ?? '(none)'
  const preview = body.replace(/\s+/g, ' ').trim().slice(0, 240)
  return `status=${response.status} content-type="${contentType}" url=${response.url} body="${preview}"`
}

async function request(path, { accept, method = 'GET' } = {}) {
  const headers = {}
  if (accept) headers.accept = accept
  if (bypassToken) headers['x-vercel-protection-bypass'] = bypassToken
  return fetch(`${base}${path}`, { headers, method, redirect: 'follow', signal: AbortSignal.timeout(30000) })
}

// Chạy một check, in kết quả ngay và ghi lại để in tổng kết cuối cùng.
// Một check hỏng không được làm dừng các check còn lại.
async function check(name, run) {
  try {
    const detail = await run()
    results.push({ name, ok: true, detail })
    console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    results.push({ name, ok: false, detail })
    console.log(`FAIL  ${name} — ${detail}`)
  }
}

// Đọc kích thước ảnh PNG từ byte đầu tiên (IHDR) để kiểm tra khung 1200×630.
function pngSize(buffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) return null
  if (buffer.subarray(12, 16).toString('latin1') !== 'IHDR') return null
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

console.log(`Agent readiness smoke — ${base}`)

await check('1. GET / (text/html) → 200 HTML có <h1> và nội dung hero', async () => {
  const response = await request('/', { accept: 'text/html' })
  const body = await response.text()
  assert.equal(response.status, 200, `Landing phải trả 200 — ${summarize(response, body)}`)
  const contentType = response.headers.get('content-type') ?? ''
  assert.ok(contentType.includes('text/html'), `Landing phải là text/html — ${summarize(response, body)}`)
  assert.match(body, /<h1[\s>]/i, `Landing phải có thẻ <h1> — ${summarize(response, body)}`)
  assert.ok(body.includes(HERO_TEXT), `Landing phải có nội dung hero "${HERO_TEXT}" — ${summarize(response, body)}`)
  return `200 text/html, có <h1> và hero "${HERO_TEXT}"`
})

await check('2. GET / (text/markdown) → 200 Markdown có Vary: Accept', async () => {
  const response = await request('/', { accept: 'text/markdown' })
  const body = await response.text()
  assert.equal(response.status, 200, `Landing Markdown phải trả 200 — ${summarize(response, body)}`)
  const contentType = response.headers.get('content-type') ?? ''
  assert.ok(
    contentType.includes('text/markdown; charset=utf-8'),
    `Landing Markdown phải là "text/markdown; charset=utf-8" — ${summarize(response, body)}`,
  )
  const vary = response.headers.get('vary') ?? ''
  assert.ok(/accept/i.test(vary), `Response Markdown phải có Vary: Accept — ${summarize(response, body)}`)
  assert.ok(body.startsWith(MARKDOWN_HEADING), `Body Markdown phải bắt đầu bằng "# " — ${summarize(response, body)}`)
  assert.ok(body.length > 500, `Body Markdown quá ngắn (${body.length} ký tự, cần > 500) — ${summarize(response, body)}`)
  return `200 text/markdown; charset=utf-8, Vary: ${vary}, ${body.length} ký tự`
})

await check('3. GET / (text/markdown;q=0, */*;q=1) → 200 HTML (Markdown bị từ chối)', async () => {
  const response = await request('/', { accept: 'text/markdown;q=0, */*;q=1' })
  const body = await response.text()
  assert.equal(response.status, 200, `Landing phải trả 200 — ${summarize(response, body)}`)
  const contentType = response.headers.get('content-type') ?? ''
  assert.ok(contentType.includes('text/html'), `q=0 phải loại Markdown nên phải trả HTML — ${summarize(response, body)}`)
  assert.ok(body.includes(HERO_TEXT), `Body phải là bản HTML có hero — ${summarize(response, body)}`)
  return `200 text/html, Markdown bị từ chối đúng (q=0)`
})

await check('4. GET / (application/json) → 406', async () => {
  const response = await request('/', { accept: 'application/json' })
  const body = await response.text()
  assert.equal(response.status, 406, `Client chỉ nhận JSON phải nhận 406 — ${summarize(response, body)}`)
  return `406 (content-type "${response.headers.get('content-type') ?? '(none)'}")`
})

await check(`5. GET ${UNKNOWN_PATH} (text/html) → 404 HTML có link điều hướng`, async () => {
  const response = await request(UNKNOWN_PATH, { accept: 'text/html' })
  const body = await response.text()
  assert.equal(response.status, 404, `Đường dẫn lạ phải trả 404 — ${summarize(response, body)}`)
  const contentType = response.headers.get('content-type') ?? ''
  assert.ok(contentType.includes('text/html'), `Trang 404 phải là text/html — ${summarize(response, body)}`)
  assert.ok(body.includes('href="/"'), `Trang 404 phải link về / — ${summarize(response, body)}`)
  assert.ok(body.includes('/llms.txt'), `Trang 404 phải link tới /llms.txt — ${summarize(response, body)}`)
  assert.ok(body.includes('/sitemap.xml'), `Trang 404 phải link tới /sitemap.xml — ${summarize(response, body)}`)
  return '404 text/html, có link /, /llms.txt, /sitemap.xml'
})

await check(`6. GET ${UNKNOWN_PATH} (text/markdown) → 404 Markdown có link điều hướng`, async () => {
  const response = await request(UNKNOWN_PATH, { accept: 'text/markdown' })
  const body = await response.text()
  assert.equal(response.status, 404, `Đường dẫn lạ phải trả 404 — ${summarize(response, body)}`)
  const contentType = response.headers.get('content-type') ?? ''
  assert.ok(contentType.includes('text/markdown'), `Trang 404 Markdown phải là text/markdown — ${summarize(response, body)}`)
  assert.ok(body.includes('404'), `Body Markdown phải nhắc 404 — ${summarize(response, body)}`)
  assert.ok(body.includes('/llms.txt'), `Body Markdown phải link tới /llms.txt — ${summarize(response, body)}`)
  assert.ok(body.includes('/sitemap.xml'), `Body Markdown phải link tới /sitemap.xml — ${summarize(response, body)}`)
  return '404 text/markdown, có 404, /llms.txt, /sitemap.xml'
})

await check('7. GET /app/essays/does-not-exist → 200 (route động hợp lệ)', async () => {
  const response = await request('/app/essays/does-not-exist', { accept: 'text/html' })
  const body = await response.text()
  assert.equal(response.status, 200, `Route động hợp lệ phải trả 200 — ${summarize(response, body)}`)
  return `200 (content-type "${response.headers.get('content-type') ?? '(none)'}")`
})

await check('8. GET /auth/callback?code=test&state=x → 200 và giữ query string', async () => {
  const response = await request('/auth/callback?code=test&state=x', { accept: 'text/html' })
  const body = await response.text()
  assert.equal(response.status, 200, `Auth callback phải trả 200 — ${summarize(response, body)}`)
  assert.ok(response.url.includes('code=test'), `Auth callback phải giữ query string — ${summarize(response, body)}`)
  return `200, url cuối ${response.url}`
})

await check('9. GET /assets/does-not-exist.js → 404 và không trả HTML của SPA', async () => {
  const response = await request('/assets/does-not-exist.js', { accept: 'text/html' })
  const body = await response.text()
  assert.equal(response.status, 404, `Asset thiếu phải trả 404 — ${summarize(response, body)}`)
  const spaMarker = SPA_MARKERS.find(marker => body.includes(marker))
  assert.ok(!spaMarker, `Asset thiếu không được trả HTML của SPA (thấy "${spaMarker}") — ${summarize(response, body)}`)
  return `404, body không phải HTML của SPA (${body.length} ký tự)`
})

await check('10. GET /favicon.svg và asset build có hash → 200 đúng kiểu file', async () => {
  const favicon = await request('/favicon.svg', { accept: 'image/svg+xml' })
  const faviconBody = await favicon.text()
  assert.equal(favicon.status, 200, `favicon.svg phải trả 200 — ${summarize(favicon, faviconBody)}`)
  const faviconType = favicon.headers.get('content-type') ?? ''
  assert.ok(faviconType.includes('image/svg+xml'), `favicon.svg phải là image/svg+xml — ${summarize(favicon, faviconBody)}`)

  // Asset build có hash: lấy đúng file mà bản deploy đang phục vụ. Tên file có
  // hash nên bản build trên Vercel có thể khác bản build local (Vite nhúng
  // biến VITE_* vào bundle), vì vậy URL lấy từ dist/index.html local chỉ dùng
  // để đối chiếu, không dùng để gọi.
  const page = await request('/', { accept: 'text/html' })
  const pageBody = await page.text()
  const deployedAsset = pageBody.match(/\/assets\/[A-Za-z0-9._-]+\.js/)?.[0]
  assert.ok(deployedAsset, `Trang đang phục vụ không tham chiếu asset /assets/*.js — ${summarize(page, pageBody)}`)

  let localAsset = ''
  if (existsSync(distIndexPath)) {
    localAsset = readFileSync(distIndexPath, 'utf8').match(/\/assets\/[A-Za-z0-9._-]+\.js/)?.[0] ?? ''
  }

  const asset = await request(deployedAsset, { accept: 'text/javascript' })
  const assetBody = await asset.text()
  assert.equal(asset.status, 200, `Asset build phải trả 200 — ${summarize(asset, assetBody)}`)
  const assetType = asset.headers.get('content-type') ?? ''
  assert.ok(/javascript/i.test(assetType), `Asset build phải là kiểu JavaScript — ${summarize(asset, assetBody)}`)

  const drift = localAsset && localAsset !== deployedAsset ? ` (dist/index.html local dùng ${localAsset})` : ''
  return `favicon.svg 200 image/svg+xml; ${deployedAsset} 200 "${assetType}"${drift}`
})

await check('11. GET /robots.txt, /llms.txt, /sitemap.xml, /og-image.png → 200 đúng kiểu file', async () => {
  const textFiles = [
    { path: '/robots.txt', type: 'text/plain' },
    { path: '/llms.txt', type: 'text/plain' },
  ]
  for (const file of textFiles) {
    const response = await request(file.path, { accept: file.type })
    const body = await response.text()
    assert.equal(response.status, 200, `${file.path} phải trả 200 — ${summarize(response, body)}`)
    const contentType = response.headers.get('content-type') ?? ''
    assert.ok(contentType.includes(file.type), `${file.path} phải là ${file.type} — ${summarize(response, body)}`)
    assert.ok(body.length > 0, `${file.path} không được rỗng — ${summarize(response, body)}`)
  }

  const sitemap = await request('/sitemap.xml', { accept: 'application/xml' })
  const sitemapBody = await sitemap.text()
  assert.equal(sitemap.status, 200, `/sitemap.xml phải trả 200 — ${summarize(sitemap, sitemapBody)}`)
  const sitemapType = sitemap.headers.get('content-type') ?? ''
  assert.ok(/xml/i.test(sitemapType), `/sitemap.xml phải là kiểu XML — ${summarize(sitemap, sitemapBody)}`)

  const ogImage = await request('/og-image.png', { accept: 'image/png' })
  const ogBytes = Buffer.from(await ogImage.arrayBuffer())
  assert.equal(ogImage.status, 200, `/og-image.png phải trả 200 — ${summarize(ogImage)}`)
  const ogType = ogImage.headers.get('content-type') ?? ''
  assert.ok(ogType.includes('image/png'), `/og-image.png phải là image/png — ${summarize(ogImage)}`)

  let size = 'không đọc được kích thước PNG'
  const served = pngSize(ogBytes)
  if (served) {
    assert.equal(served.width, 1200, `/og-image.png phải rộng 1200px — ${served.width}×${served.height}`)
    assert.equal(served.height, 630, `/og-image.png phải cao 630px — ${served.width}×${served.height}`)
    size = `${served.width}×${served.height}`
  }
  if (existsSync(ogImagePath)) {
    const local = pngSize(readFileSync(ogImagePath))
    assert.ok(local, `File cục bộ ${ogImagePath} không phải PNG hợp lệ`)
    assert.equal(local.width, 1200, `${ogImagePath} phải rộng 1200px — ${local.width}×${local.height}`)
    assert.equal(local.height, 630, `${ogImagePath} phải cao 630px — ${local.width}×${local.height}`)
  }
  return `robots.txt, llms.txt, sitemap.xml (${sitemapType}), og-image.png ${size}`
})

await check('12. GET /api/does-not-exist → 404 JSON có error.code/hint/message/status', async () => {
  const response = await request('/api/does-not-exist', { accept: 'application/json' })
  const body = await response.text()
  assert.equal(response.status, 404, `Endpoint không tồn tại phải trả 404 — ${summarize(response, body)}`)
  const contentType = response.headers.get('content-type') ?? ''
  assert.ok(contentType.includes('application/json'), `Lỗi API phải là application/json — ${summarize(response, body)}`)
  const payload = JSON.parse(body)
  const error = payload?.error
  assert.ok(error && typeof error === 'object', `Body phải có object "error" — ${summarize(response, body)}`)
  assert.equal(error.code, 'unknown_endpoint', `error.code phải là "unknown_endpoint" — ${summarize(response, body)}`)
  assert.ok(typeof error.message === 'string' && error.message.length > 0, `error.message phải có chữ — ${summarize(response, body)}`)
  assert.ok(typeof error.hint === 'string' && error.hint.length > 0, `error.hint phải có chữ — ${summarize(response, body)}`)
  assert.equal(error.status, 404, `error.status phải là 404 — ${summarize(response, body)}`)
  return `404 application/json, code=${error.code}, hint ${error.hint.length} ký tự`
})

await check('13. GET /about, /contact, /privacy → 200 HTML có <h1> có chữ', async () => {
  for (const path of ['/about', '/contact', '/privacy']) {
    const response = await request(path, { accept: 'text/html' })
    const body = await response.text()
    assert.equal(response.status, 200, `${path} phải trả 200 — ${summarize(response, body)}`)
    const contentType = response.headers.get('content-type') ?? ''
    assert.ok(contentType.includes('text/html'), `${path} phải là text/html — ${summarize(response, body)}`)
    const heading = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? ''
    const headingText = heading.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    assert.ok(headingText.length > 0, `${path} phải có <h1> có chữ — ${summarize(response, body)}`)
  }
  return '3 trang tin cậy: 200 text/html, <h1> có chữ'
})

await check('14. Trộn cache CDN: HTML → Markdown → HTML phải trả lại HTML', async () => {
  const first = await request('/', { accept: 'text/html' })
  const firstBody = await first.text()
  const middle = await request('/', { accept: 'text/markdown' })
  await middle.text()
  const last = await request('/', { accept: 'text/html' })
  const lastBody = await last.text()

  assert.equal(first.status, 200, `Lần đầu phải trả 200 — ${summarize(first, firstBody)}`)
  assert.equal(last.status, 200, `Lần sau phải trả 200 — ${summarize(last, lastBody)}`)
  const firstType = first.headers.get('content-type') ?? ''
  const lastType = last.headers.get('content-type') ?? ''
  assert.equal(lastType, firstType, `Lần sau phải cùng kiểu với lần đầu ("${firstType}") — ${summarize(last, lastBody)}`)
  assert.ok(lastBody.includes(HERO_TEXT), `Lần sau phải là HTML có hero, không phải bản Markdown — ${summarize(last, lastBody)}`)
  assert.ok(!lastBody.trimStart().startsWith(MARKDOWN_HEADING), `Lần sau không được trả bản Markdown — ${summarize(last, lastBody)}`)
  return `HTML → Markdown → HTML: cả hai lần HTML đều "${firstType}"`
})

await check('15. HEAD / → 200 có content-type và body rỗng; HEAD đường dẫn lạ → 404 body rỗng', async () => {
  const head = await request('/', { accept: 'text/html', method: 'HEAD' })
  const headBody = await head.text()
  assert.equal(head.status, 200, `HEAD / phải trả 200 — ${summarize(head, headBody)}`)
  const headType = head.headers.get('content-type') ?? ''
  assert.ok(headType.length > 0, `HEAD / phải có content-type — ${summarize(head, headBody)}`)
  assert.equal(headBody.length, 0, `HEAD / phải có body rỗng (nhận ${headBody.length} ký tự)`)

  const headMissing = await request(UNKNOWN_PATH, { accept: 'text/html', method: 'HEAD' })
  const headMissingBody = await headMissing.text()
  assert.equal(headMissing.status, 404, `HEAD ${UNKNOWN_PATH} phải trả 404 — ${summarize(headMissing, headMissingBody)}`)
  assert.equal(headMissingBody.length, 0, `HEAD ${UNKNOWN_PATH} phải có body rỗng (nhận ${headMissingBody.length} ký tự)`)
  return `HEAD / → 200 "${headType}" (rỗng); HEAD ${UNKNOWN_PATH} → 404 (rỗng)`
})

const failed = results.filter(result => !result.ok)
console.log('')
if (failed.length) {
  console.log(`FAIL: ${results.length - failed.length}/${results.length} check đạt — ${base}`)
  for (const result of failed) console.log(`  - ${result.name}: ${result.detail}`)
  process.exit(1)
}
console.log(`PASS: ${results.length}/${results.length} check đạt — ${base}`)
