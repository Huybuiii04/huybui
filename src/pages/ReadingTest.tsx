import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Clock, Send } from 'lucide-react'
import { Notice, PageHeader } from '../components/ui'
import { PassagePanel } from '../components/skill/PassagePanel.tsx'
import { QuestionGroup } from '../components/skill/QuestionGroup.tsx'
import { ReviewSheet } from '../components/skill/ReviewSheet.tsx'
import { useCopy } from '../i18n'
import { gradeSkill } from '../lib/skillApi.ts'
import { loadSkillTest } from '../lib/skillRepository.ts'
import { answeredCount, formatClock, hasCompleteQuestionSet, htmlToText, progressPercent, type SkillQuestion, type SkillTest } from '../lib/skillLogic.ts'

/** Khoảng cách tối thiểu giữa hai cột, tính theo phần trăm. */
const SPLIT_MIN = 24
const SPLIT_MAX = 76

/**
 * Phòng làm bài Reading — bố cục hai cột: passage bên trái, câu hỏi bên phải,
 * có thanh kéo giữa để đổi tỉ lệ. Thanh bên (sidebar) của ứng dụng có thể
 * ẩn cùng khung ứng dụng trong suốt quá trình làm bài.
 */
export default function ReadingTest() {
  const { c } = useCopy()
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState<SkillTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [remaining, setRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [split, setSplit] = useState(50)
  const splitRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    let alive = true
    void loadSkillTest(slug).then(item => {
      if (!alive) return
      if (!item) { setFailed(true); setLoading(false); return }
      setTest(item)
      setRemaining(item.durationMinutes * 60)
      setLoading(false)
    })
    return () => { alive = false }
  }, [slug])

  useEffect(() => {
    if (!test || loading) return
    const timer = setInterval(() => setRemaining(value => (value > 0 ? value - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [test, loading])

  // Chế độ Focus ẩn khung ứng dụng (sidebar + thanh trên) để passage chiếm hết màn hình.
  useEffect(() => {
    document.documentElement.dataset.readingFocus = 'on'
    return () => { delete document.documentElement.dataset.readingFocus }
  }, [])

  const allQuestions = useMemo<SkillQuestion[]>(() => (test?.sections ?? []).flatMap(section => section.groups.flatMap(group => group.questions)), [test])
  const numbers = useMemo(() => {
    const map: Record<string, number> = {}
    allQuestions.forEach((question, index) => { map[question.id] = index + 1 })
    return map
  }, [allQuestions])
  /**
   * Số câu gốc -> id câu, dựng RIÊNG cho từng passage.
   *
   * Phải scope theo passage, không theo cả đề: 17/77 test đánh số câu lại
   * cho từng passage (ew-*, tid-wb-*), và `cam-11-2` có câu 14 ở cả hai
   * passage. Một map toàn đề sẽ âm thầm bỏ sót câu ở các test đó.
   */
  const bySourceNumberBySection = useMemo(() => {
    const map: Record<string, Record<number, string>> = {}
    for (const item of test?.sections ?? []) {
      const sectionMap: Record<number, string> = {}
      for (const group of item.groups) {
        for (const question of group.questions) {
          if (question.sourceNumber > 0) sectionMap[question.sourceNumber] = question.id
        }
      }
      map[item.id] = sectionMap
    }
    return map
  }, [test])
  const answered = answeredCount(answers, allQuestions)
  const section = test?.sections[activeSection] ?? null

  /**
   * Đề phải tải được đủ số câu mới nộp được.
   *
   * Server chấm theo số thứ tự câu (1..N) nên nếu thiếu câu, mọi đáp án sẽ bị
   * gán nhầm câu mà vẫn được chấm điểm — tệ hơn là không cho nộp.
   */
  const incomplete = test ? !hasCompleteQuestionSet(test.questionCount, allQuestions.length) : false

  /**
   * Bản đáp án gửi lên server, khoá là SỐ CÂU toàn đề (1..N) chứ không phải id câu.
   *
   * `parseGradeSkill` chỉ nhận khoá dạng số ("answer keys must be question numbers")
   * và `gradeQuestions` tra `answers[String(order)]` — order chính là số câu toàn đề
   * mà `grade-skill` tự đánh số theo section → group → order_index.
   */
  const payloadAnswers = useMemo(() => {
    const payload: Record<string, string> = {}
    for (const question of allQuestions) {
      const value = answers[question.id]
      if (value === undefined) continue
      const number = numbers[question.id]
      // Server chỉ nhận khoá dạng số — bỏ qua câu chưa có số để không làm hỏng cả lần nộp.
      if (!Number.isInteger(number) || number < 1) continue
      payload[String(number)] = value
    }
    return payload
  }, [answers, allQuestions, numbers])

  const setAnswer = (questionId: string, value: string) => setAnswers(previous => ({ ...previous, [questionId]: value }))
  const toggleFlag = (questionId: string) => setFlagged(previous => {
    const next = new Set(previous)
    if (next.has(questionId)) next.delete(questionId)
    else next.add(questionId)
    return next
  })

  const jumpTo = (number: number) => {
    const target = allQuestions.find(question => numbers[question.id] === number)
    if (!target) return
    const owner = test?.sections.findIndex(item => item.groups.some(group => group.questions.some(question => question.id === target.id))) ?? -1
    if (owner >= 0) setActiveSection(owner)
    setReviewOpen(false)
  }

  const submit = async () => {
    if (!test || submitting) return
    if (incomplete) {
      setError(c('Đề chưa tải đủ câu hỏi, không thể nộp bài.', 'The test did not load every question, so it cannot be submitted.'))
      return
    }
    setSubmitting(true)
    setError('')
    const result = await gradeSkill({
      testId: test.id,
      answers: payloadAnswers,
      timeSpentSeconds: Math.round((Date.now() - startedAt.current) / 1000),
    })
    if (!result.ok) {
      setError(result.code)
      setSubmitting(false)
      return
    }
    navigate(`/app/reading/result/${result.value.attemptId ?? 'latest'}`, { state: { grade: result.value } })
  }

  /** Bắt đầu kéo thanh chia, dùng pointer capture để không mất sự kiện khi ra ngoài. */
  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !splitRef.current) return
    const rect = splitRef.current.getBoundingClientRect()
    if (rect.width <= 0) return
    const percent = ((event.clientX - rect.left) / rect.width) * 100
    setSplit(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, percent)))
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  /** Kéo bằng bàn phím — thanh kéo không được là cách duy nhất (WCAG 2.2). */
  const onDividerKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 8 : 2
    if (event.key === 'ArrowLeft') { event.preventDefault(); setSplit(value => Math.max(SPLIT_MIN, value - step)) }
    else if (event.key === 'ArrowRight') { event.preventDefault(); setSplit(value => Math.min(SPLIT_MAX, value + step)) }
    else if (event.key === 'Home') { event.preventDefault(); setSplit(50) }
  }

  if (loading) return <div className="loading-state" role="status">{c('Đang tải đề…', 'Loading the test…')}</div>
  if (failed || !test) return <div className="page">
    <PageHeader eyebrow={c('LUYỆN ĐỌC', 'READING')} title={c('Không tìm thấy đề', 'Test not found')} />
    <Notice error><div><strong>{c('Đề này không tồn tại hoặc đã bị ẩn.', 'This test does not exist or has been hidden.')}</strong></div></Notice>
  </div>

  return <div className="skill-room">
    <header className="skill-room-header">
      <div className="skill-room-header-side">
        <button type="button" className="icon-button" onClick={() => navigate('/app/reading')} aria-label={c('Quay lại kho đề', 'Back to the library')}><ArrowLeft size={19} /></button>
        <span className="skill-room-series">{test.series}</span>
      </div>
      <h1 className="skill-room-title">{test.title}</h1>
      <div className="skill-room-header-side is-end">
        <button type="button" className="button primary" onClick={() => void submit()} disabled={submitting || incomplete}>
          <Send size={16} />{submitting ? c('Đang nộp…', 'Submitting…') : c('Nộp bài', 'Submit')}
        </button>
      </div>
    </header>

    <div className="skill-room-toolbar">
      <div className="skill-room-toolbar-side">
        <nav className="skill-room-parts" aria-label={c('Các passage của bài', 'Test passages')}>
          {test.sections.map((item, index) => <button
            key={item.id}
            type="button"
            className={`skill-room-part-tab ${index === activeSection ? 'is-active' : ''}`}
            onClick={() => setActiveSection(index)}
            aria-current={index === activeSection ? 'true' : undefined}
          >{c('Phần', 'Part')} {index + 1}</button>)}
        </nav>
      </div>
      <div className="skill-room-timer">
        <Clock size={16} />
        <span className={remaining <= 300 ? 'is-low' : ''}>{formatClock(remaining)}</span>
      </div>
      <div className="skill-room-toolbar-side is-end">
        <span className="skill-room-progress">{answered}/{allQuestions.length} · {progressPercent(answered, allQuestions.length)}%</span>
        <button
          type="button"
          className={`skill-room-review-toggle ${reviewOpen ? 'is-active' : ''}`}
          onClick={() => setReviewOpen(value => !value)}
          aria-expanded={reviewOpen}
          aria-controls="skill-room-review"
        >
          {c('Rà soát', 'Review')}
        </button>
      </div>
    </div>

    <div className="skill-room-part">
      <strong>{c('Phần', 'Part')} {activeSection + 1}</strong>
      <span className="skill-room-part-title">{section?.title}</span>
      <p>{section ? htmlToText(section.groups[0]?.instructionHtml ?? '') : ''}</p>
    </div>

    {incomplete && <Notice error><div>
      <strong>{c('Đề tải thiếu câu hỏi nên không thể nộp bài.', 'This test is missing questions, so it cannot be submitted.')}</strong>
      <p>{c('Tải lại trang để thử lại.', 'Reload the page to try again.')}</p>
    </div></Notice>}

    {error && <Notice error><div><strong>{c('Không nộp được bài.', 'The attempt could not be submitted.')}</strong><p>{c('Thử lại sau ít phút.', 'Please try again in a moment.')}</p></div></Notice>}

    <div className="skill-room-split" ref={splitRef} style={{ '--split': `${split}%` } as React.CSSProperties}>
      <section className="skill-room-pane skill-room-pane-passage" tabIndex={0} aria-label={c('Bài đọc', 'Reading passage')}>
        {section && <PassagePanel section={section} />}
      </section>
      <div
        className="skill-room-divider"
        role="separator"
        aria-orientation="vertical"
        aria-label={c('Kéo để đổi độ rộng passage và câu hỏi', 'Drag to resize the passage and questions panes')}
        aria-valuenow={Math.round(split)}
        aria-valuemin={SPLIT_MIN}
        aria-valuemax={SPLIT_MAX}
        tabIndex={0}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onDividerKey}
        onDoubleClick={() => setSplit(50)}
      />
      <section className="skill-room-pane skill-room-pane-questions">
        {section?.groups.map(group => <QuestionGroup
          key={group.id}
          group={group}
          numbers={numbers}
          bySourceNumber={bySourceNumberBySection[section.id] ?? {}}
          answers={answers}
          flagged={flagged}
          onAnswer={setAnswer}
          onToggleFlag={toggleFlag}
        />)}
      </section>
    </div>

    {reviewOpen && <aside className="skill-room-review" id="skill-room-review">
      <div className="skill-room-review-head">
        <h2>{c('Rà soát câu trả lời', 'Answer review')}</h2>
        <button type="button" className="icon-button" onClick={() => setReviewOpen(false)} aria-label={c('Đóng bảng rà soát', 'Close the review panel')}>
          <ArrowLeft size={18} />
        </button>
      </div>
      <ReviewSheet questions={allQuestions} numbers={numbers} answers={answers} flagged={flagged} onJump={jumpTo} />
    </aside>}
  </div>
}
