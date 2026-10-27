import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bandFromRaw, matchesAnswerKey } from '../skillGrading.ts'

test('bandFromRaw follows the Cambridge academic table', () => {
  assert.equal(bandFromRaw(40, 40), 9)
  assert.equal(bandFromRaw(37, 40), 8.5)
  assert.equal(bandFromRaw(35, 40), 8)
  assert.equal(bandFromRaw(30, 40), 7)
  assert.equal(bandFromRaw(23, 40), 6)
  assert.equal(bandFromRaw(0, 40), 2)
})

test('bandFromRaw uses the general table for general tests', () => {
  assert.equal(bandFromRaw(40, 40, 'general'), 9)
  assert.equal(bandFromRaw(39, 40, 'general'), 8.5)
  assert.equal(bandFromRaw(37, 40, 'general'), 8)
  assert.equal(bandFromRaw(30, 40, 'general'), 6)
})

test('bandFromRaw scales partial tests to 40 questions', () => {
  // 10/20 = 50% -> 20/40 -> band 5.5 theo bảng Cambridge
  assert.equal(bandFromRaw(10, 20), 5.5)
  assert.equal(bandFromRaw(0, 0), 0)
})

test('matchesAnswerKey accepts the tfng synonyms', () => {
  assert.equal(matchesAnswerKey('TRUE', 'TRUE'), true)
  assert.equal(matchesAnswerKey('true', 'TRUE'), true)
  assert.equal(matchesAnswerKey('YES', 'TRUE'), true)
  assert.equal(matchesAnswerKey('NO', 'FALSE'), true)
  assert.equal(matchesAnswerKey('NOT GIVEN', 'NOT GIVEN'), true)
  assert.equal(matchesAnswerKey('not given', 'NOT GIVEN'), true)
  assert.equal(matchesAnswerKey('TRUE', 'FALSE'), false)
  assert.equal(matchesAnswerKey('', 'TRUE'), false)
})

test('matchesAnswerKey accepts a single letter with or without a dot', () => {
  assert.equal(matchesAnswerKey('C', 'C'), true)
  assert.equal(matchesAnswerKey('c', 'C'), true)
  assert.equal(matchesAnswerKey('C.', 'C'), true)
  assert.equal(matchesAnswerKey('D', 'C'), false)
})

test('matchesAnswerKey expands the Cambridge optional-part notation', () => {
  assert.equal(matchesAnswerKey('answering the phone', 'answer(ing) (the) phone'), true)
  assert.equal(matchesAnswerKey('answer phone', 'answer(ing) (the) phone'), true)
  assert.equal(matchesAnswerKey('national holiday', 'national holidays'), false)
})

test('matchesAnswerKey accepts alternatives separated by a slash', () => {
  assert.equal(matchesAnswerKey('after eleven', "after 11(:00)/eleven (o'clock)"), true)
  assert.equal(matchesAnswerKey('after 11:00', "after 11(:00)/eleven (o'clock)"), true)
})

test('matchesAnswerKey accepts the [or] notation', () => {
  assert.equal(matchesAnswerKey('October 22', '22(nd) October [or] October 22(nd)'), true)
})

test('matchesAnswerKey requires every part of a multi-blank key', () => {
  assert.equal(matchesAnswerKey('Friday and Sunday', 'Friday + Sunday'), true)
  assert.equal(matchesAnswerKey('Sunday, Friday', 'Friday + Sunday'), true)
  assert.equal(matchesAnswerKey('Friday', 'Friday + Sunday'), false)
})

test('matchesAnswerKey ignores surrounding whitespace and letter case', () => {
  assert.equal(matchesAnswerKey('  pebble ', 'Pebble'), true)
  assert.equal(matchesAnswerKey('Pebbles', 'pebble'), false)
})
