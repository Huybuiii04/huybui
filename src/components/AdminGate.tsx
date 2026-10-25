import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { KeyRound, ShieldAlert } from 'lucide-react'
import { useCopy } from '../i18n'
import { Notice } from './ui'
import { fetchMyAdminRole } from '../lib/adminRepository'
import { getAdminSession, unlockAdmin, type AdminSession } from '../lib/adminSession'

/**
 * Cổng quản trị 2 lớp:
 *  1. đã đăng nhập app bằng tài khoản có role admin;
 *  2. nhập mật khẩu quản trị để mở phiên token (12 giờ).
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { c } = useCopy()
  const [role, setRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<AdminSession | null>(() => getAdminSession())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    void fetchMyAdminRole().then(value => {
      if (!active) return
      setRole(value)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const unlocked = await unlockAdmin(password)
    setBusy(false)
    if (!unlocked) {
      setError(c('Mật khẩu quản trị không đúng.', 'The admin password is incorrect.'))
      return
    }
    setSession(unlocked)
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status">{c('Đang kiểm tra quyền quản trị…', 'Checking administrator access…')}</div></div>

  if (role !== 'admin') {
    return <div className="panel admin-locked"><ShieldAlert size={34} /><h1>{c('Bạn không có quyền quản trị', 'You do not have administrator access')}</h1><p>{c('Trang này chỉ dành cho tài khoản quản trị của dự án.', 'This page is reserved for project administrator accounts.')}</p><Link className="button outline" to="/app">{c('Quay lại không gian học tập', 'Back to your workspace')}</Link></div>
  }

  if (!session) {
    return <div className="panel admin-locked"><KeyRound size={34} /><h1>{c('Mở bảng quản trị', 'Unlock the admin console')}</h1><p>{c('Nhập mật khẩu quản trị để tiếp tục.', 'Enter the administrator password to continue.')}</p><form className="admin-unlock" onSubmit={submit}><label className="sr-only" htmlFor="admin-password">{c('Mật khẩu quản trị', 'Admin password')}</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder={c('Mật khẩu quản trị', 'Admin password')} /><button className="button primary" type="submit" disabled={busy || !password}>{busy ? c('Đang kiểm tra…', 'Checking…') : c('Mở bảng quản trị', 'Unlock')}</button></form>{error && <Notice error>{error}</Notice>}</div>
  }

  return <>{children}</>
}
