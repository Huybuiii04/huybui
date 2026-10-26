import { test } from 'node:test'
import assert from 'node:assert/strict'
import middleware, { config } from '../middleware.ts'

const origin = 'https://huybui.vercel.app'

function call(path: string, accept = 'text/html,application/xhtml+xml') {
  return middleware(new Request(`${origin}${path}`, { headers: { accept } }))
}

test('homepage answers markdown requests with markdown body and vary header', async () => {
  const response = await call('/', 'text/markdown')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') ?? '', /text\/markdown/)
  assert.match(response.headers.get('vary') ?? '', /Accept/)
  const body = await response.text()
  assert.match(body, /^# /)
  assert.ok(body.length > 500)
})

test('html requests continue to the app with a vary header', async () => {
  const response = await call('/', 'text/html')
  assert.equal(response.headers.get('x-middleware-next'), '1')
  assert.match(response.headers.get('vary') ?? '', /Accept/)
})

test('unknown paths return a real 404 status', async () => {
  const response = await call('/some-path-that-does-not-exist')
  assert.equal(response.status, 404)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/)
})

test('unknown paths return markdown body when markdown is requested', async () => {
  const response = await call('/some-path-that-does-not-exist', 'text/markdown')
  assert.equal(response.status, 404)
  assert.match(response.headers.get('content-type') ?? '', /text\/markdown/)
  const body = await response.text()
  assert.ok(body.length >= 20)
  assert.match(body, /404/)
  assert.match(body, /\/sitemap\.xml/)
  assert.match(body, /\/llms\.txt/)
  assert.ok(!body.includes('/docs'))
})

test('known routes are not treated as missing', async () => {
  for (const path of ['/app/write', '/app/prompts', '/about', '/contact', '/privacy', '/auth']) {
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

test('api paths are handed over to the functions', async () => {
  const response = await call('/api/prompts')
  assert.equal(response.headers.get('x-middleware-next'), '1')
})

test('middleware matcher keeps static assets out of the function path', () => {
  const matcher = String((config as { matcher: string[] }).matcher[0])
  assert.match(matcher, /assets/)
})
