import { useEffect, useRef, useState } from 'react'
import { Link, useBlocker, useSearchParams } from 'react-router'
import { ArrowLeft, Check, ChevronRight, ImagePlus, Maximize2, PenLine, RefreshCw, Save, Sparkles, Timer, X } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore, type Draft, type Task } from '../lib/store'
import { countWords, validateImages } from '../lib/learning'
import { loadPromptBySlug } from '../lib/promptRepository'
import { Notice, PageHeader } from '../components/ui'
import { GradingResult } from '../components/GradingResult'
import { AI_ERROR_MESSAGES, type GradingView } from '../lib/aiLogic.ts'
import { pollGrading, pollToolResult, retryJob, runWritingTool, submitEssay } from '../lib/ai.ts'

export default function Writing() {
  const [params, setParams] = useSearchParams()
  const { state } = useStore()
  const newId = useRef(crypto.randomUUID())
  useEffect(() => {
    if (!params.get('id')) { const next = new URLSearchParams(params); next.set('id', newId.current); setParams(next, { replace: true }) }
  }, [params, setParams])
  const existing = state.drafts.find(draft => draft.id === params.get('id'))
  if (!params.get('id')) return null
  return <Editor key={params.get('id')} id={params.get('id')!} existing={existing} task={params.get('task')} promptSlug={params.get('prompt')} customId={params.get('custom')} mode={params.get('mode') === 'mock' ? 'mock' : 'practice'} />
}

