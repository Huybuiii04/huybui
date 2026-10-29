import { createElement, Fragment, useMemo, type ReactNode } from 'react'
import { Flag } from 'lucide-react'
import { useCopy } from '../../i18n'
import { groupAnswerCount, matchingOptionsFor, sanitizeHtml, splitGroupHeading, splitHtmlByBlanks, type SkillQuestionGroup } from '../../lib/skillLogic.ts'
import { QuestionCard } from './QuestionCard.tsx'

/**
 * Các dạng có ô trống nằm trong HTML của nhóm.
 * `fill-blank` cũng nằm ở đây: câu của nhóm này chỉ có prompt cụt, câu đầy đủ
 * nằm trong `questionHtml` của nhóm nên phải nhúng ô nhập vào HTML.
 */
const INLINE_TYPES = new Set([
  'note-completion', 'table-completion', 'summary-completion', 'sentence-completion', 'sentence-ending',
  'fill-blank',
])

// Parse complete markup so inputs stay inside their original paragraphs and table cells.
function completionContent(html: string, blank: (sourceNumber: number, key: string) => ReactNode): ReactNode {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const render = (node: Node, key: string): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return splitHtmlByBlanks(node.textContent ?? '').map((segment, index) =>
      segment.kind === 'blank' ? blank(segment.sourceNumber, `${key}-${index}`) : segment.html)
    if (!(node instanceof Element)) return null
    const props: Record<string, string> = { key }
    for (const attribute of Array.from(node.attributes)) {
      if (attribute.name === 'style') continue
      const name = ({ class: 'className', colspan: 'colSpan', rowspan: 'rowSpan' } as Record<string, string>)[attribute.name] ?? attribute.name
      props[name] = attribute.value
    }
    const children = Array.from(node.childNodes).map((child, index) => render(child, `${key}-${index}`))
    return createElement(node.tagName.toLowerCase(), props, ...(children.length ? children : []))
  }
  return <Fragment>{Array.from(document.body.childNodes).map((node, index) => render(node, String(index)))}</Fragment>
}

