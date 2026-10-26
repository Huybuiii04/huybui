/**
 * Kiểm tra output build: mỗi trang công khai phải có nội dung đọc được không cần JavaScript,
 * đúng heading hierarchy, canonical/og metadata và JSON-LD.
 *
 *   npm run build && node tests/build-output.mjs
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
if (!existsSync(join(dist, 'index.html'))) {
  console.log('SKIP: chưa có dist/index.html - chạy `npm run build` trước.')
  process.exit(0)
}

const files = [
  { path: 'index.html', canonical: 'https://huybui.vercel.app/' },
  { path: join('pages', 'about.html'), canonical: 'https://huybui.vercel.app/about' },
  { path: join('pages', 'contact.html'), canonical: 'https://huybui.vercel.app/contact' },
  { path: join('pages', 'privacy.html'), canonical: 'https://huybui.vercel.app/privacy' },
]

const trustPages = ['about.html', 'contact.html', 'privacy.html']

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

for (const file of files) {
  const html = readFileSync(join(dist, file.path), 'utf8')
  const text = textOf(html)
  assert.ok(text.length >= 500, `${file.path}: chỉ có ${text.length} ký tự text`)
  assert.match(html, /<html[^>]*\slang="en"/, `${file.path}: thiếu html lang`)
  assert.match(html, new RegExp(`<link rel="canonical" href="${file.canonical.replace(/[/.]/g, '\\$&')}">`), `${file.path}: sai canonical`)
  assert.match(html, /<meta property="og:type" content="website">/, `${file.path}: thiếu og:type`)
  assert.match(html, /<meta property="og:image" content="https:\/\/huybui\.vercel\.app\/og-image\.png">/, `${file.path}: thiếu og:image`)
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/, `${file.path}: thiếu twitter card`)

  const headings = [...html.matchAll(/<h([1-6])[\s>]/g)].map(match => Number(match[1]))
  assert.equal(headings.filter(level => level === 1).length, 1, `${file.path}: phải có đúng 1 h1`)
  let previous = 0
  for (const level of headings) {
    assert.ok(level <= previous + 1, `${file.path}: heading nhảy từ h${previous} sang h${level}`)
    previous = level
  }

  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(jsonLd, `${file.path}: thiếu JSON-LD`)
  const graph = JSON.parse(jsonLd[1])['@graph']
  assert.ok(graph.some(node => node['@type'] === 'SoftwareApplication'), `${file.path}: JSON-LD thiếu SoftwareApplication`)
  const app = graph.find(node => node['@type'] === 'SoftwareApplication')
  assert.ok(app.description, `${file.path}: SoftwareApplication thiếu description`)
  assert.equal(app.applicationCategory, 'EducationalApplication', `${file.path}: sai applicationCategory`)
  assert.equal(app.operatingSystem, 'Web', `${file.path}: sai operatingSystem`)
  assert.ok(!('author' in app) && !('publisher' in app) && !('offers' in app), `${file.path}: JSON-LD còn dữ liệu chưa xác minh`)
}

// Landing tĩnh phải là nội dung thật của trang: đọc được ngay trong HTML.
const landing = readFileSync(join(dist, 'index.html'), 'utf8')
assert.ok(landing.includes('class="landing"'), 'landing: thiếu wrapper .landing')
assert.match(landing, /Your ideas\./, 'landing: thiếu nội dung hero')
assert.match(landing, /A LITTLE BETTER\. EVERY DAY\./, 'landing: thiếu kicker')
assert.match(landing, /href="\/app\/prompts"/, 'landing: thiếu link tới kho đề bài')
assert.match(landing, /href="\/app\/write"/, 'landing: thiếu link tới không gian viết')
assert.match(landing, /href="\/donate"/, 'landing: thiếu link ủng hộ')
assert.match(landing, /href="\/about"/, 'landing: thiếu link tới trang about')
assert.match(landing, /href="\/contact"/, 'landing: thiếu link tới trang contact')
assert.match(landing, /href="\/privacy"/, 'landing: thiếu link tới trang privacy')
assert.match(landing, /data-copy="vi"/, 'landing: thiếu bản tiếng Việt')
assert.match(landing, /data-copy="en"/, 'landing: thiếu bản tiếng Anh')

// Ba trang trust là HTML tĩnh độc lập: không boot React, không bị route wildcard thay thế.
for (const name of trustPages) {
  const html = readFileSync(join(dist, 'pages', name), 'utf8')
  assert.ok(!html.includes('/src/main.tsx'), `${name}: không được boot React`)
  assert.match(html, /<main class="doc-page"/, `${name}: thiếu nội dung <main class="doc-page">`)
  assert.match(html, /class="doc-shell"/, `${name}: thiếu .doc-shell`)
  assert.match(html, /class="doc-nav"/, `${name}: thiếu .doc-nav`)
  assert.match(html, /class="doc-footer"/, `${name}: thiếu .doc-footer`)
}

console.log(`PASS: ${files.length} trang tĩnh có nội dung, metadata và JSON-LD đầy đủ.`)
