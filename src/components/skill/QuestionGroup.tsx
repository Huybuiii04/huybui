import { useMemo } from 'react'
import { Flag } from 'lucide-react'
import { useCopy } from '../../i18n'
import { sanitizeHtml, splitHtmlByBlanks, type SkillQuestionGroup } from '../../lib/skillLogic.ts'
import { QuestionCard } from './QuestionCard.tsx'

/** Các dạng completion có ô trống nằm trong HTML của nhóm. */
const INLINE_TYPES = new Set([
  'note-completion', 'table-completion', 'summary-completion', 'sentence-completion', 'sentence-ending',
])

/**
 * Một nhóm câu hỏi dùng chung một hướng dẫn.
 *
 * Với nhóm `completion-*` / `sentence-ending`, chỗ trống nằm sẵn trong HTML
 * (`31_______`); số trong chỗ trống là **số câu của đề gốc** (`sourceNumber`),
 * nên bản đồ `bySourceNumber` phải được dựng RIÊNG cho passage đang hiển thị.
 * Câu nào không tìm thấy chỗ trống sẽ rơi về `QuestionCard` (ô nhập riêng).
 */
export function QuestionGroup({
  group,
  numbers,
  bySourceNumber,
  answers,
  flagged,
  onAnswer,
  onToggleFlag,
}: {
  group: SkillQuestionGroup
  numbers: Record<string, number>
  /** Số câu gốc -> id câu, dựng RIÊNG cho passage đang hiển thị. */
  bySourceNumber: Record<number, string>
  answers: Record<string, string>
  flagged: Set<string>
  onAnswer: (questionId: string, value: string) => void
  onToggleFlag: (questionId: string) => void
}) {
  const { c } = useCopy()
  const instruction = useMemo(() => sanitizeHtml(group.instructionHtml), [group.instructionHtml])
  const html = useMemo(() => {
    const first = group.questions.find(question => question.questionHtml.trim())
    return sanitizeHtml(first?.questionHtml ?? '')
  }, [group.questions])
  const segments = useMemo(() => splitHtmlByBlanks(html), [html])

  // Số trong chỗ trống là số câu của đề gốc.
  const blankIds = useMemo(() => {
    const ids = new Set<string>()
    for (const segment of segments) {
      if (segment.kind !== 'blank') continue
      const id = bySourceNumber[segment.sourceNumber]
      if (id) ids.add(id)
    }
    return ids
  }, [segments, bySourceNumber])

  const inlineQuestions = group.questions.filter(question => blankIds.has(question.id))
  const fallbackQuestions = group.questions.filter(question => !blankIds.has(question.id))
  const useInline = INLINE_TYPES.has(group.displayType) && inlineQuestions.length > 0

  return <section className="skill-group">
    {instruction && <div className="skill-group-instruction" dangerouslySetInnerHTML={{ __html: instruction }} />}

    {useInline && <div className="skill-completion">
      {segments.map((segment, index) => {
        if (segment.kind === 'html') return <span key={index} dangerouslySetInnerHTML={{ __html: segment.html }} />
        const id = bySourceNumber[segment.sourceNumber] ?? ''
        return <input
          key={index}
          className="skill-inline-input"
          type="text"
          value={id ? answers[id] ?? '' : ''}
          onChange={event => onAnswer(id, event.target.value)}
          aria-label={c(`Đáp án câu ${segment.sourceNumber}`, `Answer for question ${segment.sourceNumber}`)}
          placeholder="________"
        />
      })}
    </div>}

    {fallbackQuestions.map(question => <QuestionCard
      key={question.id}
      question={question}
      number={numbers[question.id] ?? 0}
      value={answers[question.id] ?? ''}
      flagged={flagged.has(question.id)}
      onAnswer={value => onAnswer(question.id, value)}
      onToggleFlag={() => onToggleFlag(question.id)}
    />)}

    {useInline && fallbackQuestions.length === 0 && <ul className="skill-group-list">
      {group.questions.map(question => <li key={question.id}>
        <span className="skill-question-number">{numbers[question.id] ?? 0}</span>
        <span className="skill-group-prompt">{question.prompt}</span>
        <button
          type="button"
          className={`skill-flag ${flagged.has(question.id) ? 'is-active' : ''}`}
          onClick={() => onToggleFlag(question.id)}
          aria-pressed={flagged.has(question.id)}
          aria-label={c('Đánh dấu câu này để xem lại', 'Flag this question for review')}
        >
          <Flag size={15} />
        </button>
      </li>)}
    </ul>}
  </section>
}
