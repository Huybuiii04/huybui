import { Check, X } from 'lucide-react'
import { useCopy } from '../../i18n'
import type { SkillGrade } from '../../lib/skillApi.ts'

/** Bảng kết quả chấm điểm do Edge Function trả về. */
export function SkillResult({ grade }: { grade: SkillGrade }) {
  const { c } = useCopy()
  const percent = grade.totalCount ? Math.round((grade.correctCount / grade.totalCount) * 100) : 0
  return <div className="skill-result">
    <section className="panel skill-result-summary">
      <p className="eyebrow">{c('KẾT QUẢ', 'RESULT')}</p>
      <h2>{grade.title}</h2>
      <p className="skill-result-band">{grade.band === null ? '—' : grade.band.toFixed(1)}</p>
      <p className="muted">{c('Đúng', 'Correct')}: {grade.correctCount}/{grade.totalCount} ({percent}%)</p>
    </section>
    <section className="panel">
      <h3>{c('Xem lại từng câu', 'Review each question')}</h3>
      <ol className="skill-result-list">
        {grade.results.map(item => <li key={item.order} className={item.isCorrect ? 'is-correct' : 'is-wrong'}>
          <span className="skill-result-icon">{item.isCorrect ? <Check size={16} /> : <X size={16} />}</span>
          <div>
            <p className="skill-result-prompt">{c(`Câu ${item.order}`, `Question ${item.order}`)}</p>
            <p className="muted">{c('Bạn trả lời', 'Your answer')}: {item.userAnswer || c('(không trả lời)', '(no answer)')}</p>
            {!item.isCorrect && <p className="muted">{c('Đáp án đúng', 'Correct answer')}: {item.correctAnswer}</p>}
            {item.explanation && <p className="skill-explanation">{item.explanation}</p>}
          </div>
        </li>)}
      </ol>
    </section>
  </div>
}