/**
 * Một nhóm câu hỏi dùng chung một hướng dẫn.
 *
 * Với nhóm `completion-*` / `sentence-ending`, chỗ trống nằm sẵn trong HTML
 * (`31_______`); số trong chỗ trống là **số câu của đề gốc** (`sourceNumber`),
 * nên bản đồ `bySourceNumber` phải được dựng RIÊNG cho passage đang hiển thị.
 * Câu nào không tìm thấy chỗ trống sẽ rơi về `QuestionCard` (ô nhập riêng).
 *
 * Nhóm nhúng ô nhập không vẽ thêm danh sách câu: HTML đã hiện đầy đủ câu hỏi,
 * lặp lại sẽ hiện câu hai lần. Vì vậy câu hỏi chỉ hiện dạng thẻ ở nhóm rơi về
 * đường dẫn dự phòng.
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
  // Tiêu đề "Questions 27-30" tách riêng khỏi phần hướng dẫn còn lại.
  const split = useMemo(() => splitGroupHeading(group.instructionHtml), [group.instructionHtml])
  const instruction = useMemo(() => sanitizeHtml(split.body), [split.body])
  // Số đáp án của nhóm ("Choose TWO correct answers") để câu mất đề bài mượn dùng.
  const answerCount = useMemo(() => groupAnswerCount(group), [group])
  const sharedSlots = group.displayType === 'multiple-choice-2' && Number(group.config.answerSlots) > 1 && group.questions.length === group.config.answerSlots
  const inlineOptions = matchingOptionsFor(group)
  const html = useMemo(() => {
    const first = group.questions.find(question => question.questionHtml.trim())
    return sanitizeHtml(first?.questionHtml ?? '')
  }, [group.questions])
  const segments = useMemo(() => splitHtmlByBlanks(html), [html])

  // Số trong chỗ trống là số câu của đề gốc.
  // Chỉ dùng được khi số đó trỏ tới câu CỦA NHÓM NÀY: cùng một số câu có thể
  // xuất hiện ở nhóm khác của cùng passage, nếu không sẽ hiển thị trùng.
  const blankIdByNumber = useMemo(() => {
    const map: Record<number, string> = {}
    const own = new Set(group.questions.map(question => question.id))
    for (const segment of segments) {
      if (segment.kind !== 'blank') continue
      const id = bySourceNumber[segment.sourceNumber]
      if (id && own.has(id)) map[segment.sourceNumber] = id
    }
    return map
  }, [segments, bySourceNumber, group.questions])

  const blankIds = useMemo(() => new Set(Object.values(blankIdByNumber)), [blankIdByNumber])
  const inlineQuestions = group.questions.filter(question => blankIds.has(question.id))
  const useInline = INLINE_TYPES.has(group.displayType) && inlineQuestions.length > 0
  // Nhóm không nhúng ô nhập thì MỌI câu đều phải hiện dạng thẻ — kể cả câu có
  // số trùng với một chỗ trống trong HTML, nếu không câu đó sẽ biến mất khỏi giao diện.
  const cardQuestions = useInline
    ? group.questions.filter(question => !blankIds.has(question.id))
    : sharedSlots ? group.questions.slice(0, 1) : group.questions

  return <section className="skill-group">
    {split.heading && <h3 className="skill-group-title">{split.heading}</h3>}
    {instruction && <div className="skill-group-instruction" dangerouslySetInnerHTML={{ __html: instruction }} />}

    {useInline && <div className="skill-completion">
      {completionContent(html, (sourceNumber, key) => {
        const id = blankIdByNumber[sourceNumber] ?? ''
        // Chỗ trống không thuộc nhóm này (số câu trùng với nhóm khác của passage)
        // thì để nguyên dạng chữ, nhóm sở hữu câu đó sẽ vẽ ô nhập.
        if (!id) return <span key={key} className="skill-inline-input">{sourceNumber}</span>
        const isFlagged = flagged.has(id)
        // Ô nhập và nút cờ nằm cạnh nhau trong một span: nút cờ KHÔNG nằm trong
        // <label>/<form> nên bấm cờ không kích hoạt nhầm ô nhập.
        const label = c(`Đáp án câu ${sourceNumber}`, `Answer for question ${sourceNumber}`)
        return <span key={key} className="skill-inline-answer">
          {inlineOptions.length ? <select
            className="skill-inline-input"
            value={answers[id] ?? ''}
            onChange={event => onAnswer(id, event.target.value)}
            aria-label={label}
          >
            <option value="">{sourceNumber}</option>
            {inlineOptions.map(option => <option key={option.key} value={option.key}>{option.key}. {option.text}</option>)}
          </select> : <input
            className="skill-inline-input"
            type="text"
            value={answers[id] ?? ''}
            onChange={event => onAnswer(id, event.target.value)}
            aria-label={label}
            placeholder={`${sourceNumber} ________`}
          />}
          <button
            type="button"
            className={`skill-flag skill-flag-inline ${isFlagged ? 'is-active' : ''}`}
            onClick={() => onToggleFlag(id)}
            aria-pressed={isFlagged}
            aria-label={isFlagged ? c('Bỏ đánh dấu câu này', 'Remove the flag from this question') : c('Đánh dấu câu này để xem lại', 'Flag this question for review')}
          >
            <Flag size={13} />
          </button>
        </span>
      })}
    </div>}

    {cardQuestions.map(question => <QuestionCard
      key={question.id}
      question={question}
      number={numbers[question.id] ?? 0}
      value={sharedSlots ? group.questions.map(item => answers[item.id]).filter(Boolean).join(',') : answers[question.id] ?? ''}
      flagged={flagged.has(question.id)}
      instructionHtml={group.instructionHtml}
      groupAnswerCount={answerCount}
      onAnswer={value => {
        if (!sharedSlots) { onAnswer(question.id, value); return }
        const values = value.split(',').filter(Boolean)
        group.questions.forEach((item, index) => onAnswer(item.id, values[index] ?? ''))
      }}
      onToggleFlag={() => onToggleFlag(question.id)}
    />)}
  </section>
}
