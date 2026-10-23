import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countWords, scheduleReview, validateImages } from '../src/lib/learning.ts'

test('word count handles whitespace, hyphens, contractions and punctuation', () => {
  assert.equal(countWords('  '), 0)
  assert.equal(countWords("It's a long-term plan.\nTry again!"), 6)
  assert.equal(countWords('... — !!!'), 0)
})
test('first success is one day, then three; failure resets, final level caps', () => {
  const now = Date.parse('2026-10-24T10:00:00Z')
  assert.deepEqual(scheduleReview(0, true, now), { level: 1, dueAt: now + 86400000 })
  assert.deepEqual(scheduleReview(1, true, now), { level: 2, dueAt: now + 3 * 86400000 })
  assert.deepEqual(scheduleReview(5, false, now), { level: 0, dueAt: now + 86400000 })
  assert.deepEqual(scheduleReview(6, true, now), { level: 6, dueAt: now + 60 * 86400000 })
})
test('image inputs reject excess count, oversized and non-image files', () => {
  assert.equal(validateImages([{ type: 'image/png', size: 100 }]), null)
  assert.equal(validateImages([{ type: 'image/svg+xml', size: 100 }]), 'imageType')
  assert.equal(validateImages([{ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }]), 'imageSize')
  assert.equal(validateImages(Array(3).fill({ type: 'image/png', size: 1 })), 'imageCount')
})
