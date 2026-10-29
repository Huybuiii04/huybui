import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  aggregateTurnScores,
  audioMimeForFile,
  buildSessionPlan,
  computeOverallBand,
  formatBand,
  groupSpeakingTests,
  maxDurationMs,
  speakingTestLabel,
  validateAudio,
} from '../src/lib/speakingLogic.ts'

test('giới hạn thời lượng theo part', () => {
  assert.equal(maxDurationMs('part-1'), 60_000)
  assert.equal(maxDurationMs('part-2'), 120_000)
  assert.equal(maxDurationMs('part-3'), 90_000)
})

test('validateAudio chặn file quá dài và quá nặng', () => {
  // 61s vẫn được chấp nhận vì có 2s dung sai cho bộ ghi âm.
  assert.equal(validateAudio({ part: 'part-1', byteSize: 1000, durationMs: 61_000 }).ok, true)
  assert.equal(validateAudio({ part: 'part-1', byteSize: 1000, durationMs: 63_000 }).ok, false)
  assert.equal(validateAudio({ part: 'part-3', byteSize: 1000, durationMs: 93_000 }).ok, false)
  assert.equal(validateAudio({ part: 'part-2', byteSize: 5 * 1024 * 1024, durationMs: 10_000 }).ok, false)
  assert.equal(validateAudio({ part: 'part-1', byteSize: 0, durationMs: 0 }).ok, false)
  assert.equal(validateAudio({ part: 'part-2', byteSize: 1000, durationMs: 30_000 }).ok, true)
})

test('computeOverallBand làm tròn nửa band', () => {
  assert.deepEqual(computeOverallBand([6.5, 6, 7, 6.5]), { raw: 6.5, display: 6.5 })
  assert.deepEqual(computeOverallBand([7, 7, 6, 6]), { raw: 6.5, display: 6.5 })
  assert.deepEqual(computeOverallBand([8, 8, 8, 8]), { raw: 8, display: 8 })
})

test('aggregateTurnScores trung bình từng tiêu chí rồi tính overall', () => {
  const result = aggregateTurnScores([
    [
      { criterion: 'fluency', score: 8 },
      { criterion: 'lexical_resource', score: 6 },
      { criterion: 'grammatical_range', score: 6 },
      { criterion: 'pronunciation', score: 6 },
    ],
    [
      { criterion: 'fluency', score: 6 },
      { criterion: 'lexical_resource', score: 6 },
      { criterion: 'grammatical_range', score: 6 },
      { criterion: 'pronunciation', score: 8 },
    ],
  ])
  assert.equal(result.scores.fluency, 7)
  assert.equal(result.scores.pronunciation, 7)
  assert.equal(result.overallDisplay, 6.5)
})

test('buildSessionPlan sinh 4 turn cho mode full 3 phần', () => {
  const plan = buildSessionPlan('mock')
  assert.equal(plan.length, 4)
  assert.deepEqual(plan.map((turn) => turn.part), ['part-1', 'part-2', 'part-3', 'part-3'])
})

test('buildSessionPlan sinh 1 turn cho mode 1 phần', () => {
  const plan = buildSessionPlan('part-2')
  assert.equal(plan.length, 1)
  assert.equal(plan[0].part, 'part-2')
})

test('groupSpeakingTests gom dòng theo cuốn và test', () => {
  const rows = [
    { id: '1', part: 'part-1', book_number: 12, test_number: 5, sub_index: 0, topic: 'Health' },
    { id: '2', part: 'part-2', book_number: 12, test_number: 5, sub_index: 0, topic: 'Waiting' },
    { id: '3', part: 'part-3', book_number: 12, test_number: 5, sub_index: 0, topic: 'Arriving early' },
    { id: '4', part: 'part-3', book_number: 12, test_number: 5, sub_index: 1, topic: 'Being patient' },
    { id: '5', part: 'part-1', book_number: 13, test_number: 1, sub_index: 0, topic: 'Television' },
  ] as never
  const groups = groupSpeakingTests(rows)
  assert.equal(groups.length, 2)
  assert.equal(groups[0].bookNumber, 12)
  assert.equal(groups[0].testNumber, 5)
  assert.equal(groups[0].label, 'Cambridge 12 · Test 1')
  assert.equal(groups[0].part1?.topic, 'Health')
  assert.equal(groups[0].part2?.topic, 'Waiting')
  assert.deepEqual(groups[0].part3.map((row) => row.topic), ['Arriving early', 'Being patient'])
  assert.equal(groups[1].bookNumber, 13)
  assert.equal(groups[1].part3.length, 0)
})

test('speakingTestLabel đặt nhãn cuốn và test', () => {
  for (const [source, display] of [[5, 1], [6, 2], [7, 3], [8, 4]]) {
    assert.equal(speakingTestLabel(12, source), `Cambridge 12 · Test ${display}`)
  }
  for (const number of [1, 4, 9]) assert.equal(speakingTestLabel(12, number), `Cambridge 12 · Test ${number}`)
  assert.equal(speakingTestLabel(13, 5), 'Cambridge 13 · Test 5')
})

test('formatBand hiển thị 1 chữ số', () => {
  assert.equal(formatBand(6.5), '6.5')
  assert.equal(formatBand(7), '7.0')
})

test('audioMimeForFile đổi đuôi file thành mime được phép', () => {
  assert.equal(audioMimeForFile('recording.webm'), 'audio/webm')
  assert.equal(audioMimeForFile('voice.mp4'), 'audio/mp4')
  assert.equal(audioMimeForFile('sound.ogg'), 'audio/ogg')
  assert.equal(audioMimeForFile('clip.txt'), null)
})
