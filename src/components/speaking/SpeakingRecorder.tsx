import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Upload } from 'lucide-react'

import { useCopy } from '../../i18n'
import {
  ALLOWED_AUDIO_MIME_TYPES,
  audioMimeForFile,
  maxDurationMs,
  validateAudio,
  type SpeakingPart,
} from '../../lib/speakingLogic.ts'

type RecordedAudio = { blob: Blob; mimeType: string; durationMs: number }

type Props = {
  part: SpeakingPart
  disabled?: boolean
  onRecorded: (audio: RecordedAudio) => void
  onError: (message: string) => void
}

export function SpeakingRecorder({ part, disabled, onRecorded, onError }: Props) {
  const { c } = useCopy()
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const startedAtRef = useRef(0)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const limit = maxDurationMs(part)

  useEffect(() => {
    if (!recording) return
    const timer = setInterval(() => {
      const next = Date.now() - startedAtRef.current
      setElapsed(next)
      if (next >= limit) stop()
    }, 200)
    return () => clearInterval(timer)
  }, [recording, limit])

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      onError(c('Trình duyệt này không hỗ trợ ghi âm.', 'This browser cannot record audio.'))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType =
        ALLOWED_AUDIO_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const durationMs = Date.now() - startedAtRef.current
        const type = recorder.mimeType || mimeType || 'audio/webm'
        onRecorded({ blob: new Blob(chunksRef.current, { type }), mimeType: type, durationMs })
      }
      recorderRef.current = recorder
      startedAtRef.current = Date.now()
      recorder.start()
      setElapsed(0)
      setRecording(true)
    } catch {
      onError(
        c(
          'Không mở được mic. Kiểm tra quyền truy cập của trình duyệt.',
          'Could not open the microphone. Check the browser permission.',
        ),
      )
    }
  }

  function stop() {
    recorderRef.current?.stop()
    recorderRef.current = null
    setRecording(false)
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const mimeType = audioMimeForFile(file.name) ?? file.type
    if (!ALLOWED_AUDIO_MIME_TYPES.includes(mimeType as (typeof ALLOWED_AUDIO_MIME_TYPES)[number])) {
      onError(c('Định dạng file này không được hỗ trợ.', 'That file format is not supported.'))
      return
    }
    const durationMs = await readDuration(file)
    const check = validateAudio({ part, byteSize: file.size, durationMs })
    if (!check.ok) {
      onError(
        check.reason === 'too_large'
          ? c('File quá lớn — tối đa 4 MB.', 'The file is too large — 4 MB max.')
          : c(
              'Bản ghi âm dài hơn giới hạn của phần này.',
              'The recording is longer than this part allows.',
            ),
      )
      return
    }
    onRecorded({ blob: file, mimeType, durationMs })
  }

  return (
    <div className="button-row">
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(event) => void onFileChange(event)}
      />
      {recording ? (
        <button type="button" className="button primary" onClick={stop}>
          <Square size={16} aria-hidden /> {c('Dừng', 'Stop')} · {Math.floor(elapsed / 1000)}s
        </button>
      ) : (
        <button
          type="button"
          className="button primary"
          disabled={disabled}
          onClick={() => void start()}
        >
          <Mic size={16} aria-hidden /> {c('Ghi âm', 'Record')}
        </button>
      )}
      <button
        type="button"
        className="button outline"
        disabled={disabled || recording}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={16} aria-hidden /> {c('Tải file lên', 'Upload a file')}
      </button>
      <span className="muted text-[12px]">
        {Math.floor(limit / 1000)}s {c('tối đa', 'max')} · 4 MB
      </span>
    </div>
  )
}

function readDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration ? Math.round(audio.duration * 1000) : 0)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(0)
    }
    audio.src = url
  })
}
