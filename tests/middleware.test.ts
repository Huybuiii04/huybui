import { test } from 'node:test'
import assert from 'node:assert/strict'
import middleware, { config } from '../middleware.ts'
import { staticFiles } from '../src/agent/routes.ts'

const origin = 'https://huybui.vercel.app'

function call(path: string, accept = 'text/html,application/xhtml+xml') {
  return middleware(new Request(`${origin}${path}`, { headers: { accept } }))
}

test('homepage answers markdown requests with markdown body and vary header', async () => {
  const response = await call('/', 'text/markdown')
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  assert.equal(response.headers.get('vary'), 'Accept')
  const body = await response.text()
  assert.match(body, /^# /)
  assert.ok(body.length > 500)
})

test('html requests continue to the app with a vary header', async () => {
  const response = await call('/', 'text/html')
  assert.equal(response.headers.get('x-middleware-next'), '1')
  assert.match(response.headers.get('vary') ?? '', /Accept/)
})

test('wildcard accept keeps browsers on html', async () => {
  for (const accept of ['*/*', 'text/*', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8']) {
    const response = await call('/', accept)
    assert.equal(response.headers.get('x-middleware-next'), '1', accept)
  }
})

test('media specificity wins before the q value', async () => {
  const downgraded = await call('/', 'text/markdown;q=0, */*;q=1')
  assert.equal(downgraded.headers.get('x-middleware-next'), '1')
  assert.equal(downgraded.headers.get('content-type'), null)
  const preferred = await call('/', 'text/markdown;q=1, text/*;q=0.1')
  assert.match(preferred.headers.get('content-type') ?? '', /text\/markdown/)
})

test('markdown is only used when the client prefers it over html', async () => {
  const html = await call('/', 'text/html')
  assert.equal(html.headers.get('x-middleware-next'), '1')
  const downgraded = await call('/', 'text/markdown;q=0, text/html;q=1')
  assert.equal(downgraded.headers.get('x-middleware-next'), '1')
  const lowerQuality = await call('/', 'text/markdown;q=0.9, text/html;q=1')
  assert.equal(lowerQuality.headers.get('x-middleware-next'), '1')
  const tie = await call('/', 'text/markdown;q=1, text/html;q=1')
  assert.equal(tie.headers.get('x-middleware-next'), '1')
  const wildcard = await call('/', '*/*')
  assert.equal(wildcard.headers.get('x-middleware-next'), '1')
  const preferred = await call('/', 'text/markdown, text/html;q=0.9')
  assert.match(preferred.headers.get('content-type') ?? '', /text\/markdown/)
})

test('an accept header without a supported format answers 406', async () => {
  const response = await call('/', 'application/json')
  assert.equal(response.status, 406)
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8')
  const body = await response.text()
  assert.match(body, /text\/html/)
  assert.match(body, /text\/markdown/)
})

test('unknown paths return a real 404 status', async () => {
  const response = await call('/some-path-that-does-not-exist')
  assert.equal(response.status, 404)
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8')
})

test('an unknown page path explains the error and links to the real resources', async () => {
  const response = await call('/khong-ton-tai')
  assert.equal(response.status, 404)
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8')
  const body = await response.text()
  assert.match(body, /404/)
  assert.match(body, /href="\/"/)
  assert.match(body, /href="\/llms\.txt"/)
  assert.match(body, /href="\/sitemap\.xml"/)
  assert.ok(!body.includes('/docs'))
})

test('unknown paths return markdown body when markdown is requested', async () => {
  const response = await call('/some-path-that-does-not-exist', 'text/markdown')
  assert.equal(response.status, 404)
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  const body = await response.text()
  assert.match(body, /404/)
  assert.match(body, /\]\(\/\)/)
  assert.match(body, /\]\(\/llms\.txt\)/)
  assert.match(body, /\]\(\/sitemap\.xml\)/)
  assert.ok(!body.includes('/docs'))
})

test('a trailing slash does not change how a page is served', async () => {
  const markdown = await call('/about/', 'text/markdown')
  assert.equal(markdown.status, 200)
  assert.equal(markdown.headers.get('content-type'), 'text/markdown; charset=utf-8')
  const html = await call('/about/')
  assert.equal(html.headers.get('x-middleware-next'), '1')
  const unacceptable = await call('/about/', 'application/json')
  assert.equal(unacceptable.status, 406)
})

test('a trailing slash does not turn a missing resource into markdown', async () => {
  for (const path of ['/missing.json/', '/missing.css/', '/missing.xml/']) {
    const response = await call(path, 'text/markdown')
    assert.equal(response.status, 404, path)
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8', path)
  }
})

test('a missing technical resource is never negotiated into markdown', async () => {
  const paths = [
    '/missing.json',
    '/missing.xml',
    '/missing.txt',
    '/missing.css',
    '/missing.js',
    '/missing.mjs',
    '/missing.map',
    '/missing.png',
    '/missing.svg',
    '/missing.ico',
    '/missing.webmanifest',
  ]
  for (const path of paths) {
    const response = await call(path, 'text/markdown')
    assert.equal(response.status, 404, path)
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8', path)
  }
})

test('an unknown api path answers a structured json 404', async () => {
  const response = await call('/api/does-not-exist')
  assert.equal(response.status, 404)
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8')
  const body = await response.json() as { error: { code: string; message: string; hint: string; status: number } }
  assert.equal(body.error.code, 'unknown_endpoint')
  assert.equal(body.error.message, 'No API endpoint is published at this path.')
  assert.equal(body.error.hint, 'Use the website navigation for app features. This project does not currently offer a public REST API.')
  assert.equal(body.error.status, 404)
})

