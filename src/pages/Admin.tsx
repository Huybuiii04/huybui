import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, Trash2, UserCog } from 'lucide-react'
import { useCopy } from '../i18n'
import { supabase } from '../lib/supabase'
import { Empty, Notice, PageHeader } from '../components/ui'
import { AI_ERROR_MESSAGES } from '../lib/aiLogic.ts'
import { adminUserAction, fetchAdminUsage, type AdminUsage } from '../lib/ai.ts'

type ContentRow = { id: string; slug: string; kind: string; status: string; sort_order: number; task_type: string | null }
type ProfileRow = { id: string; display_name: string | null; created_at: string }
type AccessRow = { user_id: string; role: string; status: string }
type JobRow = { id: string; operation: string; status: string; created_at: string; user_id: string }

export function Admin() {
  const { c } = useCopy()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'content'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return <>
    <PageHeader eyebrow="ADMIN" title={c('Quản trị', 'Administration')} description={c('Theo dõi nội dung, người dùng và chi phí AI.', 'Track content, users and AI usage.')} />
    <div className="tabs">{[['content', c('Nội dung', 'Content')], ['users', c('Người dùng', 'Users')], ['jobs', c('Tác vụ AI', 'AI jobs')], ['usage', c('Token & chi phí', 'Tokens & costs')]].map(([value, label]) => <button key={value} className={tab === value ? 'active' : ''} onClick={() => setParams({ tab: value })}>{label}</button>)}</div>
    {error && <Notice error>{error}</Notice>}
    {tab === 'content' && <ContentAdmin onError={setError} onBusy={setBusy} busy={busy} />}
    {tab === 'users' && <UsersAdmin onError={setError} onBusy={setBusy} busy={busy} />}
    {tab === 'jobs' && <JobsAdmin onError={setError} />}
    {tab === 'usage' && <UsageAdmin onError={setError} onBusy={setBusy} busy={busy} />}
  </>
}

function ContentAdmin({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [rows, setRows] = useState<ContentRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('content_entries').select('id,slug,kind,status,sort_order,task_type').order('sort_order', { ascending: true }).limit(200)
    if (error) onError(c(...AI_ERROR_MESSAGES['unknown']))
    setRows((data ?? []) as ContentRow[])
    setLoading(false)
  }, [onError])

  useEffect(() => { void load() }, [load])

  async function act(action: 'publish' | 'hide' | 'delete', row: ContentRow) {
    if (action === 'delete' && !window.confirm(c(`Xoá nội dung "${row.slug}"?`, `Delete the content "${row.slug}"?`))) return
    onBusy(true)
    onError('')
    const { adminContentAction } = await import('../lib/ai.ts')
    const result = await adminContentAction(action, { id: row.id })
    onBusy(false)
    if (!result.ok) { onError(c(...AI_ERROR_MESSAGES[result.code])); return }
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải nội dung…', 'Loading content…')}</div></div>
  if (!rows.length) return <div className="panel"><Empty title={c('Chưa có nội dung', 'No content yet')} description={c('Nội dung biên soạn sẽ hiện ở đây.', 'Curated content will appear here.')} /></div>
  return <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Slug', 'Slug')}</span><span>{c('Loại', 'Kind')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Thao tác', 'Actions')}</span></div>{rows.map(row => <div className="usage-row" key={row.id}><span>{row.slug}</span><span>{row.kind}</span><span><span className={`badge ${row.status === 'published' ? 'teal' : 'neutral'}`}>{row.status}</span></span><span className="row-actions">{row.status === 'published' ? <button className="icon-button" aria-label={c('Ẩn nội dung', 'Hide content')} disabled={busy} onClick={() => void act('hide', row)}><EyeOff size={16} /></button> : <button className="icon-button" aria-label={c('Xuất bản nội dung', 'Publish content')} disabled={busy} onClick={() => void act('publish', row)}><Eye size={16} /></button>}<button className="icon-button danger-text" aria-label={c('Xoá nội dung', 'Delete content')} disabled={busy} onClick={() => void act('delete', row)}><Trash2 size={16} /></button></span></div>)}</div></div>
}

