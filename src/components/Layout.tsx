import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ArrowUpRight, BookOpen, BookOpenCheck, ChevronRight, CircleHelp, FileText, GraduationCap, Heart, LayoutDashboard, Lightbulb, Menu, NotebookPen, PanelLeftClose, PenLine, RotateCcw, Settings, Sparkles, X } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { Notice } from './ui'

export function Brand() {
  return <Link to="/app" className="brand" aria-label="IELTS Writing Studio"><span className="brand-mark"><PenLine size={23} strokeWidth={2.4} /></span><span>IELTS<span className="brand-sub">WRITING STUDIO</span></span><span className="brand-dot" /></Link>
}
export function LanguageSwitch() {
  const { language, changeLanguage, c } = useCopy()
  return <div className="language-switch" aria-label={c('Ngôn ngữ', 'Language')}>{['vi', 'en'].map(lang => <button key={lang} onClick={() => void changeLanguage(lang)} aria-pressed={language === lang} className={language === lang ? 'selected' : ''}>{lang.toUpperCase()}</button>)}</div>
}
export default function Layout() {
  const { c } = useCopy()
  const { state, ready, error } = useStore()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])
  const due = state.cards.filter(card => card.dueAt <= Date.now()).length
  const nav = [
    { path: '/app', icon: LayoutDashboard, label: c('Tổng quan', 'Overview'), end: true },
    { path: '/app/write', icon: PenLine, label: c('Không gian viết', 'Writing space') },
    { path: '/app/essays', icon: FileText, label: c('Bài viết của tôi', 'My writing') },
    { path: '/app/vocabulary', icon: BookOpen, label: c('Sổ từ vựng', 'Vocabulary') },
    { path: '/app/review', icon: RotateCcw, label: c('Ôn tập', 'Review'), badge: due },
    { path: '/app/errors', icon: NotebookPen, label: c('Sổ lỗi sai', 'Error logbook') },
    { path: '/library', icon: GraduationCap, label: c('Thư viện', 'Library') },
    { path: '/guide', icon: BookOpenCheck, label: 'Master Guide' },
    { path: '/app/tools', icon: Sparkles, label: c('Công cụ AI', 'AI toolkit') },
  ]
  const current = nav.find(item => item.end ? location.pathname === item.path : location.pathname.startsWith(item.path))
  return <div className="app-shell">
    <a href="#main" className="skip-link">{c('Đến nội dung', 'Skip to content')}</a>
    {open && <button className="sidebar-scrim" aria-label={c('Đóng menu', 'Close menu')} onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'is-open' : ''}`}><div className="sidebar-brand"><Brand /><button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label={c('Đóng menu', 'Close menu')}><X size={20} /></button></div>
      <div className="workspace-label"><span className="workspace-icon"><NotebookPen size={16} /></span><div>{c('Không gian học tập', 'Your workspace')}<small>{c('Từng chút, mỗi ngày', 'A little better, every day')}</small></div></div>
      <nav aria-label={c('Điều hướng chính', 'Main navigation')} className="side-nav">{nav.map((item, index) => <div key={item.path}>{(index === 0 || index === 3 || index === 6) && <p className="nav-label">{index === 0 ? c('LUYỆN VIẾT', 'PRACTICE') : index === 3 ? c('GÓC HỌC TẬP', 'MY LEARNING') : c('KHÁM PHÁ', 'EXPLORE')}</p>}<NavLink to={item.path} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><item.icon size={19} /><span>{item.label}</span>{!!item.badge && <span className="nav-count">{item.badge}</span>}</NavLink></div>)}</nav>
      <div className="sidebar-bottom"><div className="support-card"><span className="support-icon"><Heart size={18} /></span><strong>{c('Cùng nuôi dưỡng tri thức', 'Keep learning open')}</strong><p>{c('Miễn phí để bạn tiến xa hơn.', 'Free learning. More possibilities.')}</p><Link to="/donate">{c('Ủng hộ dự án', 'Support the project')}<ArrowUpRight size={15} /></Link></div><NavLink to="/app/settings" className="nav-item"><Settings size={18} />{c('Cài đặt', 'Settings')}</NavLink><div className="sidebar-footer"><span>© 2026 IELTS Studio</span><PanelLeftClose size={15} /></div></div>
    </aside>
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={c('Mở menu', 'Open menu')}><Menu size={22} /></button><span className="desktop-only">{c('Không gian học tập', 'Workspace')}</span><ChevronRight size={14} className="desktop-only" /><strong>{current?.label ?? c('Khám phá', 'Explore')}</strong></div><div className="topbar-actions"><span className="local-badge"><span />{c('Bản trải nghiệm', 'Local preview')}</span><LanguageSwitch /><Link to="/guide" className="icon-button desktop-only" aria-label={c('Hướng dẫn', 'Help')}><CircleHelp size={20} /></Link><Link to="/app/settings" className="avatar" aria-label={c('Hồ sơ', 'Profile')}>{state.profile.name.slice(0, 1).toUpperCase() || 'L'}</Link></div></header>
      <main id="main" className="main-content">{error && <Notice error>{error === 'conflict' ? c('Nháp đã đổi ở tab khác. Tải lại trang để mở phiên bản mới; sao chép nội dung hiện tại trước khi tải lại.', 'Draft changed in another tab. Copy your current text, then reload to open the latest version.') : c('Không thể truy cập bộ nhớ trình duyệt. Dữ liệu chưa được lưu; hãy giữ trang mở và sao chép bài viết.', 'Browser storage is unavailable. Data has not been saved; keep this page open and copy your writing.')}</Notice>}{ready ? <Outlet /> : !error && <div className="loading-state" role="status">{c('Đang mở không gian học tập…', 'Opening your workspace…')}</div>}</main>
      <footer className="main-footer"><span>IELTS Writing Studio</span><span><Lightbulb size={14} />{c('Tiến bộ bắt đầu từ một câu viết.', 'Progress begins with a single sentence.')}</span></footer>
    </div>
    <nav className="bottom-nav" aria-label={c('Điều hướng nhanh', 'Quick navigation')}>{[nav[0], nav[1], nav[4], nav[6]].map(item => <NavLink key={item.path} to={item.path} end={item.end}><item.icon size={20} /><span>{item.label}</span></NavLink>)}</nav>
  </div>
}
