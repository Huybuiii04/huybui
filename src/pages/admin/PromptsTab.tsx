import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Loader2, Search } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { fetchPrompts, setPromptStatus, type AdminPrompt } from '../../lib/adminRepository'
import { promptLabel, shortPrompt } from '../../lib/adminLogic'
import { isSupportedWritingTask } from '../../data/prompts'

export function PromptsTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c, language } = useCopy()
  const [prompts, setPrompts] = useState<AdminPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [task, setTask] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    setPrompts((await fetchPrompts()).filter(prompt => isSupportedWritingTask(prompt.task)))
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const tasks = useMemo(() => [...new Set(prompts.map(prompt => prompt.task))].sort(), [prompts])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return prompts.filter(prompt => {
      if (task !== 'all' && prompt.task !== task) return false
      if (!needle) return true
      return `${prompt.slug} ${prompt.titleVi ?? ''} ${prompt.titleEn ?? ''} ${prompt.text ?? ''}`.toLowerCase().includes(needle)
    })
  }, [prompts, query, task])

  async function toggle(prompt: AdminPrompt) {
    const next = prompt.status === 'published' ? 'hidden' : 'published'
    onBusy(true)
    const result = await setPromptStatus(prompt.slug, next)
    onBusy(false)
    if (!result.ok) { onError(c('Không cập nhật được đề bài.', 'Could not update the prompt.')); return }
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải đề bài…', 'Loading prompts…')}</div></div>

  return <>
    <div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm đề bài', 'Search prompts')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm slug hoặc nội dung…', 'Search slug or text…')} /></div><select aria-label={c('Loại bài', 'Task type')} value={task} onChange={event => setTask(event.target.value)}><option value="all">{c('Tất cả loại', 'All tasks')}</option>{tasks.map(item => <option key={item} value={item}>{item}</option>)}</select></div>
    {!visible.length ? <div className="panel"><Empty title={c('Không có đề bài', 'No prompts')} description={c('Thử từ khóa khác.', 'Try another keyword.')} /></div> : <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Đề', 'Prompt')}</span><span>{c('Loại', 'Task')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Thao tác', 'Actions')}</span></div>{visible.slice(0, 300).map(prompt => <div className="usage-row" key={prompt.slug}><span className="admin-prompt-cell"><strong>{promptLabel(prompt, language === 'en' ? 'en' : 'vi')}</strong><small>{prompt.slug} — {shortPrompt(prompt.text ?? '', 60)}</small></span><span>{prompt.task}</span><span><span className={`badge ${prompt.status === 'published' ? 'teal' : 'warm'}`}>{prompt.status}</span></span><span className="row-actions"><button className="icon-button" aria-label={prompt.status === 'published' ? c('Ẩn đề', 'Hide prompt') : c('Hiện đề', 'Publish prompt')} disabled={busy} onClick={() => void toggle(prompt)}>{prompt.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></div>)}</div>{visible.length > 300 && <p className="helper-text">{c(`Còn ${visible.length - 300} đề khác — dùng ô tìm kiếm để lọc.`, `${visible.length - 300} more prompts — use the search box.`)}</p>}</div>}
  </>
}
