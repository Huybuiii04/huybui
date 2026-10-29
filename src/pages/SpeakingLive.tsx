import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Mic, PhoneOff, Square, Volume2 } from 'lucide-react'

import { Notice, PageHeader } from '../components/ui'
import { SpeakingResult } from '../components/speaking/SpeakingResult.tsx'
import { useCopy } from '../i18n'
import { createVad, type Vad } from '../lib/liveVad.ts'
import {
  cachedVoice,
  createLiveTranscriber,
  openLiveMic,
  playAudioBlob,
  speakWithBrowser,
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

type ConversationEntry = LiveTranscriptEntry & { durationMs?: number }

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
  recording_failed: ['Không ghi âm được. Hãy kiểm tra mic và thử lại.', 'Could not record. Check your microphone and try again.'],
  brain_timeout: ['AI chưa trả lời kịp. Lượt này tiếp tục câu hỏi trong đề.', 'The AI timed out. Continuing with the scripted question for this turn.'],
  brain_provider_error: ['Dịch vụ AI hỏi thêm đang lỗi. Lượt này tiếp tục câu hỏi trong đề.', 'The follow-up AI service failed. Continuing with the scripted question for this turn.'],
  server_misconfigured: ['Máy chủ chưa cấu hình AI hỏi thêm. Phiên này tiếp tục theo đề.', 'Follow-up AI is not configured on the server. Continuing with the test plan.'],
  brain_invalid_output: ['AI chưa tạo được câu hỏi thêm hợp lệ. Lượt này tiếp tục theo đề.', 'The AI did not return a valid follow-up. Continuing with the test plan for this turn.'],
  brain_no_follow_up: ['AI không tạo câu hỏi thêm cho câu trả lời này. Lượt này tiếp tục theo đề.', 'The AI did not ask a follow-up for this answer. Continuing with the test plan for this turn.'],
  browser_transcription_required: ['Model hỏi thêm hiện tại cần lời nhận dạng thành chữ. Hãy thử Chrome/Edge.', 'The configured follow-up model needs a text transcript. Try Chrome/Edge.'],
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
  const [session, setSession] = useState<LiveSession | null>(null)
  const [transcript, setTranscript] = useState<ConversationEntry[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [answerSeconds, setAnswerSeconds] = useState(0)
  const [prepSeconds, setPrepSeconds] = useState(0)
  const [result, setResult] = useState<SpeakingResultView | null>(null)
  const [turnLabel, setTurnLabel] = useState('')
  const [replaying, setReplaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const [followUpIssue, setFollowUpIssue] = useState('')

  const sessionRef = useRef<LiveSession | null>(null)
  const attemptRef = useRef<SpeakingAttempt | null>(null)
  const turnIndexRef = useRef(0)
  const stepIndexRef = useRef(0)
  const phaseRef = useRef<Phase>('setup')
  const vadRef = useRef<Vad>(createVad())
  const micRef = useRef<LiveMic | null>(null)
  const transcriberRef = useRef<LiveTranscriber | null>(null)
  const voiceCacheRef = useRef(new Map<string, Promise<Blob>>())
  const transcriptRef = useRef<LiveTranscriptEntry[]>([])
  const answerStartRef = useRef(0)
  const answerLimitRef = useRef(45_000)
  const prepEndRef = useRef(0)
  const busyRef = useRef(false)
  const sessionStartRef = useRef(0)
  const cancelledRef = useRef(false)
  const recordingRef = useRef(false)
  const stoppingRef = useRef(false)
  const followUpRef = useRef(false)
  const questionAudioRef = useRef<{ text: string; key: string } | null>(null)
  const pendingUploadsRef = useRef<Promise<void>[]>([])
  const conversationRef = useRef<HTMLUListElement>(null)

  const setPhaseSafe = useCallback((next: Phase) => {
    if (next === 'error' || next === 'grading' || next === 'done') {
      recordingRef.current = false
      setRecording(false)
      void transcriberRef.current?.stop()
      micRef.current?.close()
    }
    phaseRef.current = next
    setPhase(next)
  }, [])

  /** Chờ mọi upload nền hoàn tất; báo lỗi nếu có turn không lên được. */
  const waitUploads = useCallback(async () => {
    const pending = pendingUploadsRef.current
    pendingUploadsRef.current = []
    if (!pending.length) return
    try {
      await Promise.all(pending)
    } catch (error) {
      const code = error instanceof Error ? error.message : 'upload_failed'
      setError(code)
      setPhaseSafe('error')
      throw error
    }
  }, [setPhaseSafe])

  const pushTranscript = useCallback((role: 'examiner' | 'candidate', text: string, durationMs?: number) => {
    if (!text.trim() && durationMs === undefined) return
    const entry: ConversationEntry = {
      role,
      text: text.trim(),
      at: Date.now() - sessionStartRef.current,
      ...(durationMs !== undefined ? { durationMs } : {}),
    }
    // Chỉ lời nhận dạng thật được gửi cho AI; nhãn bản ghi thuộc giao diện.
    if (entry.text) transcriptRef.current = [...transcriptRef.current, { role: entry.role, text: entry.text, at: entry.at }]
    setTranscript(entries => [...entries, entry])
  }, [])

  const captureAnswer = useCallback(async () => {
    if (!recordingRef.current) return { text: '', audio: null }
    recordingRef.current = false
    micRef.current?.recorder.pause()
    const audio = micRef.current?.stopAnswerRecording()
    setRecording(false)
    setUserSpeaking(false)
    const durationMs = Date.now() - answerStartRef.current
    await transcriberRef.current?.stop()
    const text = transcriberRef.current?.text() ?? ''
    pushTranscript('candidate', text, durationMs)
    return { text, audio: await audio }
  }, [pushTranscript])

  // ------------------------------------------------------------- giọng giám khảo

  const loadVoice = useCallback((text: string, key: string): Promise<Blob> => {
    const current = sessionRef.current
    if (!current) return Promise.reject(new Error('invalid_live_token'))
    return cachedVoice(voiceCacheRef.current, key, async () => {
      const result = await requestVoice({ sessionId: current.sessionId, token: current.token, text, accent })
      if (!result.ok) throw new Error(result.code)
      return result.value
    })
  }, [accent])

  const speak = useCallback(
    async (text: string, key: string): Promise<boolean> => {
      if (!sessionRef.current || !text.trim()) return false
      // 1) Giọng của server (đồng nhất, có cache sẵn cho câu Cambridge).
      //    Thử lại một lần: provider TTS đôi lúc bị "hết kênh" ở lần gọi đầu.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        let audio: Blob
        try {
          audio = await loadVoice(text, key)
        } catch (error) {
          if (attempt === 0) continue
          break
        }
        if (cancelledRef.current) return false
        try {
          await playAudioBlob(audio)
          return true
        } catch {
          voiceCacheRef.current.delete(key)
          break
        }
      }
      // 2) Dự phòng: đọc bằng giọng của trình duyệt (miễn phí, tức thì).
      if (cancelledRef.current) return false
      if (await speakWithBrowser(text, accent)) return true
      setError('voice_failed')
      return false
    },
    [accent, loadVoice],
  )

  /**
   * Tải trước giọng cho câu hiện tại và 2 câu kế tiếp, cộng thêm câu đầu của
   * phần kế tiếp — nếu không có câu đầu phần sau trong 2 câu kế tiếp thì lúc
   * chuyển phần sẽ phải chờ gọi TTS.
   */
  const prefetchVoices = useCallback(
    (turnIndex: number, stepIndex: number) => {
      const current = sessionRef.current
      if (!current) return
      const upcoming = current.plan.flatMap((turn, index) => turn.steps
        .filter(step => index > turnIndex || (index === turnIndex && step.index >= stepIndex))
        .map(step => ({ key: `${index}:${step.index}`, text: step.text })))
      const nextTurn = current.plan[turnIndex + 1]
      const nextPartFirst = nextTurn?.steps[0]
        ? [{ key: `${turnIndex + 1}:0`, text: nextTurn.steps[0].text }]
        : []
      const targets = [...upcoming.slice(0, 2), ...nextPartFirst]
      for (const step of targets) void loadVoice(step.text, step.key).catch(() => undefined)
    },
    [loadVoice],
  )

  // ------------------------------------------------------------- vòng hỏi

  const askStep = useCallback(
    async (turnIndex: number, stepIndex: number, followUp?: string) => {
      const current = sessionRef.current
      if (!current || cancelledRef.current) return
      const turn = current.plan[turnIndex]
      const step = turn?.steps[stepIndex]
      if (!turn || !step) return

      turnIndexRef.current = turnIndex
      stepIndexRef.current = stepIndex
      setTurnLabel(turn.part === 'part-2' ? 'Part 2' : turn.part === 'part-1' ? 'Part 1' : 'Part 3')
      const text = followUp ?? step.text
      const key = followUp ? `followup:${turnIndex}:${step.index}:${text}` : `${turnIndex}:${step.index}`
      followUpRef.current = Boolean(followUp)
      questionAudioRef.current = { text, key }
      setCurrentQuestion(text)
      pushTranscript('examiner', text)
      setPhaseSafe('asking')

      const played = await speak(text, key)
      if (cancelledRef.current) return
      if (!played) { setPhaseSafe('error'); return }
      prefetchVoices(turnIndex, stepIndex + 1)

      vadRef.current.reset()
      transcriberRef.current?.clear()
      answerLimitRef.current = turn.maxAnswerMs
      setAnswerSeconds(0)
      setPhaseSafe('answering')
    },
    [prefetchVoices, pushTranscript, setPhaseSafe, speak],
  )

  /** Bắt đầu một phần: chuẩn bị (nếu có) rồi hỏi câu đầu tiên. */
  const beginPart = useCallback(
    async (turnIndex: number) => {
      const current = sessionRef.current
      const turn = current?.plan[turnIndex]
      if (!current || !turn) return
      turnIndexRef.current = turnIndex
      stepIndexRef.current = 0
      setCurrentQuestion(turn.steps[0]?.text ?? '')
      setTurnLabel(turn.part === 'part-2' ? 'Part 2' : turn.part === 'part-1' ? 'Part 1' : 'Part 3')
      if (turn.prepMs > 0) {
        prefetchVoices(turnIndex, 0)
        prepEndRef.current = Date.now() + turn.prepMs
        setPrepSeconds(Math.round(turn.prepMs / 1000))
        setPhaseSafe('prep')
        return
      }
      await askStep(turnIndex, 0)
    },
    [askStep, prefetchVoices, setPhaseSafe],
  )

  const finishExam = useCallback(async () => {
    const current = sessionRef.current
    const attempt = attemptRef.current
    if (!current || !attempt) return
    setPhaseSafe('grading')
    try {
      await waitUploads()
    } catch {
      return
    }
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
  }, [setPhaseSafe, waitUploads])

  const endTurn = useCallback(async () => {
    const current = sessionRef.current
    const attempt = attemptRef.current
    if (!current || !attempt) return
    const turnIndex = turnIndexRef.current
    const attemptTurn = attempt.turns[turnIndex]
    if (!attemptTurn) return

    setPhaseSafe('uploading')
    await captureAnswer()
    const audio = await micRef.current?.recorder.stop()
    if (cancelledRef.current) return

    // Upload + commit chạy NỀN: phần sau bắt đầu ngay, không phải đợi mạng.
    const upload = (async () => {
      if (!audio || audio.blob.size === 0) return
      const uploaded = await uploadSpeakingAudio(attemptTurn, audio)
      if (!uploaded.ok) throw new Error(uploaded.code)
      const committed = await commitSpeakingTurn({
        attemptId: attempt.attemptId,
        turnId: attemptTurn.turnId,
        mimeType: audio.mimeType,
        byteSize: audio.blob.size,
        durationMs: audio.durationMs,
      })
      if (!committed.ok) throw new Error(committed.code)
    })()
    upload.catch(() => undefined)
    pendingUploadsRef.current = [...pendingUploadsRef.current, upload]

    if (!stoppingRef.current) {
      const nextTurn = turnIndex + 1
      if (nextTurn < current.plan.length) {
        await beginPart(nextTurn)
        return
      }
    }

    await waitUploads()
    await finishExam()
  }, [beginPart, captureAnswer, finishExam, setPhaseSafe, waitUploads])

  const handleAnswerEnd = useCallback(async () => {
    if (busyRef.current || !recordingRef.current || phaseRef.current !== 'answering') return
    const current = sessionRef.current
    if (!current) return
    busyRef.current = true
    try {
      const turnIndex = turnIndexRef.current
      const stepIndex = stepIndexRef.current
      const turn = current.plan[turnIndex]
      setFollowUpIssue('')
      setPhaseSafe('thinking')
      const answer = await captureAnswer()
      if (cancelledRef.current) return

      if (turn && !followUpRef.current) {
        const reply = answer.text || answer.audio?.size ? await requestBrain({
          sessionId: current.sessionId,
          token: current.token,
          turnIndex,
          stepIndex,
          candidateAnswer: answer.text,
          audio: answer.audio,
          allowFollowUp: true,
        }) : { ok: false as const, code: 'no_speech_detected' }
        if (reply.ok) {
          const line = [reply.value.ack, reply.value.followUp].filter(Boolean).join(' ')
          if (reply.value.followUp) {
            await askStep(turnIndex, stepIndex, line)
            return
          }
          if (line) {
            pushTranscript('examiner', line)
            await speak(line, `followup:${turnIndex}:${stepIndex}:${line.slice(0, 24)}`)
          }
          setFollowUpIssue('brain_no_follow_up')
        } else setFollowUpIssue(reply.code)
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
  }, [askStep, captureAnswer, endTurn, pushTranscript, setPhaseSafe, speak])

  const toggleRecording = useCallback(() => {
    if (busyRef.current || phaseRef.current !== 'answering') return
    if (recordingRef.current) { void handleAnswerEnd(); return }
    try {
      if (!micRef.current) throw new Error('recording_failed')
      micRef.current.recorder.start()
      if (!followUpRef.current) micRef.current.startAnswerRecording()
      transcriberRef.current?.clear()
      transcriberRef.current?.start()
      vadRef.current.reset()
      answerStartRef.current = Date.now()
      recordingRef.current = true
      setAnswerSeconds(0)
      setRecording(true)
    } catch {
      setError('recording_failed')
      setPhaseSafe('error')
    }
  }, [handleAnswerEnd, setPhaseSafe])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return
      if (!(event.target instanceof Element) || event.target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="textbox"]')) return
      if (phaseRef.current !== 'answering') return
      event.preventDefault()
      if (!event.repeat) toggleRecording()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleRecording])

  useEffect(() => {
    const list = conversationRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [transcript, recording, phase])

  const replayQuestion = useCallback(async () => {
    if (busyRef.current || recordingRef.current || phaseRef.current !== 'answering') return
    const question = questionAudioRef.current
    if (!question) return
    busyRef.current = true
    setReplaying(true)
    setError('')
    setUserSpeaking(false)
    setPhaseSafe('asking')
    try {
      await speak(question.text, question.key)
    } finally {
      busyRef.current = false
      setReplaying(false)
      if (!cancelledRef.current && !stoppingRef.current) {
        vadRef.current.reset()
        setPhaseSafe('answering')
      }
    }
  }, [setPhaseSafe, speak])

  // ------------------------------------------------------------- đồng hồ

  useEffect(() => {
    if (phase !== 'answering' || !recording) return
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - answerStartRef.current
      setAnswerSeconds(Math.floor(elapsed / 1000))
      if (elapsed >= answerLimitRef.current) void handleAnswerEnd()
    }, 250)
    return () => window.clearInterval(timer)
  }, [phase, recording, handleAnswerEnd])

  useEffect(() => {
    if (!['prep', 'asking', 'answering', 'thinking'].includes(phase)) return
    const timer = window.setInterval(() => {
      if (!busyRef.current && phaseRef.current !== 'asking' && Date.now() - sessionStartRef.current > 30 * 60 * 1000) {
        stoppingRef.current = true
        void endTurn()
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase, endTurn])

  useEffect(() => {
    if (phase !== 'prep') return
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((prepEndRef.current - Date.now()) / 1000))
      setPrepSeconds(remaining)
      if (remaining === 0) {
        window.clearInterval(timer)
        void askStep(turnIndexRef.current, 0)
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [phase, askStep])

  // ------------------------------------------------------------- vòng đời

  const start = useCallback(async () => {
    transcriberRef.current?.stop()
    micRef.current?.close()
    setError('')
    setFollowUpIssue('')
    setResult(null)
    setPhaseSafe('connecting')
    sessionStartRef.current = Date.now()
    cancelledRef.current = false
    voiceCacheRef.current = new Map()
    stoppingRef.current = false
    recordingRef.current = false
    setRecording(false)
    busyRef.current = false
    transcriptRef.current = []
    setTranscript([])

    const prepared = await prepareSpeaking({
      mode,
      bookNumber: Number.isFinite(bookNumber) ? bookNumber : null,
      testNumber: Number.isFinite(testNumber) ? testNumber : null,
      questionId: questionId || null,
      feedbackLocale: 'vi',
    })
    if (cancelledRef.current) return
    if (!prepared.ok) {
      setError(prepared.code)
      setPhaseSafe('error')
      return
    }
    attemptRef.current = prepared.value

    const started = await startLiveSession({ attemptId: prepared.value.attemptId, voice: accent })
    if (cancelledRef.current) return
    if (!started.ok) {
      setError(started.code)
      setPhaseSafe('error')
      return
    }
    sessionRef.current = started.value
    setSession(started.value)

    try {
      micRef.current = await openLiveMic((level) => {
        if (!recordingRef.current) return
        const update = vadRef.current.update(Date.now(), level)
        if (update.event === 'speech-start') {
          setUserSpeaking(true)
        }
        if (update.event === 'speech-end') {
          setUserSpeaking(false)
        }
      })
      if (cancelledRef.current) { micRef.current.close(); return }
    } catch {
      setError('mic_denied')
      setPhaseSafe('error')
      return
    }

    transcriberRef.current = createLiveTranscriber(() => undefined)
    await beginPart(0)
  }, [
    accent,
    beginPart,
    bookNumber,
    mode,
    questionId,
    setPhaseSafe,
    testNumber,
  ])

  const stop = useCallback(() => {
    if (busyRef.current || !['prep', 'answering'].includes(phaseRef.current)) return
    stoppingRef.current = true
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
  const inSession = ['prep', 'asking', 'answering', 'thinking'].includes(phase)
  const canEnd = phase === 'answering' || phase === 'prep'

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
    <div className={`page speaking-live-page ${inSession ? 'is-active' : ''}`}>
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
      {followUpIssue && <Notice><strong>{c('Không hỏi thêm được ở lượt này', 'Follow-up unavailable for this turn')}</strong><p>{c(...(ERROR_MESSAGES[followUpIssue] ?? ERROR_MESSAGES.brain_provider_error))}</p></Notice>}

      {phase === 'setup' && (
        <div className="panel live-setup">
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
          <p className="muted">{c('Giám khảo tự hỏi thêm dựa trên câu trả lời của bạn. Có thể cần vài giây để chuẩn bị câu hỏi.', 'The examiner automatically asks follow-up questions based on your answer. Preparing a question may take a few seconds.')}</p>
          <p className="muted text-[12px]">
            {c(
              'Cần cấp quyền mic khi bắt đầu. Trình duyệt Chrome/Edge cho trải nghiệm nhanh nhất. Nếu không tổng hợp được giọng server, hệ thống tự đọc bằng giọng của trình duyệt.',
              'Microphone access is requested when you start. Chrome/Edge gives the smoothest experience. If the server voice is unavailable, the examiner falls back to the browser voice.',
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

      {inSession && (
        <div className="live-room">
          <section className="panel live-conversation" aria-label={c('Hội thoại', 'Conversation')}>
            <div className="live-toolbar">
              <div className="live-question-meta">
              <span className="speaking-badge">{turnLabel}</span>
              <span>
                {c('Câu hỏi', 'Question')} {questionNumber}
                {session ? ` / ${session.plan[turnIndexRef.current]?.steps.length ?? 0}` : ''}
              </span>
              {recording && (
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
              {phase === 'thinking' && <span role="status">{c('Giám khảo đang chuẩn bị câu hỏi…', 'Examiner is preparing a question…')}</span>}
              </div>
              <button type="button" className="button outline" disabled={!canEnd} onClick={stop}>
                <PhoneOff size={16} aria-hidden /> {c('Kết thúc và chấm điểm', 'End and grade')}
              </button>
            </div>
            <ul className="live-messages" ref={conversationRef} aria-label={c('Tin nhắn hội thoại', 'Conversation messages')} aria-live="polite" aria-relevant="additions" tabIndex={0}>
                {transcript.map((entry, index) => (
                  <li key={index} className={`live-message ${entry.role === 'examiner' ? 'is-examiner' : 'is-candidate'}`}>
                    <strong>{entry.role === 'examiner' ? c('Giám khảo', 'Examiner') : c('Bạn', 'You')}</strong>
                    {entry.role === 'candidate' ? <>
                      <span className="live-voice-message"><Mic size={18} aria-hidden />{c('Bản ghi âm', 'Voice recording')}<span>{Math.floor((entry.durationMs ?? 0) / 1000)}s</span></span>
                      {entry.text && <p className="live-answer-text">{entry.text}</p>}
                    </> : <p className="live-question-text">{entry.text}</p>}
                    {entry.role === 'examiner' && index === transcript.length - 1 && (
                      <button type="button" className="button outline live-replay" disabled={phase !== 'answering' || replaying || recording} onClick={() => void replayQuestion()}><Volume2 size={16} aria-hidden />{replaying ? c('Đang đọc lại…', 'Replaying…') : c('Nghe lại câu hỏi', 'Replay question')}</button>
                    )}
                  </li>
                ))}
                {phase === 'prep' && <li className="live-message is-examiner"><strong>{c('Thẻ chủ đề · Chuẩn bị', 'Cue card · Prepare')}</strong><p className="live-question-text">{currentQuestion}</p></li>}
                {recording && <li className="live-message is-candidate is-recording"><strong>{c('Bạn', 'You')}</strong><span className="live-voice-message"><Mic size={18} aria-hidden />{c('Đang ghi âm…', 'Recording…')}<span>{answerSeconds}s</span></span></li>}
            </ul>
            <div className={`live-composer ${recording ? 'is-recording' : ''}`}>
              <button type="button" className="live-mic-toggle" aria-label={recording ? c('Tắt mic và gửi câu trả lời', 'Stop recording and send answer') : c('Bật mic để nói', 'Start recording')} aria-pressed={recording} aria-keyshortcuts="Space" aria-describedby="live-mic-hint" disabled={phase !== 'answering' || replaying} onClick={toggleRecording}>
                {recording ? <Square size={23} fill="currentColor" aria-hidden /> : <Mic size={26} aria-hidden />}
              </button>
              <div className="live-mic-copy">
                <strong>{recording ? c('Bấm để dừng và gửi', 'Press to stop and send') : c('Bấm để nói', 'Press to speak')}</strong>
                <span className="muted" id="live-mic-hint">{c('hoặc nhấn', 'or press')} <kbd>Space</kbd></span>
              </div>
              <span className="live-mic-state" role="status">
                {phase === 'answering'
                  ? recording ? userSpeaking ? c('Đang nghe bạn nói…', 'Listening to you…') : c('Mic đang bật · Đang ghi âm', 'Mic on · Recording') : c('Sẵn sàng trả lời', 'Ready for your answer')
                  : phase === 'prep' ? c('Đang chuẩn bị', 'Preparation time') : c('Đợi giám khảo', 'Wait for the examiner')}
              </span>
            </div>
          </section>
          <div className="button-row live-session-actions">
            <button type="button" className="button outline" disabled={!canEnd} onClick={() => { if (!busyRef.current && ['prep', 'answering'].includes(phaseRef.current)) void endTurn() }}>
              {c('Bỏ qua phần này', 'Skip this part')}
            </button>
            <span className="muted">{c('Bật mic để nói. Tắt mic để gửi câu trả lời.', 'Turn the mic on to speak. Turn it off to send your answer.')}</span>
          </div>
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
