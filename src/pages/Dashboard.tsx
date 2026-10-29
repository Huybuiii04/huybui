import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, BookMarked, BookOpen, ChevronRight, Clock3, FileText, PenLine, Plus } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { PageHeader, SectionHeading } from '../components/ui'
import { useAdminRole } from '../lib/adminRole'
import { fetchAdminOverview, type AdminOverview } from '../lib/adminRepository'
import { loadSkillAttempts, type SkillAttempt } from '../lib/skillApi.ts'
import { useEffect, useMemo, useState } from 'react'

export default function Dashboard() {
  const { c, language } = useCopy()
  const { state } = useStore()
  const due = state.cards.filter(card => card.dueAt <= Date.now()).length
  const isAdmin = useAdminRole()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  useEffect(() => {
    if (!isAdmin) return
    let active = true
    void fetchAdminOverview().then(value => { if (active) setOverview(value) })
    return () => { active = false }
  }, [isAdmin])
  const [readingAttempts, setReadingAttempts] = useState<SkillAttempt[]>([])
  useEffect(() => {
    let active = true
    void loadSkillAttempts('reading').then(items => { if (active) setReadingAttempts(items) })
    return () => { active = false }
  }, [])
  const bestBand = useMemo(() => {
    const bands = readingAttempts.map(attempt => attempt.band).filter((band): band is number => band !== null)
    if (!bands.length) return '—'
    return Math.max(...bands).toFixed(1)
  }, [readingAttempts])
  return <div className="dashboard-page">
    <PageHeader title={c('Tổng quan học tập', 'Your learning overview')} description={c('Chọn một bài luyện, tiếp tục bài đang viết hoặc ôn lại từ vựng.', 'Pick a practice session, continue a draft, or review your vocabulary.')} action={<Link className="button primary" to="/app/write"><Plus size={18} />{c('Bắt đầu viết', 'Start writing')}</Link>} />
    <dl className="dashboard-stats" aria-label={c('Thống kê học tập', 'Learning statistics')}>
      {[
        { label: c('Bài viết đã lưu', 'Saved drafts'), value: state.drafts.length },
        { label: c('Từ vựng đã lưu', 'Saved words'), value: state.cards.length },
        { label: c('Thẻ cần ôn', 'Cards due'), value: due },
        { label: c('Band mục tiêu', 'Target band'), value: state.profile.target },
      ].map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
    </dl>
    <section aria-labelledby="practice-heading">
      <div className="section-heading"><h2 id="practice-heading">{c('Hôm nay, bạn muốn luyện gì?', 'What would you like to practise?')}</h2></div>
      <div className="practice-grid overview-practice">
        <Link to="/app/reading" className="practice-card">
          <div className="practice-card-top"><BookMarked size={26} /><ArrowUpRight size={20} /></div>
          <h3>Reading</h3>
          <p>{c('Luyện đọc với các bộ đề Cambridge, Essential Words và TID.', 'Practise with Cambridge, Essential Words and TID reading tests.')}</p>
          <div className="practice-meta"><span>{readingAttempts.length
            ? c(`${readingAttempts.length} bài đã làm · Band cao nhất ${bestBand}`, `${readingAttempts.length} tests completed · Best band ${bestBand}`)
            : c('Mở kho đề để bắt đầu', 'Open the library to get started')}</span></div>
        </Link>
        <Link to="/app/write?task=academic_task1" className="practice-card">
          <div className="practice-card-top"><FileText size={26} /><ArrowUpRight size={20} /></div>
          <h3>Writing Task 1</h3>
          <p>{c('Luyện mô tả biểu đồ, bản đồ và quy trình.', 'Practise describing charts, maps and processes.')}</p>
          <div className="practice-meta"><span><Clock3 size={16} />20 {c('phút', 'min')}</span><span><PenLine size={16} />150+ {c('từ', 'words')}</span></div>
        </Link>
        <Link to="/app/write?task=task2" className="practice-card">
          <div className="practice-card-top"><PenLine size={26} /><ArrowUpRight size={20} /></div>
          <h3>Writing Task 2</h3>
          <p>{c('Phát triển ý tưởng, xây dựng lập luận và diễn đạt quan điểm.', 'Develop your ideas, build an argument, and express your opinion.')}</p>
          <div className="practice-meta"><span><Clock3 size={16} />40 {c('phút', 'min')}</span><span><PenLine size={16} />250+ {c('từ', 'words')}</span></div>
        </Link>
      </div>
    </section>
    <div className="dashboard-columns">
      <section>
        <SectionHeading title={c('Bài viết gần đây', 'Your recent writing')} link="/app/essays" label={c('Xem tất cả', 'View all')} />
        <div className="panel recent-panel">{state.drafts.length ? state.drafts.slice(0, 3).map(draft => <Link className="recent-row" to={`/app/write?id=${draft.id}`} key={draft.id}>
          <span className="file-icon"><FileText size={20} /></span>
          <div><strong>{draft.title || c('Bài viết chưa đặt tên', 'Untitled draft')}</strong><small>{new Date(draft.updatedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB')} · {draft.task === 'task2' ? 'Task 2' : 'Task 1'}</small></div>
          <span className="badge neutral">{c('Bản nháp', 'Draft')}</span><ChevronRight size={18} />
        </Link>) : <div className="recent-empty">
          <span className="file-icon"><FileText size={22} /></span>
          <div><strong>{c('Trang đầu tiên đang chờ bạn', 'Your first page is waiting')}</strong><p>{c('Bài viết đã lưu sẽ xuất hiện ở đây.', 'Your saved drafts will appear here.')}</p></div>
          <Link to="/app/write" className="icon-button" aria-label={c('Viết bài đầu tiên', 'Write your first essay')}><ArrowRight size={20} /></Link>
        </div>}</div>
      </section>
      <aside className="dashboard-aside">
        <div className="daily-card">
          <div className="daily-top"><h2>{c('Ôn từ vựng', 'Vocabulary review')}</h2><BookOpen size={22} /></div>
          <p>{due ? c(`Có ${due} thẻ cần ôn. Dành vài phút để ghi nhớ lâu hơn.`, `${due} cards are ready. Take a few minutes to remember them longer.`) : c('Lưu từ mới hôm nay, để ngày mai diễn đạt tự tin hơn.', 'Save a new phrase today. Express yourself more confidently tomorrow.')}</p>
          <Link className="button outline full" to={due ? '/app/review' : '/app/vocabulary'}>{due ? c('Bắt đầu ôn tập', 'Start reviewing') : c('Khám phá từ vựng', 'Explore vocabulary')}<ArrowRight size={17} /></Link>
          <div className="word-of-day"><span>{c('Cụm từ gợi ý', 'A phrase to keep')}</span><strong>make a meaningful impact</strong><p>{c('Tạo ra tác động có ý nghĩa', 'To bring about a valuable change')}</p></div>
        </div>
      </aside>
    </div>
    {isAdmin ? <section className="panel admin-quick-panel">
      <div className="panel-heading"><h2>{c('Bảng quản trị', 'Administration')}</h2><Link className="text-link" to="/admin">{c('Mở bảng quản trị', 'Open the admin console')}<ArrowRight size={16} /></Link></div>
      <div className="admin-mini-stats">{[
        { label: c('Người dùng', 'Users'), value: overview?.users ?? '—' },
        { label: c('Bài viết', 'Essays'), value: overview?.essays ?? '—' },
        { label: c('Job AI đang chờ', 'AI jobs queued'), value: overview?.queued ?? '—' },
        { label: c('Job AI lỗi', 'Failed AI jobs'), value: overview?.failed ?? '—', danger: (overview?.failed ?? 0) > 0 },
      ].map(item => <div className="admin-mini-stat" key={item.label}><strong className={item.danger ? 'danger-text' : ''}>{item.value}</strong><span>{item.label}</span></div>)}</div>
    </section> : null}
  </div>
}
