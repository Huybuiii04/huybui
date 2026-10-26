/**
 * Sinh ảnh OG 1200x630 cho các trang công khai.
 *
 *   node scripts/generate-og-image.mjs
 *
 * Dùng Playwright (đã cài sẵn) để render HTML với đúng design token của app trong
 * src/styles.css rồi ghi ra public/og-image.png. Script idempotent: chạy lại với
 * cùng input cho ra đúng file byte-for-byte, không thêm dependency mới.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { site } from '../src/agent/site.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = join(root, 'public', 'og-image.png')
const width = 1200
const height = 630

// Một dòng mô tả đúng nội dung của site (xem site.description), giữ ngắn để đọc
// được ở kích thước thumbnail.
const tagline = 'Free practice space for IELTS Writing Task 1 and Task 2.'

/** Design token lấy thẳng từ src/styles.css để ảnh không lệch màu với app. */
async function readDesignTokens() {
  const css = await readFile(join(root, 'src', 'styles.css'), 'utf8')
  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(css)
  if (!block) throw new Error('Không tìm thấy khối :root trong src/styles.css')
  const tokens = {}
  for (const match of block[1].matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim()
  }
  if (!tokens['--bg'] || !tokens['--brand'] || !tokens['--text']) {
    throw new Error('src/styles.css không có đủ design token cần thiết')
  }
  return tokens
}

/** Nhúng font của app (Be Vietnam Pro) để ảnh dùng đúng typeface của sản phẩm. */
async function readFontFace() {
  const files = join(root, 'node_modules', '@fontsource', 'be-vietnam-pro', 'files')
  const faces = []
  for (const [weight, file] of [
    [400, 'be-vietnam-pro-latin-400-normal.woff2'],
    [600, 'be-vietnam-pro-latin-600-normal.woff2'],
  ]) {
    const bytes = await readFile(join(files, file))
    faces.push(
      `@font-face { font-family: 'Be Vietnam Pro'; font-style: normal; font-weight: ${weight}; ` +
        `src: url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2'); }`,
    )
  }
  return faces.join('\n')
}

function renderHtml(tokens, fontFace) {
  const tokenCss = Object.entries(tokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n')
  const domain = new URL(site.url).host
  // Cùng icon PenLine mà app dùng ở brand mark.
  const penIcon =
    '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 20h9"/>' +
    '<path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>' +
    '</svg>'

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${site.name}</title>
<style>
${fontFace}
:root {
${tokenCss}
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${width}px; height: ${height}px; }
body {
  font-family: 'Be Vietnam Pro', system-ui, sans-serif;
  color: var(--text);
  background-color: var(--bg);
  background-image: radial-gradient(900px circle at 88% 8%, var(--brand-soft), transparent 62%);
  display: flex;
  align-items: center;
  padding: 76px;
}
.card {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 60px 66px;
}
.brand { display: flex; align-items: center; gap: 20px; }
.brand-mark {
  width: 78px; height: 82px; border-radius: 22px; background: var(--brand); color: var(--on-brand);
  display: grid; place-items: center;
}
.brand-text { display: flex; flex-direction: column; gap: 6px; }
.brand-name { font-size: 34px; font-weight: 600; letter-spacing: -.02em; }
.brand-sub { font-size: 15px; font-weight: 600; letter-spacing: .18em; color: var(--text-subtle); }
h1 { margin-top: 40px; font-size: 66px; font-weight: 600; letter-spacing: -.03em; line-height: 1.12; }
.tagline { margin-top: 22px; font-size: 31px; line-height: 1.5; color: var(--text-muted); max-width: 880px; }
.domain {
  margin-top: 46px; padding-top: 28px; border-top: 1px solid var(--border);
  font-size: 25px; font-weight: 500; color: var(--brand-ink);
}
</style>
</head>
<body>
  <main class="card">
    <div class="brand">
      <span class="brand-mark">${penIcon}</span>
      <span class="brand-text">
        <span class="brand-name">IELTS</span>
        <span class="brand-sub">WRITING STUDIO</span>
      </span>
    </div>
    <h1>${site.name}</h1>
    <p class="tagline">${tagline}</p>
    <div class="domain">${domain}</div>
  </main>
</body>
</html>`
}

const tokens = await readDesignTokens()
const fontFace = await readFontFace()
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.setContent(renderHtml(tokens, fontFace), { waitUntil: 'load' })
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  const png = await page.screenshot({ type: 'png' })
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, png)
  console.log(outputPath)
} finally {
  await browser.close()
}