function Editor({ id, existing, task, promptSlug, customId, mode }: { id: string; existing?: Draft; task: string | null; promptSlug: string | null; customId: string | null; mode: 'mock' | 'practice' }) {
  const { c } = useCopy()
  const { saveDraft, state, ready, signedIn, remoteRef } = useStore()
  const own = state.prompts.find(item => item.id === customId)
  const [seed, setSeed] = useState<{ task: Task; text: string; reference: string; title: string } | null>(null)
  useEffect(() => {
    let active = true
    if (!promptSlug) return
    void loadPromptBySlug(promptSlug).then(item => {
      if (active && item) setSeed({ task: item.task, text: item.text, reference: item.reference ?? '', title: item.title[0] })
    })
    return () => { active = false }
  }, [promptSlug])
  const chosenTask = (seed?.task ?? own?.task ?? task) as Task
  const [draft, setDraft] = useState<Draft>(() => existing ?? { id, title: own?.title ?? '', task: ['task2', 'academic_task1', 'general_task1'].includes(chosenTask) ? chosenTask : 'task2', subtype: chosenTask === 'general_task1' ? 'formal' : 'line', prompt: own?.text ?? '', text: '', reference: own?.reference ?? '', images: own?.file?.kind === 'image' ? [{ name: own.file.name, url: own.file.url }] : [], target: state.profile.target, updatedAt: 0 })
  const [status, setStatus] = useState<'saved' | 'saving' | 'dirty' | 'error' | 'conflict'>('saved')
  const [mobileTab, setMobileTab] = useState('essay')
  const [imageError, setImageError] = useState('')
  const [focus, setFocus] = useState(false)
  const [grading, setGrading] = useState<GradingView | null>(null)
  const [gradingState, setGradingState] = useState<'idle' | 'saving' | 'queued' | 'done' | 'error'>('idle')
  const [aiError, setAiError] = useState('')
  const [imageReading, setImageReading] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [imageData, setImageData] = useState<string[]>([])
  const [lastJobId, setLastJobId] = useState<string | null>(null)
  const version = useRef(existing?.updatedAt ?? 0)
  const latest = useRef(draft)
  const dirty = useRef(false)
  const saving = useRef(false)
  const persisted = useRef(false)
  latest.current = draft

  /**
   * Lưu nháp. Trả về true khi đã lưu (hoặc không có gì để lưu),
   * false khi lỗi hoặc có một lần lưu khác đang chạy.
   */
  async function save() {
    if (!dirty.current) return true
    if (saving.current) return false
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

  /** Chờ lần lưu đang chạy xong rồi lưu tiếp nếu còn thay đổi. */
  async function saveWhenIdle() {
    if (saving.current) {
      await new Promise<void>(resolve => window.setTimeout(resolve, 300))
    }
    return save()
  }

  useEffect(() => {
    if (!dirty.current || status === 'conflict' || status === 'error') return
    const timer = window.setTimeout(() => void save(), 1000)
    return () => window.clearTimeout(timer)
  })

  useEffect(() => {
    if (!ready || persisted.current) return
    if (existing) { persisted.current = true; return }
    if (!latest.current.prompt && !latest.current.text) return
    persisted.current = true
    void persistInitial()
  }, [ready, existing])

  async function persistInitial() {
    if (saving.current) return
    saving.current = true
    const snapshot = latest.current
    setStatus('saving')
    try {
      version.current = await saveDraft(snapshot, version.current)
      dirty.current = false
      setStatus('saved')
    } catch (error) {
      setStatus(error instanceof Error && error.message === 'conflict' ? 'conflict' : 'error')
    } finally { saving.current = false }
  }

  useEffect(() => {
    if (!seed || existing || draft.text || draft.prompt) return
    change({ task: seed.task, prompt: seed.text, reference: seed.reference, title: draft.title || seed.title, subtype: seed.task === 'general_task1' ? 'formal' : draft.subtype })
  }, [seed])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty.current && currentLocation.pathname !== nextLocation.pathname)

  const mockMinutes = draft.task === 'task2' ? 40 : 20
  const [remaining, setRemaining] = useState(mode === 'mock' ? mockMinutes * 60 : 0)
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    if (mode !== 'mock') return
    const timer = window.setInterval(() => {
      setRemaining(value => {
        if (value <= 1) { setExpired(true); return 0 }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [mode])

  useEffect(() => {
    if (blocker.state === 'blocked') return
    if (blocker.state === 'proceeding') { dirty.current = false }
  }, [blocker.state])

  async function leave() {
    const saved = await saveWhenIdle()
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

  /** Chấm bài: lưu nháp trước rồi đẩy job chấm lên hàng đợi. */
  async function grade() {
    setAiError('')
    if (!signedIn) { setAiError(c('Hãy đăng nhập để nhận nhận xét.', 'Sign in to receive feedback.')); return }
    if (!draft.text.trim() || !draft.prompt.trim()) { setAiError(c('Cần có cả đề bài và nội dung bài viết.', 'Both the task prompt and your writing are needed.')); return }
    setGradingState('saving')
    const saved = await saveWhenIdle()
    if (!saved) { setGradingState('error'); setAiError(c('Chưa lưu được bài viết. Hãy lưu lại rồi thử.', 'The essay could not be saved. Save it and try again.')); return }
    const ref = remoteRef(id)
    if (!ref) { setGradingState('error'); setAiError(c('Bài viết chưa được đồng bộ lên tài khoản.', 'This essay is not synced to your account yet.')); return }
    const submitted = await submitEssay({ essayId: ref.essayId, expectedVersion: ref.version, idempotencyKey: `grade-${id}-${ref.version}`, mode: 'grade' })
    if (!submitted.ok) { setGradingState('error'); setAiError(c(...AI_ERROR_MESSAGES[submitted.code])); return }
    setLastJobId(submitted.value.jobId)
    setGradingState('queued')
    const result = await pollGrading(submitted.value.jobId, draft.task, snapshot => { if (snapshot.view) setGrading(snapshot.view) })
    if (!result.ok) { setGradingState('error'); setAiError(c(...AI_ERROR_MESSAGES[result.code])); return }
    setGrading(result.value.view)
    setGradingState('done')
  }

  /** Thử lại job đã lỗi. */
  async function retry() {
    if (!lastJobId) return
    setAiError('')
    setGradingState('queued')
    const queued = await retryJob(lastJobId)
    if (!queued.ok) { setGradingState('error'); setAiError(c(...AI_ERROR_MESSAGES[queued.code])); return }
    const result = await pollGrading(lastJobId, draft.task, snapshot => { if (snapshot.view) setGrading(snapshot.view) })
    if (!result.ok) { setGradingState('error'); setAiError(c(...AI_ERROR_MESSAGES[result.code])); return }
    setGrading(result.value.view)
    setGradingState('done')
  }

  /** Đọc số liệu trong ảnh đề bài bằng AI. */
  async function readImage() {
    setAiError('')
    const assetIds = draft.images.map(image => image.assetId).filter((value): value is string => Boolean(value))
    if (!assetIds.length) { setAiError(c('Ảnh chưa được tải lên máy chủ. Hãy lưu bài rồi thử lại.', 'The image has not been uploaded yet. Save the essay and try again.')); return }
    setImageReading('busy')
    const started = await runWritingTool({ operation: 'read-image', assetIds })
    if (!started.ok) { setImageReading('error'); setAiError(c(...AI_ERROR_MESSAGES[started.code])); return }
    const result = await pollToolResult(started.value.jobId, 'read-image')
    if (!result.ok) { setImageReading('error'); setAiError(c(...AI_ERROR_MESSAGES[result.code])); return }
    setImageData(result.value)
    setImageReading('done')
  }

  const words = countWords(draft.text)
  const minimum = draft.task === 'task2' ? 250 : 150
  return <div className={focus ? 'writing-focus' : ''}>
    <PageHeader eyebrow={c('ĐỂ Ý TƯỞNG THÀNH CÂU CHỮ', 'GIVE YOUR IDEAS A VOICE')} title={c('Không gian viết', 'Your writing space')} description={c('Không cần hoàn hảo ngay từ đầu. Bắt đầu bằng một câu.', 'It does not have to be perfect. Start with a sentence.')} action={<Link className="button outline" to="/app/essays"><ArrowLeft size={16} />{c('Bài viết của tôi', 'My writing')}</Link>} />
    <div className="editor-toolbar"><div className="segmented">{([['task2', 'Task 2'], ['academic_task1', 'Task 1 Academic'], ['general_task1', 'Task 1 General']] as const).map(([value, label]) => <button key={value} className={draft.task === value ? 'selected' : ''} aria-pressed={draft.task === value} onClick={() => {
      if (draft.task === value) return
      if ((draft.reference || draft.images.length) && !window.confirm(c('Đổi loại bài sẽ xóa dữ liệu tham chiếu và ảnh hiện tại. Tiếp tục?', 'Changing the task removes current reference data and images. Continue?'))) return
      change({ task: value, reference: '', images: [], subtype: value === 'general_task1' ? 'formal' : 'line' })
    }}>{label}</button>)}</div><div className="editor-status">{mode === 'mock' && <span className={`mock-timer ${expired ? 'expired' : ''}`} role="timer" aria-live="off"><Timer size={15} />{expired ? c('Hết thời gian', 'Time is up') : `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`}</span>}<span className={`save-status ${status === 'error' || status === 'conflict' ? 'danger-text' : ''}`} aria-live="polite">{status === 'saved' ? <Check size={15} /> : <Save size={15} />}{status === 'saved' ? c('Đã lưu trên trình duyệt', 'Saved in this browser') : status === 'saving' ? c('Đang lưu…', 'Saving…') : status === 'dirty' ? c('Chưa lưu', 'Unsaved changes') : status === 'conflict' ? c('Xung đột phiên bản', 'Version conflict') : c('Lưu thất bại', 'Save failed')}</span></div></div>
    <div className="mobile-editor-tabs segmented"><button className={mobileTab === 'prompt' ? 'selected' : ''} onClick={() => setMobileTab('prompt')}>{c('Đề bài', 'Task prompt')}</button><button className={mobileTab === 'essay' ? 'selected' : ''} onClick={() => setMobileTab('essay')}>{c('Bài viết', 'Your writing')}</button></div>
    <div className="editor-grid"><section className={`panel prompt-panel ${mobileTab !== 'prompt' ? 'hide-mobile' : ''}`}><div className="panel-heading"><span className="number-dot">01</span><h2>{c('Đề bài của bạn', 'Your task')}</h2><Link to="/app/prompts" className="text-link">{c('Kho đề bài', 'Prompt library')}<ChevronRight size={15} /></Link></div>
      {draft.task !== 'task2' && <div className="field"><label htmlFor="subtype">{c('Dạng bài', 'Task type')}</label><select id="subtype" value={draft.subtype} onChange={event => change({ subtype: event.target.value })}>{(draft.task === 'academic_task1' ? ['line', 'bar', 'pie', 'table', 'process', 'map', 'mixed'] : ['formal', 'semi-formal', 'informal']).map(item => <option key={item}>{item}</option>)}</select></div>}
      <div className="field"><label htmlFor="prompt">{c('Nội dung đề bài', 'Task prompt')}</label><textarea id="prompt" rows={7} maxLength={6000} value={draft.prompt} onChange={event => change({ prompt: event.target.value })} placeholder={c('Dán đề bài tại đây hoặc chọn từ thư viện…', 'Paste your task here or choose one from the library…')} /></div>
      {draft.task === 'academic_task1' && <><div className="field"><label htmlFor="reference">{c('Dữ liệu / mô tả tham chiếu', 'Reference data / description')}</label><textarea id="reference" rows={5} maxLength={20000} value={draft.reference} onChange={event => change({ reference: event.target.value })} placeholder={c('Nhãn, đơn vị, số liệu; hoặc các bước / vị trí…', 'Labels, units, figures; or process steps / locations…')} /></div><label className="upload-zone"><ImagePlus size={26} /><strong>{c('Thêm ảnh đề bài', 'Add task images')}</strong><span>PNG, JPG, WebP · 5 MB · {c('tối đa 2 ảnh', 'up to 2 images')}</span><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={event => { void upload(event.target.files); event.target.value = '' }} /></label>{imageError && <Notice error>{imageError === 'imageSize' ? c('Mỗi ảnh tối đa 5 MiB.', 'Each image must be 5 MiB or smaller.') : imageError === 'imageType' ? c('Chỉ nhận JPEG, PNG hoặc WebP.', 'Use JPEG, PNG or WebP images.') : imageError === 'imageCount' ? c('Tối đa 2 ảnh cho mỗi đề.', 'Maximum two images per task.') : c('Không đọc được ảnh. Thử lại.', 'Could not read the image. Try again.')}</Notice>}<div className="image-previews">{draft.images.map((image, index) => <div key={`${image.name}-${index}`}><img src={image.url} alt={image.name} /><button className="icon-button" aria-label={c('Xóa ảnh', 'Remove image')} onClick={() => change({ images: draft.images.filter((_, i) => i !== index) })}><X size={16} /></button></div>)}</div>{draft.images.length > 0 && <button className="button outline full" disabled={imageReading === 'busy'} onClick={() => void readImage()}><Sparkles size={16} />{imageReading === 'busy' ? c('Đang đọc ảnh…', 'Reading image…') : c('Đọc dữ liệu từ ảnh', 'Read image data')}</button>}</>}
      <div className="writing-tip"><span className="eyebrow">{c('MỘT GỢI Ý NHỎ', 'A SMALL REMINDER')}</span><p>{draft.task === 'task2' ? c('Dành vài phút xác định lập trường và hai luận điểm trước khi viết.', 'Spend a few minutes choosing your position and two supporting ideas.') : c('Đọc kỹ đề, xác định các ý chính trước khi đi vào chi tiết.', 'Read the task closely and identify the main features before adding detail.')}</p></div>
    </section><section className={`panel essay-panel ${mobileTab !== 'essay' ? 'hide-mobile' : ''}`}><div className="panel-heading"><span className="number-dot">02</span><h2>{c('Trang viết', 'Your page')}</h2><button className="icon-button" aria-pressed={focus} aria-label={c('Chế độ tập trung', 'Focus mode')} onClick={() => setFocus(!focus)}><Maximize2 size={17} /></button></div>{draft.prompt && <div className="prompt-banner-inline"><span className="prompt-banner-label">{c('ĐỀ BÀI', 'YOUR QUESTION')}</span><p>{draft.prompt}</p>{draft.reference && <details className="prompt-banner-details"><summary>{c('Xem dữ liệu tham chiếu', 'View reference data')}</summary><p>{draft.reference}</p></details>}</div>}<input className="essay-title" aria-label={c('Tên bài viết', 'Essay title')} maxLength={150} value={draft.title} onChange={event => change({ title: event.target.value })} placeholder={c('Đặt tên cho bài viết…', 'Give your writing a title…')} /><label className="sr-only" htmlFor="essay">{c('Nội dung bài viết', 'Essay text')}</label><textarea id="essay" className="essay-textarea" maxLength={30000} readOnly={expired} value={draft.text} onChange={event => change({ text: event.target.value })} placeholder={c('Mọi bài viết tốt đều bắt đầu bằng một ý tưởng.\n\nViết câu đầu tiên của bạn tại đây…', 'Every good essay begins with an idea.\n\nWrite your first sentence here…')} /><div className="editor-bottom"><span><strong>{words}</strong> / {minimum}+ {c('từ', 'words')}</span><span>{draft.text.length.toLocaleString()} / 30,000</span></div><div className="editor-actions"><div className="target-select"><label htmlFor="target">{c('Mục tiêu', 'Target')}</label><select id="target" aria-label={c('Band mục tiêu', 'Target band')} value={draft.target} onChange={event => change({ target: event.target.value })}>{['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(item => <option key={item}>{item}</option>)}</select></div><div className="button-row"><button className="button outline" onClick={() => { if (status === 'error') setStatus('dirty'); void save() }} disabled={status === 'saving' || status === 'conflict'}><Save size={16} />{c('Lưu nháp', 'Save draft')}</button><button className="button primary" disabled={!draft.text.trim() || !draft.prompt.trim() || gradingState === 'saving' || gradingState === 'queued'} onClick={() => void grade()}><Sparkles size={17} />{gradingState === 'saving' ? c('Đang lưu…', 'Saving…') : gradingState === 'queued' ? c('Đang chấm…', 'Assessing…') : c('Chấm bài', 'Get feedback')}</button></div></div></section></div>
    {!!words && words < minimum && <p className="helper-text"><PenLine size={14} />{c(`Bài hiện dưới ${minimum} từ. Bạn vẫn có thể chấm khi backend được kết nối.`, `Your draft is under ${minimum} words. It can still be assessed once the backend is connected.`)}</p>}
    {expired && <Notice error>{c('Đã hết thời gian của bài thi thử. Bài viết của bạn vẫn được lưu — hãy nộp để nhận nhận xét khi backend sẵn sàng.', 'Your mock test time is up. Your writing is still saved — submit it for feedback once the backend is ready.')}</Notice>}
    {aiError && <Notice error>{aiError}</Notice>}
    {gradingState === 'error' && lastJobId && <button className="button outline" onClick={() => void retry()}><RefreshCw size={16} />{c('Thử lại', 'Try again')}</button>}
    {imageReading === 'done' && imageData.length > 0 && <section className="panel grading-panel"><span className="eyebrow">{c('DỮ LIỆU ĐỌC TỪ ẢNH', 'DATA READ FROM THE IMAGE')}</span><ul className="grading-list">{imageData.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul><button className="button outline full" onClick={() => change({ reference: imageData.join('\n') })}><Check size={16} />{c('Chèn vào dữ liệu tham chiếu', 'Insert into reference data')}</button></section>}
    {gradingState === 'queued' && <Notice>{c('Bài đang được chấm. Kết quả sẽ hiện ngay sau khi AI xử lý xong.', 'Your essay is being assessed. The result appears as soon as the AI finishes.')}</Notice>}
    {grading && <GradingResult view={grading} task={draft.task} />}
    <p className="helper-text">{signedIn ? c('Nháp được đồng bộ tới tài khoản của bạn.', 'Drafts are synced to your account.') : c('Nháp và ảnh chỉ lưu trên trình duyệt này. Hãy đăng nhập để đồng bộ và nhận nhận xét.', 'Drafts and images are stored only in this browser. Sign in to sync and receive feedback.')}</p>
    {blocker.state === 'blocked' && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="leave-title"><div className="panel leave-dialog"><span className="task-icon amber"><PenLine size={24} /></span><h2 id="leave-title">{c('Bạn chưa lưu bài viết', 'Your writing is not saved yet')}</h2><p>{c('Lưu nháp trước khi rời đi? Nếu không, thay đổi chưa lưu sẽ mất.', 'Save your draft before leaving? Unsaved changes are lost otherwise.')}</p><div className="button-row"><button className="button primary" onClick={() => void leave()}><Save size={17} />{c('Lưu và rời đi', 'Save and leave')}</button><button className="button outline" onClick={() => blocker.reset()}>{c('Tiếp tục viết', 'Keep writing')}</button></div></div></div>}
  </div>
}
