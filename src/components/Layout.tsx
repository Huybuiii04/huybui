import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { BookMarked, BookOpen, ChevronRight, CircleHelp, ClipboardList, FileText, Heart, LayoutDashboard, Mic, Lightbulb, LogOut, Menu, Moon, NotebookPen, PanelLeftClose, PanelLeftOpen, RotateCcw, Settings, ShieldCheck, Sun, X } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { useAdminRole } from '../lib/adminRole'
import { useTheme } from '../theme'
import { isConfigured } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Notice } from './ui'
import { landingCopy } from '../agent/landing'

const SIDEBAR_STORAGE_KEY = 'ielts-studio:sidebar-collapsed'

/** Đọc trạng thái thu gọn của thanh bên đã lưu ở lần trước. */
function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function Brand() {
  return <Link to="/app" className="brand" aria-label="IELTS Studio"><img className="brand-mark" src="/brand/ielts-studio-mark.webp" width="44" height="44" alt="" /><span>IELTS Studio</span></Link>
}
export function LanguageSwitch() {
  const { language, changeLanguage, c } = useCopy()
  return <div className="language-switch" aria-label={c(landingCopy.languageSwitchLabel[0], landingCopy.languageSwitchLabel[1])}>{landingCopy.languageButtons.map(button => <button key={button.code} onClick={() => void changeLanguage(button.code)} aria-pressed={language === button.code} className={language === button.code ? 'selected' : ''}>{button.label}</button>)}</div>
}
export function ThemeToggle() {
  const { c } = useCopy()
  const { theme, toggle } = useTheme()
  return <button className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? c('Chuyển sang giao diện sáng', 'Switch to light theme') : c('Chuyển sang giao diện tối', 'Switch to dark theme')} title={theme === 'dark' ? c('Giao diện sáng', 'Light theme') : c('Giao diện tối', 'Dark theme')}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
}
export default function Layout() {
  const { c } = useCopy()
  const { state, ready, error } = useStore()
  const { signOut, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed)
  const location = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [location.pathname])
  const toggleCollapsed = () => setCollapsed(value => {
    const next = !value
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0') } catch { /* vẫn dùng được trong phiên này */ }
    return next
  })
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])
  const due = state.cards.filter(card => card.dueAt <= Date.now()).length
  const isAdmin = useAdminRole()
  const nav = [
    { group: c('LUYỆN TẬP', 'PRACTICE'), path: '/app', icon: LayoutDashboard, label: c('Tổng quan', 'Overview'), end: true },
    { path: '/app/prompts', icon: ClipboardList, label: c('Luyện viết', 'Writing') },
    { path: '/app/reading', icon: BookMarked, label: c('Luyện đọc', 'Reading') },
    { path: '/app/speaking', icon: Mic, label: c('Luyện nói', 'Speaking') },
    { group: c('GÓC HỌC TẬP', 'MY LEARNING'), path: '/app/essays', icon: FileText, label: c('Bài viết của tôi', 'My writing') },
    { path: '/app/vocabulary', icon: BookOpen, label: c('Sổ từ vựng', 'Vocabulary') },
    { path: '/app/review', icon: RotateCcw, label: c('Ôn tập', 'Review'), badge: due },
    { path: '/app/errors', icon: NotebookPen, label: c('Sổ lỗi sai', 'Error logbook') },
    ...(isAdmin ? [{ group: c('QUẢN TRỊ', 'ADMINISTRATION'), path: '/admin', icon: ShieldCheck, label: c('Bảng quản trị', 'Administration') }] : []),
  ]
  const current = nav.find(item => item.end ? location.pathname === item.path : location.pathname.startsWith(item.path))
  const currentLabel = current?.label ?? (location.pathname.startsWith('/app/write') ? c('Luyện viết', 'Writing') : location.pathname === '/app/settings' ? c('Cài đặt', 'Settings') : location.pathname === '/donate' ? c('Ủng hộ dự án', 'Support the project') : c('Không gian học tập', 'Workspace'))
  return <div className={`app-shell ${collapsed ? 'is-sidebar-collapsed' : ''}`}>
    <a href="#main" className="skip-link">{c('Đến nội dung', 'Skip to content')}</a>
    {open && <button className="sidebar-scrim" aria-label={c('Đóng menu', 'Close menu')} onClick={() => setOpen(false)} />}
    <aside id="app-sidebar" className={`sidebar ${open ? 'is-open' : ''}`}><div className="sidebar-brand"><Brand /><button type="button" className="icon-button desktop-only sidebar-toggle" onClick={toggleCollapsed} aria-expanded={!collapsed} aria-controls="app-sidebar" aria-label={c('Thu gọn thanh bên', 'Collapse the sidebar')} title={c('Thu gọn thanh bên', 'Collapse the sidebar')}><PanelLeftClose size={20} /></button><button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label={c('Đóng menu', 'Close menu')}><X size={20} /></button></div>
      <nav aria-label={c('Điều hướng chính', 'Main navigation')} className="side-nav">{nav.map(item => <div key={item.path}>{'group' in item && item.group && <p className="nav-label">{item.group}</p>}<NavLink to={item.path} end={item.end} className={({ isActive }) => `nav-item ${isActive || (item.path === '/app/prompts' && location.pathname.startsWith('/app/write')) ? 'active' : ''}`}><item.icon size={19} /><span>{item.label}</span>{!!item.badge && <span className="nav-count">{item.badge}</span>}</NavLink></div>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/donate" className="nav-item"><Heart size={18} />{c('Ủng hộ dự án', 'Support the project')}</NavLink><NavLink to="/app/settings" className="nav-item"><Settings size={18} />{c('Cài đặt', 'Settings')}</NavLink><div className="sidebar-footer"><span>© 2026 IELTS Studio</span></div></div>
    </aside>
    <div className="workspace"><header className="topbar"><div className="breadcrumb">{collapsed && <button type="button" className="icon-button desktop-only sidebar-toggle" onClick={toggleCollapsed} aria-expanded={false} aria-controls="app-sidebar" aria-label={c('Mở thanh bên', 'Open the sidebar')} title={c('Mở thanh bên', 'Open the sidebar')}><PanelLeftOpen size={20} /></button>}<button className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={c('Mở menu', 'Open menu')}><Menu size={22} /></button><span className="desktop-only">{c('Không gian học tập', 'Workspace')}</span><ChevronRight size={14} className="desktop-only" /><strong>{currentLabel}</strong></div><div className="topbar-actions"><ThemeToggle /><LanguageSwitch /><Link to="/app/prompts" className="icon-button desktop-only" aria-label={c('Luyện viết', 'Writing')}><CircleHelp size={20} /></Link><Link to="/app/settings" className="avatar" aria-label={c('Hồ sơ', 'Profile')}>{state.profile.name.slice(0, 1).toUpperCase() || 'L'}</Link>{user && <button className="icon-button desktop-only" aria-label={c('Đăng xuất', 'Sign out')} title={c('Đăng xuất', 'Sign out')} onClick={() => void signOut()}><LogOut size={19} /></button>}</div></header>
      <main id="main" className="main-content">{!isConfigured && <Notice error><div><strong>{c('Ứng dụng chưa được cấu hình máy chủ.', 'The app is not configured yet.')}</strong><p>{c('Thiếu biến môi trường VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY khi build. Thêm chúng vào Environment Variables của Vercel rồi deploy lại.', 'The build was missing VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. Add them to the Vercel environment variables and deploy again.')}</p></div></Notice>}{error && <Notice error>{error === 'conflict' ? c('Nháp đã đổi ở tab khác. Tải lại trang để mở phiên bản mới; sao chép nội dung hiện tại trước khi tải lại.', 'Draft changed in another tab. Copy your current text, then reload to open the latest version.') : c('Không thể truy cập bộ nhớ trình duyệt. Dữ liệu chưa được lưu; hãy giữ trang mở và sao chép bài viết.', 'Browser storage is unavailable. Data has not been saved; keep this page open and copy your writing.')}</Notice>}{ready ? <Outlet /> : !error && <div className="loading-state" role="status">{c('Đang mở không gian học tập…', 'Opening your workspace…')}</div>}</main>
      <footer className="main-footer"><span>IELTS Studio</span><span><Lightbulb size={14} />{c('Tiến bộ bắt đầu từ một câu viết.', 'Progress begins with a single sentence.')}</span></footer>
    </div>
    <nav className="bottom-nav" aria-label={c('Điều hướng nhanh', 'Quick navigation')}>{['/app', '/app/prompts', '/app/review', '/app/vocabulary'].map(path => { const item = nav.find(entry => entry.path === path)!; return <NavLink key={path} to={path} end={item.end}><item.icon size={20} /><span>{item.label}</span></NavLink> })}</nav>
  </div>
}
