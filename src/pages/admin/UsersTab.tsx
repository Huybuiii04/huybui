import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, Loader2, LockKeyhole, Search, ShieldCheck, Trash2, UserCog } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { fetchAdminUsers, type AdminAccessRow, type AdminProfileRow } from '../../lib/adminRepository'
import { canDeleteUser, deleteConfirmationMatches, filterAdminUsers, type AdminUserRow } from '../../lib/adminLogic'
import { adminDeleteUser, adminUserAction } from '../../lib/ai'
import { AI_ERROR_MESSAGES } from '../../lib/aiLogic'
import { UserDetail } from './UserDetail'

/** Các phần tử có thể nhận focus bên trong modal (dùng để khoá focus). */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function UsersTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const { user } = useAuth()
  const currentAdminId = user?.id ?? ''
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([])
  const [access, setAccess] = useState<AdminAccessRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string>('')
  const [listError, setListError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const deletingRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchAdminUsers()
    setProfiles(result.profiles)
    setAccess(result.access)
    setListError(result.error ?? '')
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

  const closeDelete = useCallback(() => {
    setDeleteTarget(null)
    setConfirmEmail('')
    setDeleteError('')
    setDeleting(false)
    deletingRef.current = false
  }, [])

  /**
   * Modal xoá: khoá focus bên trong, Escape đóng, khoá cuộn nền. Focus được
   * đưa vào ô nhập email ngay khi mở và trả lại nút đã mở modal khi đóng.
   */
  useEffect(() => {
    if (!deleteTarget) return
    const panel = dialogRef.current
    if (!panel) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(element => element.getClientRects().length > 0)
    focusables()[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeDelete(); return }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) { event.preventDefault(); last.focus() }
        return
      }
      if (active === last || !panel.contains(active)) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [deleteTarget, closeDelete])

  // Đóng modal → trả focus về nút đã mở nó (nếu nút còn trong trang).
  useEffect(() => {
    if (deleteTarget) return
    const trigger = triggerRef.current
    if (!trigger) return
    triggerRef.current = null
    if (trigger.isConnected) trigger.focus()
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

  function openDelete(row: AdminUserRow, trigger: HTMLButtonElement) {
    onError('')
    setNotice('')
    setDeleteError('')
    setConfirmEmail('')
    setDeleting(false)
    deletingRef.current = false
    triggerRef.current = trigger
    setDeleteTarget(row)
  }

  async function confirmDelete() {
    if (!deleteTarget || deletingRef.current) return
    const email = confirmEmail.trim()
    if (!deleteConfirmationMatches(email, deleteTarget.email)) return
    deletingRef.current = true
    setDeleting(true)
    onBusy(true)
    onError('')
    setDeleteError('')
    const result = await adminDeleteUser(deleteTarget.user_id, email)
    onBusy(false)
    deletingRef.current = false
    setDeleting(false)
    // Lỗi: giữ modal mở để admin thử lại hoặc huỷ.
    if (!result.ok) {
      const message = c(...AI_ERROR_MESSAGES[result.code])
      setDeleteError(message)
      onError(message)
      return
    }
    // Không đưa email vào thông báo — chỉ tên hiển thị (hoặc 8 ký tự đầu id).
    const name = deleteTarget.display_name || deleteTarget.user_id.slice(0, 8)
    closeDelete()
    setNotice(c(`Đã xoá tài khoản ${name}.`, `The account ${name} was deleted.`))
    await load()
    // Dòng bị xoá đã biến mất nên không thể trả focus về nút cũ: đưa focus về
    // ô tìm kiếm sau khi bảng render lại.
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const dialog = deleteTarget ? createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-delete-title" onClick={event => { if (event.target === event.currentTarget) closeDelete() }}>
      <div className="admin-delete-panel" ref={dialogRef}>
        <h2 id="admin-delete-title">{c('Xoá tài khoản', 'Delete account')}</h2>
        <p className="helper-text">{c(`Bạn sắp xoá vĩnh viễn tài khoản của ${deleteTarget.display_name || deleteTarget.email}. Thao tác này không thể hoàn tác.`, `You are about to permanently delete the account of ${deleteTarget.display_name || deleteTarget.email}. This cannot be undone.`)}</p>
        <div className="admin-delete-warning">
          <strong>{c('Dữ liệu sẽ bị xoá:', 'The following data will be deleted:')}</strong>
          <ul className="admin-delete-list">
            <li>{c('Tài khoản đăng nhập', 'The login account')}</li>
            <li>{c('Bài viết và bản nháp', 'Essays and drafts')}</li>
            <li>{c('Thẻ từ vựng và lịch ôn tập', 'Vocabulary cards and review schedule')}</li>
            <li>{c('Sổ log lỗi', 'The error logbook')}</li>
            <li>{c('Ảnh đã tải lên', 'Uploaded images')}</li>
            <li>{c('Tác vụ AI đang chờ', 'Pending AI jobs')}</li>
          </ul>
        </div>
        <div className="admin-delete-confirm-row">
          <label htmlFor="admin-delete-email">{c('Gõ lại email để xác nhận', 'Type the email to confirm')}</label>
          <code className="admin-delete-email">{deleteTarget.email || '—'}</code>
          <input id="admin-delete-email" type="text" inputMode="email" autoComplete="off" autoFocus value={confirmEmail} onChange={event => setConfirmEmail(event.target.value)} placeholder={deleteTarget.email} />
        </div>
        {deleteError && <p className="helper-text danger-text admin-delete-error">{deleteError}</p>}
        <div className="admin-delete-actions">
          <button className="button outline" onClick={closeDelete}>{c('Huỷ bỏ', 'Cancel')}</button>
          <button className="button danger-outline" disabled={!deleteConfirmationMatches(confirmEmail, deleteTarget.email) || busy || deleting} onClick={() => void confirmDelete()}>{deleting ? c('Đang xoá…', 'Deleting…') : c('Xoá vĩnh viễn', 'Delete permanently')}</button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null

  if (loading) return <><div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải người dùng…', 'Loading users…')}</div></div>{dialog}</>

  if (selected) {
    const profile = profiles.find(item => item.id === selected)
    return <><UserDetail userId={selected} displayName={profile?.display_name ?? ''} onBack={() => setSelected('')} onError={onError} onBusy={onBusy} busy={busy} />{dialog}</>
  }

  return <>
    <div className="filter-bar"><div className="search-field"><Search size={18} /><input ref={searchRef} aria-label={c('Tìm người dùng', 'Search users')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm theo tên, email hoặc id…', 'Search by name, email or id…')} /></div></div>
    {notice && <p className="helper-text admin-users-notice" role="status">{notice}</p>}
    {listError && <p className="helper-text danger-text admin-users-error" role="alert">{c('Không tải được danh sách người dùng. Hãy tải lại trang để thử lại.', 'Could not load the user list. Reload the page to try again.')}</p>}
    {!listError && !visible.length && <div className="panel"><Empty title={c('Không có người dùng', 'No users yet')} description={c('Chỉ admin mới thấy danh sách này.', 'Only admins can see this list.')} /></div>}
    {!listError && visible.length > 0 && <div className="panel"><div className="usage-table admin-users-table" role="table" aria-label={c('Danh sách người dùng', 'User list')}>
      <div className="usage-row usage-head" role="row">
        <span role="columnheader">{c('Người dùng', 'User')}</span>
        <span role="columnheader">{c('Email', 'Email')}</span>
        <span role="columnheader">{c('Vai trò', 'Role')}</span>
        <span role="columnheader">{c('Trạng thái', 'Status')}</span>
        <span role="columnheader">{c('Thao tác', 'Actions')}</span>
      </div>
      {visible.map(row => <div className="usage-row" role="row" key={row.user_id}>
        <span className="admin-user-cell" role="cell"><button className="text-link" onClick={() => setSelected(row.user_id)}>{row.display_name || row.user_id.slice(0, 8)}</button><small>{row.user_id.slice(0, 8)}</small></span>
        <span className="admin-user-email" role="cell">{row.email || '—'}</span>
        <span role="cell"><span className="badge neutral">{row.role}</span></span>
        <span role="cell"><span className={`badge ${row.status === 'active' ? 'teal' : 'warm'}`}>{row.status}</span></span>
        <span className="row-actions" role="cell">
          {row.status === 'active' ? <button className="icon-button" aria-label={c('Khoá tài khoản', 'Suspend account')} disabled={busy} onClick={() => void act('suspend', row.user_id)}><LockKeyhole size={16} /></button> : <button className="icon-button" aria-label={c('Mở khoá tài khoản', 'Restore account')} disabled={busy} onClick={() => void act('restore', row.user_id)}><ShieldCheck size={16} /></button>}
          {row.role === 'admin' ? <button className="icon-button" aria-label={c('Bỏ quyền admin', 'Remove admin')} disabled={busy} onClick={() => void act('remove_admin', row.user_id)}><UserCog size={16} /></button> : <button className="icon-button" aria-label={c('Cấp quyền admin', 'Make admin')} disabled={busy} onClick={() => void act('make_admin', row.user_id)}><UserCog size={16} /></button>}
          {canDeleteUser({ role: row.role, isSelf: row.user_id === currentAdminId }) && <button className="icon-button danger-text" aria-label={c('Xoá tài khoản', 'Delete account')} disabled={busy} onClick={event => openDelete(row, event.currentTarget)}><Trash2 size={16} /></button>}
          <button className="icon-button" aria-label={c('Xem chi tiết', 'View details')} onClick={() => setSelected(row.user_id)}><ChevronRight size={16} /></button>
        </span>
      </div>)}
    </div></div>}
    {dialog}
  </>
}
