import { Flag } from 'lucide-react'
import { useCopy } from '../../i18n'
import type { SkillQuestion } from '../../lib/skillLogic.ts'

const TFNG_OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'] as const
const YNNG_OPTIONS = ['YES', 'NO', 'NOT GIVEN'] as const

/**
 * Một câu hỏi dạng thẻ: số câu, đề bài, cờ đánh dấu và ô trả lời theo `question.type`.
 * Dùng cho mọi dạng không có chỗ trống nằm sẵn trong HTML của nhóm.
 */
export function QuestionCard({
  question,
  number,
  value,
  flagged,
  onAnswer,
  onToggleFlag,
}: {
  question: SkillQuestion
  number: number
  value: string
  flagged: boolean
  onAnswer: (value: string) => void
  onToggleFlag: () => void
}) {
  const { c } = useCopy()
  const selected = value ?? ''
  const chips = question.type === 'ynng' ? YNNG_OPTIONS : TFNG_OPTIONS
  return <article className="skill-question" id={`question-${number}`}>
    <header className="skill-question-head">
      <span className={`skill-question-number ${selected ? 'is-answered' : ''}`}>{number}</span>
      <div className="skill-question-text">
        {question.prompt && <p className="skill-question-prompt">{question.prompt}</p>}
      </div>
      <button
        type="button"
        className={`skill-flag ${flagged ? 'is-active' : ''}`}
        onClick={onToggleFlag}
        aria-pressed={flagged}
        aria-label={flagged ? c('Bỏ đánh dấu câu này', 'Remove the flag from this question') : c('Đánh dấu câu này để xem lại', 'Flag this question for review')}
      >
        <Flag size={16} />
      </button>
    </header>

    {(question.type === 'tfng' || question.type === 'ynng') && <div className="skill-tfng">
      {chips.map(option => <button
        key={option}
        type="button"
        className={`skill-chip ${selected === option ? 'is-selected' : ''}`}
        onClick={() => onAnswer(option)}
      >{option}</button>)}
    </div>}

    {question.type === 'mcq' && <div className="skill-options">
      {question.options.map(option => <label key={option.key} className={`skill-option ${selected === option.key ? 'is-selected' : ''}`}>
        <input type="radio" name={`question-${number}`} value={option.key} checked={selected === option.key} onChange={() => onAnswer(option.key)} />
        <span><strong>{option.key}.</strong> {option.text}</span>
      </label>)}
    </div>}

    {question.type === 'matching' && <div className="skill-options">
      <label className={`skill-option ${selected ? 'is-selected' : ''}`}>
        <select value={selected} onChange={event => onAnswer(event.target.value)} aria-label={c('Chọn đáp án', 'Choose an answer')}>
          <option value="">{c('— Chọn đáp án —', '— Choose an answer —')}</option>
          {question.options.map(option => <option key={option.key} value={option.key}>{option.key}. {option.text}</option>)}
        </select>
      </label>
    </div>}

    {question.type === 'fill' && <div className="skill-fill">
      <input
        type="text"
        value={selected}
        onChange={event => onAnswer(event.target.value)}
        placeholder={c('Nhập đáp án của bạn', 'Type your answer')}
        aria-label={c('Đáp án câu', 'Your answer')}
      />
    </div>}
  </article>
}
