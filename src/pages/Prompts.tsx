import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, CloudOff, FileText, FileUp, PenLine, Plus, Search, Sparkles, Timer, Trash2, Upload, X } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore, type CustomPrompt } from '../lib/store'
import { chartTypes, isSupportedWritingTask, topicLibrary, type PromptItem, type TaskKind } from '../data/prompts'
import { backendConfigured, loadChartTypes, loadPrompts, loadTopics, type PromptChartType, type PromptTopic } from '../lib/promptRepository'
import { ChartPreview } from '../components/ChartPreview'
import { Empty, Notice, PageHeader } from '../components/ui'
import { countWords } from '../lib/learning'

export default function Prompts() {
  const { c, pick, language } = useCopy()
  const { state, addPrompt, removePrompt } = useStore()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedTask = params.get('task')
  const task = isSupportedWritingTask(requestedTask) ? requestedTask : 'task2'
  const tab = params.get('tab') ?? 'ready'
  const [query, setQuery] = useState('')
  const [customOpen, setCustomOpen] = useState(false)
  const [topicKey, setTopicKey] = useState<string | null>(null)
  const [groupKey, setGroupKey] = useState<string | null>(null)

  const taskOptions: { id: TaskKind; label: string; minutes: number }[] = [
    { id: 'task2', label: 'Task 2', minutes: 40 },
    { id: 'academic_task1', label: 'Task 1 Academic', minutes: 20 },
  ]
  const ownAsPrompts: (PromptItem & { file?: CustomPrompt['file'] })[] = state.prompts.filter(item => item.task === task).map(item => ({
    slug: item.id,
    task,
    subtype: 'own',
    typeLabel: item.task === 'academic_task1' ? 'REPORT' : 'ESSAY',
    source: 'recalled',
    difficulty: 'MEDIUM',
    topics: [],
    title: [item.title, item.title],
    text: item.text,
    reference: item.reference,
    file: item.file,
    minutes: item.task === 'task2' ? 40 : 20,
    hint: ['', ''],
  }))
  const [remote, setRemote] = useState<PromptItem[]>([])
  const [topics, setTopics] = useState<PromptTopic[]>([])
  const [chartTypeList, setChartTypeList] = useState<PromptChartType[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    setLoading(true)
    void loadPrompts({ task }).then(items => {
      if (!active) return
      setRemote(items)
      setLoading(false)
    })
    return () => { active = false }
  }, [task])
  useEffect(() => {
    let active = true
    void loadTopics().then(items => { if (active) setTopics(items) })
    void loadChartTypes().then(items => { if (active) setChartTypeList(items) })
    return () => { active = false }
  }, [])
  const all = [...remote, ...ownAsPrompts]
  const ready = all.filter(item => `${item.title.join(' ')} ${item.text} ${item.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  const chartGroups: PromptChartType[] = chartTypeList.length ? chartTypeList : chartTypes
  const topicList: PromptTopic[] = topics.length
    ? topics
    : topicLibrary.map(topic => ({ key: topic.key, labelVi: topic.labelVi, labelEn: topic.labelEn, descriptionVi: topic.descriptionVi, descriptionEn: topic.descriptionEn, subtopics: topic.subtopics, task: null, sortOrder: topic.sortOrder }))
  const topicPool = topicList
    .map(topic => ({ topic, items: ready.filter(item => item.topics.includes(topic.key)) }))
    .sort((a, b) => (b.items.length > 0 ? 1 : 0) - (a.items.length > 0 ? 1 : 0) || a.topic.sortOrder - b.topic.sortOrder)
  const chartPool = chartGroups
    .map(group => ({ group, items: ready.filter(item => item.subtype === group.key) }))
    .sort((a, b) => (b.items.length > 0 ? 1 : 0) - (a.items.length > 0 ? 1 : 0) || a.group.sortOrder - b.group.sortOrder)
  const activeTopic = topicPool.find(entry => entry.topic.key === topicKey)
  const activeChartGroup = chartPool.find(entry => entry.group.key === groupKey)
  const topicLabel = (topic: PromptTopic) => (language === 'en' ? topic.labelEn : topic.labelVi)
  const topicDescription = (topic: PromptTopic) => (language === 'en' ? topic.descriptionEn : topic.descriptionVi)

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    setParams(next)
  }
  function open(item: PromptItem, mode: 'mock' | 'practice') {
    const route = item.subtype === 'own' ? `custom=${item.slug}` : `prompt=${item.slug}`
    navigate(`/app/write?task=${item.task}&${route}&mode=${mode}`)
  }

  return <>
    <PageHeader eyebrow={c('KHO ĐỀ BÀI', 'PROMPT LIBRARY')} title={c('Luyện đề thi thử IELTS Writing', 'IELTS Writing practice tests')} description={c('Chọn chủ đề, xem các đề bên trong rồi thi thử có tính giờ hoặc luyện tập có hướng dẫn từ AI.', 'Pick a topic, browse the questions inside it, then run a timed mock or practise with AI guidance.')} />

    <section className="library-banner prompt-banner"><div><span className="eyebrow">{c('LOẠI BÀI', 'TASK TYPE')}</span><h2>{c('Chọn loại bài bạn muốn luyện', 'Choose the task you want to practise')}</h2><p>{c('Task 2 là bài luận 40 phút. Task 1 Academic là báo cáo biểu đồ trong 20 phút.', 'Task 2 is a 40-minute essay. Task 1 Academic is a 20-minute chart report.')}</p></div></section>
    <div className="task-type-cards" role="radiogroup" aria-label={c('Loại bài', 'Task type')}>{taskOptions.map(option => <button role="radio" aria-checked={task === option.id} key={option.id} className={`task-type-card ${task === option.id ? 'active' : ''}`} onClick={() => setParam('task', option.id)}><span className="task-type-radio" /><div><strong>{option.label}</strong><small>{option.minutes} {c('phút', 'min')}</small></div></button>)}</div>

    <div className="tabs"><button className={tab === 'ready' ? 'active' : ''} aria-pressed={tab === 'ready'} onClick={() => setParam('tab', 'ready')}>{c('Đề chứa làm', 'Ready prompts')}</button><button className={tab === 'history' ? 'active' : ''} aria-pressed={tab === 'history'} onClick={() => setParam('tab', 'history')}>{c('Lịch sử bài làm', 'Your attempts')}</button></div>

    {tab === 'history' ? <HistoryTab task={task} /> : <>
      {!backendConfigured() && <Notice><CloudOff size={16} /><div>{c('Chưa kết nối kho đề bài. Các đề sẽ được tải từ backend sau khi bạn tạo bảng dữ liệu.', 'The prompt library is not connected yet. Prompts will load from the backend once its table exists.')}</div></Notice>}
      {loading && <div className="loading-state" role="status">{c('Đang tải đề bài…', 'Loading prompts…')}</div>}

      {!loading && <>
        <section className="section-heading"><h2>{c('Chọn chủ đề', 'Choose a topic')}</h2><span className="muted">{c('Bấm vào một chủ đề để xem các đề bên trong.', 'Open a topic to see the questions inside it.')}</span></section>
        {task === 'academic_task1' ? <section className="type-card-grid">{chartPool.map(entry => <button className="panel type-card topic-card" key={entry.group.key} onClick={() => setGroupKey(entry.group.key)}>
          <div className="prompt-card-top"><span className="badge neutral">{entry.items.length ? `${entry.items.length} ${c('đề', 'questions')}` : c('Chưa có đề', 'No questions yet')}</span><ArrowRight size={17} /></div>
          <h3>{language === 'en' ? entry.group.labelEn : entry.group.labelVi}</h3>
          <p className="prompt-text topic-subtopics">{language === 'en' ? entry.group.descriptionEn : entry.group.descriptionVi}</p>
        </button>)}</section> : <>{topicPool.length ? <section className="type-card-grid">{topicPool.map(entry => <button className="panel type-card topic-card" key={entry.topic.key} onClick={() => setTopicKey(entry.topic.key)}>
          <div className="prompt-card-top"><span className="badge neutral">{entry.items.length ? `${entry.items.length} ${c('đề', 'questions')}` : c('Chưa có đề', 'No questions yet')}</span><ArrowRight size={17} /></div>
          <h3>{topicLabel(entry.topic)}</h3>
          <p className="prompt-text topic-subtopics">{topicDescription(entry.topic) || entry.topic.subtopics.slice(0, 8).join(' · ')}</p>
        </button>)}</section> : <div className="panel"><Empty title={c('Chưa có đề nào cho loại bài này', 'No questions for this task yet')} description={c('Kho đề sẽ được nạp từ backend. Bạn cũng có thể thêm đề của riêng mình.', 'Questions load from the backend. You can also add your own.')} action={<button className="button primary" onClick={() => setCustomOpen(true)}><Plus size={17} />{c('Thêm đề của bạn', 'Add your own')}</button>} /></div>}</>}

        <section className="section-heading"><h2>{c('Tất cả đề của loại bài này', 'Every question in this task')}</h2></section>
        <div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm kiếm đề bài', 'Search prompts')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm kiếm đề bài…', 'Search prompts…')} /></div></div>
        {ready.length ? <div className="academic-grid">{ready.map(item => <article className="panel academic-card" key={item.slug}>
          <div className="prompt-card-top"><span className="badge neutral">{item.subtype === 'own' ? c('Đề của bạn', 'Your question') : item.typeLabel}</span><span className="badge neutral">{item.minutes} {c('phút', 'min')}</span></div>
          <h3>{pick(item.title)}</h3>
          {item.chart && <ChartPreview spec={item.chart} />}
          <p className="prompt-text">{item.text}</p>
          {item.topics.length > 0 && <div className="prompt-tags">{item.topics.map(topic => <span className="badge neutral" key={topic}>{topicList.find(entry => entry.key === topic) ? topicLabel(topicList.find(entry => entry.key === topic)!) : topic}</span>)}</div>}
          <div className="type-card-actions"><button className="button primary" onClick={() => open(item, 'mock')}><Timer size={16} />{c('Thi thử', 'Mock test')}</button><button className="button outline" onClick={() => open(item, 'practice')}><PenLine size={16} />{c('Luyện tập', 'Practise')}</button></div>
        </article>)}</div> : <div className="panel"><Empty title={c('Không tìm thấy đề phù hợp', 'No matching questions')} description={c('Thử từ khóa khác hoặc thêm đề của riêng bạn.', 'Try another keyword or add your own question.')} action={<button className="button primary" onClick={() => setCustomOpen(true)}><Plus size={17} />{c('Thêm đề của bạn', 'Add your own')}</button>} /></div>}

        <section className="prompt-grid">
          <button className="prompt-custom-card" onClick={() => setCustomOpen(true)}>
            <div className="prompt-custom-top"><span className="badge teal">{c('Đề của bạn', 'Your own')}</span></div>
            <h3>{c('Tự nhập đề bài của bạn', 'Bring your own question')}</h3>
            <p>{c('Dán đề bài, tải ảnh biểu đồ hoặc tệp đề lên, rồi viết ngay theo đúng chuẩn IELTS.', 'Paste a question, upload a chart image or file, then start writing to the IELTS standard.')}</p>
            <div className="prompt-custom-foot"><span>{c('TỰ NHẬP / TẢI LÊN', 'CUSTOM / UPLOAD')}</span><strong>{c('Viết ngay', 'Write now')}<ArrowRight size={16} /></strong></div>
          </button>
          {ownAsPrompts.map(item => <article className="panel prompt-card" key={item.slug}>
            <div className="prompt-card-top"><span className="badge neutral">{c('Đề của bạn', 'Your question')}</span><button className="icon-button" aria-label={c('Xóa đề', 'Delete prompt')} onClick={() => { if (window.confirm(c('Xóa đề bài này khỏi kho của bạn?', 'Delete this question from your shelf?'))) void removePrompt(item.slug).catch(() => {}) }}><Trash2 size={16} /></button></div>
            <h3>{pick(item.title)}</h3>
            <p className="prompt-text">{item.text}</p>
            {item.file && <div className="prompt-file-chip"><FileUp size={13} />{item.file.name}</div>}
            <div className="type-card-actions"><button className="button primary" onClick={() => open(item, 'mock')}><Timer size={16} />{c('Thi thử', 'Mock test')}</button><button className="button outline" onClick={() => open(item, 'practice')}><PenLine size={16} />{c('Luyện tập', 'Practise')}</button></div>
          </article>)}
        </section>
      </>}
    </>}

    {activeTopic && <TopicDialog topicKey={activeTopic.topic.key} label={topicLabel(activeTopic.topic)} task={task} fallback={activeTopic.items} onClose={() => setTopicKey(null)} onPick={open} />}
    {activeChartGroup && <ChartTypeDialog chartKey={activeChartGroup.group.key} label={language === 'en' ? activeChartGroup.group.labelEn : activeChartGroup.group.labelVi} task="academic_task1" fallback={activeChartGroup.items} onClose={() => setGroupKey(null)} onPick={open} />}
    <CustomPromptDialog open={customOpen} onClose={() => setCustomOpen(false)} onSave={async values => { const created = await addPrompt(values); setCustomOpen(false); navigate(`/app/write?task=${created.task}&custom=${created.id}`) }} />
  </>
}

function TopicDialog({ topicKey, label, task, fallback, onClose, onPick }: { topicKey: string; label: string; task: TaskKind; fallback: PromptItem[]; onClose: () => void; onPick: (item: PromptItem, mode: 'mock' | 'practice') => void }) {
  const { c, pick } = useCopy()
  const dialog = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<PromptItem[]>(fallback)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!element.open) element.showModal()
  }, [])
  useEffect(() => {
    let active = true
    setLoading(true)
    void loadPrompts({ task, topic: topicKey }).then(rows => {
      if (!active) return
      if (rows.length) setItems(rows)
      setLoading(false)
    })
    return () => { active = false }
  }, [task, topicKey])
  return <dialog ref={dialog} className="modal topic-dialog" onClose={onClose}>
    <div className="section-heading"><div><span className="eyebrow">{c('CHỦ ĐỀ', 'TOPIC')}</span><h2>{label}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label={c('Đóng', 'Close')}><X size={20} /></button></div>
    {loading ? <div className="loading-state" role="status">{c('Đang tải đề…', 'Loading questions…')}</div> : <>
      <p className="muted topic-dialog-intro">{c(`${items.length} đề trong chủ đề này. Chọn một đề để bắt đầu.`, `${items.length} questions in this topic. Pick one to start.`)}</p>
      <div className="topic-dialog-list">{items.length ? items.map(item => <article className="topic-prompt" key={item.slug}>
        <div className="prompt-card-top"><span className="badge neutral">{item.subtype === 'own' ? c('Đề của bạn', 'Your question') : item.typeLabel}</span><span className="badge neutral">{item.minutes} {c('phút', 'min')}</span></div>
        <h3>{pick(item.title)}</h3>
        {item.chart && <ChartPreview spec={item.chart} />}
        <p className="prompt-text">{item.text}</p>
        <div className="type-card-actions"><button className="button primary" onClick={() => onPick(item, 'mock')}><Timer size={16} />{c('Thi thử', 'Mock test')}</button><button className="button outline" onClick={() => onPick(item, 'practice')}><PenLine size={16} />{c('Luyện tập', 'Practise')}</button></div>
      </article>) : <p className="muted">{c('Chủ đề này chưa có đề nào.', 'This topic has no questions yet.')}</p>}</div>
    </>}
  </dialog>
}

function ChartTypeDialog({ chartKey, label, task, fallback, onClose, onPick }: { chartKey: string; label: string; task: TaskKind; fallback: PromptItem[]; onClose: () => void; onPick: (item: PromptItem, mode: 'mock' | 'practice') => void }) {
  const { c, pick } = useCopy()
  const dialog = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<PromptItem[]>(fallback)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!element.open) element.showModal()
  }, [])
  useEffect(() => {
    let active = true
    setLoading(true)
    void loadPrompts({ task, subtype: chartKey }).then(rows => {
      if (!active) return
      if (rows.length) setItems(rows)
      setLoading(false)
    })
    return () => { active = false }
  }, [task, chartKey])
  return <dialog ref={dialog} className="modal topic-dialog" onClose={onClose}>
    <div className="section-heading"><div><span className="eyebrow">{c('DẠNG BIỂU ĐỒ', 'CHART TYPE')}</span><h2>{label}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label={c('Đóng', 'Close')}><X size={20} /></button></div>
    {loading ? <div className="loading-state" role="status">{c('Đang tải đề…', 'Loading questions…')}</div> : <>
      <p className="muted topic-dialog-intro">{c(`${items.length} đề dạng này. Chọn một đề để bắt đầu.`, `${items.length} questions of this type. Pick one to start.`)}</p>
      <div className="topic-dialog-list">{items.length ? items.map(item => <article className="topic-prompt" key={item.slug}>
        <div className="prompt-card-top"><span className="badge neutral">{item.subtype === 'own' ? c('Đề của bạn', 'Your question') : item.typeLabel}</span><span className="badge neutral">{item.minutes} {c('phút', 'min')}</span></div>
        <h3>{pick(item.title)}</h3>
        {item.chart && <ChartPreview spec={item.chart} />}
        <p className="prompt-text">{item.text}</p>
        <div className="type-card-actions"><button className="button primary" onClick={() => onPick(item, 'mock')}><Timer size={16} />{c('Thi thử', 'Mock test')}</button><button className="button outline" onClick={() => onPick(item, 'practice')}><PenLine size={16} />{c('Luyện tập', 'Practise')}</button></div>
      </article>) : <p className="muted">{c('Dạng biểu đồ này chưa có đề nào.', 'No questions of this chart type yet.')}</p>}</div>
    </>}
  </dialog>
}

function HistoryTab({ task }: { task: TaskKind }) {
  const { c, language } = useCopy()
  const { state } = useStore()
  const rows = state.drafts.filter(draft => draft.task === task).sort((a, b) => b.updatedAt - a.updatedAt)
  if (!rows.length) return <div className="panel"><Empty title={c('Chưa có bài nào', 'Nothing here yet')} description={c('Bài bạn viết từ kho đề sẽ xuất hiện tại đây.', 'Essays you write from this library will appear here.')} action={<Link className="button primary" to="/app/prompts"><PenLine size={17} />{c('Chọn một đề', 'Pick a prompt')}</Link>} /></div>
  return <div className="panel prompt-history">{rows.map(draft => <Link className="prompt-history-row" to={`/app/write?id=${draft.id}`} key={draft.id}><span className="file-icon"><FileText size={20} /></span><div><strong>{draft.title || draft.prompt.slice(0, 60) || c('Bài viết chưa đặt tên', 'Untitled draft')}</strong><small>{draft.task === 'task2' ? 'Task 2' : draft.task === 'academic_task1' ? 'Task 1 Academic' : c('Bài viết đã lưu', 'Saved essay')} · {countWords(draft.text)} {c('từ', 'words')} · {new Date(draft.updatedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB')}</small></div><ArrowRight size={17} /></Link>)}</div>
}

function CustomPromptDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (values: Omit<CustomPrompt, 'id' | 'createdAt'>) => Promise<void> }) {
  const { c } = useCopy()
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<CustomPrompt['file']>(undefined)
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  function read(fileInput: File) {
    if (fileInput.size > 5 * 1024 * 1024) { setFileError(c('Tệp vượt quá 5 MB.', 'File exceeds 5 MB.')); return }
    const isImage = fileInput.type.startsWith('image/')
    const isPdf = fileInput.type === 'application/pdf'
    if (!isImage && !isPdf) { setFileError(c('Chỉ nhận ảnh hoặc PDF.', 'Only images or PDF are accepted.')); return }
    const reader = new FileReader()
    reader.onload = () => setFile({ name: fileInput.name, kind: isImage ? 'image' : 'pdf', url: String(reader.result) })
    reader.onerror = () => setFileError(c('Không đọc được tệp.', 'Could not read the file.'))
    reader.readAsDataURL(fileInput)
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const task = data.get('task')
    if (!isSupportedWritingTask(task)) return
    setBusy(true)
    void onSave({
      task,
      title: String(data.get('title')).trim() || c('Đề của tôi', 'My question'),
      text: String(data.get('text')).trim(),
      reference: String(data.get('reference')).trim(),
      file,
    }).catch(() => {}).finally(() => setBusy(false))
    form.reset()
    setFile(undefined)
  }
  return <dialog ref={dialog} className="modal" onClose={onClose}><form onSubmit={submit}>
    <div className="section-heading"><h2>{c('Thêm đề bài của bạn', 'Add your own question')}</h2><button type="button" className="icon-button" onClick={onClose} aria-label={c('Đóng', 'Close')}><X size={20} /></button></div>
    <div className="field"><label htmlFor="custom-task">{c('Loại bài', 'Task type')}</label><select id="custom-task" name="task" defaultValue="task2"><option value="task2">Task 2</option><option value="academic_task1">Task 1 Academic</option></select></div>
    <div className="field"><label htmlFor="custom-title">{c('Tiêu đề', 'Title')}</label><input id="custom-title" name="title" maxLength={120} placeholder={c('Ví dụ: Bài thi tháng 3', 'e.g. Mock exam, March')} /></div>
    <div className="field"><label htmlFor="custom-text">{c('Nội dung đề bài (tiếng Anh)', 'Prompt text (English)')}</label><textarea id="custom-text" name="text" required rows={5} maxLength={6000} placeholder={c('Dán nội dung đề bài vào đây…', 'Paste the question here…')} /></div>
    <div className="field"><label htmlFor="custom-reference">{c('Dữ liệu / mô tả tham chiếu (nếu có)', 'Reference data (optional)')}</label><textarea id="custom-reference" name="reference" rows={3} maxLength={20000} placeholder={c('Số liệu, nhãn, đơn vị hoặc các bước của quy trình…', 'Figures, labels, units or process steps…')} /></div>
    <label className="upload-zone"><Upload size={24} /><strong>{c('Tải ảnh đề hoặc tệp PDF', 'Upload an image or PDF')}</strong><span>PNG, JPG, WebP, PDF · 5 MB</span><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={event => { const picked = event.target.files?.[0]; if (picked) { read(picked); setFileError('') } event.target.value = '' }} /></label>
    {file && <div className="prompt-file-preview"><FileUp size={16} /><span>{file.name}</span><button type="button" className="icon-button" aria-label={c('Bỏ tệp', 'Remove file')} onClick={() => setFile(undefined)}><X size={15} /></button></div>}
    {fileError && <Notice error>{fileError}</Notice>}
    <Notice>{c('Tệp và nội dung chỉ lưu trong trình duyệt này. Khi có backend, chúng sẽ được lưu vào kho riêng của bạn.', 'Files and text stay in this browser. With the backend connected they will live in your own shelf.')}</Notice>
    <button className="button primary full" disabled={busy}><Sparkles size={17} />{busy ? c('Đang lưu…', 'Saving…') : c('Lưu và viết ngay', 'Save and start writing')}</button>
  </form></dialog>
}
