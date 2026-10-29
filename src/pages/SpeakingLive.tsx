import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react'

import { Notice, PageHeader } from '../components/ui'
import { SpeakingResult } from '../components/speaking/SpeakingResult.tsx'
import { useCopy } from '../i18n'
import { createVad, type Vad } from '../lib/liveVad.ts'
import {
  createLiveTranscriber,
  openLiveMic,
  playAudioBlob,
  type LiveMic,
  type LiveTranscriber,
  type LiveVoiceAccent,
} from '../lib/liveAudio.ts'
import {
  commitSpeakingTurn,
  pollSpeakingResult,
  prepareSpeaking,
  uploadSpeakingAudio,
  type SpeakingAttempt,
  type SpeakingResultView,
} from '../lib/speaking.ts'
import {
  finishLiveSession,
  requestBrain,
  requestVoice,
  startLiveSession,
  type LiveSession,
  type LiveTranscriptEntry,
} from '../lib/speakingLive.ts'
import { speakingTestLabel, type SpeakingMode } from '../lib/speakingLogic.ts'

type Phase =
  | 'setup'
  | 'connecting'
  | 'prep'
  | 'asking'
  | 'answering'
  | 'thinking'
  | 'uploading'
  | 'grading'
  | 'done'
  | 'error'

const ERROR_MESSAGES: Record<string, readonly [string, string]> = {
  unauthenticated: ['Bạn cần đăng nhập.', 'You need to sign in.'],
  mic_denied: [
    'Không mở được mic. Hãy cấp quyền truy cập mic cho trình duyệt.',
    'Could not open the microphone. Allow microphone access in your browser.',
  ],
  no_speaking_questions: ['Chưa có câu hỏi cho chế độ này.', 'There is no question available for this mode yet.'],
  rate_limited: ['Bạn đã dùng quá nhiều phiên. Hãy thử lại sau.', 'You have reached the live-session limit. Try again later.'],
  invalid_live_token: ['Phiên đã hết hạn. Hãy bắt đầu lại.', 'The live session expired. Please start again.'],
  voice_failed: ['Không phát được giọng giám khảo.', 'The examiner voice could not be played.'],
  no_speech_detected: [
    'Không nhận được lời nói trong bản ghi âm. Hãy kiểm tra mic và thử lại.',
    'No speech was detected in your recording. Check your microphone and try again.',
  ],
  not_found: ['Không tìm thấy bài làm. Hãy tải lại trang.', 'The attempt could not be found. Please reload the page.'],
  upload_failed: ['Không tải được bản ghi âm lên.', 'The recording could not be uploaded.'],
  attempt_not_found: ['Không tìm thấy bài làm.', 'The attempt could not be found.'],
  unknown_error: ['Vui lòng thử lại.', 'Please try again.'],
}

