import type { ContentPage } from './content.ts'
import { publicLinks } from './routes.ts'

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Bản HTML tĩnh của trang: cùng cấu trúc và class với component React để nội dung
// không đổi khi app mount (và đọc được khi JavaScript bị chặn).
export function renderStaticHtml(page: ContentPage): string {
  const parts: string[] = [
    `<main class="doc-page" data-agent-page="${escapeHtml(page.id)}">`,
    '<header class="doc-header">',
    '<p class="doc-eyebrow">IELTS Writing Studio</p>',
    `<h1>${escapeHtml(page.title[1])}</h1>`,
    `<p class="doc-summary">${escapeHtml(page.summary[1])}</p>`,
    '</header>',
  ]
  for (const section of page.sections) {
    parts.push(`<section class="doc-section" id="${escapeHtml(section.id)}">`)
    parts.push(`<h2>${escapeHtml(section.heading[1])}</h2>`)
    for (const paragraph of section.body) parts.push(`<p>${escapeHtml(paragraph[1])}</p>`)
    if (section.list) {
      parts.push('<ul>')
      for (const item of section.list) parts.push(`<li>${escapeHtml(item[1])}</li>`)
      parts.push('</ul>')
    }
    parts.push('</section>')
  }
  parts.push('<nav class="doc-links" aria-label="Resources">')
  for (const link of publicLinks) parts.push(`<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
  parts.push('</nav>', '</main>')
  return parts.join('')
}

// Khung HTML dùng chung cho các trang lỗi tĩnh (404, 406).
const errorStyles = `
      :root { color-scheme: light dark; --bg: #f7f5ef; --surface: #ffffff; --border: #d4e1db; --text: #183c38; --muted: #496660; --brand: #00635e; }
      @media (prefers-color-scheme: dark) { :root { --bg: #090a0b; --surface: #131516; --border: #2b3032; --text: #edf1f0; --muted: #bac3c1; --brand: #4dd6bd; } }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 40px 20px; background: var(--bg); color: var(--text); font-family: 'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', sans-serif; line-height: 1.65; }
      main { max-width: 640px; width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; }
      p.code { margin: 0; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--brand); font-weight: 700; }
      h1 { margin: 12px 0 14px; font-size: clamp(26px, 5vw, 38px); letter-spacing: -.03em; line-height: 1.2; }
      p { margin: 0 0 14px; font-size: 14.5px; color: var(--muted); }
      code { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 2px 6px; font-size: 13px; }
      ul { margin: 18px 0 0; padding-left: 20px; }
      li { font-size: 14px; color: var(--muted); margin-bottom: 8px; }
      a { color: var(--brand); }
`

function errorDocument(input: { code: string; title: string; heading: string; content: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.title)}</title>
    <meta name="robots" content="noindex" />
    <style>${errorStyles}    </style>
  </head>
  <body>
    <main>
      <p class="code">Error ${escapeHtml(input.code)}</p>
      <h1>${escapeHtml(input.heading)}</h1>
      ${input.content}
    </main>
  </body>
</html>
`
}

// Trang 404 tĩnh: dùng khi agent hoặc người dùng gõ sai đường dẫn.
export function renderNotFoundHtml(path: string) {
  return errorDocument({
    code: '404',
    title: '404 — Page not found — IELTS Writing Studio',
    heading: 'This page is not here',
    content: `<p>The address <code>${escapeHtml(path)}</code> does not exist on IELTS Writing Studio, so there is no page to read at this URL.</p>
      <p>If you are looking for machine-readable resources, use one of these:</p>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/llms.txt">llms.txt</a> and the <a href="/sitemap.xml">sitemap</a></li>
      </ul>`,
  })
}

// Trang 406: client không chấp nhận bất kỳ định dạng nào site này tạo ra.
export function renderNotAcceptableHtml() {
  return errorDocument({
    code: '406',
    title: '406 — Not Acceptable — IELTS Writing Studio',
    heading: 'This format is not available',
    content: `<p>The Accept header of this request does not allow any format this site can produce. Every public page is available in two formats:</p>
      <ul>
        <li><code>text/html</code> — the readable web page</li>
        <li><code>text/markdown</code> — the same page as plain Markdown for agents</li>
      </ul>
      <p>Ask for one of them explicitly, for example <code>Accept: text/markdown</code>.</p>`,
  })
}
