import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { AI_ERROR_MESSAGES } from '../../lib/aiLogic'
import { adminContentAction } from '../../lib/ai'
import { supabase } from '../../lib/supabase'
import { isSupportedWritingTask } from '../../data/prompts'

type ContentRow = { id: string; slug: string; kind: string; status: string; sort_order: number; task_type: string | null }

export function ContentTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [rows, setRows] = useState<ContentRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('content_entries').select('id,slug,kind,status,sort_order,task_type').order('sort_order', { ascending: true }).limit(200)
    setRows(((data ?? []) as ContentRow[]).filter(row => row.task_type === null || isSupportedWritingTask(row.task_type)))
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function act(action: 'publish' | 'hide' | 'delete', row: ContentRow) {
    if (action === 'delete' && !window.confirm(c(`Xoá nội dung "${row.slug}"?`, `Delete the content "${row.slug}"?`))) return
    onBusy(true)
    onError('')
    const result = await adminContentAction(action, { id: row.id })
    onBusy(false)
    if (!result.ok) { onError(c(...AI_ERROR_MESSAGES[result.code])); return }
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải nội dung…', 'Loading content…')}</div></div>
  if (!rows.length) return <div className="panel"><Empty title={c('Chưa có nội dung', 'No content yet')} description={c('Nội dung biên soạn sẽ hiện ở đây.', 'Curated content will appear here.')} /></div>

  return <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Slug', 'Slug')}</span><span>{c('Loại', 'Kind')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Thao tác', 'Actions')}</span></div>{rows.map(row => <div className="usage-row" key={row.id}><span>{row.slug}</span><span>{row.kind}</span><span><span className={`badge ${row.status === 'published' ? 'teal' : 'neutral'}`}>{row.status}</span></span><span className="row-actions">{row.status === 'published' ? <button className="icon-button" aria-label={c('Ẩn nội dung', 'Hide content')} disabled={busy} onClick={() => void act('hide', row)}><EyeOff size={16} /></button> : <button className="icon-button" aria-label={c('Xuất bản nội dung', 'Publish content')} disabled={busy} onClick={() => void act('publish', row)}><Eye size={16} /></button>}<button className="icon-button danger-text" aria-label={c('Xoá nội dung', 'Delete content')} disabled={busy} onClick={() => void act('delete', row)}><Trash2 size={16} /></button></span></div>)}</div></div>
}
