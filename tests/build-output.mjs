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
  { path: join('pages', 'developers.html'), canonical: 'https://huybui.vercel.app/developers' },
  { path: join('pages', 'docs.html'), canonical: 'https://huybui.vercel.app/docs' },
]

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
  assert.match(html, /<html lang="en">/, `${file.path}: thiếu html lang`)
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
  const types = graph.map(node => node['@type'])
  assert.ok(types.includes('SoftwareApplication'), `${file.path}: thiếu SoftwareApplication`)
  const organization = graph.find(node => node['@type'] === 'Organization')
  assert.ok(organization, `${file.path}: thiếu Organization`)
  assert.ok(organization.contactPoint?.[0]?.email, `${file.path}: Organization thiếu contactPoint`)
  assert.ok(organization.contactPoint?.[0]?.contactType, `${file.path}: contactPoint thiếu contactType`)
  assert.equal(organization.address?.['@type'], 'PostalAddress', `${file.path}: thiếu PostalAddress`)
}

console.log(`PASS: ${files.length} trang tĩnh có nội dung, metadata và JSON-LD đầy đủ.`)
