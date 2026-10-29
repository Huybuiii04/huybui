import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import vm from 'node:vm'
import { site, buildJsonLd, buildHeadTags, htmlLang } from '../src/agent/site.ts'
import { pages, pageById, pageByPath, plainText, type ContentPage, type Copy } from '../src/agent/content.ts'
import { renderMarkdown, renderNotFoundMarkdown, escapePlainText } from '../src/agent/markdown.ts'
import { escapeHtml, renderLandingHtml, renderStaticHtml } from '../src/agent/html.ts'
import { landingCopy } from '../src/agent/landing.ts'
import { defaultTheme, themeBootstrapScript, themeStorageKey } from '../src/agent/theme.ts'
import { languageStorageKey, renderLanguageScript } from '../src/agent/language.ts'
import { agentPages } from '../src/agent/pages.ts'
import { matchPath, spaRoutes, staticFiles, apiRoutes, markdownPageIds, publicLinks } from '../src/agent/routes.ts'

// Tuyên bố cấm trong bản tiếng Anh: các bản đặc tả API, cổng nhà phát triển,
// MCP server, khoá API, môi trường thử nghiệm, và khả năng dùng app ngoại tuyến
// (app không có service worker nên cache cục bộ không làm app chạy offline).
const forbiddenClaims = ['OpenAPI', 'developer portal', 'MCP', 'API key', 'sandbox', 'REST API', 'keeps working offline', 'works offline'] as const
// Cùng danh sách ở bản tiếng Việt, gồm cả thuật ngữ Việt tương ứng.
const forbiddenClaimsVi = [
  'OpenAPI',
  'MCP',
  'API key',
  'khoá API',
  'sandbox',
  'môi trường thử nghiệm',
  'cổng nhà phát triển',
  'trang tài liệu nhà phát triển',
  'API REST',
  'vẫn dùng được khi mất mạng',
  'dùng được ngoại tuyến',
  'hoạt động ngoại tuyến',
] as const

// Đọc code span đầu tiên sau "The path " trong trang 404 Markdown.
function pathCodeSpan(markdown: string) {
  const marker = 'The path '
  const start = markdown.indexOf(marker)
  if (start < 0) return null
  const rest = markdown.slice(start + marker.length)
  const fence = rest.match(/^`+/)?.[0]
  if (!fence) return null
  const body = rest.slice(fence.length)
  const close = body.indexOf(fence)
  if (close < 0) return null
  return { fence, content: body.slice(0, close), after: body.slice(close + fence.length) }
}

function longestBacktickRun(value: string) {
  return (value.match(/`+/g) ?? []).reduce((longest, run) => Math.max(longest, run.length), 0)
}

// Nội dung hiển thị của một code span: CommonMark bỏ đúng một khoảng trắng ở
// mỗi đầu khi nội dung bắt đầu và kết thúc bằng khoảng trắng, trừ khi nội dung
// chỉ gồm khoảng trắng.
function visibleSpanContent(content: string) {
  if (content.startsWith(' ') && content.endsWith(' ') && content.trim() !== '') {
    return content.slice(1, -1)
  }
  return content
}

test('only the four verified public pages are published', () => {
  for (const path of ['/', '/about', '/contact', '/privacy']) {
    assert.equal(matchPath(path)?.id, path, path)
    assert.ok(pageByPath(path), `missing content page ${path}`)
  }
  assert.deepEqual(pages.map(page => page.id), ['home', 'about', 'contact', 'privacy'])
  assert.deepEqual([...markdownPageIds].sort(), ['about', 'contact', 'home', 'privacy'])
})

test('removed api, docs and developer resources are not routable', () => {
  for (const path of ['/docs', '/developers', '/openapi.json', '/.well-known/mcp', '/api/mcp', '/api/health']) {
    assert.equal(matchPath(path), null, path)
  }
  assert.deepEqual(apiRoutes, [])
  assert.equal(pageById('docs'), undefined)
  assert.equal(pageById('developers'), undefined)
  assert.equal(pageByPath('/docs'), undefined)
  assert.equal(pageByPath('/developers'), undefined)
})

test('static file list contains only files that really exist', () => {
  assert.deepEqual(staticFiles, [
    '/favicon.svg',
    '/favicon.png',
    '/brand/ielts-studio-mark.webp',
    '/donate-qr.png',
    '/og-image.png',
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
  ])
  for (const file of staticFiles) assert.equal(matchPath(file)?.kind, 'static', file)
})

