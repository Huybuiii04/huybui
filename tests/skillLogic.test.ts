import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  answeredCount,
  formatClock,
  normalizeQuestionType,
  parseOptions,
  progressPercent,
  sanitizeHtml,
  splitHtmlByBlanks,
  splitParagraphs,
} from '../src/lib/skillLogic.ts'

test('formatClock renders minutes with padded seconds', () => {
  assert.equal(formatClock(0), '0:00')
  assert.equal(formatClock(65), '1:05')
  assert.equal(formatClock(3600), '60:00')
  assert.equal(formatClock(-5), '0:00')
})

test('answeredCount ignores blank answers', () => {
  const questions = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  assert.equal(answeredCount({ a: 'TRUE', b: '   ' }, questions), 1)
  assert.equal(answeredCount({}, questions), 0)
})

test('progressPercent never divides by zero', () => {
  assert.equal(progressPercent(0, 0), 0)
  assert.equal(progressPercent(1, 4), 25)
  assert.equal(progressPercent(4, 4), 100)
})

test('splitParagraphs drops blank chunks and trims each paragraph', () => {
  assert.deepEqual(splitParagraphs('one\n\n\n  two  \n\n'), ['one', 'two'])
  assert.deepEqual(splitParagraphs(''), [])
})

test('parseOptions splits "A. text" and falls back to letters', () => {
  assert.deepEqual(parseOptions(['A. first', 'B. second']), [
    { key: 'A', text: 'first' },
    { key: 'B', text: 'second' },
  ])
  assert.deepEqual(parseOptions(['only one']), [{ key: 'A', text: 'only one' }])
  assert.deepEqual(parseOptions([{ key: 'X', text: 'custom' }]), [{ key: 'X', text: 'custom' }])
})

test('normalizeQuestionType maps every source type to an app type', () => {
  assert.equal(normalizeQuestionType('tfng'), 'tfng')
  assert.equal(normalizeQuestionType('T_F_NG'), 'tfng')
  assert.equal(normalizeQuestionType('ynng'), 'ynng')
  assert.equal(normalizeQuestionType('yes-no'), 'ynng')
  assert.equal(normalizeQuestionType('multiple-choice'), 'mcq')
  assert.equal(normalizeQuestionType('matching-info'), 'matching')
  assert.equal(normalizeQuestionType('matching-feature'), 'matching')
  assert.equal(normalizeQuestionType('MATCHING_HEADING'), 'matching')
  assert.equal(normalizeQuestionType('fill-blank'), 'fill')
  assert.equal(normalizeQuestionType('gap-filling'), 'fill')
  assert.equal(normalizeQuestionType('khong-biết'), 'fill')
})

test('sanitizeHtml drops scripts and event handlers but keeps markup', () => {
  const html = '<p>Hello <strong>world</strong></p><script>alert(1)</script><p onclick="x()">Bye</p>'
  const clean = sanitizeHtml(html)
  assert.match(clean, /<strong>world<\/strong>/)
  assert.doesNotMatch(clean, /script/i)
  assert.doesNotMatch(clean, /onclick/i)
})

test('sanitizeHtml drops javascript: links', () => {
  assert.doesNotMatch(sanitizeHtml('<a href="javascript:alert(1)">x</a>'), /javascript:/i)
})

test('splitHtmlByBlanks finds numbered blanks', () => {
  const segments = splitHtmlByBlanks('<p>cost was <strong>1_______</strong> each</p>')
  assert.equal(segments.length, 3)
  assert.deepEqual(segments[1], { kind: 'blank', questionId: 1 })
  assert.match(segments[0].html, /cost was/)
})

test('splitHtmlByBlanks returns plain html when there is no blank', () => {
  const segments = splitHtmlByBlanks('<p>no blanks here</p>')
  assert.equal(segments.length, 1)
  assert.equal(segments[0].kind, 'html')
})
