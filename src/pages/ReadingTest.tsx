import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Send } from 'lucide-react'
import { Notice, PageHeader } from '../components/ui'
import { PassagePanel } from '../components/skill/PassagePanel.tsx'
import { QuestionGroup } from '../components/skill/QuestionGroup.tsx'
import { ReviewSheet } from '../components/skill/ReviewSheet.tsx'
import { TestTimer } from '../components/skill/TestTimer.tsx'
import { useCopy } from '../i18n'
import { gradeSkill } from '../lib/skillApi.ts'
import { loadSkillTest } from '../lib/skillRepository.ts'
import { answeredCount, hasCompleteQuestionSet, progressPercent, type SkillQuestion, type SkillTest } from '../lib/skillLogic.ts'

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

  if (loading) return <div className="loading-state" role="status">{c('Đang tải đề…', 'Loading the test…')}</div>
  if (failed || !test) return <div className="page">
    <PageHeader eyebrow={c('LUYỆN ĐỌC', 'READING')} title={c('Không tìm thấy đề', 'Test not found')} />
    <Notice error><div><strong>{c('Đề này không tồn tại hoặc đã bị ẩn.', 'This test does not exist or has been hidden.')}</strong></div></Notice>
  </div>

  return <div className="skill-workspace">
    <header className="skill-workspace-bar">
      <button type="button" className="icon-button" onClick={() => navigate('/app/reading')} aria-label={c('Quay lại kho đề', 'Back to the library')}><ArrowLeft size={19} /></button>
      <div className="skill-workspace-title">
        <p className="eyebrow">{test.series}</p>
        <h1>{test.title}</h1>
      </div>
      <div className="skill-workspace-progress">
        <span>{c('Đã trả lời', 'Answered')} {answered}/{allQuestions.length} ({progressPercent(answered, allQuestions.length)}%)</span>
        <span className="skill-timer-bar"><span style={{ width: `${progressPercent(answered, allQuestions.length)}%` }} /></span>
      </div>
      <TestTimer seconds={remaining} durationMinutes={test.durationMinutes} />
      <button type="button" className="button primary" onClick={() => void submit()} disabled={submitting || incomplete}>
        <Send size={16} />{submitting ? c('Đang nộp…', 'Submitting…') : c('Nộp bài', 'Submit')}
      </button>
    </header>

    {incomplete && <Notice error><div>
      <strong>{c('Đề tải thiếu câu hỏi nên không thể nộp bài.', 'This test is missing questions, so it cannot be submitted.')}</strong>
      <p>{c('Tải lại trang để thử lại.', 'Reload the page to try again.')}</p>
    </div></Notice>}

    {error && <Notice error><div><strong>{c('Không nộp được bài.', 'The attempt could not be submitted.')}</strong><p>{c('Thử lại sau ít phút.', 'Please try again in a moment.')}</p></div></Notice>}

    <div className="skill-workspace-body">
      <aside className="skill-workspace-side">
        <ReviewSheet questions={allQuestions} numbers={numbers} answers={answers} flagged={flagged} onJump={jumpTo} />
        <nav className="skill-section-tabs" aria-label={c('Các passage của bài', 'Test passages')}>
          {test.sections.map((item, index) => <button key={item.id} type="button" className={`skill-section-tab ${index === activeSection ? 'is-active' : ''}`} onClick={() => setActiveSection(index)}>{item.title}</button>)}
        </nav>
      </aside>
      <section className="skill-workspace-passage">
        {section && <PassagePanel section={section} />}
      </section>
      <section className="skill-workspace-questions">
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
  </div>
}
