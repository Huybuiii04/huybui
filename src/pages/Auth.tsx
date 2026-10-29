import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowRight, Mail, PenLine } from 'lucide-react'
import { Brand, LanguageSwitch, ThemeToggle } from '../components/Layout'
import { Notice } from '../components/ui'
import { useCopy } from '../i18n'
import { useAuth } from '../lib/auth'
import { AUTH_ERROR_MESSAGES, type AuthErrorCode } from '../lib/authLogic'

type Mode = 'login' | 'signup' | 'forgot' | 'reset'

const MIN_PASSWORD = 8

export function Auth() {
  const { c } = useCopy()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, configured, signUp, signIn, sendReset, updatePassword } = useAuth()
  const [mode, setMode] = useState<Mode>(location.pathname.includes('reset') ? 'reset' : 'login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<AuthErrorCode | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/app'

  useEffect(() => {
    if (!loading && user && mode !== 'reset') navigate(from, { replace: true })
  }, [loading, user, mode, from, navigate])

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setNotice('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNotice('')
    if (mode === 'reset') {
      if (password.length < MIN_PASSWORD) return setError('weak_password')
      if (password !== confirm) return setError('password_mismatch')
      setBusy(true)
      const result = await updatePassword(password)
      setBusy(false)
      if (!result.ok) return setError(result.code ?? 'unknown')
      setNotice(c('Đã đổi mật khẩu. Bạn có thể đăng nhập lại.', 'Password updated. You can sign in again.'))
      setMode('login')
      return
    }
    if (mode === 'forgot') {
      if (!email.trim()) return
      setBusy(true)
      const result = await sendReset(email.trim())
      setBusy(false)
      if (!result.ok) return setError(result.code ?? 'unknown')
      setNotice(c('Đã gửi email hướng dẫn đặt lại mật khẩu. Hãy kiểm tra hộp thư.', 'We sent a password reset link. Please check your inbox.'))
      return
    }
    if (mode === 'signup') {
      if (!displayName.trim()) return
      if (password.length < MIN_PASSWORD) return setError('weak_password')
      setBusy(true)
      const result = await signUp(email.trim(), password, displayName.trim())
      setBusy(false)
      if (!result.ok) return setError(result.code ?? 'unknown')
      if (result.needsConfirmation) {
        setNotice(c('Đã tạo tài khoản. Hãy xác nhận email rồi đăng nhập.', 'Account created. Confirm your email, then sign in.'))
        setMode('login')
        return
      }
      navigate(from, { replace: true })
      return
    }
    setBusy(true)
    const result = await signIn(email.trim(), password)
    setBusy(false)
    if (!result.ok) return setError(result.code ?? 'unknown')
    navigate(from, { replace: true })
  }

  const title = mode === 'login' ? c('Chào mừng trở lại.', 'Welcome back.') : mode === 'signup' ? c('Một hành trình mới.', 'A new chapter.') : mode === 'forgot' ? c('Quên mật khẩu?', 'Forgot your password?') : c('Đặt lại mật khẩu', 'Reset your password')
  const subtitle = mode === 'login' ? c('Đăng nhập để đồng bộ bài viết của bạn.', 'Sign in to sync your essays across devices.') : mode === 'signup' ? c('Đăng ký xong là dùng được ngay, không cần xác nhận email.', 'Register and you are in — no email confirmation needed.') : mode === 'forgot' ? c('Chúng tôi sẽ gửi link đặt lại mật khẩu tới email của bạn.', 'We will email you a link to reset your password.') : c('Chọn mật khẩu mới cho tài khoản.', 'Choose a new password for your account.')

  return <div className="auth-page"><div className="auth-top"><Brand /><div className="auth-controls"><ThemeToggle /><LanguageSwitch /></div></div><div className="auth-card panel"><span className="task-icon teal"><PenLine size={25} /></span><h1>{title}</h1><p>{subtitle}</p>
    {!configured && <Notice>{c('Chưa cấu hình kết nối máy chủ. Đăng nhập tạm thời không khả dụng.', 'The server connection is not configured. Signing in is unavailable for now.')}</Notice>}
    {error && <Notice error>{c(...AUTH_ERROR_MESSAGES[error])}</Notice>}
    {notice && <Notice>{notice}</Notice>}
    <form onSubmit={event => { void submit(event) }}>
      {mode !== 'reset' && <label>Email<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>}
      {mode === 'signup' && <label>{c('Tên hiển thị', 'Display name')}<input required maxLength={60} autoComplete="name" value={displayName} onChange={event => setDisplayName(event.target.value)} placeholder={c('Ví dụ: Lan', 'e.g. Lan')} /></label>}
      {(mode === 'login' || mode === 'signup') && <label>{c('Mật khẩu', 'Password')}<input type="password" required minLength={MIN_PASSWORD} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" /><small className="helper-text">{c(`Tối thiểu ${MIN_PASSWORD} ký tự.`, `At least ${MIN_PASSWORD} characters.`)}</small></label>}
      {mode === 'reset' && <><label>{c('Mật khẩu mới', 'New password')}<input type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" /></label><label>{c('Xác nhận mật khẩu', 'Confirm password')}<input type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="••••••••" /></label></>}
      <button className="button primary full" disabled={busy || !configured}>
        {mode === 'login' ? c('Đăng nhập', 'Sign in') : mode === 'signup' ? c('Tạo tài khoản', 'Create account') : mode === 'forgot' ? c('Gửi hướng dẫn', 'Send instructions') : c('Đặt lại mật khẩu', 'Update password')}
        {mode === 'forgot' ? <Mail size={17} /> : <ArrowRight size={17} />}
      </button>
    </form>
    <div className="auth-links">
      {mode === 'login' && <button onClick={() => switchMode('signup')}>{c('Tạo tài khoản mới', 'Create an account')}</button>}
      {mode === 'signup' && <button onClick={() => switchMode('login')}>{c('Đã có tài khoản?', 'Already have an account?')}</button>}
      {mode === 'login' && <button onClick={() => switchMode('forgot')}>{c('Quên mật khẩu?', 'Forgot password?')}</button>}
      {(mode === 'forgot' || mode === 'reset') && <button onClick={() => switchMode('login')}>{c('Quay lại đăng nhập', 'Back to sign in')}</button>}
    </div>
    <Link className="button outline full" to="/">{c('Khám phá không cần tài khoản', 'Explore without an account')}</Link>
  </div></div>
}