test('app and auth routes including dynamic paths stay routable', () => {
  for (const path of [
    '/',
    '/auth',
    '/auth/callback',
    '/auth/reset-password',
    '/donate',
    '/app',
    '/app/write',
    '/app/prompts',
    '/app/essays',
    '/app/vocabulary',
    '/app/review',
    '/app/errors',
    '/app/settings',
    '/admin',
    '/about',
    '/contact',
    '/privacy',
  ]) {
    assert.equal(matchPath(path)?.id, path, path)
    assert.equal(matchPath(path)?.kind, 'spa', path)
  }
  assert.equal(matchPath('/app/essays/abc')?.id, '/app/essays/:id')
  assert.equal(matchPath('/app/essays/abc/')?.id, '/app/essays/:id')
  assert.equal(matchPath('/app/essays')?.id, '/app/essays')
  // Speaking: route live phải khớp trước route động ":mode".
  assert.equal(matchPath('/app/speaking')?.id, '/app/speaking')
  assert.equal(matchPath('/app/speaking/live')?.id, '/app/speaking/live')
  assert.equal(matchPath('/app/speaking/result/abc')?.id, '/app/speaking/result/:attemptId')
  assert.equal(matchPath('/app/speaking/part-1')?.id, '/app/speaking/:mode')
  assert.equal(matchPath('/app/speaking/mock/12/5')?.id, '/app/speaking/:mode/:book/:test')
  assert.equal(matchPath('/khong-ton-tai'), null)
})

test('route table keeps spa and static routes disjoint', () => {
  for (const path of spaRoutes) assert.equal(matchPath(path)?.kind, 'spa', path)
  for (const file of staticFiles) assert.equal(matchPath(file)?.kind, 'static', file)
  assert.equal(new Set([...spaRoutes, ...staticFiles]).size, spaRoutes.length + staticFiles.length)
})

test('every public page has a markdown representation', () => {
  for (const id of markdownPageIds) {
    const page = pageById(id)
    assert.ok(page, `missing content page ${id}`)
    assert.ok(page.path.startsWith('/'))
  }
})

test('trust anchor pages carry at least 500 characters of readable content', () => {
  for (const id of ['about', 'contact', 'privacy']) {
    const text = plainText(pageById(id), 1)
    assert.ok(text.length >= 500, `${id} only has ${text.length} characters`)
  }
})

test('public copy claims no public api, developer portal or mcp server', () => {
  for (const page of pages) {
    for (const [lang, needles] of [[0, forbiddenClaimsVi], [1, forbiddenClaims]] as const) {
      const text = plainText(page, lang)
      for (const needle of needles) {
        assert.ok(!new RegExp(needle, 'i').test(text), `${page.id} (lang ${lang}) still mentions ${needle}`)
      }
    }
  }
})

test('home states that the interactive writing features need sign in', () => {
  const home = plainText(pageById('home'), 1)
  assert.match(home, /sign[- ]?in/i)
  assert.match(home, /account/i)
})

test('privacy matches the verified backend facts', () => {
  const privacy = plainText(pageById('privacy'), 1)
  assert.match(privacy, /26 October 2026/)
  assert.match(privacy, /Supabase/i)
  assert.match(privacy, /Postgres/i)
  assert.match(privacy, /IndexedDB/)
  assert.match(privacy, /localStorage/)
  assert.match(privacy, /sessionStorage/)
  assert.match(privacy, /Anthropic API/)
  assert.ok(!/within \d+ days|30 days|retention period/i.test(privacy), 'privacy promises a deadline')
  assert.ok(!/not used to train|never used to train/i.test(privacy), 'privacy promises provider training behaviour')
})

