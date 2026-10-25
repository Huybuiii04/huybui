import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { fetchJobs, retryFailedJobs, retryJob, type AdminJobRow } from '../../lib/adminRepository'

export function JobsTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [jobs, setJobs] = useState<AdminJobRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setJobs(await fetchJobs())
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function retry(jobId: string) {
    onBusy(true)
    const result = await retryJob(jobId)
    onBusy(false)
    if (!result.ok) { onError(c('Không retry được tác vụ.', 'Could not retry the job.')); return }
    await load()
  }

  async function retryAll() {
    onBusy(true)
    const result = await retryFailedJobs()
    onBusy(false)
    if (!result.ok) { onError(c('Không retry được các tác vụ lỗi.', 'Could not retry the failed jobs.')); return }
    await load()
  }

  const failed = jobs.filter(job => job.status === 'failed')

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải tác vụ…', 'Loading jobs…')}</div></div>

  return <>
    <div className="filter-bar"><button className="button outline" onClick={() => void load()}><RefreshCw size={16} />{c('Tải lại', 'Reload')}</button><button className="button primary" disabled={busy || !failed.length} onClick={() => void retryAll()}><RefreshCw size={16} />{c(`Retry ${failed.length} tác vụ lỗi`, `Retry ${failed.length} failed jobs`)}</button></div>
    {!jobs.length ? <div className="panel"><Empty title={c('Chưa có tác vụ AI', 'No AI jobs yet')} description={c('Mỗi lần chấm bài sẽ tạo một tác vụ ở đây.', 'Each assessment creates a job here.')} /></div> : <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Tác vụ', 'Operation')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Lỗi', 'Error')}</span><span>{c('Thời gian', 'Time')}</span></div>{jobs.map(job => <div className="usage-row" key={job.id}><span>{job.operation}</span><span><span className={`badge ${job.status === 'succeeded' ? 'teal' : job.status === 'failed' ? 'warm' : 'neutral'}`}>{job.status}</span></span><span className="admin-prompt-cell"><span>{job.error_code ?? '—'}</span></span><span className="row-actions"><small>{new Date(job.created_at).toLocaleString()}</small>{job.status === 'failed' && <button className="icon-button" aria-label={c('Retry tác vụ', 'Retry job')} disabled={busy} onClick={() => void retry(job.id)}><RefreshCw size={15} /></button>}</span></div>)}</div></div>}
  </>
}
