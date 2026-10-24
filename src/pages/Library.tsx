import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookMarked, BookOpen, Check, FileText, Layers3, PenLine, Search } from 'lucide-react'
import { entries } from '../data/content'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { Empty, PageHeader } from '../components/ui'

export function Library() {
  const { c } = useCopy()
  const [params, setParams] = useSearchParams()
  const kind = params.get('kind') ?? 'all'
  const [search, setSearch] = useState('')
  const [task, setTask] = useState('all')
  const items = entries.filter(item => (kind === 'all' || item.kind === kind) && (task === 'all' || item.task === task || item.task === 'all') && `${item.title.join(' ')} ${item.description.join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  const tabs = [['all', c('Tất cả', 'All resources')], ['prompt', c('Đề bài', 'Prompts')], ['template', c('Khung bài', 'Frameworks')], ['sample', c('Bài mẫu', 'Samples')], ['vocabulary', c('Từ vựng', 'Vocabulary')]]
  return <>
    <PageHeader eyebrow={c('MỘT CHÚT CẢM HỨNG CHO BÀI VIẾT MỚI', 'INSPIRATION FOR YOUR NEXT ESSAY')} title={c('Thư viện học tập', 'The learning library')} description={c('Khung bài, bài mẫu và những cách diễn đạt đáng giữ lại.', 'Frameworks, samples and expressions worth keeping.')} />
    <div className="library-banner"><div><span className="eyebrow">{c('BIÊN SOẠN CHO HÀNH TRÌNH CỦA BẠN', 'CURATED FOR YOUR JOURNEY')}</span><h2>{c('Đọc để hiểu. Viết để tiến bộ.', 'Read to understand. Write to grow.')}</h2><p>{c('Tài liệu tự biên soạn, mở cho mọi người học.', 'Original learning resources, open to every learner.')}</p></div><BookOpen size={78} strokeWidth={1} /></div>
    <div className="tabs">{tabs.map(([value, label]) => <button key={value} aria-pressed={kind === value} className={kind === value ? 'active' : ''} onClick={() => setParams({ kind: value })}>{label}</button>)}</div>
    {kind === 'prompt'
      ? <div className="panel prompt-library-callout">
        <span className="task-icon teal"><PenLine size={26} /></span>
        <h2>{c('Đề bài đã chuyển sang Kho đề bài', 'Prompts now live in the prompt library')}</h2>
        <p>{c('Kho đề bài có đề sẵn cho Task 1 Academic, Task 1 General và Task 2, kèm tìm kiếm, lọc độ khó và chỗ thêm đề của riêng bạn.', 'The prompt library holds ready prompts for Task 1 Academic, Task 1 General and Task 2, with search, difficulty filters and a place for your own questions.')}</p>
        <Link className="button primary" to="/app/prompts">{c('Mở Kho đề bài', 'Open prompt library')}<ArrowRight size={16} /></Link>
      </div>
      : <>
        <div className="filter-bar">
          <div className="search-field"><Search size={18} /><input value={search} aria-label={c('Tìm tài liệu', 'Search resources')} onChange={event => setSearch(event.target.value)} placeholder={c('Tìm một chủ đề, từ vựng hoặc dạng bài…', 'Find a topic, expression or task type…')} /></div>
          <select aria-label={c('Lọc dạng bài', 'Filter task type')} value={task} onChange={event => setTask(event.target.value)}><option value="all">{c('Tất cả dạng bài', 'All tasks')}</option><option value="task2">Task 2</option><option value="academic_task1">Task 1 Academic</option><option value="general_task1">Task 1 General</option></select>
        </div>
        <div className="library-grid">{items.map(item => {
          const Icon = item.kind === 'template' ? Layers3 : item.kind === 'sample' ? FileText : BookMarked
          return <Link className="panel resource-card" to={`/library/${item.kind}/${item.slug}`} key={item.slug}>
            <div className="card-topline"><span className={`task-icon ${item.kind === 'vocabulary' ? 'amber' : 'teal'}`}><Icon size={23} /></span><ArrowUpRight size={18} /></div>
            <span className="eyebrow">{item.task === 'all' ? 'ALL TASKS' : item.task === 'task2' ? 'WRITING TASK 2' : item.task === 'academic_task1' ? 'TASK 1 ACADEMIC' : 'TASK 1 GENERAL'}</span>
            <h3>{c(...item.title)}</h3>
            <p>{c(...item.description)}</p>
            <div className="card-bottom"><span className="badge neutral">{c(...item.tag)}</span><span>{c('Khám phá', 'Explore')}<ArrowRight size={14} /></span></div>
          </Link>
        })}</div>
        {!items.length && <div className="panel"><Empty title={c('Không tìm thấy tài liệu', 'No resources found')} description={c('Thử từ khóa khác hoặc bỏ bớt bộ lọc.', 'Try another keyword or remove a filter.')} /></div>}
      </>}
  </>
}

export function LibraryDetail() {
  const { kind, slug } = useParams()
  const { c } = useCopy()
  const { addCard } = useStore()
  const [saved, setSaved] = useState(false)
  const item = entries.find(entry => entry.slug === slug && entry.kind === kind)
  if (!item) return <Empty title={c('Không tìm thấy tài liệu', 'Resource not found')} description={c('Quay lại thư viện để chọn tài liệu khác.', 'Return to the library to choose another resource.')} action={<Link to="/library" className="button outline">{c('Về thư viện', 'Back to library')}</Link>} />
  return <>
    <Link className="text-link back-link" to={`/library?kind=${item.kind}`}><ArrowLeft size={16} />{c('Thư viện học tập', 'Learning library')}</Link>
    <PageHeader eyebrow={c(...item.tag)} title={c(...item.title)} description={c(...item.description)} />
    <div className="reading-layout">
      <article className="panel prose reading-article">{c(...item.body).split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}{item.kind === 'sample' && <p className="source-note">{c('Bài mẫu do dự án tự biên soạn. Chưa có điểm chấm được xác minh.', 'Original project sample. No verified assessment score.')}</p>}</article>
      <aside><div className="panel reading-action">
        <span className="task-icon teal"><PenLine size={25} /></span>
        <h3>{c('Biến điều vừa đọc thành kỹ năng.', 'Turn what you read into a skill.')}</h3>
        <p>{c('Thử viết bằng ngôn ngữ của bạn, thay vì học thuộc từng câu.', 'Try your own words instead of memorising every sentence.')}</p>
        {item.kind === 'vocabulary'
          ? <button className="button primary full" onClick={() => void addCard({ term: item.expression ?? item.title[1], meaning: c(...item.description), example: item.body[1].split('\n\n')[0], kind: 'vocabulary' }).then(() => setSaved(true)).catch(() => {})}>{saved ? <Check size={17} /> : <BookMarked size={17} />}{saved ? c('Đã lưu vào sổ', 'Saved to collection') : c('Lưu từ cần nhớ', 'Save this phrase')}</button>
          : <Link className="button primary full" to={`/app/write?task=${item.task === 'all' ? 'task2' : item.task}`}>{c('Luyện viết ngay', 'Practise writing')}<ArrowRight size={17} /></Link>}
      </div></aside>
    </div>
  </>
}
