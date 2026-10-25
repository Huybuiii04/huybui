import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowRight, BookMarked, Check, ChevronRight, FileText, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore, type Draft } from '../lib/store'
import { Empty, Notice, PageHeader } from '../components/ui'
import { countWords } from '../lib/learning'
import { entries } from '../data/content'
import { GradingResult } from '../components/GradingResult'
import { fetchLatestGrading } from '../lib/ai.ts'
import { fetchEssayFeatures, fetchErrorLogs, fetchLatestRevisionId } from '../lib/featuresRepository'
import { sampleFeatures, sampleErrors } from '../data/sampleFeatures'
import type { ErrorLogEntry, EssayFeatures, GradingView } from '../lib/aiLogic.ts'

/** Kết quả chấm minh họa cho trang demo — không phải điểm giám khảo. */
const demoGradingView: GradingView = {
  status: 'ok',
  overallDisplay: 6,
  overallRaw: 6.17,
  scores: { task_response: 6, coherence_ability: 6, lexical_resource: 6.5, grammatical_range: 5.5 },
  criteria: {},
  summary: 'A clear position and a readable structure, but the counter-argument is thin and two key words stay vague.',
  strengths: ['The position is stated clearly in the introduction.'],
  priorityActions: ['Develop the counter-argument with one concrete example.'],
  taskChecks: [{ requirement: 'Answer both parts of the question', status: 'partial', note: 'The second part is only implied.' }],
  missingReference: [],
  model: 'sample',
  createdAt: null,
}

/** Phần thân của trang kết quả: bài viết của bạn + thẻ lưu từ vựng. */
function EssayBody({ draft, tab, setTab, addCard, saved, setSaved }: { draft: Draft; tab: string; setTab: (value: string) => void; addCard: (card: { term: string; meaning: string; example: string; kind: 'vocabulary' | 'structure' | 'error' }) => Promise<void>; saved: boolean; setSaved: (value: boolean) => void }) {
  const { c } = useCopy()
  const paragraphs = draft.text.split('\n\n').filter(Boolean)
  return <><div className="tabs">{[['overview', c('Tổng quan', 'Overview')], ['detail', c('Sửa chi tiết', 'Detailed feedback')], ['vocabulary', c('Từ vựng', 'Vocabulary')], ['plan', c('Kế hoạch cải thiện', 'Action plan')]].map(([value, label]) => <button className={tab === value ? 'active' : ''} key={value} onClick={() => setTab(value)} aria-pressed={tab === value}>{label}</button>)}</div><div className="feedback-grid"><article className="panel prose"><span className="eyebrow">{c('BÀI VIẾT CỦA BẠN', 'YOUR ESSAY')}</span><h2>{draft.title || c('Bài viết chưa đặt tên', 'Untitled draft')}</h2>{paragraphs.length ? paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="muted">{c('Bài viết còn trống.', 'This essay is still empty.')}</p>}</article><aside className="panel feedback-panel"><span className="badge teal"><Sparkles size={14} />{c('BÀI VIẾT CỦA BẠN', 'YOUR ESSAY')}</span>{tab === 'overview' && <><h2>{c('Đề bài', 'Your task')}</h2><p>{draft.prompt || c('Chưa có đề bài.', 'No prompt yet.')}</p>{draft.reference && <><h3>{c('Dữ liệu tham chiếu', 'Reference data')}</h3><p>{draft.reference}</p></>}<small className="muted">{countWords(draft.text)} {c('từ', 'words')}</small></>}{tab === 'detail' && <><h2>{c('Chi tiết bài viết', 'Essay details')}</h2><p>{c('Dùng phần nhận xét theo từng tiêu chí ở trên để chỉnh từng đoạn.', 'Use the criterion-by-criterion feedback above to revise each paragraph.')}</p></>}{tab === 'vocabulary' && <><h2>{c('Lưu cụm từ hay', 'Save a useful phrase')}</h2><p>{c('Thêm một cụm từ đắt giá từ bài của bạn vào sổ từ để ôn lại sau.', 'Add a valuable phrase from your essay to your word list for later review.')}</p><button className="button primary" onClick={() => void addCard({ term: draft.title || c('Cụm từ của tôi', 'My phrase'), meaning: c('Cụm từ từ bài viết', 'Phrase from my essay'), example: draft.text.slice(0, 140), kind: 'vocabulary' }).then(() => setSaved(true)).catch(() => {})}>{saved ? <Check size={17} /> : <BookMarked size={17} />}{saved ? c('Đã lưu', 'Saved') : c('Lưu vào sổ từ', 'Save phrase')}</button></>}{tab === 'plan' && <><h2>{c('Một mục tiêu cho bài tiếp theo', 'One goal for your next essay')}</h2><p>{c('Chọn một luận điểm. Viết thêm hai câu giải thích cơ chế và một ví dụ cụ thể.', 'Choose one point. Add two sentences explaining the mechanism and one concrete example.')}</p><Link className="text-link" to="/app/prompts">{c('Xem đề để luyện', 'Pick a task to practise')}<ArrowRight size={16} /></Link></>}</aside></div></>
}

