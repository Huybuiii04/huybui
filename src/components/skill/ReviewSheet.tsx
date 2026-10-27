import { useCopy } from '../../i18n'

/** Lưới rà soát câu trả lời: bấm vào ô là nhảy tới câu tương ứng. */
export function ReviewSheet({
  questions,
  numbers,
  answers,
  flagged,
  onJump,
}: {
  questions: { id: string }[]
  numbers: Record<string, number>
  answers: Record<string, string>
  flagged: Set<string>
  onJump: (number: number) => void
}) {
  const { c } = useCopy()
  return <div className="skill-review">
    <div className="skill-review-grid">
      {questions.map(question => {
        const number = numbers[question.id] ?? 0
        const answered = Boolean(answers[question.id]?.trim())
        const isFlagged = flagged.has(question.id)
        const state = isFlagged ? 'flagged' : answered ? 'answered' : 'empty'
        return <button
          key={question.id}
          type="button"
          className={`skill-review-cell is-${state}`}
          onClick={() => onJump(number)}
          aria-label={c(`Câu ${number}`, `Question ${number}`)}
        >{number}</button>
      })}
    </div>
    <ul className="skill-review-legend">
      <li><span className="is-answered" />{c('Đã trả lời', 'Answered')}</li>
      <li><span className="is-flagged" />{c('Đã gắn cờ', 'Flagged')}</li>
      <li><span className="is-empty" />{c('Chưa trả lời', 'Unanswered')}</li>
    </ul>
  </div>
}
