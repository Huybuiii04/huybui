import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createVad, rms } from '../src/lib/liveVad.ts'

const QUIET = { calibrationMs: 0, minThreshold: 0.01, noiseFactor: 2 }

test('VAD bắt đầu lượt nói sau khi nói đủ lâu', () => {
  const vad = createVad({ ...QUIET, minSpeechMs: 200, silenceMs: 800 })
  assert.equal(vad.update(0, 0.001).event, 'none')
  // Vượt ngưỡng nhưng chưa đủ thời gian nói liên tục.
  assert.equal(vad.update(100, 0.08).event, 'none')
  assert.equal(vad.update(350, 0.08).event, 'speech-start')
  assert.equal(vad.speaking, true)
})

test('VAD kết thúc lượt nói sau khi im lặng đủ lâu', () => {
  const vad = createVad({ ...QUIET, minSpeechMs: 100, silenceMs: 500 })
  vad.update(0, 0.08)
  assert.equal(vad.update(150, 0.08).event, 'speech-start')
  // Ngập ngừng 300ms chưa kết thúc.
  assert.equal(vad.update(300, 0.001).event, 'none')
  assert.equal(vad.update(700, 0.001).event, 'speech-end')
  assert.equal(vad.speaking, false)
})

test('VAD không bật lại ngay sau khi kết thúc lượt nói', () => {
  const vad = createVad({ ...QUIET, minSpeechMs: 100, silenceMs: 300, cooldownMs: 500 })
  vad.update(0, 0.08)
  vad.update(150, 0.08)
  assert.equal(vad.update(500, 0.001).event, 'speech-end')
  // Vẫn trong thời gian nghỉ: giọng nói không được tính là lượt mới.
  assert.equal(vad.update(600, 0.08).event, 'none')
  assert.equal(vad.update(1100, 0.08).event, 'speech-start')
})

test('VAD hiệu chỉnh nền tiếng ồn bằng giá trị nhỏ nhất', () => {
  const vad = createVad({ calibrationMs: 700, minThreshold: 0.01, noiseFactor: 2 })
  // Phòng ồn nền RMS ~0.05, xen kẽ một tiếng nói to.
  for (let time = 0; time < 800; time += 50) {
    vad.update(time, time % 200 === 0 ? 0.2 : 0.05)
  }
  const sample = vad.update(850, 0.05)
  assert.equal(sample.calibrating, false)
  assert.ok(sample.noiseFloor <= 0.05, `nền phải bám giá trị nhỏ nhất, thực tế ${sample.noiseFloor}`)
  assert.ok(sample.threshold > 0.05, `ngưỡng phải cao hơn nền, thực tế ${sample.threshold}`)
  // Giọng nói to vẫn vượt ngưỡng (cần đủ thời gian nói liên tục).
  assert.equal(vad.update(900, 0.2).event, 'none')
  assert.equal(vad.update(1200, 0.2).event, 'speech-start')
})

test('VAD giữ nền đã đo khi reset sang câu hỏi mới', () => {
  const vad = createVad({ ...QUIET, minSpeechMs: 100, silenceMs: 500 })
  vad.update(0, 0.08)
  assert.equal(vad.update(150, 0.08).event, 'speech-start')
  assert.equal(vad.speaking, true)
  const before = vad.update(300, 0.001).noiseFloor
  vad.reset()
  assert.equal(vad.speaking, false)
  const after = vad.update(400, 0.001).noiseFloor
  // Nền không bị "reset" về mặc định và không tăng vọt.
  assert.ok(after <= before + 1e-9, `nền không được tăng lên: ${before} -> ${after}`)
  assert.ok(after >= 0.01)
})

test('rms tính đúng trên mẫu âm thanh', () => {
  assert.equal(rms(new Float32Array(0)), 0)
  assert.equal(rms(new Float32Array([1, 1, 1, 1])), 1)
  assert.ok(Math.abs(rms(new Float32Array([0.5, -0.5])) - 0.5) < 1e-6)
})
