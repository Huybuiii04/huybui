import { useEffect, useRef, useState } from 'react'
import { Link, useBlocker, useSearchParams } from 'react-router'
import { ArrowLeft, Check, ChevronRight, ImagePlus, Maximize2, PenLine, Save, Sparkles, X } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore, type Draft, type Task } from '../lib/store'
import { countWords, validateImages } from '../lib/learning'
import { BackendNotice, Notice, PageHeader } from '../components/ui'
import { entries } from '../data/content'

export default function Writing() {
  const [params, setParams] = useSearchParams()
  const { state } = useStore()
  const newId = useRef(crypto.randomUUID())
  useEffect(() => {
    if (!params.get('id')) { const next = new URLSearchParams(params); next.set('id', newId.current); setParams(next, { replace: true }) }
  }, [params, setParams])
  const existing = state.drafts.find(draft => draft.id === params.get('id'))
  if (!params.get('id')) return null
  return <Editor key={params.get('id')} id={params.get('id')!} existing={existing} task={params.get('task')} promptSlug={params.get('prompt')} />
}

function Editor({ id, existing, task, promptSlug }: { id: string; existing?: Draft; task: string | null; promptSlug: string | null }) {
  const { c } = useCopy()
  const { saveDraft, state } = useStore()
  const seed = entries.find(entry => entry.slug === promptSlug)
  const chosenTask = (seed?.task ?? task) as Task
  const [draft, setDraft] = useState<Draft>(() => existing ?? { id, title: '', task: ['task2', 'academic_task1', 'general_task1'].includes(chosenTask) ? chosenTask : 'task2', subtype: chosenTask === 'general_task1' ? 'formal' : 'line', prompt: seed?.kind === 'prompt' ? seed.body[1] : '', text: '', reference: seed?.task === 'academic_task1' ? seed.body[1] : '', images: [], target: state.profile.target, updatedAt: 0 })
  const [status, setStatus] = useState<'saved' | 'saving' | 'dirty' | 'error' | 'conflict'>('saved')
  const [mobileTab, setMobileTab] = useState('essay')
  const [notice, setNotice] = useState(false)
  const [imageError, setImageError] = useState('')
  const [focus, setFocus] = useState(false)
  const version = useRef(existing?.updatedAt ?? 0)
  const latest = useRef(draft)
  const dirty = useRef(false)
  const saving = useRef(false)
  latest.current = draft

  async function save() {
    if (!dirty.current || saving.current) return false
    saving.current = true
    const snapshot = latest.current
    setStatus('saving')
    try {
      version.current = await saveDraft(snapshot, version.current)
      if (snapshot === latest.current) { dirty.current = false; setStatus('saved') } else setStatus('dirty')
      return true
    } catch (error) {
      setStatus(error instanceof Error && error.message === 'conflict' ? 'conflict' : 'error')
      return false
    } finally { saving.current = false }
  }

  useEffect(() => {
    if (!dirty.current || status === 'conflict' || status === 'error') return
    const timer = window.setTimeout(() => void save(), 1000)
    return () => window.clearTimeout(timer)
  })

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty.current && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (blocker.state === 'blocked') return
    if (blocker.state === 'proceeding') { dirty.current = false }
  }, [blocker.state])

  async function leave() {
    const saved = await save()
    if (saved && blocker.state === 'blocked') blocker.proceed()
  }

  async function upload(files: FileList | null) {
    if (!files) return
    const selected = [...files]
    const problem = validateImages(selected)
    if (problem || selected.length + draft.images.length > 2) { setImageError(problem ?? 'imageCount'); return }
    try {
      const images = await Promise.all(selected.map(file => new Promise<{ name: string; url: string }>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve({ name: file.name, url: String(reader.result) })
        reader.onerror = reject
        reader.readAsDataURL(file)
      })))
      change({ images: [...draft.images, ...images] }); setImageError('')
    } catch { setImageError('read') }
  }

  function change(patch: Partial<Draft>) { dirty.current = true; setStatus('dirty'); setDraft(current => ({ ...current, ...patch })) }

  const words = countWords(draft.text)
  const minimum = draft.task === 'task2' ? 250 : 150
  return <div className={focus ? 'writing-focus' : ''}>
    <PageHeader eyebrow={c('ĐỂ Ý TƯỞNG THÀNH CÂU CHỮ', 'GIVE YOUR IDEAS A VOICE')} title={c('Không gian viết', 'Your writing space')} description={c('Không cần hoàn hảo ngay từ đầu. Bắt đầu bằng một câu.', 'It does not have to be perfect. Start with a sentence.')} action={<Link className="button outline" to="/app/essays"><ArrowLeft size={16} />{c('Bài viết của tôi', 'My writing')}</Link>} />
    <div className="editor-toolbar"><div className="segmented">{([['task2', 'Task 2'], ['academic_task1', 'Task 1 Academic'], ['general_task1', 'Task 1 General']] as const).map(([value, label]) => <button key={value} className={draft.task === value ? 'selected' : ''} aria-pressed={draft.task === value} onClick={() => {
      if (draft.task === value) return
      if ((draft.reference || draft.images.length) && !window.confirm(c('Đổi loại bài sẽ xóa dữ liệu tham chiếu và ảnh hiện tại. Tiếp tục?', 'Changing the task removes current reference data and images. Continue?'))) return
      change({ task: value, reference: '', images: [], subtype: value === 'general_task1' ? 'formal' : 'line' })
    }}>{label}</button>)}</div><span className={`save-status ${status === 'error' || status === 'conflict' ? 'danger-text' : ''}`} aria-live="polite">{status === 'saved' ? <Check size={15} /> : <Save size={15} />}{status === 'saved' ? c('Đã lưu trên trình duyệt', 'Saved in this browser') : status === 'saving' ? c('Đang lưu…', 'Saving…') : status === 'dirty' ? c('Chưa lưu', 'Unsaved changes') : status === 'conflict' ? c('Xung đột phiên bản', 'Version conflict') : c('Lưu thất bại', 'Save failed')}</span></div>
    <div className="mobile-editor-tabs segmented"><button className={mobileTab === 'prompt' ? 'selected' : ''} onClick={() => setMobileTab('prompt')}>{c('Đề bài', 'Task prompt')}</button><button className={mobileTab === 'essay' ? 'selected' : ''} onClick={() => setMobileTab('essay')}>{c('Bài viết', 'Your writing')}</button></div>
    <div className="editor-grid"><section className={`panel prompt-panel ${mobileTab !== 'prompt' ? 'hide-mobile' : ''}`}><div className="panel-heading"><span className="number-dot">01</span><h2>{c('Đề bài của bạn', 'Your task')}</h2><Link to="/library?kind=prompt" className="text-link">{c('Chọn đề', 'Browse')}<ChevronRight size={15} /></Link></div>
      {draft.task !== 'task2' && <label>{c('Dạng bài', 'Task type')}<select value={draft.subtype} onChange={event => change({ subtype: event.target.value })}>{(draft.task === 'academic_task1' ? ['line', 'bar', 'pie', 'table', 'process', 'map', 'mixed'] : ['formal', 'semi-formal', 'informal']).map(item => <option key={item}>{item}</option>)}</select></label>}
      <label htmlFor="prompt">{c('Nội dung đề bài', 'Task prompt')}<textarea id="prompt" rows={7} maxLength={6000} value={draft.prompt} onChange={event => change({ prompt: event.target.value })} placeholder={c('Dán đề bài tại đây hoặc chọn từ thư viện…', 'Paste your task here or choose one from the library…')} /></label>
      {draft.task === 'academic_task1' && <><label>{c('Dữ liệu / mô tả tham chiếu', 'Reference data / description')}<textarea rows={5} maxLength={20000} value={draft.reference} onChange={event => change({ reference: event.target.value })} placeholder={c('Nhãn, đơn vị, số liệu; hoặc các bước / vị trí…', 'Labels, units, figures; or process steps / locations…')} /></label><label className="upload-zone"><ImagePlus size={26} /><strong>{c('Thêm ảnh đề bài', 'Add task images')}</strong><span>PNG, JPG, WebP · 5 MB · {c('tối đa 2 ảnh', 'up to 2 images')}</span><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={event => { void upload(event.target.files); event.target.value = '' }} /></label>{imageError && <Notice error>{imageError === 'imageSize' ? c('Mỗi ảnh tối đa 5 MiB.', 'Each image must be 5 MiB or smaller.') : imageError === 'imageType' ? c('Chỉ nhận JPEG, PNG hoặc WebP.', 'Use JPEG, PNG or WebP images.') : imageError === 'imageCount' ? c('Tối đa 2 ảnh cho mỗi đề.', 'Maximum two images per task.') : c('Không đọc được ảnh. Thử lại.', 'Could not read the image. Try again.')}</Notice>}<div className="image-previews">{draft.images.map((image, index) => <div key={`${image.name}-${index}`}><img src={image.url} alt={image.name} /><button className="icon-button" aria-label={c('Xóa ảnh', 'Remove image')} onClick={() => change({ images: draft.images.filter((_, i) => i !== index) })}><X size={16} /></button></div>)}</div>{draft.images.length > 0 && <button className="button outline full" onClick={() => setNotice(true)}><Sparkles size={16} />{c('Đọc dữ liệu từ ảnh', 'Read image data')}</button>}</>}
      <div className="writing-tip"><span className="eyebrow">{c('MỘT GỢI Ý NHỎ', 'A SMALL REMINDER')}</span><p>{draft.task === 'task2' ? c('Dành vài phút xác định lập trường và hai luận điểm trước khi viết.', 'Spend a few minutes choosing your position and two supporting ideas.') : c('Đọc kỹ đề, xác định các ý chính trước khi đi vào chi tiết.', 'Read the task closely and identify the main features before adding detail.')}</p></div>
    </section><section className={`panel essay-panel ${mobileTab !== 'essay' ? 'hide-mobile' : ''}`}><div className="panel-heading"><span className="number-dot">02</span><h2>{c('Trang viết', 'Your page')}</h2><button className="icon-button" aria-pressed={focus} aria-label={c('Chế độ tập trung', 'Focus mode')} onClick={() => setFocus(!focus)}><Maximize2 size={17} /></button></div><input className="essay-title" aria-label={c('Tên bài viết', 'Essay title')} maxLength={150} value={draft.title} onChange={event => change({ title: event.target.value })} placeholder={c('Đặt tên cho bài viết…', 'Give your writing a title…')} /><label className="sr-only" htmlFor="essay">{c('Nội dung bài viết', 'Essay text')}</label><textarea id="essay" className="essay-textarea" maxLength={30000} value={draft.text} onChange={event => change({ text: event.target.value })} placeholder={c('Mọi bài viết tốt đều bắt đầu bằng một ý tưởng.\n\nViết câu đầu tiên của bạn tại đây…', 'Every good essay begins with an idea.\n\nWrite your first sentence here…')} /><div className="editor-bottom"><span><strong>{words}</strong> / {minimum}+ {c('từ', 'words')}</span><span>{draft.text.length.toLocaleString()} / 30,000</span></div><div className="editor-actions"><label className="target-select">{c('Mục tiêu', 'Target')}<select aria-label={c('Band mục tiêu', 'Target band')} value={draft.target} onChange={event => change({ target: event.target.value })}>{['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(item => <option key={item}>{item}</option>)}</select></label><div className="button-row"><button className="button outline" onClick={() => { if (status === 'error') setStatus('dirty'); void save() }} disabled={status === 'saving' || status === 'conflict'}><Save size={16} />{c('Lưu nháp', 'Save draft')}</button><button className="button primary" disabled={!draft.text.trim() || !draft.prompt.trim()} onClick={() => { void save(); setNotice(true) }}><Sparkles size={17} />{c('Chấm bài', 'Get feedback')}</button></div></div></section></div>
    {!!words && words < minimum && <p className="helper-text"><PenLine size={14} />{c(`Bài hiện dưới ${minimum} từ. Bạn vẫn có thể chấm khi backend được kết nối.`, `Your draft is under ${minimum} words. It can still be assessed once the backend is connected.`)}</p>}
    {notice && <BackendNotice />}
    <p className="helper-text">{c('Nháp và ảnh chỉ lưu trên trình duyệt này. Chưa đồng bộ tài khoản.', 'Drafts and images are stored only in this browser. Account sync is not connected.')}</p>
    {blocker.state === 'blocked' && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="leave-title"><div className="panel leave-dialog"><span className="task-icon amber"><PenLine size={24} /></span><h2 id="leave-title">{c('Bạn chưa lưu bài viết', 'Your writing is not saved yet')}</h2><p>{c('Lưu nháp trước khi rời đi? Nếu không, thay đổi chưa lưu sẽ mất.', 'Save your draft before leaving? Unsaved changes are lost otherwise.')}</p><div className="button-row"><button className="button primary" onClick={() => void leave()}><Save size={17} />{c('Lưu và rời đi', 'Save and leave')}</button><button className="button outline" onClick={() => blocker.reset()}>{c('Tiếp tục viết', 'Keep writing')}</button></div></div></div>}
  </div>
}
