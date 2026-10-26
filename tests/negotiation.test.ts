import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeVary, negotiateRepresentation } from '../src/agent/negotiation.ts'

test('a request without an accept header gets html', () => {
  assert.deepEqual(negotiateRepresentation(null), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation(''), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('   '), { kind: 'html' })
})

test('an exact media type wins over a subtype wildcard', () => {
  // text/* có q=0.1 nhưng text/markdown khớp chính xác nên q=1 thắng.
  assert.deepEqual(negotiateRepresentation('text/markdown;q=1, text/*;q=0.1'), { kind: 'markdown' })
  // text/markdown khớp chính xác nên q=0.5 thắng, html vẫn được text/* với q=1.
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0.5, text/*;q=1'), { kind: 'html' })
})

test('an exact media type wins over the full wildcard', () => {
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0, */*;q=1'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/html;q=0, */*;q=1'), { kind: 'markdown' })
})

test('a wildcard range never overrides a more specific range', () => {
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0, text/*;q=1'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/markdown;q=1, */*;q=0.1'), { kind: 'markdown' })
})

test('a q value of zero means the range is not acceptable', () => {
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0, text/html;q=1'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0'), { kind: 'not-acceptable' })
  assert.deepEqual(negotiateRepresentation('text/html;q=0'), { kind: 'not-acceptable' })
})

test('an invalid q value counts as zero instead of one', () => {
  for (const accept of ['text/html;q=abc', 'text/html;q=2', 'text/html;q=1.5', 'text/html;q=-1', 'text/html;q=.5', 'text/html;q=0.0000']) {
    assert.deepEqual(negotiateRepresentation(accept), { kind: 'not-acceptable' }, accept)
  }
  assert.deepEqual(negotiateRepresentation('text/html;q=0.000'), { kind: 'not-acceptable' })
  assert.deepEqual(negotiateRepresentation('text/html;q=1.000'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0.5'), { kind: 'markdown' })
})

test('markdown is only chosen when it is strictly preferred', () => {
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0.9, text/html;q=0.5'), { kind: 'markdown' })
  assert.deepEqual(negotiateRepresentation('text/markdown, text/html;q=0.9'), { kind: 'markdown' })
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0.9, text/html;q=1'), { kind: 'html' })
})

test('a tie keeps html so browsers do not change behaviour', () => {
  assert.deepEqual(negotiateRepresentation('text/markdown;q=0.8, text/html;q=0.8'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/markdown;q=1, text/html;q=1'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('*/*'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/*'), { kind: 'html' })
})

test('markdown alone is acceptable while html is not', () => {
  assert.deepEqual(negotiateRepresentation('text/markdown'), { kind: 'markdown' })
})

test('a header without any supported type is not acceptable', () => {
  assert.deepEqual(negotiateRepresentation('application/json'), { kind: 'not-acceptable' })
  assert.deepEqual(negotiateRepresentation('application/xml, image/png'), { kind: 'not-acceptable' })
  assert.deepEqual(negotiateRepresentation('application/json, text/markdown'), { kind: 'markdown' })
  assert.deepEqual(negotiateRepresentation('application/json, text/html'), { kind: 'html' })
})

test('media types are compared case insensitively and ignore extra parameters', () => {
  assert.deepEqual(negotiateRepresentation('TEXT/MARKDOWN'), { kind: 'markdown' })
  assert.deepEqual(negotiateRepresentation('text/html;charset=utf-8'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/markdown; charset=utf-8; q=0.9'), { kind: 'markdown' })
})

test('empty accept elements are ignored', () => {
  assert.deepEqual(negotiateRepresentation(','), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation(',,'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation(' , '), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text/html,,'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation(', text/markdown'), { kind: 'markdown' })
  assert.deepEqual(negotiateRepresentation(', application/json'), { kind: 'not-acceptable' })
})

test('only the full wildcard and a subtype wildcard may contain a wildcard', () => {
  assert.deepEqual(negotiateRepresentation('*/json'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('*/html'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('*/markdown'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('*/json, text/html'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('text'), { kind: 'html' })
  assert.deepEqual(negotiateRepresentation('*/json, application/json'), { kind: 'not-acceptable' })
})

test('mergeVary keeps every existing value', () => {
  assert.equal(mergeVary('Accept', 'Accept'), 'Accept')
  assert.equal(mergeVary('Cookie, Accept', 'Accept'), 'Cookie, Accept')
  assert.equal(mergeVary(null, 'Accept'), 'Accept')
  assert.equal(mergeVary(undefined, 'Accept'), 'Accept')
  assert.equal(mergeVary('', 'Accept'), 'Accept')
  assert.equal(mergeVary('Cookie', 'Accept'), 'Cookie, Accept')
  assert.equal(mergeVary('Cookie', 'Accept-Encoding'), 'Cookie, Accept-Encoding')
})

test('mergeVary never drops a value that is written differently', () => {
  assert.equal(mergeVary('accept', 'Accept'), 'accept')
  assert.equal(mergeVary('Cookie, Accept, User-Agent', 'Accept'), 'Cookie, Accept, User-Agent')
})
