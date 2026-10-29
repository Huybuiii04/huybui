/**
 * Lớp audio cho chế độ luyện nói trực tiếp: thu âm, đo VAD, ghi âm, phát giọng
 * giám khảo và chép lời nói (Web Speech) khi trình duyệt hỗ trợ.
 */

import { rms } from './liveVad.ts'

export type LiveVoiceAccent = 'en-GB' | 'en-US'

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
] as const

/**
 * Chọn mime cho MediaRecorder.
 *
 * Không dùng biến thể `;codecs=opus`: bucket `speaking-audio` chỉ cho phép đúng
 * các mime dạng `audio/webm`, `audio/mp4`, `audio/ogg`... — có tham số codec thì
 * Storage từ chối upload.
 */
export function pickRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg']
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? ''
}

/** Bỏ tham số codec để mime khớp với danh sách Storage cho phép. */
export function normalizeAudioMimeType(mimeType: string): string {
  return (mimeType || 'audio/webm').split(';')[0].trim() || 'audio/webm'
}

/** Bộ ghi âm liên tục cho cả một phần thi. */
export type LiveRecorder = {
  start: () => void
  stop: () => Promise<{ blob: Blob; mimeType: string; durationMs: number }>
  readonly startedAt: number
}

export type LiveMic = {
  recorder: LiveRecorder
  /** Mức âm lượng hiện tại (RMS 0..1). */
  level: () => number
  /** Đóng mic và giải phóng tài nguyên. */
  close: () => void
}

/**
 * Mở mic. `onLevel` được gọi mỗi khung hình (khoảng 20 lần/giây) với RMS.
 */
export async function openLiveMic(onLevel: (level: number) => void): Promise<LiveMic> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('This browser cannot access the microphone.')
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  })

  const context = new AudioContext()
  const source = context.createMediaStreamSource(stream)
  const analyser = context.createAnalyser()
  analyser.fftSize = 1024
  source.connect(analyser)

  const buffer = new Float32Array(analyser.fftSize)
  let currentLevel = 0
  let running = true

  const tick = () => {
    if (!running) return
    analyser.getFloatTimeDomainData(buffer)
    currentLevel = rms(buffer)
    onLevel(currentLevel)
    window.setTimeout(tick, 50)
  }
  tick()

  let recorder: MediaRecorder | null = null
  let chunks: BlobPart[] = []
  let startedAt = 0

  const liveRecorder: LiveRecorder = {
    get startedAt() {
      return startedAt
    },
    start() {
      if (recorder) return
      const mimeType = pickRecorderMimeType()
      chunks = []
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data)
      }
      recorder.start()
      startedAt = Date.now()
    },
    stop() {
      return new Promise((resolve) => {
        const current = recorder
        if (!current) {
          resolve({ blob: new Blob([], { type: 'audio/webm' }), mimeType: 'audio/webm', durationMs: 0 })
          return
        }
        const durationMs = Date.now() - startedAt
        const type = normalizeAudioMimeType(current.mimeType || 'audio/webm')
        current.onstop = () => {
          recorder = null
          resolve({ blob: new Blob(chunks, { type }), mimeType: type, durationMs })
        }
        current.stop()
      })
    },
  }

  return {
    recorder: liveRecorder,
    level: () => currentLevel,
    close() {
      running = false
      stream.getTracks().forEach((track) => track.stop())
      void context.close().catch(() => undefined)
    },
  }
}

/** Phát một blob audio và chờ tới khi phát xong. */
export function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not play the audio.'))
    }
    void audio.play().catch((error) => {
      URL.revokeObjectURL(url)
      reject(error instanceof Error ? error : new Error('Could not play the audio.'))
    })
  })
}

// ------------------------------------------------------------------ Web Speech

type SpeechAlternativeLike = { transcript: string; confidence: number }
type SpeechResultLike = { isFinal: boolean; length: number; [index: number]: SpeechAlternativeLike }
type SpeechEventLike = {
  resultIndex: number
  results: { length: number; [index: number]: SpeechResultLike }
}
type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((event: SpeechEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const scope = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}

export type LiveTranscriber = {
  supported: boolean
  /** Bắt đầu nghe; `onFinal` nhận đoạn vừa nói xong. */
  start: () => void
  /** Dừng nghe. */
  stop: () => void
  /** Lấy toàn bộ lời đã nghe được kể từ lần start gần nhất. */
  text: () => string
  /** Xoá lời đã nghe (dùng khi sang câu hỏi mới). */
  clear: () => void
}

/**
 * Chép lời nói bằng Web Speech API (Chrome/Edge).
 * Chỉ là đường tắt cho bộ não của giám khảo; transcript chính thức vẫn do
 * Gemini đọc từ audio ghi âm.
 */
export function createLiveTranscriber(onFinal: (text: string) => void): LiveTranscriber {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) {
    return {
      supported: false,
      start: () => undefined,
      stop: () => undefined,
      text: () => '',
      clear: () => undefined,
    }
  }

  let recognition: SpeechRecognitionLike | null = null
  let chunks: string[] = []

  const ensure = () => {
    if (recognition) return recognition
    const instance = new Ctor()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = 'en-US'
    instance.maxAlternatives = 1
    instance.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (!result?.isFinal) continue
        const text = result[0]?.transcript?.trim()
        if (!text) continue
        chunks.push(text)
        onFinal(text)
      }
    }
    instance.onerror = () => undefined
    instance.onend = () => undefined
    recognition = instance
    return instance
  }

  return {
    supported: true,
    start() {
      const instance = ensure()
      try {
        instance.start()
      } catch {
        // Chrome báo lỗi nếu start() được gọi liên tiếp — bỏ qua.
      }
    },
    stop() {
      try {
        recognition?.stop()
      } catch {
        // Bỏ qua.
      }
    },
    text() {
      return chunks.join(' ').trim()
    },
    clear() {
      chunks = []
    },
  }
}