function UsersAdmin({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [access, setAccess] = useState<AccessRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [profileResult, accessResult] = await Promise.all([
      supabase.from('profiles').select('id,display_name,created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('user_access').select('user_id,role,status').limit(200),
    ])
    onError('')
    setProfiles((profileResult.data ?? []) as ProfileRow[])
    setAccess((accessResult.data ?? []) as AccessRow[])
    setLoading(false)
  }, [onError])

  useEffect(() => { void load() }, [load])

  async function act(action: 'suspend' | 'restore' | 'make_admin' | 'remove_admin', userId: string) {
    onBusy(true)
    onError('')
    const result = await adminUserAction(action, userId)
    onBusy(false)
    if (!result.ok) { onError(c(...AI_ERROR_MESSAGES[result.code])); return }
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải người dùng…', 'Loading users…')}</div></div>
  if (!profiles.length) return <div className="panel"><Empty title={c('Không có người dùng', 'No users yet')} description={c('Chỉ admin mới thấy danh sách này.', 'Only admins can see this list.')} /></div>
  const accessByUser = new Map(access.map(row => [row.user_id, row]))
  return <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Người dùng', 'User')}</span><span>{c('Vai trò', 'Role')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Thao tác', 'Actions')}</span></div>{profiles.map(profile => {
    const role = accessByUser.get(profile.id)?.role ?? 'user'
    const status = accessByUser.get(profile.id)?.status ?? 'active'
    return <div className="usage-row" key={profile.id}><span>{profile.display_name || profile.id.slice(0, 8)}</span><span><span className="badge neutral">{role}</span></span><span><span className={`badge ${status === 'active' ? 'teal' : 'warm'}`}>{status}</span></span><span className="row-actions">{status === 'active' ? <button className="icon-button" aria-label={c('Khoá tài khoản', 'Suspend account')} disabled={busy} onClick={() => void act('suspend', profile.id)}><LockKeyhole size={16} /></button> : <button className="icon-button" aria-label={c('Mở khoá tài khoản', 'Restore account')} disabled={busy} onClick={() => void act('restore', profile.id)}><ShieldCheck size={16} /></button>}{role === 'admin' ? <button className="icon-button" aria-label={c('Bỏ quyền admin', 'Remove admin')} disabled={busy} onClick={() => void act('remove_admin', profile.id)}><UserCog size={16} /></button> : <button className="icon-button" aria-label={c('Cấp quyền admin', 'Make admin')} disabled={busy} onClick={() => void act('make_admin', profile.id)}><UserCog size={16} /></button>}</span></div>
  })}</div></div>
}

function JobsAdmin({ onError }: { onError: (value: string) => void }) {
  const { c } = useCopy()
  const [rows, setRows] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void supabase.from('ai_jobs').select('id,operation,status,created_at,user_id').order('created_at', { ascending: false }).limit(100).then(({ data, error }) => {
      if (!active) return
      if (error) onError(c(...AI_ERROR_MESSAGES['unknown']))
      setRows((data ?? []) as JobRow[])
      setLoading(false)
    })
    return () => { active = false }
  }, [onError, c])

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải tác vụ…', 'Loading jobs…')}</div></div>
  if (!rows.length) return <div className="panel"><Empty title={c('Chưa có tác vụ AI', 'No AI jobs yet')} description={c('Mỗi lần chấm bài sẽ tạo một tác vụ ở đây.', 'Each assessment creates a job here.')} /></div>
  return <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Tác vụ', 'Operation')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Người dùng', 'User')}</span><span>{c('Thời gian', 'Time')}</span></div>{rows.map(row => <div className="usage-row" key={row.id}><span>{row.operation}</span><span><span className={`badge ${row.status === 'succeeded' ? 'teal' : row.status === 'failed' ? 'warm' : 'neutral'}`}>{row.status}</span></span><span>{row.user_id.slice(0, 8)}</span><span>{new Date(row.created_at).toLocaleString()}</span></div>)}</div></div>
}

function UsageAdmin({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [usage, setUsage] = useState<AdminUsage | null>(null)

  async function load() {
    onBusy(true)
    onError('')
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
    const result = await fetchAdminUsage(from.toISOString(), to.toISOString())
    onBusy(false)
    if (!result.ok) { onError(c(...AI_ERROR_MESSAGES[result.code])); return }
    setUsage(result.value)
  }

  useEffect(() => { void load() }, [])

  if (!usage) return <div className="panel"><Empty title={c('Chưa có dữ liệu', 'No data yet')} description={c('Bấm "Tải dữ liệu" để đọc số liệu từ máy chủ.', 'Use "Load usage" to read the figures from the server.')} action={<button className="button primary" disabled={busy} onClick={() => void load()}>{busy ? c('Đang tải…', 'Loading…') : c('Tải dữ liệu', 'Load usage')}</button>} /></div>
  return <div className="panel"><div className="panel-heading"><h2>{c('Token & chi phí 30 ngày', 'Tokens & costs — last 30 days')}</h2><button className="button outline" disabled={busy} onClick={() => void load()}>{busy ? c('Đang tải…', 'Loading…') : c('Tải lại', 'Reload')}</button></div><div className="usage-table"><div className="usage-row usage-head"><span>{c('Mô hình', 'Model')}</span><span>{c('Input', 'Input')}</span><span>{c('Output', 'Output')}</span><span>{c('Độ trễ', 'Latency')}</span></div>{usage.rows.map((row, index) => <div className="usage-row" key={`${row.model}-${index}`}><span>{row.model}</span><span>{row.input_tokens.toLocaleString()}</span><span>{row.output_tokens.toLocaleString()}</span><span>{row.latency_ms} ms</span></div>)}</div><p className="helper-text">{c(`Tổng: ${usage.totals.jobs} lượt · ${usage.totals.inputTokens.toLocaleString()} token vào · ${usage.totals.outputTokens.toLocaleString()} token ra.`, `Total: ${usage.totals.jobs} calls · ${usage.totals.inputTokens.toLocaleString()} input tokens · ${usage.totals.outputTokens.toLocaleString()} output tokens.`)}</p></div>
}
