import type { ReactNode } from 'react'
import { ArrowUpRight, Inbox, Info } from 'lucide-react'
import { Link } from 'react-router'
import { useCopy } from '../i18n'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="muted page-description">{description}</p>}</div>{action}</div>
}
export function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty"><span className="empty-icon"><Inbox size={25} /></span><h3>{title}</h3><p className="muted">{description}</p>{action}</div>
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={`notice ${error ? 'notice-error' : ''}`} role={error ? 'alert' : 'status'}><Info size={18} /><div>{children}</div></div>
}
export function BackendNotice() {
  const { c } = useCopy()
  return <Notice>{c('Chưa kết nối backend. Chức năng này sẽ hoạt động khi cấu hình dịch vụ; bài viết của bạn vẫn được lưu trên trình duyệt.', 'Backend not connected. This feature will be available once services are configured; your writing remains saved in this browser.')}</Notice>
}
export function SectionHeading({ title, link, label }: { title: string; link?: string; label?: string }) {
  return <div className="section-heading"><h2>{title}</h2>{link && <Link className="text-link" to={link}>{label}<ArrowUpRight size={16} /></Link>}</div>
}
