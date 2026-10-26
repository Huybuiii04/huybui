import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronRight, Loader2, LockKeyhole, Search, ShieldCheck, Trash2, UserCog } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { fetchAdminUsers, type AdminAccessRow, type AdminProfileRow } from '../../lib/adminRepository'
import { canDeleteUser, deleteConfirmationMatches, filterAdminUsers, type AdminUserRow } from '../../lib/adminLogic'
import { adminDeleteUser, adminUserAction } from '../../lib/ai'
import { AI_ERROR_MESSAGES } from '../../lib/aiLogic'
import { UserDetail } from './UserDetail'

export function UsersTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const { user } = useAuth()
  const currentAdminId = user?.id ?? ''
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([])
  const [access, setAccess] = useState<AdminAccessRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchAdminUsers()
    setProfiles(result.profiles)
    setAccess(result.access)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const accessByUser = useMemo(() => new Map(access.map(row => [row.user_id, row])), [access])
  // profiles (có email) + user_access (role, status) → một danh sách dùng chung.
  const rows = useMemo<AdminUserRow[]>(() => profiles.map(profile => ({
    user_id: profile.id,
    email: profile.email ?? '',
    display_name: profile.display_name ?? '',
    role: accessByUser.get(profile.id)?.role ?? 'user',
    status: accessByUser.get(profile.id)?.status ?? 'active',
    created_at: profile.created_at,
  })), [profiles, accessByUser])
  const visible = useMemo(() => filterAdminUsers(rows, query), [rows, query])

  function closeDelete() {
    setDeleteTarget(null)
    setConfirmEmail('')
    setDeleteError('')
  }

  useEffect(() => {
    if (!deleteTarget) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDelete()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [deleteTarget])

  async function act(action: 'suspend' | 'restore' | 'make_admin' | 'remove_admin', userId: string) {
    onBusy(true)
    onError('')
    setNotice('')
    const result = await adminUserAction(action, userId)
    onBusy(false)
    if (!result.ok) { onError(c(...AI_ERROR_MESSAGES[result.code])); return }
    await load()
  }

  function openDelete(row: AdminUserRow) {
    onError('')
    setNotice('')
    setDeleteError('')
    setConfirmEmail('')
    setDeleteTarget(row)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const email = confirmEmail.trim()
    if (!deleteConfirmationMatches(email, deleteTarget.email)) return
    onBusy(true)
    onError('')
    setDeleteError('')
    const result = await adminDeleteUser(deleteTarget.user_id, email)
    onBusy(false)
    // Lỗi: giữ modal mở để admin thử lại hoặc huỷ.
    if (!result.ok) {
      const message = c(...AI_ERROR_MESSAGES[result.code])
      setDeleteError(message)
      onError(message)
      return
    }
    const name = deleteTarget.display_name || deleteTarget.email
    closeDelete()
    setNotice(c(`Đã xoá tài khoản ${name}.`, `The account ${name} was deleted.`))
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải người dùng…', 'Loading users…')}</div></div>

  if (selected) {
    const profile = profiles.find(item => item.id === selected)
    return <UserDetail userId={selected} displayName={profile?.display_name ?? ''} onBack={() => setSelected('')} onError={onError} onBusy={onBusy} busy={busy} />
  }

  return <>
    <div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm người dùng', 'Search users')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm theo tên, email hoặc id…', 'Search by name, email or id…')} /></div></div>
    {notice && <p className="helper-text admin-users-notice">{notice}</p>}
    {!visible.length ? <div className="panel"><Empty title={c('Không có người dùng', 'No users yet')} description={c('Chỉ admin mới thấy danh sách này.', 'Only admins can see this list.')} /></div> : <div className="panel"><div className="usage-table admin-users-table"><div className="usage-row usage-head"><span>{c('Người dùng', 'User')}</span><span>{c('Email', 'Email')}</span><span>{c('Vai trò', 'Role')}</span><span>{c('Trạng thái', 'Status')}</span><span>{c('Thao tác', 'Actions')}</span></div>{visible.map(row => {
      return <div className="usage-row" key={row.user_id}><span className="admin-user-cell"><button className="text-link" onClick={() => setSelected(row.user_id)}>{row.display_name || row.user_id.slice(0, 8)}</button><small>{row.user_id.slice(0, 8)}</small></span><span className="admin-user-email">{row.email || '—'}</span><span><span className="badge neutral">{row.role}</span></span><span><span className={`badge ${row.status === 'active' ? 'teal' : 'warm'}`}>{row.status}</span></span><span className="row-actions">{row.status === 'active' ? <button className="icon-button" aria-label={c('Khoá tài khoản', 'Suspend account')} disabled={busy} onClick={() => void act('suspend', row.user_id)}><LockKeyhole size={16} /></button> : <button className="icon-button" aria-label={c('Mở khoá tài khoản', 'Restore account')} disabled={busy} onClick={() => void act('restore', row.user_id)}><ShieldCheck size={16} /></button>}{row.role === 'admin' ? <button className="icon-button" aria-label={c('Bỏ quyền admin', 'Remove admin')} disabled={busy} onClick={() => void act('remove_admin', row.user_id)}><UserCog size={16} /></button> : <button className="icon-button" aria-label={c('Cấp quyền admin', 'Make admin')} disabled={busy} onClick={() => void act('make_admin', row.user_id)}><UserCog size={16} /></button>}{canDeleteUser({ role: row.role, isSelf: row.user_id === currentAdminId }) && <button className="icon-button danger-text" aria-label={c('Xoá tài khoản', 'Delete account')} disabled={busy} onClick={() => openDelete(row)}><Trash2 size={16} /></button>}<button className="icon-button" aria-label={c('Xem chi tiết', 'View details')} onClick={() => setSelected(row.user_id)}><ChevronRight size={16} /></button></span></div>
    })}</div></div>}
    {deleteTarget && <div className="admin-delete-modal" role="dialog" aria-modal="true" aria-labelledby="admin-delete-title" onClick={event => { if (event.target === event.currentTarget) closeDelete() }}><div className="admin-delete-panel"><h2 id="admin-delete-title">{c('Xoá tài khoản', 'Delete account')}</h2><p className="helper-text">{c(`Bạn sắp xoá vĩnh viễn tài khoản của ${deleteTarget.display_name || deleteTarget.email}. Thao tác này không thể hoàn tác.`, `You are about to permanently delete the account of ${deleteTarget.display_name || deleteTarget.email}. This cannot be undone.`)}</p><div className="admin-delete-warning"><strong>{c('Dữ liệu sẽ bị xoá:', 'The following data will be deleted:')}</strong><ul className="admin-delete-list"><li>{c('Tài khoản đăng nhập', 'The login account')}</li><li>{c('Bài viết và bản nháp', 'Essays and drafts')}</li><li>{c('Thẻ từ vựng và lịch ôn tập', 'Vocabulary cards and review schedule')}</li><li>{c('Sổ log lỗi', 'The error logbook')}</li><li>{c('Ảnh đã tải lên', 'Uploaded images')}</li><li>{c('Tác vụ AI đang chờ', 'Pending AI jobs')}</li></ul></div><div className="admin-delete-confirm-row"><label htmlFor="admin-delete-email">{c('Gõ lại email để xác nhận', 'Type the email to confirm')}</label><code className="admin-delete-email">{deleteTarget.email || '—'}</code><input id="admin-delete-email" type="email" autoComplete="off" autoFocus value={confirmEmail} onChange={event => setConfirmEmail(event.target.value)} placeholder={deleteTarget.email} /></div>{deleteError && <p className="helper-text danger-text admin-delete-error">{deleteError}</p>}<div className="admin-delete-actions"><button className="button outline" onClick={closeDelete}>{c('Huỷ bỏ', 'Cancel')}</button><button className="button danger-outline" disabled={!deleteConfirmationMatches(confirmEmail, deleteTarget.email) || busy} onClick={() => void confirmDelete()}>{busy ? c('Đang xoá…', 'Deleting…') : c('Xoá vĩnh viễn', 'Delete permanently')}</button></div></div></div>}
  </>
}