test('markdown rendering produces a heading, sections and links to real resources only', () => {
  const markdown = renderMarkdown(pageById('about'), 1)
  assert.match(markdown, /^# /)
  assert.match(markdown, /\n## /)
  for (const href of ['/', '/about', '/contact', '/privacy', '/sitemap.xml', '/llms.txt']) {
    assert.ok(markdown.includes(`](${href})`), `missing link ${href}`)
  }
  for (const href of ['/docs', '/developers', '/openapi.json', '/.well-known/mcp', '/api/']) {
    assert.ok(!markdown.includes(href), `markdown still links ${href}`)
  }
  assert.ok(markdown.length > 500)
})

test('not found markdown explains the error and points to agent resources', () => {
  const markdown = renderNotFoundMarkdown('/khong-ton-tai')
  assert.ok(markdown.length >= 20)
  assert.match(markdown, /404/)
  assert.match(markdown, /\/llms\.txt/)
  assert.match(markdown, /\/sitemap\.xml/)
  assert.ok(markdown.includes('](/)'))
  assert.ok(!markdown.includes('/docs'))
  assert.ok(!markdown.includes('/developers'))
})

test('not found markdown keeps a backtick path inside a safe code span', () => {
  for (const path of ['/a`b', '/a``b', '/a```b', '/a`b](http://example.com)']) {
    const markdown = renderNotFoundMarkdown(path)
    const span = pathCodeSpan(markdown)
    assert.ok(span, `no code span for ${path}`)
    assert.equal(span.content, path, `the path must stay visible for ${path}`)
    assert.ok(longestBacktickRun(span.content) < span.fence.length, `the path must not close the span for ${path}`)
    assert.ok(span.after.startsWith(' does not exist on '), `the span must end where the sentence continues for ${path}`)
  }
})

test('not found markdown strips control characters from the path', () => {
  const markdown = renderNotFoundMarkdown('/a\u0000b\u0007c\nd')
  const span = pathCodeSpan(markdown)
  assert.ok(span, 'no code span')
  assert.equal(span.content, '/abcd')
  assert.ok(!/[\u0000-\u001f\u007f]/.test(span.content), 'control characters must be stripped from the path')
  assert.ok(!/[\u0000-\u001f\u007f]/.test(markdown.replace(/\n/g, '')), 'control characters must be stripped from the body')
})

test('the code span keeps a path that starts or ends with a backtick visible', () => {
  for (const path of ['`start', 'end`', '/a`', '`', '/``']) {
    const markdown = renderNotFoundMarkdown(path)
    const span = pathCodeSpan(markdown)
    assert.ok(span, `no code span for ${path}`)
    assert.equal(visibleSpanContent(span.content), path, `the path must stay visible for ${path}`)
    assert.ok(longestBacktickRun(span.content) < span.fence.length, `the path must not close the span for ${path}`)
    assert.ok(span.after.startsWith(' does not exist on '), `the span must end where the sentence continues for ${path}`)
  }
})

test('the code span keeps a path that only contains spaces visible', () => {
  const markdown = renderNotFoundMarkdown('   ')
  const span = pathCodeSpan(markdown)
  assert.ok(span, 'no code span')
  assert.equal(visibleSpanContent(span.content), '   ')
  assert.ok(span.after.startsWith(' does not exist on '))
})

test('an empty path still produces a well formed code span', () => {
  // CommonMark không có code span rỗng: hai backtick liền nhau bị đọc thành một
  // backtick string, nên fence phải dài hơn một backtick.
  const markdown = renderNotFoundMarkdown('')
  const span = pathCodeSpan(markdown)
  assert.ok(span, 'no code span')
  assert.equal(span.fence.length, 2)
  assert.equal(span.content, ' ')
  assert.ok(span.after.startsWith(' does not exist on '))
})

test('markdown escapes plain text so content cannot inject structure', () => {
  const hostile: ContentPage = {
    id: 'hostile',
    path: '/hostile',
    title: ['# Tiêu đề', '# Title'],
    summary: ['> Tóm tắt', '> Summary'],
    sections: [
      {
        id: 'section',
        heading: ['## Heading', '## Heading'],
        body: [['- mục', '- item']],
        list: [['* nhấn mạnh', '* emphasis']],
      },
    ],
  }
  const markdown = renderMarkdown(hostile, 1)
  assert.ok(markdown.startsWith('# \\# Title'), markdown)
  assert.ok(markdown.includes('> \\> Summary'), markdown)
  assert.ok(markdown.includes('## \\#\\# Heading'), markdown)
  assert.ok(markdown.includes('\\- item'), markdown)
  assert.ok(markdown.includes('- \\* emphasis'), markdown)
  assert.equal((markdown.match(/^#{1,6} /gm) ?? []).length, 2)
  const lines = markdown.split('\n')
  assert.ok(!lines.includes('- item'), 'a paragraph must not turn into a list item')
  assert.ok(!lines.includes('* emphasis'), 'a list item must not turn into emphasis')
})

// Mỗi dấu mở khối của CommonMark: nội dung thuần phải không bao giờ tạo khối.
const blockMarkers = [
  { text: '1) injected', escaped: '1\\) injected', block: /^\s*1\)/ },
  { text: '1. injected', escaped: '1\\. injected', block: /^\s*1\./ },
  { text: '- injected', escaped: '\\- injected', block: /^\s*[-+*]\s/ },
  { text: '+ injected', escaped: '\\+ injected', block: /^\s*[-+*]\s/ },
  { text: '* injected', escaped: '\\* injected', block: /^\s*[-+*]\s/ },
  { text: '# injected', escaped: '\\# injected', block: /^\s*#{1,6}\s/ },
  { text: '### injected', escaped: '\\#\\#\\# injected', block: /^\s*#{1,6}\s/ },
  { text: '> injected', escaped: '\\> injected', block: /^\s*>/ },
  { text: '===', escaped: '\\===', block: /^=+\s*$/ },
  { text: '---', escaped: '\\---', block: /^-{3,}\s*$/ },
  { text: '***', escaped: '\\*\\*\\*', block: /^\*{3,}\s*$/ },
  { text: '```', escaped: '\\`\\`\\`', block: /^`{3,}/ },
  { text: '~~~', escaped: '\\~\\~\\~', block: /^~{3,}/ },
  { text: '[label]: https://example.com', escaped: '\\[label\\]: https://example.com', block: /^\[[^\]]+\]:/ },
] as const

// Trang mẫu có cùng một nội dung thuần ở mọi trường văn bản.
function hostilePage(text: string): ContentPage {
  return {
    id: 'hostile',
    path: '/hostile',
    title: [text, text],
    summary: [text, text],
    sections: [{ id: 'section', heading: [text, text], body: [[text, text]], list: [[text, text]] }],
  }
}

test('plain text can never open a markdown block', () => {
  for (const marker of blockMarkers) {
    const markdown = renderMarkdown(hostilePage(marker.text), 1)
    const lines = markdown.split('\n')
    // Mọi trường văn bản thuần đều phải hiện ra ở dạng đã escape.
    assert.ok(lines.includes(marker.escaped), `${marker.text} must render escaped:\n${markdown}`)
    assert.ok(lines.includes(`# ${marker.escaped}`), `${marker.text} title must render escaped`)
    assert.ok(lines.includes(`> ${marker.escaped}`), `${marker.text} summary must render escaped`)
    assert.ok(lines.includes(`## ${marker.escaped}`), `${marker.text} heading must render escaped`)
    assert.ok(lines.includes(`- ${marker.escaped}`), `${marker.text} list item must render escaped`)
    // Dòng mang nội dung này không được mở khối Markdown nào.
    for (const line of lines.filter(item => item.endsWith(marker.escaped))) {
      const text = line.replace(/^(#{1,2} |> |- )/, '')
      assert.ok(!marker.block.test(text), `${marker.text} must not open a block: ${line}`)
    }
  }
})

test('plain text cannot open a block on a later line', () => {
  const markdown = renderMarkdown(hostilePage('intro text\n===\n1) injected\n> quote'), 1)
  const lines = markdown.split('\n')
  assert.ok(lines.includes('intro text'))
  assert.ok(lines.includes('\\==='))
  assert.ok(lines.includes('1\\) injected'))
  assert.ok(lines.includes('\\> quote'))
  assert.ok(!lines.includes('==='))
  assert.ok(!lines.includes('1) injected'))
  assert.ok(!lines.includes('> quote'))
})

test('the plain text escape helper neutralises block markers', () => {
  assert.equal(escapePlainText('1) injected'), '1\\) injected')
  assert.equal(escapePlainText('1. injected'), '1\\. injected')
  assert.equal(escapePlainText('- injected'), '\\- injected')
  assert.equal(escapePlainText('+ injected'), '\\+ injected')
  assert.equal(escapePlainText('=== '), '\\=== ')
  assert.equal(escapePlainText('plain prose'), 'plain prose')
})

test('the public resource list is shared by the markdown and html renderers', () => {
  const page = pageById('about')
  assert.ok(page)
  const markdown = renderMarkdown(page, 1)
  const html = renderStaticHtml(page)
  for (const link of publicLinks) {
    assert.ok(markdown.includes(`](${link.href})`), `markdown is missing ${link.href}`)
    assert.ok(html.includes(`href="${link.href}"`), `html is missing ${link.href}`)
  }
})

test('json-ld exposes only the verified SoftwareApplication identity', () => {
  const graph = buildJsonLd()['@graph'] as Record<string, unknown>[]
  assert.equal(graph.length, 1)
  const app = graph[0]
  assert.equal(app['@type'], 'SoftwareApplication')
  assert.equal(app.name, site.name)
  assert.ok(String(app.description).length > 40)
  assert.equal(app.url, `${site.url}/`)
  assert.equal(app.applicationCategory, 'EducationalApplication')
  assert.equal(app.operatingSystem, 'Web')
  for (const key of ['author', 'publisher', 'offers']) assert.ok(!(key in app), `json-ld still has ${key}`)
  const serialized = JSON.stringify(graph)
  for (const type of ['Organization', 'Person', 'PostalAddress']) {
    assert.ok(!serialized.includes(type), `json-ld still has ${type}`)
  }
})

test('head tags carry canonical url, open graph, twitter card and html language', () => {
  const tags = buildHeadTags({ path: '/about', title: 'About', description: 'About the studio' })
  assert.match(tags, /<link rel="canonical" href="https:\/\/huybui\.vercel\.app\/about">/)
  assert.match(tags, /<meta property="og:type" content="website">/)
  assert.match(tags, /<meta property="og:image" content="https:\/\/huybui\.vercel\.app\/og-image\.png">/)
  assert.match(tags, /<meta property="og:url" content="https:\/\/huybui\.vercel\.app\/about">/)
  assert.match(tags, /<meta name="twitter:card" content="summary_large_image">/)
  assert.equal(htmlLang, 'en')
})

test('head tags escape the description before embedding it in metadata', () => {
  const tags = buildHeadTags({ path: '/about', title: 'About', description: 'He said "hi" & <b>' })
  assert.match(tags, /content="He said &quot;hi&quot; &amp; &lt;b&gt;"/)
  assert.ok(!tags.includes('"hi"'))
})

test('pages are addressable by id and by path', () => {
  assert.equal(pageByPath('/privacy')?.id, 'privacy')
  assert.equal(pageById('home')?.path, '/')
  assert.equal(pages.length, 4)
})

// ---------- Landing tĩnh: copy dùng chung cho React và HTML ----------

// Duyệt toàn bộ cấu trúc export để thu thập mọi cặp [vi, en]: không chuỗi nào
// của landing được bỏ sót khỏi kiểm thử "không lệch".
function collectCopyPairs(
  value: unknown,
  path: string,
  found: { path: string; pair: Copy }[] = [],
): { path: string; pair: Copy }[] {
  if (Array.isArray(value)) {
    if (value.length === 2 && value.every(item => typeof item === 'string')) {
      found.push({ path, pair: value as Copy })
      return found
    }
    value.forEach((item, index) => collectCopyPairs(item, `${path}[${index}]`, found))
    return found
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) collectCopyPairs(item, path ? `${path}.${key}` : key, found)
  }
  return found
}

test('the shared landing copy follows the four-skill reference and marks upcoming modules', () => {
  assert.deepEqual(landingCopy.heroTitle, ['Bốn kỹ năng.', 'Four skills.'])
  assert.deepEqual(landingCopy.primaryCta, ['Bắt đầu học', 'Start learning'])
  assert.deepEqual(landingCopy.features.map(feature => feature.id), ['listening', 'reading', 'writing', 'speaking', 'vocabulary'])
  assert.deepEqual(landingCopy.features.filter(feature => feature.comingSoon).map(feature => feature.id), ['listening', 'speaking'])
  assert.equal(landingCopy.features.find(feature => feature.id === 'reading')?.href, '/app/reading')
  assert.equal(landingCopy.features.find(feature => feature.id === 'writing')?.href, '/app/write')
})

test('the static landing html ships both language variants of every shared string', () => {
  const html = renderLandingHtml()
  const pairs = collectCopyPairs(landingCopy, 'landingCopy')
  assert.ok(pairs.length >= 40, `expected the landing copy to be shared, found ${pairs.length} pairs`)
  for (const { path, pair } of pairs) {
    assert.ok(pair[0].trim().length > 0, `${path} has no Vietnamese copy`)
    assert.ok(pair[1].trim().length > 0, `${path} has no English copy`)
    assert.ok(
      html.includes(`<span data-copy="vi" lang="vi">${escapeHtml(pair[0])}</span>`),
      `static landing is missing the Vietnamese copy of ${path}`,
    )
    assert.ok(
      html.includes(`<span data-copy="en" lang="en">${escapeHtml(pair[1])}</span>`),
      `static landing is missing the English copy of ${path}`,
    )
  }
})

test('the static landing mirrors the React landing structure and links', () => {
  const html = renderLandingHtml()
  for (const className of ['landing', 'landing-nav', 'landing-stage', 'landing-intro', 'skill-art', 'landing-learning', 'landing-features', 'landing-feature', 'landing-rhythm', 'learning-steps', 'landing-feedback', 'sample-score', 'landing-cta', 'landing-footer']) {
    assert.ok(new RegExp(`class="[^"\\n]*\\b${className}\\b`).test(html), `static landing is missing .${className}`)
  }
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, 'static landing needs exactly one h1')
  for (const href of [
    '/app/prompts',
    '/app/write',
    '/app/essays/demo',
    '/app/vocabulary',
    '/donate',
    '/about',
    '/contact',
    '/privacy',
  ]) {
    assert.ok(html.includes(`href="${href}"`), `static landing is missing the link ${href}`)
  }
  assert.ok(!html.includes('react-router'), 'static landing must not depend on the router')
})

test('the React landing reads its copy from the shared landing module', () => {
  const source = readFileSync(join(process.cwd(), 'src', 'pages', 'Other.tsx'), 'utf8')
  assert.match(source, /import \{[^}]*landingCopy[^}]*\} from '\.\.\/agent\/landing(\.ts)?'/)
  const start = source.indexOf('export function Landing()')
  const end = source.indexOf('export function Donate()')
  assert.ok(start > 0 && end > start, 'could not locate the Landing component')
  const landingSource = source.slice(start, end)
  assert.ok(!/c\(\s*'/.test(landingSource), 'the Landing component still hard-codes copy')
  assert.ok(!landingSource.includes('Your ideas.'), 'the Landing component still hard-codes the hero title')
  assert.ok(landingSource.includes('landingCopy'), 'the Landing component does not use the shared copy')
})

test('the trust page renderer produces a complete document body', () => {
  for (const id of ['about', 'contact', 'privacy']) {
    const page = pageById(id)
    assert.ok(page, `missing content page ${id}`)
    const html = renderStaticHtml(page)
    assert.ok(html.includes('class="doc-shell"'), `${id} is missing .doc-shell`)
    assert.ok(html.includes('class="doc-nav"'), `${id} is missing .doc-nav`)
    assert.ok(html.includes('class="doc-main"'), `${id} is missing .doc-main`)
    assert.ok(html.includes('<main class="doc-page"'), `${id} is missing <main class="doc-page">`)
    assert.ok(html.includes('class="doc-footer"'), `${id} is missing .doc-footer`)
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${id} needs exactly one h1`)
    assert.equal((html.match(/<h2[\s>]/g) ?? []).length, page.sections.length, `${id} needs one h2 per section`)
    for (const href of ['/', '/about', '/contact', '/privacy', '/llms.txt', '/sitemap.xml']) {
      assert.ok(html.includes(`href="${href}"`), `${id} is missing the link ${href}`)
    }
  }
})

test('the trust page renderer escapes every interpolated string', () => {
  const hostile: ContentPage = {
    id: 'hostile',
    path: '/hostile',
    title: ['Tiêu đề', '<script>alert(1)</script>'],
    summary: ['a & b', 'a & b'],
    sections: [{ id: 'section', heading: ['<h2>', 'Heading'], body: [['<b>body</b>', '<i>body</i>']], list: [['<li>x</li>', '"x"']] }],
  }
  const html = renderStaticHtml(hostile)
  assert.ok(!html.includes('<script>'), 'a script tag must never reach the document')
  assert.ok(!html.includes('<b>'), 'markup must never reach the document')
  assert.ok(!html.includes('<i>'), 'markup must never reach the document')
  assert.ok(html.includes('&lt;script&gt;'), 'the title must be escaped')
  assert.ok(html.includes('&lt;i&gt;body&lt;/i&gt;'), 'the body must be escaped')
  assert.ok(html.includes('&quot;x&quot;'), 'the list item must be escaped')
})

// ---------- Theme bootstrap dùng chung cho mọi trang tĩnh ----------

// Chạy đúng đoạn script mà vite.config.ts chèn vào <head> trong một môi trường
// giả lập, để kiểm tra hành vi thật chứ không phải một bản song song.
function runThemeBootstrap(storage: { getItem(key: string): string | null }, systemDark = false) {
  const dataset: Record<string, string> = {}
  const style: Record<string, string> = {}
  vm.runInNewContext(themeBootstrapScript(), {
    localStorage: storage,
    window: { matchMedia: () => ({ matches: systemDark }) },
    document: { documentElement: { dataset, style } },
  })
  return { theme: dataset.theme, colorScheme: style.colorScheme }
}

test('the shared theme bootstrap applies the app theme to every static page', () => {
  assert.equal(themeStorageKey, 'ielts-theme-v2')
  assert.equal(defaultTheme, 'light')

  const readKeys: string[] = []
  const withoutStoredTheme = runThemeBootstrap({
    getItem: key => { readKeys.push(key); return null },
  })
  assert.equal(withoutStoredTheme.theme, 'light', 'a page without a stored theme must use the light default')
  assert.equal(withoutStoredTheme.colorScheme, 'light')
  assert.deepEqual(readKeys, [themeStorageKey], 'the bootstrap must read the app theme key')
  assert.equal(runThemeBootstrap({ getItem: () => null }, true).theme, 'light', 'dark OS settings must not override the default')

  assert.equal(runThemeBootstrap({ getItem: () => 'light' }).theme, 'light', 'a stored light theme must win')
  assert.equal(runThemeBootstrap({ getItem: () => 'dark' }).theme, 'dark')
  assert.equal(
    runThemeBootstrap({ getItem: () => { throw new Error('storage is blocked') } }).theme,
    'light',
    'unreadable storage must fall back to the light default',
  )
  assert.equal(
    runThemeBootstrap({ getItem: () => 'system' }).theme,
    'light',
    'the system preference must follow the operating system colour scheme',
  )
  assert.equal(runThemeBootstrap({ getItem: () => 'system' }, true).theme, 'dark')
})

test('the landing states the same sign-in condition as the public home page', () => {
  const home = pageById('home')
  assert.ok(home, 'missing home page')
  for (const lang of [0, 1] as const) {
    const homeText = plainText(home, lang).toLowerCase()
    const note = landingCopy.signInNote[lang].toLowerCase()
    const account = lang === 0 ? 'tài khoản' : 'account'
    const signIn = lang === 0 ? 'đăng nhập' : 'sign in'
    assert.ok(homeText.includes(account), `home (lang ${lang}) does not mention the account condition`)
    assert.ok(homeText.includes(signIn), `home (lang ${lang}) does not mention signing in`)
    assert.ok(note.includes(account), `the landing note (lang ${lang}) does not mention the account condition`)
    assert.ok(note.includes(signIn), `the landing note (lang ${lang}) does not mention signing in`)
  }
})

// ---------- Bộ chuyển ngôn ngữ của bản HTML tĩnh ----------

// Chạy đúng script inline mà plugin chèn vào trang, trong môi trường giả lập.
function runLanguageScript(storage: { getItem(key: string): string | null }, stored = 'en') {
  const root = { lang: 'en', dataset: { lang: 'en' as string } }
  const listeners: ((event: unknown) => void)[] = []
  const makeButton = (code: string, pressed: string) => {
    const attributes: Record<string, string> = { 'data-lang-switch': code, 'aria-pressed': pressed }
    const button = {
      attributes,
      getAttribute: (name: string) => attributes[name] ?? null,
      setAttribute: (name: string, value: string) => { attributes[name] = value },
      closest: (selector: string) => selector.includes('data-lang-switch') ? button : null,
    }
    return button
  }
  const buttons = [makeButton('vi', 'false'), makeButton('en', 'true')]
  const fakeDocument = {
    documentElement: root,
    querySelectorAll: () => buttons,
    addEventListener: (type: string, handler: (event: unknown) => void) => {
      if (type === 'click') listeners.push(handler)
    },
  }
  vm.runInNewContext(renderLanguageScript(), { document: fakeDocument, localStorage: storage })
  return { root, buttons, listeners, stored }
}

test('the static landing ships a working language switch', () => {
  const html = renderLandingHtml()
  assert.ok(html.includes('class="language-switch"'), 'the static landing needs the .language-switch control')
  assert.ok(html.includes('data-lang-switch="vi"'), 'the static landing needs a VI button')
  assert.ok(html.includes('data-lang-switch="en"'), 'the static landing needs an EN button')
  for (const button of landingCopy.languageButtons) {
    assert.ok(html.includes(`>${button.label}</button>`), `the static landing is missing the ${button.label} button`)
  }
  assert.ok(
    html.includes(`<span data-copy="vi" lang="vi">${escapeHtml(landingCopy.languageSwitchLabel[0])}</span>`),
    'the static landing needs the Vietnamese label of the language switch',
  )
})

test('the language script switches language, persists it and updates aria-pressed', () => {
  assert.equal(languageStorageKey, 'ielts-language')

  const stored: Record<string, string> = {}
  const storage = { getItem: (key: string) => stored[key] ?? null, setItem: (key: string, value: string) => { stored[key] = value } }
  const run = runLanguageScript(storage, 'en')
  assert.equal(run.root.lang, 'en', 'the script must set the document language')
  assert.equal(run.root.dataset.lang, 'en', 'the script must set the data-lang contract')

  // Bấm nút VI: đổi ngôn ngữ, lưu lại và cập nhật aria-pressed của cả hai nút.
  run.listeners.forEach(handler => handler({ target: run.buttons[0] }))
  assert.equal(run.root.lang, 'vi')
  assert.equal(run.root.dataset.lang, 'vi')
  assert.equal(stored['ielts-language'], 'vi', 'the choice must be persisted')
  assert.equal(run.buttons[0].attributes['aria-pressed'], 'true')
  assert.equal(run.buttons[1].attributes['aria-pressed'], 'false')

  // Ngôn ngữ đã lưu phải được dùng ngay khi trang mở.
  const restored = runLanguageScript({ getItem: () => 'vi' }, 'vi')
  assert.equal(restored.root.lang, 'vi')
  assert.equal(restored.root.dataset.lang, 'vi')
})

test('the localisation css falls back to English when the language attribute is missing', () => {
  const css = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8')
  assert.match(css, /\[data-copy\]\s*\{\s*display:\s*none;\s*\}/, 'the inactive language must stay hidden')
  assert.match(
    css,
    /html\[data-lang='vi'\]\s*\[data-copy='vi'\]\s*\{\s*display:\s*inline;\s*\}/,
    'Vietnamese must be shown when data-lang is vi',
  )
  assert.match(
    css,
    /html:not\(\[data-lang='vi'\]\)\s*\[data-copy='en'\]\s*\{\s*display:\s*inline;\s*\}/,
    'English must be the fallback when data-lang is missing or not vi',
  )
})

test('the static landing keeps single-language footer labels readable in the raw html', () => {
  const html = renderLandingHtml()
  for (const link of landingCopy.footerLinks) {
    assert.ok(html.includes(`>${link.label}</a>`), `the footer label ${link.label} must appear once`)
    assert.ok(!html.includes(`${link.label}${link.label}`), `the footer label ${link.label} must not be duplicated`)
  }
})

// ---------- Drift giữa bản React và bản HTML tĩnh ----------

test('React renders the same escaped HTML used by the static landing', () => {
  const source = readFileSync(join(process.cwd(), 'src', 'pages', 'Other.tsx'), 'utf8')
  assert.match(source, /const landingMarkup = renderLandingHtml\(\)/)
  assert.match(source, /dangerouslySetInnerHTML=\{\{ __html: landingMarkup \}\}/)
  const hrefs = [...renderLandingHtml().matchAll(/href="([^"]+)"/g)].map(match => match[1])
  for (const href of ['/app', '/app/reading', '/app/write', '/app/vocabulary', '/app/essays/demo', '/donate']) assert.ok(hrefs.includes(href), href)
})

// ---------- Plugin build: phải fail loudly khi marker đổi ----------

type HtmlHook = (html: string, context: { path: string }) => string | { html: string }

function transformPage(html: string, path = '/index.html') {
  const plugin = agentPages()
  const hook = plugin.transformIndexHtml as unknown as HtmlHook
  const result = hook(html, { path })
  return typeof result === 'string' ? result : result.html
}

const validEntry = '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>x</title></head><body><div id="root"></div></body></html>'

test('the page plugin throws when the html markers are missing', () => {
  assert.throws(
    () => transformPage('<!doctype html><html lang="en"><head><title>x</title></head><body></body></html>', '/index.html'),
    /root/i,
    'the plugin must fail when the #root marker is missing',
  )
  assert.throws(
    () => transformPage('<!doctype html><html lang="en"><body><div id="root"></div></body></html>', '/pages/about.html'),
    /head/i,
    'the plugin must fail when the </head> marker is missing',
  )
})

test('the page plugin injects the landing content and the language script', () => {
  const output = transformPage(validEntry, '/index.html')
  assert.ok(output.includes('class="landing"'), 'the landing markup must be injected')
  assert.ok(output.includes('data-lang-switch="vi"'), 'the landing must ship the language switch')
  assert.ok(output.includes(`localStorage.setItem("${languageStorageKey}"`), 'the language script must persist the choice')
  const trust = transformPage(validEntry, '/pages/about.html')
  assert.ok(trust.includes('class="doc-shell"'), 'the trust page markup must be injected')
  assert.ok(trust.includes('data-lang-switch'), 'trust pages share the language switch')
  assert.ok(trust.includes('data-theme-switch'), 'trust pages share the theme switch')
})