test('an encoded resource path is still detected as a missing resource', async () => {
  const paths = ['/missing%2Ejson', '/missing%2Ecss', '/missing%2Exml', '/missing%2Etxt', '/missing%2Ejs', '/missing%zz.json']
  for (const path of paths) {
    const response = await call(path, 'text/markdown')
    assert.equal(response.status, 404, path)
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8', path)
  }
})

test('a multiply encoded resource path is still detected as a missing resource', async () => {
  for (const path of ['/missing%252Ejson', '/missing%25252Ejson']) {
    const response = await call(path, 'text/markdown')
    assert.equal(response.status, 404, path)
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8', path)
  }
})

test('a malformed percent escape still answers 404 without throwing', async () => {
  for (const path of ['/missing%zz.json', '/%E0%A4%A', '/%zz']) {
    const response = await call(path)
    assert.equal(response.status, 404, path)
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8', path)
    const body = await response.text()
    assert.match(body, /404/, path)
  }
})

test('every api path answers the same json error', async () => {
  for (const path of ['/api', '/api/', '/api/prompts', '/api/health']) {
    const response = await call(path)
    assert.equal(response.status, 404, path)
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8', path)
    const body = await response.json() as { error: { code: string; status: number } }
    assert.equal(body.error.code, 'unknown_endpoint', path)
    assert.equal(body.error.status, 404, path)
  }
})

test('known routes are not treated as missing', async () => {
  for (const path of ['/app/write', '/app/essays/abc', '/auth/callback', '/about', '/privacy', '/app', '/donate', '/admin', '/auth']) {
    const response = await call(path)
    assert.equal(response.status, 200, path)
    assert.equal(response.headers.get('x-middleware-next'), '1', path)
  }
})

test('public content pages also answer in markdown', async () => {
  const response = await call('/privacy', 'text/markdown')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') ?? '', /text\/markdown/)
  assert.match(await response.text(), /^# /)
})

test('the removed mcp manifest is not published', async () => {
  const response = await call('/.well-known/mcp')
  assert.equal(response.status, 404)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/)
})

test('head requests get the same status and headers without a body', async () => {
  const get = await call('/khong-ton-tai', 'text/markdown')
  const head = await middleware(new Request(`${origin}/khong-ton-tai`, { method: 'HEAD', headers: { accept: 'text/markdown' } }))
  assert.equal(head.status, get.status)
  assert.equal(head.headers.get('content-type'), get.headers.get('content-type'))
  assert.equal(head.headers.get('vary'), get.headers.get('vary'))
  assert.equal(head.headers.get('cache-control'), get.headers.get('cache-control'))
  assert.equal(await head.text(), '')
})

test('control characters in the missing path are stripped', async () => {
  const response = await call('/khong%0A%20ton%20tai', 'text/markdown')
  const body = await response.text()
  assert.ok(!/[\u0000-\u001f\u007f]/.test(body.replace(/\n/g, '')), 'control characters must not reach the body')
  assert.match(body, /khong ton tai/)
})

test('generated responses forbid sniffing and force revalidation', async () => {
  const responses = [
    await call('/', 'text/markdown'),
    await call('/', 'application/json'),
    await call('/khong-ton-tai'),
    await call('/khong-ton-tai', 'text/markdown'),
    await call('/missing.json', 'text/markdown'),
    await call('/api/does-not-exist'),
  ]
  for (const response of responses) {
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate')
  }
})

test('only negotiated responses carry a vary header', async () => {
  const markdown = await call('/about', 'text/markdown')
  assert.equal(markdown.headers.get('vary'), 'Accept')
  const html = await call('/about')
  assert.equal(html.headers.get('vary'), 'Accept')
  const notFound = await call('/khong-ton-tai')
  assert.equal(notFound.headers.get('vary'), 'Accept')
  const notFoundMarkdown = await call('/khong-ton-tai', 'text/markdown')
  assert.equal(notFoundMarkdown.headers.get('vary'), 'Accept')
  const unacceptable = await call('/', 'application/json')
  assert.equal(unacceptable.headers.get('vary'), 'Accept')
})

test('responses that do not vary by accept carry no vary header', async () => {
  const api = await call('/api/does-not-exist')
  assert.equal(api.headers.get('vary'), null)
  const missingResource = await call('/missing.json', 'text/markdown')
  assert.equal(missingResource.headers.get('vary'), null)
})

test('middleware matcher keeps static assets out of the function path', () => {
  const matcher = String((config as { matcher: string[] }).matcher[0])
  assert.match(matcher, /assets/)
  const regex = new RegExp(`^${matcher}$`)
  for (const path of ['/assets/missing.js', '/favicon.svg', '/donate-qr.png', '/og-image.png', '/robots.txt', '/sitemap.xml', '/llms.txt']) {
    assert.equal(regex.test(path), false, path)
  }
  for (const path of ['/', '/about', '/missing.json', '/api/does-not-exist']) {
    assert.equal(regex.test(path), true, path)
  }
})

test('the middleware matcher excludes exactly the static public files', () => {
  const matcher = String((config as { matcher: string[] }).matcher[0])
  const regex = new RegExp(`^${matcher}$`)
  for (const file of staticFiles) {
    assert.equal(regex.test(file), false, `${file} must be served by the CDN`)
  }
  assert.equal(regex.test('/assets/app.js'), false)
  for (const path of ['/', '/about', '/api/does-not-exist', '/missing.json', '/logo.svg', '/robots']) {
    assert.equal(regex.test(path), true, path)
  }
})
