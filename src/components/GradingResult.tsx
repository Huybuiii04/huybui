import { useState } from 'react'
import { CheckCircle2, CircleAlert, ListChecks, Sparkles, Target } from 'lucide-react'
import { useCopy } from '../i18n'
import { CRITERION_LABELS, CRITERION_SHORT, criteriaForTask, type GradingView, type TaskCheck } from '../lib/aiLogic.ts'

const CHECK_LABEL: Record<TaskCheck['status'], readonly [string, string]> = {
  met: ['Đạt', 'Met'],
  partial: ['Một phần', 'Partly met'],
  not_met: ['Chưa đạt', 'Not met'],
  not_applicable: ['Không áp dụng', 'Not applicable'],
}

/** Hiển thị kết quả chấm thật từ Edge Function (grading_results). */
export function GradingResult({ view, task }: { view: GradingView; task: string }) {
  const { c } = useCopy()
  const [open, setOpen] = useState<string | null>(null)
  const criteria = criteriaForTask(task)

  if (view.status === 'needs_reference') {
    return <div className="panel grading-panel"><span className="eyebrow">{c('CẦN THÊM DỮ LIỆU THAM CHIẾU', 'REFERENCE DATA NEEDED')}</span><h2>{c('Chưa đủ dữ liệu để chấm', 'Not enough data to assess')}</h2><p className="muted">{view.summary}</p>{view.missingReference.length > 0 && <ul className="grading-list">{view.missingReference.map(item => <li key={item}><CircleAlert size={15} />{item}</li>)}</ul>}</div>
  }

  return <div className="grading-result">
    <div className="score-summary">
      <div className="overall-score">
        <span>{c('BAND TỔNG', 'OVERALL BAND')}</span>
        <strong>{view.overallDisplay === null ? '—' : view.overallDisplay.toFixed(1)}</strong>
        <small>{view.overallRaw === null ? c('Chưa có điểm', 'No score yet') : c(`điểm thô ${view.overallRaw.toFixed(2)}`, `raw ${view.overallRaw.toFixed(2)}`)}</small>
      </div>
      <div className="criteria-grid">{criteria.map(criterion => {
        const score = view.scores[criterion]
        const percent = score === null || score === undefined ? 0 : Math.max(0, Math.min(100, (score / 9) * 100))
        return <div key={criterion}><span className="badge teal">{CRITERION_SHORT[criterion]}</span><strong>{score === null || score === undefined ? '—' : score.toFixed(1)}</strong><p>{c(...CRITERION_LABELS[criterion])}</p><div className="score-bar"><span style={{ width: `${percent}%` }} /></div></div>
      })}</div>
    </div>

    {view.summary && <div className="panel grading-panel"><span className="eyebrow">{c('TỔNG QUAN', 'OVERVIEW')}</span><p className="grading-summary">{view.summary}</p></div>}

    <div className="grading-columns">
      <section className="panel grading-panel">
        <span className="eyebrow"><Sparkles size={14} />{c('ĐIỂM MẠNH', 'STRENGTHS')}</span>
        {view.strengths.length ? <ul className="grading-list">{view.strengths.map(item => <li key={item}><CheckCircle2 size={15} />{item}</li>)}</ul> : <p className="muted">{c('Chưa có điểm mạnh nào được ghi nhận.', 'No strengths were recorded yet.')}</p>}
      </section>
      <section className="panel grading-panel">
        <span className="eyebrow"><Target size={14} />{c('VIỆC NÊN LÀM TIẾP', 'PRIORITY ACTIONS')}</span>
        {view.priorityActions.length ? <ol className="grading-list">{view.priorityActions.map(item => <li key={item}><span className="grading-index">{view.priorityActions.indexOf(item) + 1}</span>{item}</li>)}</ol> : <p className="muted">{c('Chưa có gợi ý nào.', 'No suggestions yet.')}</p>}
      </section>
    </div>

    {view.taskChecks.length > 0 && <section className="panel grading-panel"><span className="eyebrow"><ListChecks size={14} />{c('KIỂM TRA YÊU CẦU ĐỀ', 'TASK REQUIREMENT CHECK')}</span><ul className="grading-list">{view.taskChecks.map((check, index) => <li key={`${check.requirement}-${index}`}><span className={`badge ${check.status === 'met' ? 'teal' : check.status === 'partial' ? 'warm' : 'neutral'}`}>{c(...CHECK_LABEL[check.status])}</span><span><strong>{check.requirement}</strong>{check.note && <em>{check.note}</em>}</span></li>)}</ul></section>}

    <section className="panel grading-panel">
      <span className="eyebrow">{c('CHI TIẾT TỪNG TIÊU CHÍ', 'CRITERION BY CRITERION')}</span>
      <div className="grading-criteria">
        {criteria.map(criterion => {
          const detail = view.criteria[criterion]
          if (!detail) return null
          const expanded = open === criterion
          return <article key={criterion} className="grading-criterion">
            <button className="grading-criterion-head" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : criterion)}>
              <span className="badge teal">{CRITERION_SHORT[criterion]}</span>
              <span className="grading-criterion-title"><strong>{c(...CRITERION_LABELS[criterion])}</strong><em>{detail.rationale}</em></span>
              <span className="grading-criterion-score">{detail.score.toFixed(1)}</span>
            </button>
            {expanded && <div className="grading-criterion-body">
              {detail.evidence.length > 0 && <div><span className="eyebrow">{c('DẪN CHỨNG TRONG BÀI', 'EVIDENCE FROM YOUR WRITING')}</span><ul className="grading-list">{detail.evidence.map(item => <li key={item}><CheckCircle2 size={15} />{item}</li>)}</ul></div>}
              {detail.improvements.length > 0 && <div><span className="eyebrow">{c('CẢI THIỆN ĐỀ XUẤT', 'SUGGESTED IMPROVEMENTS')}</span><ul className="grading-list">{detail.improvements.map(item => <li key={item}><CircleAlert size={15} />{item}</li>)}</ul></div>}
            </div>}
          </article>
        })}
      </div>
    </section>

    {view.model && <p className="helper-text">{c(`Kết quả bằng mô hình ${view.model}.`, `Produced with model ${view.model}.`)}</p>}
  </div>
}
