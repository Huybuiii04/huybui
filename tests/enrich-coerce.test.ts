/**
 * Test: `coerceEnrichmentOutput` phải chịu được model trả `errors` dạng chuỗi JSON.
 *
 * Model (qua proxy) đôi khi trả `errors` là STRING chứa JSON thay vì mảng.
 * `asArray` hiện bỏ mất → mất toàn bộ góp ý, error_logs rỗng.
 *
 *   node --test tests/enrich-coerce.test.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { coerceEnrichmentOutput } from '../supabase/functions/_shared/ai/enrich.ts'

test('errors trả về dạng chuỗi JSON vẫn được giữ lại', () => {
  const output = coerceEnrichmentOutput({
    structure: { paragraphs: [] },
    lexical: { examples: [] },
    grammar: { examples: [] },
    errors: '[{"criterion":"GRA","quote":"a big problem","correction":"a pressing threat","explanation":"e","category":"word choice","skill_tags":["lexis"],"fingerprint":"f"}]',
    unnatural: [],
    vocabulary_plan: { topic: 't', words: [] },
    band_plan: { current_band: 6, target_band: 7, steps: [] },
  })
  assert.equal(output.errors.length, 1)
  assert.equal(output.errors[0].quote, 'a big problem')
  assert.equal(output.errors[0].correction, 'a pressing threat')
})

test('errors bọc hai lần (chuỗi trong chuỗi) vẫn được giữ lại', () => {
  const inner = '[{"criterion":"GRA","quote":"q","correction":"c","explanation":"e","category":"cat","skill_tags":[],"fingerprint":"f"}]'
  const output = coerceEnrichmentOutput({
    structure: { paragraphs: [] },
    lexical: { examples: [] },
    grammar: { examples: [] },
    errors: JSON.stringify(inner),
    unnatural: [],
    vocabulary_plan: { topic: 't', words: [] },
    band_plan: { current_band: 6, target_band: 7, steps: [] },
  })
  assert.equal(output.errors.length, 1)
  assert.equal(output.errors[0].quote, 'q')
})

test('mảng errors bình thường vẫn hoạt động', () => {
  const output = coerceEnrichmentOutput({
    structure: { paragraphs: [] },
    lexical: { examples: [] },
    grammar: { examples: [] },
    errors: [{ criterion: 'GRA', quote: 'q', correction: 'c', explanation: 'e', category: 'cat', skill_tags: ['t'], fingerprint: 'f' }],
    unnatural: [],
    vocabulary_plan: { topic: 't', words: [] },
    band_plan: { current_band: 6, target_band: 7, steps: [] },
  })
  assert.equal(output.errors.length, 1)
  assert.equal(output.errors[0].quote, 'q')
})

test('chuỗi JSON hỏng thì bỏ qua, không throw', () => {
  const output = coerceEnrichmentOutput({
    structure: { paragraphs: [] },
    lexical: { examples: [] },
    grammar: { examples: [] },
    errors: 'not json at all',
    unnatural: [],
    vocabulary_plan: { topic: 't', words: [] },
    band_plan: { current_band: 6, target_band: 7, steps: [] },
  })
  assert.deepEqual(output.errors, [])
})
