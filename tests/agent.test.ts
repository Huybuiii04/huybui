import { test } from 'node:test'
import assert from 'node:assert/strict'
import { site, buildJsonLd, buildHeadTags, htmlLang } from '../src/agent/site.ts'
import { pages, pageById, pageByPath, plainText, type ContentPage } from '../src/agent/content.ts'
import { renderMarkdown, renderNotFoundMarkdown } from '../src/agent/markdown.ts'
import { matchPath, spaRoutes, staticFiles, apiRoutes, markdownPageIds } from '../src/agent/routes.ts'

// Tuyên bố cấm trong bản tiếng Anh: các bản đặc tả API, cổng nhà phát triển,
// MCP server, khoá API, môi trường thử nghiệm.
const forbiddenClaims = ['OpenAPI', 'developer portal', 'MCP', 'API key', 'sandbox', 'REST API'] as const
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
