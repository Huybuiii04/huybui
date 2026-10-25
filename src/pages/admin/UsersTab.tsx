import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronRight, Loader2, LockKeyhole, Search, ShieldCheck, UserCog } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { fetchAdminUsers, type AdminAccessRow, type AdminProfileRow } from '../../lib/adminRepository'
import { adminUserAction } from '../../lib/ai'
import { AI_ERROR_MESSAGES } from '../../lib/aiLogic'
import { UserDetail } from './UserDetail'

export function UsersTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([])
  const [access, setAccess] = useState<AdminAccessRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchAdminUsers()
    setProfiles(result.profiles)
    setAccess(result.access)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const accessByUser = useMemo(() => new Map(access.map(row => [row.user_id, row])), [access])
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return profiles
    return profiles.filter(profile => `${profile.display_name ?? ''} ${profile.id}`.toLowerCase().includes(needle))
  }, [profiles, query])

  async function act(action: 'suspend' | 'restore' | 'make_admin' | 'remove_admin', userId: string) {
    onBusy(true)
    onError('')
    const result = await adminUserAction(action, userId)
    onBusy(false)
    if (!result.ok) { onError(c(...AI_ERROR_MESSAGES[result.code])); return }
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải người dùng…', 'Loading users…')}</div></div>

  if (selected) {
    const profile = profiles.find(item => item.id === selected)
    return <UserDetail userId={selected} displayName={profile?.display_name ?? ''} onBack={() => setSelected('')} onError={onError} onBusy={onBusy} busy={busy} />
  }

  return <>
    <div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm người dùng', 'Search users')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm theo tên hoặc id…', 'Search by name or id…')} /></div></div>
    {!visible.length ? <div className="panel"><Empty title={c('Không có người dùng', 'No users yet')} description={c('Chỉ admin mới thấy danh sách này.', 'Only admins can see this list.')} /></div> : <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Người dùng', 'User')}</span><span>{c('Vai trò', 'Role')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Thao tác', 'Actions')}</span></div>{visible.map(profile => {
      const role = accessByUser.get(profile.id)?.role ?? 'user'
      const status = accessByUser.get(profile.id)?.status ?? 'active'
      return <div className="usage-row" key={profile.id}><span className="admin-user-cell"><button className="text-link" onClick={() => setSelected(profile.id)}>{profile.display_name || profile.id.slice(0, 8)}</button><small>{profile.id.slice(0, 8)}</small></span><span><span className="badge neutral">{role}</span></span><span><span className={`badge ${status === 'active' ? 'teal' : 'warm'}`}>{status}</span></span><span className="row-actions">{status === 'active' ? <button className="icon-button" aria-label={c('Khoá tài khoản', 'Suspend account')} disabled={busy} onClick={() => void act('suspend', profile.id)}><LockKeyhole size={16} /></button> : <button className="icon-button" aria-label={c('Mở khoá tài khoản', 'Restore account')} disabled={busy} onClick={() => void act('restore', profile.id)}><ShieldCheck size={16} /></button>}{role === 'admin' ? <button className="icon-button" aria-label={c('Bỏ quyền admin', 'Remove admin')} disabled={busy} onClick={() => void act('remove_admin', profile.id)}><UserCog size={16} /></button> : <button className="icon-button" aria-label={c('Cấp quyền admin', 'Make admin')} disabled={busy} onClick={() => void act('make_admin', profile.id)}><UserCog size={16} /></button>}<button className="icon-button" aria-label={c('Xem chi tiết', 'View details')} onClick={() => setSelected(profile.id)}><ChevronRight size={16} /></button></span></div>
    })}</div></div>}
  </>
}
