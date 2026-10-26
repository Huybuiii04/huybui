import { test } from 'node:test'
import assert from 'node:assert/strict'
import { site, buildJsonLd, buildHeadTags, htmlLang } from '../src/agent/site.ts'
import { pages, pageById, pageByPath, plainText } from '../src/agent/content.ts'
import { renderMarkdown, renderNotFoundMarkdown } from '../src/agent/markdown.ts'
import { matchPath, spaRoutes, staticFiles, apiRoutes, markdownPageIds } from '../src/agent/routes.ts'

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
  const text = pages.map(page => plainText(page, 1)).join('\n')
  for (const needle of ['OpenAPI', 'developer portal', 'MCP', 'API key', 'sandbox', 'REST API']) {
    assert.ok(!new RegExp(needle, 'i').test(text), `public copy still mentions ${needle}`)
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

test('not found markdown escapes the requested path before quoting it', () => {
  const markdown = renderNotFoundMarkdown('/a `b` c\nsecond line')
  assert.ok(!markdown.includes('`b`'), 'the path is not escaped inside the code span')
  assert.match(markdown, /\\`/)
  assert.ok(!markdown.includes('\nsecond'), 'the path keeps a line break')
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
