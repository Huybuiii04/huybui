import { useMemo } from 'react'
import { useCopy } from '../../i18n'
import { sanitizeHtml, splitHtmlByBlanks, type SkillQuestionGroup } from '../../lib/skillLogic.ts'
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
  const instruction = useMemo(() => sanitizeHtml(group.instructionHtml), [group.instructionHtml])
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
    : group.questions

  return <section className="skill-group">
    {instruction && <div className="skill-group-instruction" dangerouslySetInnerHTML={{ __html: instruction }} />}

    {useInline && <div className="skill-completion">
      {segments.map((segment, index) => {
        if (segment.kind === 'html') return <span key={index} dangerouslySetInnerHTML={{ __html: segment.html }} />
        const id = blankIdByNumber[segment.sourceNumber] ?? ''
        // Chỗ trống không thuộc nhóm này (số câu trùng với nhóm khác của passage)
        // thì để nguyên dạng chữ, nhóm sở hữu câu đó sẽ vẽ ô nhập.
        if (!id) return <span key={index} className="skill-inline-input">{segment.sourceNumber}</span>
        return <input
          key={index}
          className="skill-inline-input"
          type="text"
          value={answers[id] ?? ''}
          onChange={event => onAnswer(id, event.target.value)}
          aria-label={c(`Đáp án câu ${segment.sourceNumber}`, `Answer for question ${segment.sourceNumber}`)}
          placeholder="________"
        />
      })}
    </div>}

    {cardQuestions.map(question => <QuestionCard
      key={question.id}
      question={question}
      number={numbers[question.id] ?? 0}
      value={answers[question.id] ?? ''}
      flagged={flagged.has(question.id)}
      onAnswer={value => onAnswer(question.id, value)}
      onToggleFlag={() => onToggleFlag(question.id)}
    />)}
  </section>
}
