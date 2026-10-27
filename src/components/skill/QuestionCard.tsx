import { Flag } from 'lucide-react'
import { useCopy } from '../../i18n'
import {
  isMatchingDisplayType,
  isPlaceholderPrompt,
  multiAnswerCount,
  type SkillOption,
  type SkillQuestion,
} from '../../lib/skillLogic.ts'

const TFNG_OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'] as const
const YNNG_OPTIONS = ['YES', 'NO', 'NOT GIVEN'] as const

/**
 * Nhãn hiển thị của một lựa chọn: "A. nội dung", hoặc chỉ "A" khi nội dung
 * chính là nhãn (option dạng chữ cái trần của câu matching).
 */
function optionLabel(option: SkillOption): string {
  return option.text === option.key ? option.key : `${option.key}. ${option.text}`
}

/**
 * Một câu hỏi dạng thẻ: số câu, đề bài, cờ đánh dấu và ô trả lời theo `question.type`.
 * Dùng cho mọi dạng không có chỗ trống nằm sẵn trong HTML của nhóm.
 *
 * `instructionHtml` là hướng dẫn của nhóm: một số nhóm chỉ nói số đáp án cần
 * chọn ở hướng dẫn ("Choose TWO correct answers") chứ không nói ở từng câu.
 * `groupAnswerCount` là số đáp án của nhóm, dùng cho câu bị mất đề bài.
 */
export function QuestionCard({
  question,
  number,
  value,
  flagged,
  instructionHtml,
  groupAnswerCount,
  onAnswer,
  onToggleFlag,
}: {
  question: SkillQuestion
  number: number
  value: string
  flagged: boolean
  instructionHtml: string
  groupAnswerCount: number
  onAnswer: (value: string) => void
  onToggleFlag: () => void
}) {
  const { c } = useCopy()
  const selected = value ?? ''
  const chips = question.type === 'ynng' ? YNNG_OPTIONS : TFNG_OPTIONS

  /**
   * Số đáp án của câu: đề bài trước, hướng dẫn nhóm sau; câu mất đề bài
   * ("Question 12") thì mượn số đáp án của nhóm.
   */
  const answerCount = multiAnswerCount(question.prompt, instructionHtml)
    || (isPlaceholderPrompt(question.prompt) ? groupAnswerCount : 0)
  const isMultiAnswer = question.type === 'mcq' && answerCount > 1
  const selectedKeys = isMultiAnswer
    ? selected.split(',').map(key => key.trim()).filter(Boolean)
    : []

  /** Bật/tắt một đáp án của câu nhiều đáp án; lưu dạng "A,C" (đã sắp xếp). */
  const toggleKey = (key: string) => {
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter(item => item !== key)
      : [...selectedKeys, key]
    onAnswer(next.sort().join(','))
  }

  // Nhóm matching: câu phải chọn trong danh sách đã có, kể cả câu bị ghi
  // nhầm kiểu `fill` (41 câu matching-heading trong dữ liệu gốc).
  const showSelect = isMatchingDisplayType(question.displayType) && question.options.length > 0
  const showText = !showSelect && (question.type === 'fill' || question.type === 'matching')

  return <article className="skill-question" id={`question-${number}`}>
    <header className="skill-question-head">
      <span className={`skill-question-number ${selected ? 'is-answered' : ''}`}>{number}</span>
      <div className="skill-question-text">
        {question.prompt && <p className="skill-question-prompt">{question.prompt}</p>}
        {isMultiAnswer && <p className="skill-question-hint">{c(`Chọn ${answerCount} đáp án`, `Select ${answerCount} answers`)}</p>}
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
      {question.options.map(option => isMultiAnswer
        ? <label key={option.key} className={`skill-option ${selectedKeys.includes(option.key) ? 'is-selected' : ''}`}>
          <input
            type="checkbox"
            name={`question-${number}`}
            value={option.key}
            checked={selectedKeys.includes(option.key)}
            disabled={!selectedKeys.includes(option.key) && selectedKeys.length >= answerCount}
            onChange={() => toggleKey(option.key)}
          />
          <span><strong>{option.key}.</strong>{option.text === option.key ? '' : ` ${option.text}`}</span>
        </label>
        : <label key={option.key} className={`skill-option ${selected === option.key ? 'is-selected' : ''}`}>
          <input type="radio" name={`question-${number}`} value={option.key} checked={selected === option.key} onChange={() => onAnswer(option.key)} />
          <span><strong>{option.key}.</strong>{option.text === option.key ? '' : ` ${option.text}`}</span>
        </label>)}
    </div>}

    {showSelect && <div className="skill-options">
      <label className={`skill-option ${selected ? 'is-selected' : ''}`}>
        <select value={selected} onChange={event => onAnswer(event.target.value)} aria-label={c('Chọn đáp án', 'Choose an answer')}>
          <option value="">{c('— Chọn đáp án —', '— Choose an answer —')}</option>
          {question.options.map(option => <option key={option.key} value={option.key}>{optionLabel(option)}</option>)}
        </select>
      </label>
    </div>}

    {showText && <div className="skill-fill">
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
