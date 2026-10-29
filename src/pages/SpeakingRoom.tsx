import { useCallback, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router'

import { Notice, PageHeader } from '../components/ui'
import { SpeakingRecorder } from '../components/speaking/SpeakingRecorder.tsx'
import { SpeakingResult } from '../components/speaking/SpeakingResult.tsx'
import { SpeakingTurnPrompt } from '../components/speaking/SpeakingTurnPrompt.tsx'
import { useCopy } from '../i18n'
import {
  commitSpeakingTurn,
  pollSpeakingResult,
  prepareSpeaking,
  uploadSpeakingAudio,
  type SpeakingAttempt,
  type SpeakingResultView,
} from '../lib/speaking.ts'
import { speakingTestLabel, type SpeakingMode } from '../lib/speakingLogic.ts'

const ERROR_MESSAGES: Record<string, readonly [string, string]> = {
  unauthenticated: ['Bạn cần đăng nhập.', 'You need to sign in.'],
  too_many_ai_jobs: [
    'Bạn đang có quá nhiều bài đang chấm. Vui lòng đợi.',
    'Too many grading jobs are running. Please wait.',
  ],
  no_speaking_questions: [
    'Chưa có câu hỏi cho chế độ này.',
    'There is no question available for this mode yet.',
  ],
  audio_not_uploaded: [
    'Bản ghi âm chưa được tải lên. Hãy thử lại.',
    'The recording was not uploaded. Please try again.',
  ],
  upload_failed: [
    'Không tải được bản ghi âm lên.',
    'Could not upload the recording.',
  ],
  service_unavailable: [
    'Chấm quá lâu. Vui lòng thử lại.',
    'Grading took too long. Please try again.',
  ],
}

export default function SpeakingRoom() {
  const { mode = 'part-1', book, test } = useParams<{
    mode: string
    book?: string
    test?: string
  }>()
  const [searchParams] = useSearchParams()
  const { c } = useCopy()
  const [attempt, setAttempt] = useState<SpeakingAttempt | null>(null)
  const [turnIndex, setTurnIndex] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'grading'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<SpeakingResultView | null>(null)

  const bookNumber = book ? Number(book) : null
  const testNumber = test ? Number(test) : null
  const questionId = searchParams.get('question')

  const start = useCallback(async () => {
    setError('')
    setResult(null)
    const prepared = await prepareSpeaking({
      mode: mode as SpeakingMode,
      bookNumber: Number.isFinite(bookNumber) ? bookNumber : null,
      testNumber: Number.isFinite(testNumber) ? testNumber : null,
      questionId: questionId || null,
      feedbackLocale: 'vi',
    })
    if (!prepared.ok) {
      setError(prepared.code)
      return
    }
    setAttempt(prepared.value)
    setTurnIndex(0)
  }, [mode, bookNumber, testNumber, questionId])

  async function onRecorded(audio: { blob: Blob; mimeType: string; durationMs: number }) {
    if (!attempt) return
    const turn = attempt.turns[turnIndex]
    if (!turn) return
    setPhase('uploading')
    setError('')
    try {
      const uploaded = await uploadSpeakingAudio(turn, audio)
      if (!uploaded.ok) {
        setError(uploaded.code)
        setPhase('idle')
        return
      }
      const committed = await commitSpeakingTurn({
        attemptId: attempt.attemptId,
        turnId: turn.turnId,
        mimeType: audio.mimeType,
        byteSize: audio.blob.size,
        durationMs: audio.durationMs,
      })
      if (!committed.ok) {
        setError(committed.code)
        setPhase('idle')
        return
      }
      if (turnIndex + 1 < attempt.turns.length) {
        setTurnIndex(turnIndex + 1)
        setPhase('idle')
        return
      }
      setPhase('grading')
      const polled = await pollSpeakingResult(attempt.attemptId)
      if (!polled.ok) {
        setError(polled.code)
        setPhase('idle')
        return
      }
      setResult(polled.value)
    } catch {
      setError('unknown_error')
    }
    setPhase('idle')
  }

  if (searchParams.get('record') !== '1') {
    const query = new URLSearchParams({ mode })
    if (book) query.set('book', book)
    if (test) query.set('test', test)
    if (questionId) query.set('question', questionId)
    return <Navigate to={`/app/speaking/live?${query}`} replace />
  }

  if (result) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="SPEAKING"
          title={c('Kết quả', 'Your result')}
          description={c(
            'Band ước tính theo bốn tiêu chí Speaking chính thức.',
            'Estimated band across the four official Speaking criteria.',
          )}
        />
        <SpeakingResult result={result} />
      </div>
    )
  }

  const turn = attempt?.turns[turnIndex]
  const testLabel =
    bookNumber !== null && testNumber !== null && Number.isFinite(bookNumber) && Number.isFinite(testNumber)
      ? speakingTestLabel(bookNumber, testNumber)
      : ''

  return (
    <div className="page">
      <PageHeader
        eyebrow={testLabel || 'SPEAKING'}
        title={c('Luyện nói', 'Speaking practice')}
        description={c(
          'Ghi âm, rồi AI chấm band trên bốn tiêu chí chính thức của IELTS.',
          'Record your answer and get a band on the four official IELTS criteria.',
        )}
      />

      {error && (
        <Notice error>
          <div>
            <strong>{c('Có lỗi xảy ra', 'Something went wrong')}</strong>
            <p>{c(...(ERROR_MESSAGES[error] ?? ['Vui lòng thử lại.', 'Please try again.']))}</p>
          </div>
        </Notice>
      )}

      {!attempt && (
        <div className="panel">
          <p>{c('Bắt đầu để nhận câu hỏi.', 'Start to get your question.')}</p>
          <button
            type="button"
            className="button primary"
            onClick={() => void start()}
            disabled={phase !== 'idle'}
          >
            {c('Bắt đầu', 'Start')}
          </button>
        </div>
      )}

      {attempt && turn && (
        <div className="flex flex-col gap-4">
          <p className="muted text-[12px]">
            {c('Lần trả lời', 'Turn')} {turnIndex + 1} / {attempt.turns.length}
          </p>
          <SpeakingTurnPrompt turn={turn} />
          <SpeakingRecorder
            part={turn.part}
            disabled={phase !== 'idle'}
            onRecorded={(audio) => void onRecorded(audio)}
            onError={setError}
          />
        </div>
      )}

      {phase === 'grading' && (
        <p className="muted" role="status">
          {c('Đang chấm bài của bạn…', 'Scoring your answer…')}
        </p>
      )}
    </div>
  )
}
