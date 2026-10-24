import { useState } from 'react'
import { BookMarked, CheckCircle2, CircleAlert, Lightbulb, ListChecks, Route, Sparkles, Target, TriangleAlert } from 'lucide-react'
import { useCopy } from '../i18n'
import { CRITERION_LABELS, CRITERION_SHORT, criteriaForTask, type CriterionName, type ErrorLogEntry, type EssayFeatures, type GradingView, type TaskCheck } from '../lib/aiLogic.ts'
import { VocabularyCardDialog, type NewCardValues } from './VocabularyCardDialog'

const CHECK_LABEL: Record<TaskCheck['status'], readonly [string, string]> = {
  met: ['Đạt', 'Met'],
  partial: ['Một phần', 'Partly met'],
  not_met: ['Chưa đạt', 'Not met'],
  not_applicable: ['Không áp dụng', 'Not applicable'],
}

type CardDraft = Pick<NewCardValues, 'term' | 'meaning' | 'example' | 'kind'>

/** Nhãn tiêu chí; trả về chính chuỗi gốc nếu không phải tiêu chí đã biết. */
function criterionLabel(value: string): string {
  return value in CRITERION_SHORT ? CRITERION_SHORT[value as CriterionName] : value
}

/** Hiển thị kết quả chấm thật từ Edge Function (grading_results) + phản hồi sâu (essay_features). */
export function GradingResult({
  view,
  task,
  features,
  errors,
  onAddCard,
}: {
  view: GradingView
  task: string
  features?: EssayFeatures | null
  errors?: ErrorLogEntry[]
  onAddCard?: (card: CardDraft) => Promise<void> | void
}) {
  const { c } = useCopy()
  const [open, setOpen] = useState<string | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [savedNotice, setSavedNotice] = useState('')
  const criteria = criteriaForTask(task)

  const errorList = errors && errors.length
    ? errors
    : (features?.grammar ?? []).map(item => ({
      id: `grammar-${item.error}`,
      criterion: 'grammatical_range',
      category: 'grammar',
      quote: item.error,
      correction: item.correction,
      explanation: '',
      skillTags: [] as string[],
    }))
  const unnatural = features?.unnatural ?? []
  const bandSteps = features?.bandPlan.steps ?? []
  const targetBand = features?.bandPlan.targetBand ?? null
  const lexical = features?.lexical ?? []
  const words = features?.vocabularyPlan.words ?? []
  const paragraphs = features?.structure ?? []

  async function save(card: CardDraft) {
    await onAddCard?.(card)
    setSavedNotice(card.term)
  }

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

    {errorList.length > 0 && <details className="panel grading-panel feedback-block" open>
      <summary><span className="eyebrow"><TriangleAlert size={14} />{c('LỖI SAI CẦN SỬA', 'MISTAKES TO FIX')}</span><strong>{errorList.length}</strong></summary>
      <ul className="grading-list">{errorList.map((item, index) => <li key={`${item.id}-${index}`} className="error-item">
        <span className="error-quote">{item.quote}</span>
        <span className="error-correction">{item.correction}</span>
        {item.explanation && <em>{item.explanation}</em>}
        <span className="error-meta">{item.category}{item.criterion ? ` · ${criterionLabel(item.criterion)}` : ''}</span>
        {onAddCard && <button className="button outline small" onClick={() => void save({ term: item.quote, meaning: item.correction, example: item.explanation, kind: 'error' })}>{c('Lưu vào sổ lỗi sai', 'Save to error log')}</button>}
      </li>)}</ul>
    </details>}

    {bandSteps.length > 0 && <details className="panel grading-panel feedback-block" open>
      <summary><span className="eyebrow"><Route size={14} />{targetBand ? c(`LỘ TRÌNH LÊN BAND ${targetBand.toFixed(1)}`, `PLAN FOR BAND ${targetBand.toFixed(1)}`) : c('LỘ TRÌNH LÊN BAND', 'BAND IMPROVEMENT PLAN')}</span><strong>{bandSteps.length}</strong></summary>
      <ol className="grading-list">{bandSteps.map((step, index) => <li key={`${step.title}-${index}`} className="band-step">
        <span className="grading-index">{index + 1}</span>
        <span><strong>{step.title}</strong><em>{step.detail}</em>{step.expectedGain && <span className="error-meta">{step.expectedGain}</span>}</span>
      </li>)}</ol>
    </details>}

    {unnatural.length > 0 && <details className="panel grading-panel feedback-block">
      <summary><span className="eyebrow"><CircleAlert size={14} />{c('ĐIỂM CHƯA HỢP LÝ', 'UNNATURAL OR UNSUPPORTED')}</span><strong>{unnatural.length}</strong></summary>
      <ul className="grading-list">{unnatural.map((item, index) => <li key={`${item.quote}-${index}`} className="error-item">
        <span className="error-quote">{item.quote}</span>
        <em>{item.issue}</em>
        {item.suggestion && <span className="error-correction">{item.suggestion}</span>}
        <span className={`badge ${item.severity === 'major' ? 'warm' : 'neutral'}`}>{item.severity === 'major' ? c('Cần sửa', 'Needs fixing') : c('Nhỏ', 'Minor')}</span>
      </li>)}</ul>
    </details>}

    {(lexical.length > 0 || words.length > 0) && <details className="panel grading-panel feedback-block">
      <summary><span className="eyebrow"><BookMarked size={14} />{c('TỪ VỰNG NÂNG CAO', 'VOCABULARY TO LEVEL UP')}</span><strong>{lexical.length + words.length}</strong></summary>
      {lexical.length > 0 && <div className="vocab-suggestions"><span className="eyebrow">{c('NÂNG CẤP TỪ ĐANG DÙNG', 'UPGRADE THE WORDS YOU USED')}</span>
        <ul className="grading-list">{lexical.map((item, index) => <li key={`${item.term}-${index}`} className="vocab-item">
          <span><strong>{item.term}</strong>{item.meaning && <em>{item.meaning}</em>}{item.evidence && <span className="error-quote">{item.evidence}</span>}</span>
          <span className="error-correction">{item.correction}</span>
          {onAddCard && <button className="button outline small" onClick={() => void save({ term: item.term, meaning: item.correction, example: item.evidence, kind: 'vocabulary' })}>{c('Lưu vào sổ từ vựng', 'Save to word list')}</button>}
        </li>)}</ul>
      </div>}
      {words.length > 0 && <div className="vocab-suggestions"><span className="eyebrow">{features?.vocabularyPlan.topic ? c(`TỪ VỰNG NÊN HỌC — ${features.vocabularyPlan.topic}`, `WORDS TO STUDY — ${features.vocabularyPlan.topic}`) : c('TỪ VỰNG NÊN HỌC', 'WORDS TO STUDY')}</span>
        <ul className="grading-list">{words.map((item, index) => <li key={`${item.word}-${index}`} className="vocab-item">
          <span><strong>{item.word}</strong>{item.meaning && <em>{item.meaning}</em>}{item.example && <span className="error-quote">{item.example}</span>}{item.why && <em>{item.why}</em>}</span>
          {onAddCard && <button className="button outline small" onClick={() => void save({ term: item.word, meaning: item.meaning, example: item.example, kind: 'vocabulary' })}>{c('Lưu vào sổ từ vựng', 'Save to word list')}</button>}
        </li>)}</ul>
      </div>}
      {onAddCard && <div className="feedback-block-actions"><button className="button outline full" onClick={() => setManualOpen(true)}><Lightbulb size={16} />{c('+ Thêm từ của tôi', '+ Add my own word')}</button></div>}
      {savedNotice && <p className="text-teal" role="status">{c(`Đã lưu "${savedNotice}" vào sổ từ vựng.`, `Saved "${savedNotice}" to your word list.`)}</p>}
      <VocabularyCardDialog open={manualOpen} onClose={() => setManualOpen(false)} onSave={async values => { await onAddCard?.(values); setManualOpen(false) }} />
    </details>}

    {paragraphs.length > 0 && <details className="panel grading-panel feedback-block">
      <summary><span className="eyebrow"><ListChecks size={14} />{c('CẤU TRÚC BÀI', 'ESSAY STRUCTURE')}</span><strong>{paragraphs.length}</strong></summary>
      <ul className="grading-list">{paragraphs.map((paragraph, index) => <li key={`${paragraph.index}-${index}`} className="structure-item">
        <span className="grading-index">{paragraph.index + 1}</span>
        <span><strong>{paragraph.role}</strong><em>{paragraph.summary}</em>{paragraph.linkToNext && <em className="structure-link">{paragraph.linkToNext}</em>}</span>
      </li>)}</ul>
    </details>}

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
