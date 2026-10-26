import { test } from 'node:test'
import assert from 'node:assert/strict'
import { site, buildJsonLd, buildHeadTags, htmlLang } from '../src/agent/site.ts'
import { pages, pageById, pageByPath, plainText } from '../src/agent/content.ts'
import { renderMarkdown, renderNotFoundMarkdown } from '../src/agent/markdown.ts'
import { matchPath, spaRoutes, staticFiles, apiRoutes, markdownPageIds } from '../src/agent/routes.ts'

test('route table matches exact paths, dynamic segments and rejects unknown paths', () => {
  assert.equal(matchPath('/')?.id, '/')
  assert.equal(matchPath('/app/prompts')?.id, '/app/prompts')
  assert.equal(matchPath('/app/essays/9f0c-1234')?.id, '/app/essays/:id')
  assert.equal(matchPath('/api/prompts/urban-parks')?.id, '/api/prompts/:slug')
  assert.equal(matchPath('/openapi.json')?.kind, 'static')
  assert.equal(matchPath('/khong-ton-tai'), null)
  assert.equal(matchPath('/app/essays')?.id, '/app/essays')
  assert.equal(matchPath('/app/essays/')?.id, '/app/essays')
})

test('route table keeps spa, static and api routes disjoint', () => {
  for (const path of spaRoutes) assert.equal(matchPath(path)?.kind, 'spa', path)
  for (const path of staticFiles) assert.equal(matchPath(path)?.kind, 'static', path)
  for (const path of apiRoutes) assert.equal(matchPath(path)?.kind, 'api', path)
})

test('every public page has a markdown representation', () => {
  for (const id of markdownPageIds) {
    const page = pageById(id)
    assert.ok(page, `missing content page ${id}`)
    assert.ok(page.path.startsWith('/'))
  }
  assert.deepEqual(markdownPageIds.sort(), ['about', 'contact', 'developers', 'docs', 'home', 'privacy'])
})

test('trust anchor pages carry at least 500 characters of readable content', () => {
  for (const id of ['about', 'contact', 'privacy']) {
    const text = plainText(pageById(id), 1)
    assert.ok(text.length >= 500, `${id} only has ${text.length} characters`)
  }
})

test('developer portal and api docs describe quickstart, auth, sandbox and endpoints', () => {
  const developers = plainText(pageById('developers'), 1)
  for (const needle of ['curl', 'API key', 'Sandbox', 'MCP', 'Rate limit']) assert.match(developers, new RegExp(needle, 'i'))
  const docs = plainText(pageById('docs'), 1)
  for (const needle of ['/api/prompts', '/api/health', 'error', 'operationId']) assert.match(docs, new RegExp(needle.replace(/[/]/g, '\\/'), 'i'))
})

test('markdown rendering produces a heading, sections and working links', () => {
  const markdown = renderMarkdown(pageById('about'), 1)
  assert.match(markdown, /^# /)
  assert.match(markdown, /\n## /)
  assert.match(markdown, /\]\(\/docs\)/)
  assert.ok(markdown.length > 500)
})

test('not found markdown explains the error and points to agent resources', () => {
  const markdown = renderNotFoundMarkdown('/khong-ton-tai')
  assert.ok(markdown.length >= 20)
  assert.match(markdown, /404/)
  assert.match(markdown, /\/docs/)
  assert.match(markdown, /\/sitemap\.xml/)
  assert.match(markdown, /\/llms\.txt/)
})

test('json-ld exposes software application and organization identity', () => {
  const graph = buildJsonLd()['@graph'] as Record<string, unknown>[]
  const app = graph.find(node => node['@type'] === 'SoftwareApplication')!
  const org = graph.find(node => node['@type'] === 'Organization')!
  assert.ok(app, 'SoftwareApplication node missing')
  assert.ok(org, 'Organization node missing')
  assert.equal(app.name, site.name)
  assert.ok(String(app.description).length > 40)
  assert.equal(app.url, `${site.url}/`)
  assert.deepEqual((app.offers as Record<string, unknown>)['@type'], 'Offer')
  const contact = (org.contactPoint as Record<string, unknown>[])[0]
  assert.equal(contact.contactType, site.contact.contactType)
  assert.equal(contact.email, site.contact.email)
  assert.equal((org.address as Record<string, unknown>)['@type'], 'PostalAddress')
  assert.equal((org.address as Record<string, unknown>).addressCountry, site.address.addressCountry)
  assert.ok((org.sameAs as string[]).includes(site.repository))
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

test('pages are addressable by id and by path', () => {
  assert.equal(pageByPath('/privacy')?.id, 'privacy')
  assert.equal(pageById('docs').path, '/docs')
  assert.equal(pages.length, 6)
})