export function Essays() {
  const { c, language } = useCopy()
  const { state, removeDraft } = useStore()
  const [search, setSearch] = useState('')
  const [task, setTask] = useState('all')
  const filtered = state.drafts.filter(draft => (task === 'all' || draft.task === task) && `${draft.title} ${draft.prompt}`.toLowerCase().includes(search.toLowerCase()))
  return <><PageHeader eyebrow={c('HÀNH TRÌNH QUA TỪNG BÀI VIẾT', 'YOUR JOURNEY, ONE ESSAY AT A TIME')} title={c('Bài viết của tôi', 'My writing')} description={c('Mỗi bản nháp là một cơ hội để tiến bộ.', 'Every draft is a chance to grow.')} action={<Link className="button primary" to="/app/write"><Plus size={18} />{c('Viết bài mới', 'New essay')}</Link>} /><div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm bài viết', 'Search essays')} placeholder={c('Tìm bài viết…', 'Search essays…')} value={search} onChange={event => setSearch(event.target.value)} /></div><select aria-label={c('Lọc loại bài', 'Filter task')} value={task} onChange={event => setTask(event.target.value)}><option value="all">{c('Tất cả dạng bài', 'All tasks')}</option><option value="task2">Task 2</option><option value="academic_task1">Task 1 Academic</option><option value="general_task1">Task 1 General</option></select></div><div className="panel">{filtered.length ? filtered.map(draft => <div className="essay-row" key={draft.id}><span className="file-icon"><FileText size={23} /></span><Link to={`/app/write?id=${draft.id}`} className="essay-row-main"><strong>{draft.title || c('Bài viết chưa đặt tên', 'Untitled draft')}</strong><p>{draft.prompt || c('Chưa có đề bài', 'No prompt yet')}</p><small>{draft.task === 'task2' ? 'Task 2' : draft.task === 'academic_task1' ? 'Task 1 Academic' : 'Task 1 General'} · {countWords(draft.text)} {c('từ', 'words')} · {new Date(draft.updatedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB')}</small></Link><span className="badge neutral">{c('Nháp', 'Draft')}</span><Link className="text-link" to={`/app/essays/${draft.id}`}>{c('Xem kết quả', 'View feedback')}<ChevronRight size={15} /></Link><button className="icon-button danger-text" aria-label={c('Xóa bài viết', 'Delete essay')} onClick={() => { if (window.confirm(c('Xóa bản nháp này và ảnh đính kèm khỏi trình duyệt?', 'Delete this draft and its images from this browser?'))) void removeDraft(draft.id).catch(() => {}) }}><Trash2 size={18} /></button></div>) : <Empty title={c('Chưa có bài viết phù hợp', 'No essays here yet')} description={c('Bắt đầu một bản nháp mới và để ý tưởng dẫn đường.', 'Start a fresh draft and let your ideas lead the way.')} action={<Link className="button primary" to="/app/write">{c('Mở trang viết', 'Open writing space')}<ArrowRight size={16} /></Link>} />}</div><div className="demo-callout"><Sparkles size={22} /><div><strong>{c('Bạn muốn xem trước giao diện chấm bài?', 'Curious about the feedback experience?')}</strong><p>{c('Khám phá một kết quả minh họa, tách biệt với bài viết của bạn.', 'Explore an illustrative result, separate from your own writing.')}</p></div><Link className="button outline" to="/app/essays/demo">{c('Xem minh họa', 'View example')}<ArrowRight size={16} /></Link></div></>
}
export function EssayDetail() {
  const { id } = useParams()
  const { c } = useCopy()
  const { state, addCard, remoteRef } = useStore()
  const [tab, setTab] = useState('overview')
  const [saved, setSaved] = useState(false)
  const [grading, setGrading] = useState<GradingView | null>(null)
  const [features, setFeatures] = useState<EssayFeatures | null>(null)
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const draft = id === 'demo' ? undefined : state.drafts.find(item => item.id === id)
  useEffect(() => {
    if (!draft) return
    const ref = remoteRef(draft.id)
    if (!ref) return
    let active = true
    setLoading(true)
    void fetchLatestGrading(ref.essayId, draft.task).then(view => { if (active) { setGrading(view); setLoading(false) } })
    void fetchLatestRevisionId(ref.essayId).then(async revisionId => {
      if (!revisionId || !active) return
      const [loadedFeatures, loadedErrors] = await Promise.all([fetchEssayFeatures(revisionId), fetchErrorLogs(revisionId)])
      if (!active) return
      setFeatures(loadedFeatures)
      setErrorLogs(loadedErrors)
    })
    return () => { active = false }
  }, [draft?.id, draft?.task, state.drafts.length])
  if (id !== 'demo') {
    if (loading) return <Empty title={c('Đang tải kết quả…', 'Loading feedback…')} description={c('Kết quả chấm gần nhất sẽ hiện ở đây.', 'Your latest assessment will appear here.')} />
    if (draft && grading) return <><PageHeader eyebrow={c('KẾT QUẢ CHẤM', 'ASSESSMENT RESULT')} title={draft.title || c('Bài viết của tôi', 'My essay')} description={c('Điểm và nhận xét do AI chấm theo bốn tiêu chí IELTS Writing.', 'Scores and comments from the four IELTS Writing criteria.')} action={<Link className="button outline" to={`/app/write?id=${draft.id}`}>{c('Tiếp tục viết', 'Keep writing')}<ArrowRight size={16} /></Link>} /><GradingResult view={grading} task={draft.task} features={features} errors={errorLogs} onAddCard={addCard} /><EssayBody draft={draft} tab={tab} setTab={setTab} addCard={addCard} saved={saved} setSaved={setSaved} /></>
    return <Empty title={draft ? c('Bài chưa có kết quả chấm', 'This essay has no assessment yet') : c('Không tìm thấy bài viết', 'Essay not found')} description={c('Mở bài viết và bấm "Chấm bài" để nhận nhận xét từ AI.', 'Open the essay and use "Get feedback" to receive AI comments.')} action={<Link className="button primary" to={draft ? `/app/write?id=${draft.id}` : '/app/essays'}>{c('Quay lại bài viết', 'Back to writing')}</Link>} />
  }
  const sample = entries.find(item => item.kind === 'sample')!
  return <><PageHeader eyebrow={c('VIẾT TASK 2', 'WRITING TASK 2')} title={c('Không gian xanh trong đô thị', 'Making room for greener cities')} description={c('Giao diện kết quả minh họa · Không phải kết quả gọi AI', 'Illustrative feedback interface · Not an AI assessment result')} action={<Link to="/app/write" className="button outline">{c('Tự viết một bài', 'Write your own')}<ArrowRight size={16} /></Link>} /><Notice>{c('Tất cả điểm và nhận xét bên dưới là dữ liệu minh họa UI, không phải điểm giám khảo hoặc kết quả chấm bài của bạn.', 'All scores and comments below are UI demonstration data, not examiner scores or an assessment of your work.')}</Notice><GradingResult view={demoGradingView} task="task2" features={sampleFeatures} errors={sampleErrors} onAddCard={addCard} /><div className="tabs">{[['overview', c('Tổng quan', 'Overview')], ['detail', c('Sửa chi tiết', 'Detailed feedback')], ['structure', c('Cấu trúc', 'Structure')], ['vocabulary', c('Từ vựng', 'Vocabulary')], ['plan', c('Kế hoạch cải thiện', 'Action plan')]].map(([value, label]) => <button className={tab === value ? 'active' : ''} key={value} onClick={() => setTab(value)} aria-pressed={tab === value}>{label}</button>)}</div><div className="feedback-grid"><article className="panel prose"><span className="eyebrow">{c('BÀI MẪU TỰ BIÊN SOẠN', 'ORIGINAL SAMPLE ESSAY')}</span><h2>{c(...sample.title)}</h2>{c(...sample.body).split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}</article><aside className="panel feedback-panel"><span className="badge teal"><Sparkles size={14} />{c('NHẬN XÉT MINH HỌA', 'EXAMPLE FEEDBACK')}</span>{tab === 'overview' && <><h2>{c('Lập trường rõ, ví dụ có mục đích.', 'A clear position, purposeful examples.')}</h2><p>{c('Bài viết nhất quán trong quan điểm ưu tiên công viên. Ví dụ gia đình ở căn hộ nhỏ làm rõ lợi ích tiếp cận không gian công cộng.', 'The essay consistently prioritises parks. The example of a family in a small apartment makes the access argument concrete.')}</p><div className="feedback-good"><Check size={18} /><div><strong>{c('Điểm mạnh', 'A strength')}</strong><p>{c('Phản biện được xử lý ở đoạn về vai trò của trung tâm thương mại.', 'The paragraph about retail facilities acknowledges the opposing view.')}</p></div></div><h3>{c('Bước tiếp theo', 'A next step')}</h3><p>{c('Thử phát triển ví dụ về duy trì công viên để làm rõ điều kiện cho lợi ích môi trường.', 'Develop an example of park maintenance to clarify when environmental benefits are achieved.')}</p></>}{tab === 'detail' && <><h2>{c('Từ nhận định đến giải thích', 'From a claim to an explanation')}</h2><blockquote>“These benefits depend on thoughtful design and regular maintenance”</blockquote><p>{c('Câu này xác định điều kiện cần thiết, giúp tránh khẳng định quá mức. Có thể thêm một ví dụ ngắn về lựa chọn cây phù hợp với khí hậu.', 'This identifies necessary conditions and avoids overclaiming. A brief example about climate-appropriate planting could develop it further.')}</p></>}{tab === 'structure' && <><h2>{c('Bản đồ bài viết', 'Your essay map')}</h2>{[c('Mở bài: nêu quan điểm', 'Introduction: state a position'), c('Thân bài 1: lợi ích tiếp cận', 'Body 1: accessible public space'), c('Thân bài 2: môi trường', 'Body 2: environmental benefits'), c('Phản biện: vai trò thương mại', 'Counterpoint: the role of retail'), c('Kết luận: tổng hợp', 'Conclusion: synthesise')].map((text, index) => <div className="structure-step" key={text}><span>{index + 1}</span>{text}</div>)}</>}{tab === 'vocabulary' && <><h2>{c('Cụm từ đáng lưu', 'A phrase worth keeping')}</h2><blockquote>give greater priority to</blockquote><p>{c('Ưu tiên hơn cho một điều gì đó.', 'To treat something as more important.')}</p><button className="button primary" onClick={() => void addCard({ term: 'give greater priority to', meaning: c('Ưu tiên hơn cho', 'To treat as more important'), example: 'Cities should give greater priority to parks.', kind: 'vocabulary' }).then(() => setSaved(true)).catch(() => {})}>{saved ? <Check size={17} /> : <BookMarked size={17} />}{saved ? c('Đã lưu', 'Saved') : c('Lưu vào sổ từ', 'Save phrase')}</button></>}{tab === 'plan' && <><h2>{c('Một mục tiêu cho bài tiếp theo', 'One goal for your next essay')}</h2><p>{c('Chọn một luận điểm. Viết thêm hai câu giải thích cơ chế và một ví dụ cụ thể. Kiểm tra ví dụ có hỗ trợ trực tiếp cho ý chính không.', 'Choose one point. Add two sentences explaining the mechanism and one concrete example. Check that the example directly supports the point.')}</p><Link className="text-link" to="/app/prompts">{c('Xem đề để luyện', 'Pick a task to practise')}<ArrowRight size={16} /></Link></>}</aside></div></>
}
