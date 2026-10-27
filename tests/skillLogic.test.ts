import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as skillLogic from '../src/lib/skillLogic.ts'
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
  assert.equal(normalizeQuestionType('matching'), 'matching')
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

test('sanitizeHtml keeps safe attributes on allowed tags', () => {
  const clean = sanitizeHtml('<img src="/img/a.png" alt="A" width="100"><a href="https://example.com">link</a><td colspan="2">x</td>')
  assert.match(clean, /<img src="\/img\/a\.png" alt="A" width="100">/)
  assert.match(clean, /<a href="https:\/\/example\.com">link<\/a>/)
  assert.match(clean, /<td colspan="2">x<\/td>/)
})

test('sanitizeHtml drops attributes outside the allow list', () => {
  assert.equal(sanitizeHtml('<p id="intro" draggable="true">text</p>'), '<p>text</p>')
  assert.equal(sanitizeHtml('<p class="lead">text</p>'), '<p>text</p>')
})

test('sanitizeHtml drops unquoted javascript: links', () => {
  const clean = sanitizeHtml('<a href=javascript:alert(1) title="safe">x</a>')
  assert.doesNotMatch(clean, /javascript:/i)
  assert.match(clean, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml drops javascript: href but keeps the tag', () => {
  const clean = sanitizeHtml('<a href="javascript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(clean, /javascript:/i)
  assert.match(clean, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml drops dangerous url schemes', () => {
  const vbscript = sanitizeHtml('<a href="vbscript:msgbox(1)" title="safe">x</a>')
  assert.doesNotMatch(vbscript, /vbscript:/i)
  assert.match(vbscript, /<a title="safe">x<\/a>/)

  const data = sanitizeHtml('<img src="data:image/png;base64,AAA" alt="A">')
  assert.doesNotMatch(data, /data:/i)
  assert.match(data, /<img alt="A">/)

  const newline = sanitizeHtml('<a href="java\nscript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(newline, /javascript:/i)
  assert.match(newline, /<a title="safe">x<\/a>/)

  const mixedCase = sanitizeHtml('<a href="  JaVaScRiPt:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(mixedCase, /javascript:/i)
  assert.match(mixedCase, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml removes script blocks including their content', () => {
  const clean = sanitizeHtml('<div>keep</div><script>alert("x")</script><style>body{color:red}</style>')
  assert.match(clean, /<div>keep<\/div>/)
  assert.doesNotMatch(clean, /alert/)
  assert.doesNotMatch(clean, /script/i)
  assert.doesNotMatch(clean, /style/i)
})

test('sanitizeHtml removes dangerous and disallowed elements but keeps inner text', () => {
  assert.equal(
    sanitizeHtml('<p>a</p><iframe src="https://evil.test"></iframe><object data="x"></object><embed src="y">'),
    '<p>a</p>',
  )
  assert.equal(sanitizeHtml('<form>keep text</form>'), 'keep text')
})

test('sanitizeHtml keeps inline styles on allowed tags', () => {
  const clean = sanitizeHtml('<td style="border:1px solid #555">x</td>')
  assert.match(clean, /<td style="border:1px solid #555">x<\/td>/)
})

test('sanitizeHtml drops unsafe style values', () => {
  const url = sanitizeHtml('<td style="background:url(evil.png)" colspan="2">x</td>')
  assert.doesNotMatch(url, /url\(/i)
  assert.match(url, /<td colspan="2">x<\/td>/)

  const expression = sanitizeHtml('<td style="width:expression(alert(1))">x</td>')
  assert.doesNotMatch(expression, /expression/i)
  assert.match(expression, /<td>x<\/td>/)

  const scriptUrl = sanitizeHtml('<td style="background:JavaScript:alert(1)">x</td>')
  assert.doesNotMatch(scriptUrl, /javascript:/i)
  assert.match(scriptUrl, /<td>x<\/td>/)
})

test('sanitizeHtml drops class attributes', () => {
  assert.equal(sanitizeHtml('<p class="lead" id="x" data-word="y">t</p>'), '<p>t</p>')
})

test('sanitizeHtml decodes entities before checking the url scheme', () => {
  const decimal = sanitizeHtml('<a href="&#106;avascript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(decimal, /javascript:/i)
  assert.match(decimal, /<a title="safe">x<\/a>/)

  const hex = sanitizeHtml('<a href="jav&#x09;ascript:alert(1)" title="safe">x</a>')
  assert.match(hex, /<a title="safe">x<\/a>/)

  const named = sanitizeHtml('<a href="javascript&colon;alert(1)" title="safe">x</a>')
  assert.match(named, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml still drops data attributes and id', () => {
  const clean = sanitizeHtml('<p data-word="x" id="y" data-testid="z">text</p>')
  assert.equal(clean, '<p>text</p>')
})

test('sanitizeHtml drops style values with css escapes or absolute positioning', () => {
  const escaped = sanitizeHtml('<td style="background:\\75 rl(evil.png)">x</td>')
  assert.doesNotMatch(escaped, /style=/i)
  assert.match(escaped, /<td>x<\/td>/)

  const absolute = sanitizeHtml('<td style="position:absolute">x</td>')
  assert.doesNotMatch(absolute, /style=/i)
  assert.match(absolute, /<td>x<\/td>/)

  const fixed = sanitizeHtml('<td style="position:fixed;top:0">x</td>')
  assert.match(fixed, /<td>x<\/td>/)

  const sticky = sanitizeHtml('<td style="position:sticky">x</td>')
  assert.match(sticky, /<td>x<\/td>/)

  const relative = sanitizeHtml('<td style="position:relative">x</td>')
  assert.match(relative, /<td style="position:relative">x<\/td>/)

  const staticPosition = sanitizeHtml('<td style="position:static">x</td>')
  assert.match(staticPosition, /<td style="position:static">x<\/td>/)
})

test('sanitizeHtml removes html comments including their content', () => {
  assert.equal(sanitizeHtml('<!-- secret --><p>x</p>'), '<p>x</p>')
  const hidden = sanitizeHtml('<p>a</p><!-- <script>alert(1)</script> --><p>b</p>')
  assert.doesNotMatch(hidden, /script/i)
  assert.doesNotMatch(hidden, /secret/i)
  assert.match(hidden, /<p>a<\/p>/)
  assert.match(hidden, /<p>b<\/p>/)
})

test('sanitizeHtml drops numeric character references without a trailing semicolon', () => {
  const clean = sanitizeHtml('<a href="&#106avascript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(clean, /javascript:/i)
  assert.match(clean, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml rejects every obfuscated url scheme', () => {
  const payloads = [
    '&#106avascript:alert(1)',
    '&#106;avascript:alert(1)',
    'jav&#x09;ascript:alert(1)',
    'javascript&colon;alert(1)',
  ]
  for (const payload of payloads) {
    const clean = sanitizeHtml(`<a href="${payload}" title="safe">x</a>`)
    assert.doesNotMatch(clean, /javascript:/i, payload)
    assert.match(clean, /<a title="safe">x<\/a>/, payload)
  }
})

test('sanitizeHtml keeps plain urls untouched', () => {
  assert.equal(
    sanitizeHtml('<a href="https://example.com/x?a=1&b=2">x</a>'),
    '<a href="https://example.com/x?a=1&b=2">x</a>',
  )
  assert.equal(sanitizeHtml('<img src="/img/a.png">'), '<img src="/img/a.png">')
})

test('sanitizeHtml escapes markup it cannot parse', () => {
  const clean = sanitizeHtml('<a href="x onmouseover=alert(1)>')
  assert.doesNotMatch(clean, /<a/)
  assert.match(clean, /&lt;/)
})

test('sanitizeHtml removes an unclosed script block to the end of the content', () => {
  assert.equal(sanitizeHtml('<script>alert(1)'), '')
  assert.equal(sanitizeHtml('<p>a</p><style>body{}'), '<p>a</p>')
})

test('splitHtmlByBlanks finds numbered blanks', () => {
  const segments = splitHtmlByBlanks('<p>cost was <strong>1_______</strong> each</p>')
  assert.equal(segments.length, 3)
  assert.deepEqual(segments[1], { kind: 'blank', sourceNumber: 1 })
  assert.match(segments[0].html, /cost was/)
})

test('module exports exactly the 9 public helpers', () => {
  assert.deepEqual(Object.keys(skillLogic).sort(), [
    'answeredCount',
    'formatClock',
    'normalizeDisplayType',
    'normalizeQuestionType',
    'parseOptions',
    'progressPercent',
    'sanitizeHtml',
    'splitHtmlByBlanks',
    'splitParagraphs',
  ])
})

test('normalizeDisplayType keeps known types and falls back to fill-blank', () => {
  assert.equal(skillLogic.normalizeDisplayType('note-completion'), 'note-completion')
  assert.equal(skillLogic.normalizeDisplayType('NOTE-COMPLETION'), 'note-completion')
  assert.equal(skillLogic.normalizeDisplayType('bogus'), 'fill-blank')
  assert.equal(skillLogic.normalizeDisplayType(null), 'fill-blank')
})

test('parseOptions handles empty, invalid and unusual input', () => {
  assert.deepEqual(parseOptions([]), [])
  assert.deepEqual(parseOptions('A. x'), [])
  assert.deepEqual(parseOptions(null), [])
  assert.deepEqual(parseOptions(['.']), [{ key: 'A', text: '.' }])
  assert.deepEqual(parseOptions(['3.5 million']), [{ key: 'A', text: '3.5 million' }])
  assert.deepEqual(parseOptions([{ key: 'X' }]), [{ key: 'X', text: '' }])
  assert.deepEqual(parseOptions(['A', 'B', 'C']), [
    { key: 'A', text: 'A' },
    { key: 'B', text: 'B' },
    { key: 'C', text: 'C' },
  ])
})

test('progressPercent never exceeds 100', () => {
  assert.equal(progressPercent(5, 4), 100)
})

test('formatClock falls back to zero for invalid input', () => {
  assert.equal(formatClock(NaN), '0:00')
})

test('splitHtmlByBlanks returns plain html when there is no blank', () => {
  const segments = splitHtmlByBlanks('<p>no blanks here</p>')
  assert.equal(segments.length, 1)
  assert.equal(segments[0].kind, 'html')
})

test('splitHtmlByBlanks matches the documented placeholder examples', () => {
  const examples = [['<p>a 2____ b</p>', 2], ['<p>a 3…….. b</p>', 3]] as const
  for (const [html, number] of examples) {
    const segments = splitHtmlByBlanks(html)
    assert.equal(segments.length, 3)
    assert.deepEqual(segments[1], { kind: 'blank', sourceNumber: number })
  }
})

test('splitHtmlByBlanks finds a placeholder next to letters and to another placeholder', () => {
  const leading = splitHtmlByBlanks('1____abc')
  assert.equal(leading.length, 2)
  assert.deepEqual(leading[0], { kind: 'blank', sourceNumber: 1 })
  assert.deepEqual(leading[1], { kind: 'html', html: 'abc' })

  const trailing = splitHtmlByBlanks('abc 1____')
  assert.equal(trailing.length, 2)
  assert.deepEqual(trailing[0], { kind: 'html', html: 'abc ' })
  assert.deepEqual(trailing[1], { kind: 'blank', sourceNumber: 1 })

  const adjacent = splitHtmlByBlanks('1____2____')
  assert.equal(adjacent.length, 2)
  assert.deepEqual(adjacent[0], { kind: 'blank', sourceNumber: 1 })
  assert.deepEqual(adjacent[1], { kind: 'blank', sourceNumber: 2 })

  const spaced = splitHtmlByBlanks('1____ 2____')
  assert.equal(spaced.length, 3)
  assert.deepEqual(spaced[0], { kind: 'blank', sourceNumber: 1 })
  assert.deepEqual(spaced[1], { kind: 'html', html: ' ' })
  assert.deepEqual(spaced[2], { kind: 'blank', sourceNumber: 2 })

  const afterLetters = splitHtmlByBlanks('the answer is1____')
  assert.equal(afterLetters.length, 2)
  assert.deepEqual(afterLetters[0], { kind: 'html', html: 'the answer is' })
  assert.deepEqual(afterLetters[1], { kind: 'blank', sourceNumber: 1 })

  const longNumber = splitHtmlByBlanks('12345____')
  assert.equal(longNumber.length, 1)
  assert.equal(longNumber[0].kind, 'html')
})
