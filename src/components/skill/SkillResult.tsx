import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useCopy } from '../../i18n'
import type { SkillGrade } from '../../lib/skillApi.ts'

/** Bảng kết quả chấm điểm do Edge Function trả về. */
export function SkillResult({ grade }: { grade: SkillGrade }) {
  const { c } = useCopy()
  const [expanded, setExpanded] = useState<number[]>([])
  const percent = grade.totalCount ? Math.round((grade.correctCount / grade.totalCount) * 100) : 0
  return <div className="skill-result">
    <section className="panel skill-result-summary">
      <p className="eyebrow">{c('KẾT QUẢ', 'RESULT')}</p>
      <h2>{grade.title}</h2>
      <p className="skill-result-score">{c('Đúng', 'Correct')}: {grade.correctCount}/{grade.totalCount} ({percent}%)</p>
      <p className="skill-result-band">{grade.band === null ? '—' : grade.band.toFixed(1)}</p>
    </section>
    <section className="panel">
      <h3>{c('Xem lại từng câu', 'Review each question')}</h3>
      <ol className="skill-result-list">
        {grade.results.map(item => <li key={item.order} className={item.isCorrect ? 'is-correct' : 'is-wrong'}>
          <span className="skill-result-icon" role="img" aria-label={item.isCorrect ? c('Đúng', 'Correct') : c('Sai', 'Incorrect')}>{item.isCorrect ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}</span>
          <div className="skill-result-item">
            <div className="skill-result-question-header">
              <p className="skill-result-prompt">{c(`Câu ${item.order}`, `Question ${item.order}`)}</p>
              <button type="button" className="button outline small" aria-expanded={expanded.includes(item.order)} aria-controls={`skill-explanation-${item.order}`} onClick={() => setExpanded(previous => previous.includes(item.order) ? previous.filter(order => order !== item.order) : [...previous, item.order])}>
                {expanded.includes(item.order) ? c('Ẩn giải thích', 'Hide explanation') : c('Hiện giải thích', 'Show explanation')}
              </button>
            </div>
            <p className="muted">{c('Bạn trả lời', 'Your answer')}: {item.userAnswer || c('(không trả lời)', '(no answer)')}</p>
            <p className="muted">{c('Đáp án đúng', 'Correct answer')}: {item.correctAnswer || c('(chưa có đáp án)', '(answer unavailable)')}</p>
            <p id={`skill-explanation-${item.order}`} className="skill-explanation" hidden={!expanded.includes(item.order)}>{item.explanation?.trim() || c('Câu này chưa có giải thích.', 'No explanation is available for this question yet.')}</p>
          </div>
        </li>)}
      </ol>
    </section>
  </div>
}
