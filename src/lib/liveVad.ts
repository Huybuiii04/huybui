/**
 * Máy trạng thái VAD (voice activity detection) cho chế độ luyện nói trực tiếp.
 *
 * File thuần — không I/O — để test được bằng `node --test`.
 *
 * Nguyên tắc:
 *  - Giai đoạn hiệu chỉnh (mặc định 700ms đầu tiên) chỉ đo nền tiếng ồn, dùng
 *    GIÁ TRỊ NHỎ NHẤT của các mẫu — nhờ vậy tiếng nói xen kẽ không làm nền bị đẩy lên.
 *  - Sau hiệu chỉnh, nền chỉ có thể đi xuống (phòng yên hơn), không đi lên — tránh việc
 *    giám khảo nói to làm VAD "mù".
 *  - Phải nói liên tục ≥ minSpeechMs mới coi là bắt đầu lượt nói (tránh giật nhẹ).
 *  - Im lặng liên tục ≥ silenceMs mới kết thúc lượt nói. Vì vậy người học ngập
 *    ngừng giữa câu vẫn không bị cắt.
 *  - Sau khi kết thúc lượt nói có một khoảng nghỉ (cooldown) để tránh bật/tắt liên hồi.
 */

export type VadEvent = 'none' | 'speech-start' | 'speech-end'

export type VadOptions = {
  /** Ngưỡng tuyệt đối (RMS 0..1). Dưới mức này luôn là im lặng. */
  minThreshold?: number
  /** Hệ số so với nền tiếng ồn đo được. */
  noiseFactor?: number
  /** Im lặng liên tục bao lâu thì kết thúc lượt nói (ms). */
  silenceMs?: number
  /** Phải nói liên tục bao lâu thì mới tính là bắt đầu lượt nói (ms). */
  minSpeechMs?: number
  /** Nghỉ sau khi kết thúc lượt nói (ms). */
  cooldownMs?: number
  /** Thời gian hiệu chỉnh nền tiếng ồn khi bắt đầu (ms). */
  calibrationMs?: number
}

export type VadUpdate = {
  event: VadEvent
  speaking: boolean
  /** Ngưỡng đang dùng — hữu ích để hiển thị/chẩn đoán. */
  threshold: number
  /** Nền tiếng ồn hiện tại. */
  noiseFloor: number
  /** true khi đang trong giai đoạn hiệu chỉnh. */
  calibrating: boolean
}

const DEFAULTS: Required<VadOptions> = {
  minThreshold: 0.012,
  noiseFactor: 2,
  silenceMs: 900,
  minSpeechMs: 250,
  cooldownMs: 400,
  calibrationMs: 700,
}

export type Vad = {
  /** Cập nhật mức âm lượng (RMS) tại thời điểm `nowMs`. */
  update: (nowMs: number, rms: number) => VadUpdate
  /** Đặt lại trạng thái lượt nói (khi sang câu hỏi mới); giữ nguyên nền đã đo. */
  reset: () => void
  readonly speaking: boolean
}

export function createVad(options: VadOptions = {}): Vad {
  const config = { ...DEFAULTS, ...options }
  let noiseFloor = config.minThreshold
  let speaking = false
  let speechStartedAt: number | null = null
  let lastVoiceAt = 0
  let cooldownUntil = 0
  let startedAt: number | null = null
  let calibrationSamples: number[] = []
  let calibrated = config.calibrationMs <= 0

  const threshold = () => Math.max(config.minThreshold, noiseFloor * config.noiseFactor)

  return {
    get speaking() {
      return speaking
    },
    reset() {
      speaking = false
      speechStartedAt = null
      lastVoiceAt = 0
      cooldownUntil = 0
    },
    update(nowMs: number, rms: number): VadUpdate {
      const level = Number.isFinite(rms) ? Math.max(0, rms) : 0
      if (startedAt === null) startedAt = nowMs

      // Giai đoạn hiệu chỉnh: lấy giá trị nhỏ nhất, không sinh sự kiện.
      if (!calibrated) {
        calibrationSamples.push(level)
        if (calibrationSamples.length > 200) calibrationSamples.shift()
        noiseFloor = Math.max(config.minThreshold, Math.min(...calibrationSamples))
        if (nowMs - startedAt >= config.calibrationMs) calibrated = true
        return {
          event: 'none',
          speaking: false,
          threshold: threshold(),
          noiseFloor,
          calibrating: !calibrated,
        }
      }

      let current = threshold()
      // Nền chỉ đi xuống khi phòng yên hơn.
      if (!speaking && level < current) {
        noiseFloor = Math.max(config.minThreshold, noiseFloor * 0.98 + level * 0.02)
        current = threshold()
      }

      if (!speaking) {
        if (level > current) {
          if (speechStartedAt === null) speechStartedAt = nowMs
          if (nowMs - speechStartedAt >= config.minSpeechMs && nowMs >= cooldownUntil) {
            speaking = true
            lastVoiceAt = nowMs
            speechStartedAt = null
            return { event: 'speech-start', speaking, threshold: current, noiseFloor, calibrating: false }
          }
        } else {
          speechStartedAt = null
        }
        return { event: 'none', speaking, threshold: current, noiseFloor, calibrating: false }
      }

      if (level > current) {
        lastVoiceAt = nowMs
      } else if (nowMs - lastVoiceAt >= config.silenceMs) {
        speaking = false
        cooldownUntil = nowMs + config.cooldownMs
        speechStartedAt = null
        return { event: 'speech-end', speaking, threshold: current, noiseFloor, calibrating: false }
      }
      return { event: 'none', speaking, threshold: current, noiseFloor, calibrating: false }
    },
  }
}

/** Tính RMS từ mảng mẫu âm thanh (time-domain). */
export function rms(samples: Float32Array): number {
  if (!samples.length) return 0
  let sum = 0
  for (let index = 0; index < samples.length; index += 1) sum += samples[index] * samples[index]
  return Math.sqrt(sum / samples.length)
}
