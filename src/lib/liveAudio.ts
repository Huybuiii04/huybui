/**
 * Lớp audio cho chế độ luyện nói trực tiếp: thu âm, đo VAD, ghi âm, phát giọng
 * giám khảo và chép lời nói (Web Speech) khi trình duyệt hỗ trợ.
 */

import { rms } from './liveVad.ts'

export type LiveVoiceAccent = 'en-GB' | 'en-US'

/** Tải trước và phát cùng dùng một request; lỗi phải cho phép thử lại. */
export function cachedVoice(cache: Map<string, Promise<Blob>>, key: string, load: () => Promise<Blob>): Promise<Blob> {
  const cached = cache.get(key)
  if (cached) return cached
  const pending = load().catch(error => {
    if (cache.get(key) === pending) cache.delete(key)
    throw error
  })
  cache.set(key, pending)
  return pending
}

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

/** Một bản ghi mỗi phần; pause/resume giữ nguyên các câu trả lời đã thu. */
export type LiveRecorder = {
  start: () => void
  pause: () => void
  stop: () => Promise<{ blob: Blob; mimeType: string; durationMs: number }>
  readonly startedAt: number
}

export type LiveMic = {
  recorder: LiveRecorder
  startAnswerRecording: () => void
  stopAnswerRecording: () => Promise<Blob | null>
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
  const setEnabled = (enabled: boolean) => stream.getAudioTracks().forEach(track => { track.enabled = enabled })
  setEnabled(false)

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
  let resumedAt = 0
  let recordedMs = 0
  let answerRecorder: MediaRecorder | null = null
  let answerAudio: Promise<Blob | null> = Promise.resolve(null)

  const stopAnswerRecording = () => {
    const current = answerRecorder
    answerRecorder = null
    if (!current) return Promise.resolve(null)
    if (current.state !== 'inactive') current.stop()
    return answerAudio
  }

  const liveRecorder: LiveRecorder = {
    get startedAt() {
      return startedAt
    },
    start() {
      if (recorder?.state === 'recording') return
      if (recorder) {
        recorder.resume()
      } else {
        const mimeType = pickRecorderMimeType()
        chunks = []
        recordedMs = 0
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data)
        }
        recorder.start()
        startedAt = Date.now()
      }
      resumedAt = Date.now()
      setEnabled(true)
    },
    pause() {
      setEnabled(false)
      if (recorder?.state !== 'recording') return
      recordedMs += Date.now() - resumedAt
      recorder.pause()
    },
    stop() {
      liveRecorder.pause()
      return new Promise((resolve) => {
        const current = recorder
        if (!current) {
          resolve({ blob: new Blob([], { type: 'audio/webm' }), mimeType: 'audio/webm', durationMs: 0 })
          return
        }
        const durationMs = recordedMs
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
    startAnswerRecording() {
      const mimeType = pickRecorderMimeType()
      const current = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const parts: BlobPart[] = []
      answerAudio = new Promise(resolve => {
        current.ondataavailable = event => { if (event.data.size) parts.push(event.data) }
        current.onstop = () => resolve(new Blob(parts, { type: normalizeAudioMimeType(current.mimeType) }))
        current.onerror = () => resolve(null)
      })
      answerRecorder = current
      current.start()
    },
    stopAnswerRecording,
    level: () => currentLevel,
    close() {
      running = false
      liveRecorder.pause()
      void stopAnswerRecording()
      if (recorder && recorder.state !== 'inactive') recorder.stop()
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
  /** Dừng nghe, chờ kết quả cuối tối đa 300 ms. */
  stop: () => Promise<void>
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

/**
 * Đọc bằng giọng của trình duyệt (`SpeechSynthesis`).
 *
 * Dùng khi server không tổng hợp được audio (ví dụ hết số dư nhà cung cấp):
 * không mất tiền, không cần CPU mạnh và bắt đầu phát gần như tức thì nên hợp
 * với câu follow-up sinh động.
 */
export function browserVoiceAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

/** Danh sách giọng (nạp bất đồng bộ ở một số trình duyệt). */
export function browserVoices(): SpeechSynthesisVoice[] {
  if (!browserVoiceAvailable()) return []
  return window.speechSynthesis.getVoices()
}

/** Chờ danh sách giọng sẵn sàng (Chrome nạp bất đồng bộ). */
export function waitForBrowserVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (!browserVoiceAvailable()) return Promise.resolve([])
  const existing = browserVoices()
  if (existing.length) return Promise.resolve(existing)
  return new Promise((resolve) => {
    const done = (voices: SpeechSynthesisVoice[]) => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', onChange)
      resolve(voices)
    }
    const onChange = () => done(browserVoices())
    window.speechSynthesis.addEventListener?.('voiceschanged', onChange)
    setTimeout(() => done(browserVoices()), timeoutMs)
  })
}

/** Chọn giọng theo accent; ưu tiên các giọng quen thuộc trên Windows/Chrome. */
export function pickBrowserVoice(accent: LiveVoiceAccent): SpeechSynthesisVoice | null {
  const voices = browserVoices()
  if (!voices.length) return null
  const wanted = accent === 'en-GB' ? 'en-GB' : 'en-US'
  const preferred = accent === 'en-GB'
    ? ['Microsoft Ryan', 'Microsoft Libby', 'Microsoft Thomas', 'Google UK English Female', 'Daniel']
    : ['Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Google US English', 'Samantha']
  for (const name of preferred) {
    const found = voices.find((voice) => voice.name === name && voice.lang.replace('_', '-').startsWith(wanted))
    if (found) return found
  }
  return (
    voices.find((voice) => voice.lang.replace('_', '-') === wanted) ??
    voices.find((voice) => voice.lang.replace('_', '-').startsWith(wanted)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ??
    null
  )
}

/**
 * Đọc một câu bằng giọng trình duyệt. Trả false nếu trình duyệt không có giọng
 * tiếng Anh (ví dụ môi trường headless).
 */
export async function speakWithBrowser(text: string, accent: LiveVoiceAccent): Promise<boolean> {
  if (!browserVoiceAvailable() || !text.trim()) return false
  if (!browserVoices().length) await waitForBrowserVoices()
  const voice = pickBrowserVoice(accent)
  if (!voice) return false
  return new Promise((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = voice.lang
      utterance.voice = voice
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onend = () => resolve(true)
      utterance.onerror = () => resolve(false)
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    } catch {
      resolve(false)
    }
  })
}

export function createLiveTranscriber(onFinal: (text: string) => void): LiveTranscriber {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) {
    return {
      supported: false,
      start: () => undefined,
      stop: async () => undefined,
      text: () => '',
      clear: () => undefined,
    }
  }

  let recognition: SpeechRecognitionLike | null = null
  let chunks: string[] = []
  let interim = ''

  const ensure = () => {
    if (recognition) return recognition
    const instance = new Ctor()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = 'en-US'
    instance.maxAlternatives = 1
    instance.onresult = (event) => {
      interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (!result) continue
        const text = result[0]?.transcript?.trim()
        if (!text) continue
        if (!result.isFinal) { interim += `${text} `; continue }
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
      const current = recognition
      if (!current) return Promise.resolve()
      return new Promise<void>(resolve => {
        // ponytail: tối đa 300 ms chờ lời cuối; audio vẫn là nguồn chấm điểm chính.
        const done = () => {
          clearTimeout(timer)
          current.onresult = null
          current.onend = null
          try { current.abort() } catch { /* Đã dừng hoặc trình duyệt đã đóng mic. */ }
          if (recognition === current) recognition = null
          resolve()
        }
        const timer = setTimeout(done, 300)
        current.onend = done
        try { current.stop() } catch { done() }
      })
    },
    text() {
      return [...chunks, interim].join(' ').trim()
    },
    clear() {
      chunks = []
      interim = ''
    },
  }
}