export default function SpeakingLive() {
  const [searchParams] = useSearchParams()
  const { c } = useCopy()

  const bookNumber = Number(searchParams.get('book') ?? '')
  const testNumber = Number(searchParams.get('test') ?? '')
  const mode = (searchParams.get('mode') ?? 'mock') as SpeakingMode
  const questionId = searchParams.get('question')

  const [phase, setPhase] = useState<Phase>('setup')
  const [error, setError] = useState('')
  const [accent, setAccent] = useState<LiveVoiceAccent>('en-GB')
  const [allowFollowUp, setAllowFollowUp] = useState(false)
  const [session, setSession] = useState<LiveSession | null>(null)
  const [transcript, setTranscript] = useState<LiveTranscriptEntry[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [answerSeconds, setAnswerSeconds] = useState(0)
  const [prepSeconds, setPrepSeconds] = useState(0)
  const [result, setResult] = useState<SpeakingResultView | null>(null)
  const [turnLabel, setTurnLabel] = useState('')

  const sessionRef = useRef<LiveSession | null>(null)
  const attemptRef = useRef<SpeakingAttempt | null>(null)
  const turnIndexRef = useRef(0)
  const stepIndexRef = useRef(0)
  const phaseRef = useRef<Phase>('setup')
  const vadRef = useRef<Vad>(createVad())
  const micRef = useRef<LiveMic | null>(null)
  const transcriberRef = useRef<LiveTranscriber | null>(null)
  const voiceCacheRef = useRef(new Map<string, Blob>())
  const transcriptRef = useRef<LiveTranscriptEntry[]>([])
  const answerStartRef = useRef(0)
  const answerLimitRef = useRef(45_000)
  const busyRef = useRef(false)
  const sessionStartRef = useRef(0)
  const cancelledRef = useRef(false)
  const spokeRef = useRef(false)
  const stoppingRef = useRef(false)

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const pushTranscript = useCallback((role: 'examiner' | 'candidate', text: string) => {
    if (!text.trim()) return
    const entry: LiveTranscriptEntry = {
      role,
      text: text.trim(),
      at: Date.now() - sessionStartRef.current,
    }
    transcriptRef.current = [...transcriptRef.current, entry]
    setTranscript(transcriptRef.current)
  }, [])

  // ------------------------------------------------------------- giọng giám khảo

  const speak = useCallback(
    async (text: string, key: string): Promise<boolean> => {
      const current = sessionRef.current
      if (!current || !text.trim()) return false
      const cached = voiceCacheRef.current.get(key)
      if (cached) {
        try {
          await playAudioBlob(cached)
          return true
        } catch {
          voiceCacheRef.current.delete(key)
        }
      }
      const result = await requestVoice({
        sessionId: current.sessionId,
        token: current.token,
        text,
        accent,
      })
      if (!result.ok) {
        setError(result.code)
        return false
      }
      voiceCacheRef.current.set(key, result.value)
      try {
        await playAudioBlob(result.value)
        return true
      } catch {
        setError('voice_failed')
        return false
      }
    },
    [accent],
  )

  /** Tải sẵn giọng cho mọi câu hỏi trong đề — lượt đầu phát ngay, không chờ mạng. */
  const prefetchVoices = useCallback(
    (plan: LiveSession['plan']) => {
      const current = sessionRef.current
      if (!current) return
      const jobs: Array<Promise<void>> = []
      plan.forEach((turn, turnIndex) => {
        turn.steps.forEach((step) => {
          const key = `${turnIndex}:${step.index}`
          if (voiceCacheRef.current.has(key)) return
          jobs.push(
            requestVoice({
              sessionId: current.sessionId,
              token: current.token,
              text: step.text,
              accent,
            }).then((result) => {
              if (result.ok) voiceCacheRef.current.set(key, result.value)
            }),
          )
        })
      })
      void Promise.all(jobs)
    },
    [accent],
  )

  // ------------------------------------------------------------- vòng hỏi

  const askStep = useCallback(
    async (turnIndex: number, stepIndex: number) => {
      const current = sessionRef.current
      if (!current || cancelledRef.current) return
      const turn = current.plan[turnIndex]
      const step = turn?.steps[stepIndex]
      if (!turn || !step) return

      turnIndexRef.current = turnIndex
      stepIndexRef.current = stepIndex
      setTurnLabel(turn.part === 'part-2' ? 'Part 2' : turn.part === 'part-1' ? 'Part 1' : 'Part 3')
      setCurrentQuestion(step.text)
      pushTranscript('examiner', step.text)
      spokeRef.current = false
      setPhaseSafe('asking')

      const played = await speak(step.text, `${turnIndex}:${step.index}`)
      if (!played || cancelledRef.current) return

      vadRef.current.reset()
      transcriberRef.current?.clear()
      answerStartRef.current = Date.now()
      answerLimitRef.current = turn.maxAnswerMs
      setAnswerSeconds(0)
      setPhaseSafe('answering')
      transcriberRef.current?.start()
    },
    [pushTranscript, setPhaseSafe, speak],
  )

  /** Bắt đầu một phần: chuẩn bị (nếu có) rồi hỏi câu đầu tiên. */
  const beginPart = useCallback(
    async (turnIndex: number) => {
      const current = sessionRef.current
      const turn = current?.plan[turnIndex]
      if (!current || !turn) return
      turnIndexRef.current = turnIndex
      if (turn.prepMs > 0) {
        setPrepSeconds(Math.round(turn.prepMs / 1000))
        setPhaseSafe('prep')
        return
      }
      micRef.current?.recorder.start()
      await askStep(turnIndex, 0)
    },
    [askStep, setPhaseSafe],
  )

  const finishExam = useCallback(async () => {
    const current = sessionRef.current
    const attempt = attemptRef.current
    if (!current || !attempt) return
    setPhaseSafe('grading')
    await finishLiveSession({
      sessionId: current.sessionId,
      token: current.token,
      transcript: transcriptRef.current,
    })
    const polled = await pollSpeakingResult(attempt.attemptId)
    if (!polled.ok) {
      setError(polled.code)
      setPhaseSafe('error')
      return
    }
    setResult(polled.value)
    setPhaseSafe('done')
  }, [setPhaseSafe])

  const endTurn = useCallback(async () => {
    const current = sessionRef.current
    const attempt = attemptRef.current
    if (!current || !attempt) return
    const turnIndex = turnIndexRef.current
    const attemptTurn = attempt.turns[turnIndex]
    if (!attemptTurn) return

    setPhaseSafe('uploading')
    transcriberRef.current?.stop()
    const audio = await micRef.current?.recorder.stop()
    if (audio && audio.blob.size > 0) {
      const uploaded = await uploadSpeakingAudio(attemptTurn, audio)
      if (!uploaded.ok) {
        setError(uploaded.code)
        setPhaseSafe('error')
        return
      }
      const committed = await commitSpeakingTurn({
        attemptId: attempt.attemptId,
        turnId: attemptTurn.turnId,
        mimeType: audio.mimeType,
        byteSize: audio.blob.size,
        durationMs: audio.durationMs,
      })
      if (!committed.ok) {
        setError(committed.code)
        setPhaseSafe('error')
        return
      }
    }

    if (stoppingRef.current) {
      await finishExam()
      return
    }

    const nextTurn = turnIndex + 1
    if (nextTurn < current.plan.length) {
      await beginPart(nextTurn)
      return
    }
    await finishExam()
  }, [beginPart, finishExam, setPhaseSafe])

  const handleAnswerEnd = useCallback(async () => {
    if (busyRef.current) return
    const current = sessionRef.current
    if (!current) return
    busyRef.current = true
    try {
      const turnIndex = turnIndexRef.current
      const stepIndex = stepIndexRef.current
      const turn = current.plan[turnIndex]
      const candidateAnswer = transcriberRef.current?.text() ?? ''
      if (candidateAnswer) pushTranscript('candidate', candidateAnswer)

      if (allowFollowUp && turn) {
        setPhaseSafe('thinking')
        const reply = await requestBrain({
          sessionId: current.sessionId,
          token: current.token,
          turnIndex,
          stepIndex,
          candidateAnswer,
          allowFollowUp: true,
        })
        if (reply.ok) {
          const line = [reply.value.ack, reply.value.followUp].filter(Boolean).join(' ')
          if (line) {
            pushTranscript('examiner', line)
            await speak(line, `followup:${turnIndex}:${stepIndex}:${line.slice(0, 24)}`)
          }
        }
      }

      const nextStep = stepIndex + 1
      if (nextStep < (turn?.steps.length ?? 0)) {
        await askStep(turnIndex, nextStep)
      } else {
        await endTurn()
      }
    } finally {
      busyRef.current = false
    }
  }, [allowFollowUp, askStep, endTurn, pushTranscript, setPhaseSafe, speak])

  // ------------------------------------------------------------- đồng hồ

  useEffect(() => {
    if (phase !== 'answering') return
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - answerStartRef.current
      setAnswerSeconds(Math.floor(elapsed / 1000))
      if (elapsed >= answerLimitRef.current) void handleAnswerEnd()
      if (sessionStartRef.current && Date.now() - sessionStartRef.current > 30 * 60 * 1000) {
        void finishExam()
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [phase, handleAnswerEnd, finishExam])

  useEffect(() => {
    if (phase !== 'prep') return
    const timer = window.setInterval(() => {
      setPrepSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer)
          micRef.current?.recorder.start()
          void askStep(turnIndexRef.current, 0)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase, askStep])

  // ------------------------------------------------------------- vòng đời

  const start = useCallback(async () => {
    setError('')
    setResult(null)
    setPhaseSafe('connecting')
    sessionStartRef.current = Date.now()
    cancelledRef.current = false
    stoppingRef.current = false
    transcriptRef.current = []
    setTranscript([])

    const prepared = await prepareSpeaking({
      mode,
      bookNumber: Number.isFinite(bookNumber) ? bookNumber : null,
      testNumber: Number.isFinite(testNumber) ? testNumber : null,
      questionId: questionId || null,
      feedbackLocale: 'vi',
    })
    if (!prepared.ok) {
      setError(prepared.code)
      setPhaseSafe('error')
      return
    }
    attemptRef.current = prepared.value

    const started = await startLiveSession({ attemptId: prepared.value.attemptId, voice: accent })
    if (!started.ok) {
      setError(started.code)
      setPhaseSafe('error')
      return
    }
    sessionRef.current = started.value
    setSession(started.value)

    try {
      micRef.current = await openLiveMic((level) => {
        const update = vadRef.current.update(Date.now(), level)
        if (update.event === 'speech-start') {
          spokeRef.current = true
          setUserSpeaking(true)
        }
        if (update.event === 'speech-end') {
          setUserSpeaking(false)
          // Part 2 là lượt dài: người học dừng lại thì KHÔNG kết thúc lượt nói.
          const turn = sessionRef.current?.plan[turnIndexRef.current]
          if (phaseRef.current === 'answering' && turn?.part !== 'part-2' && spokeRef.current) {
            void handleAnswerEnd()
          }
        }
      })
    } catch {
      setError('mic_denied')
      setPhaseSafe('error')
      return
    }

    transcriberRef.current = createLiveTranscriber(() => undefined)
    prefetchVoices(started.value.plan)
    await beginPart(0)
  }, [
    accent,
    beginPart,
    bookNumber,
    handleAnswerEnd,
    mode,
    prefetchVoices,
    questionId,
    setPhaseSafe,
    testNumber,
  ])

  const stop = useCallback(() => {
    if (phaseRef.current === 'grading' || phaseRef.current === 'done') return
    stoppingRef.current = true
    transcriberRef.current?.stop()
    void endTurn()
  }, [endTurn])

  useEffect(() => {
    return () => {
      cancelledRef.current = true
      transcriberRef.current?.stop()
      micRef.current?.close()
    }
  }, [])

  const testLabel =
    Number.isFinite(bookNumber) && Number.isFinite(testNumber) && bookNumber > 0 && testNumber > 0
      ? speakingTestLabel(bookNumber, testNumber)
      : ''

  const questionNumber = useMemo(() => {
    const current = session
    if (!current) return 0
    const turn = current.plan[turnIndexRef.current]
    if (!turn) return 0
    return stepIndexRef.current + 1
  }, [session, phase])

  if (result) {
    return (
      <div className="page">
        <PageHeader
          eyebrow={testLabel || 'SPEAKING'}
          title={c('Kết quả luyện nói trực tiếp', 'Live speaking result')}
          description={c(
            'Band ước tính theo bốn tiêu chí Speaking chính thức.',
            'Estimated band across the four official Speaking criteria.',
          )}
        />
        <SpeakingResult result={result} />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={testLabel || 'SPEAKING'}
        title={c('Luyện nói trực tiếp', 'Live speaking')}
        description={c(
          'Giám khảo AI hỏi trực tiếp, bạn trả lời bằng mic. Chấm điểm chỉ diễn ra sau khi kết thúc bài.',
          'An AI examiner asks you live and you answer with your microphone. Grading happens after the test.',
        )}
      />

      {error && (
        <Notice error>
          <div>
            <strong>{c('Có lỗi xảy ra', 'Something went wrong')}</strong>
            <p>{c(...(ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown_error))}</p>
          </div>
        </Notice>
      )}

      {phase === 'setup' && (
        <div className="panel flex flex-col gap-4">
          <div className="button-row">
            <label className="muted text-[12px]">
              {c('Giọng giám khảo', 'Examiner voice')}
              <select
                value={accent}
                onChange={(event) => setAccent(event.target.value as LiveVoiceAccent)}
                className="ml-2"
              >
                <option value="en-GB">{c('Giọng nam · Anh-Anh', 'Male voice · British English')}</option>
                <option value="en-US">{c('Giọng nữ · Anh-Mỹ', 'Female voice · American English')}</option>
              </select>
            </label>
          </div>
          <label className="muted text-[12px] flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowFollowUp}
              onChange={(event) => setAllowFollowUp(event.target.checked)}
            />
            {c(
              'Cho phép giám khảo hỏi thêm (chậm hơn một chút)',
              'Let the examiner ask follow-up questions (slightly slower)',
            )}
          </label>
          <p className="muted text-[12px]">
            {c(
              'Cần cấp quyền mic khi bắt đầu. Trình duyệt Chrome/Edge cho trải nghiệm nhanh nhất.',
              'Microphone access is requested when you start. Chrome/Edge gives the smoothest experience.',
            )}
          </p>
          <div className="button-row">
            <button type="button" className="button primary" onClick={() => void start()}>
              <Mic size={16} aria-hidden /> {c('Bắt đầu', 'Start')}
            </button>
          </div>
        </div>
      )}

      {phase === 'connecting' && (
        <p className="muted" role="status">
          {c('Đang kết nối với giám khảo…', 'Connecting to the examiner…')}
        </p>
      )}

      {(phase === 'prep' || phase === 'asking' || phase === 'answering' || phase === 'thinking') && (
        <div className="flex flex-col gap-4">
          <div className="panel flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3 muted text-[12px]">
              <span className="speaking-badge">{turnLabel}</span>
              <span>
                {c('Câu hỏi', 'Question')} {questionNumber}
                {session ? ` / ${session.plan[turnIndexRef.current]?.steps.length ?? 0}` : ''}
              </span>
              {phase === 'answering' && (
                <span className="muted">
                  {c('đang trả lời', 'answering')} {answerSeconds}s
                </span>
              )}
              {phase === 'prep' && (
                <span className="muted">
                  {c('chuẩn bị', 'prepare')} {prepSeconds}s
                </span>
              )}
              {phase === 'asking' && (
                <span className="muted flex items-center gap-1">
                  <Volume2 size={12} aria-hidden /> {c('giám khảo đang nói', 'examiner speaking')}
                </span>
              )}
            </div>
            <p className="text-[15px] leading-6">{currentQuestion}</p>
            <div className="flex items-center gap-2 text-[12px]">
              {phase === 'answering' ? (
                <span className={userSpeaking ? 'flex items-center gap-1' : 'muted flex items-center gap-1'}>
                  {userSpeaking ? <Mic size={14} aria-hidden /> : <MicOff size={14} aria-hidden />}
                  {userSpeaking ? c('Đang nghe bạn nói…', 'Listening to you…') : c('Sẵn sàng trả lời', 'Ready for your answer')}
                </span>
              ) : (
                <span className="muted">—</span>
              )}
            </div>
          </div>

          <div className="button-row">
            <button type="button" className="button outline" onClick={() => void endTurn()}>
              {c('Bỏ qua phần này', 'Skip this part')}
            </button>
            <button type="button" className="button outline" onClick={stop}>
              <PhoneOff size={16} aria-hidden /> {c('Kết thúc và chấm điểm', 'End and grade')}
            </button>
          </div>

          {transcript.length > 0 && (
            <div className="panel flex flex-col gap-2">
              <p className="muted text-[12px]">{c('Hội thoại', 'Conversation')}</p>
              <ul className="flex flex-col gap-2">
                {transcript.map((entry, index) => (
                  <li key={index} className={entry.role === 'examiner' ? 'muted text-[13px]' : 'text-[13px]'}>
                    <strong>{entry.role === 'examiner' ? c('Giám khảo', 'Examiner') : c('Bạn', 'You')}:</strong>{' '}
                    {entry.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(phase === 'uploading' || phase === 'grading') && (
        <p className="muted" role="status">
          {phase === 'uploading'
            ? c('Đang tải bản ghi âm lên…', 'Uploading your recording…')
            : c('Đang chấm bài của bạn…', 'Scoring your answers…')}
        </p>
      )}

      {phase === 'error' && (
        <div className="button-row">
          <button type="button" className="button primary" onClick={() => setPhaseSafe('setup')}>
            {c('Quay lại', 'Back')}
          </button>
        </div>
      )}
    </div>
  )
}
