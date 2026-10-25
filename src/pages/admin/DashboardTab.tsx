import { useCallback, useEffect, useRef, useState } from 'react'
import { Coins, FileText, Loader2, RefreshCw, Sparkles, Users } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty, Notice } from '../../components/ui'
import { fetchDashboard, type DashboardStats } from '../../lib/adminRepository'
import { promptLabel } from '../../lib/adminLogic'

export function DashboardTab({ onError }: { onError: (value: string) => void }) {
  const { c, language } = useCopy()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  // useCopy trả về hàm mới mỗi render — giữ bản gần nhất để không tạo vòng lặp effect.
  const copy = useRef(c)
  copy.current = c

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchDashboard()
    if (!result.ok) { onError(copy.current('Không tải được số liệu quản trị.', 'Could not load the admin figures.')); setLoading(false); return }
    onError('')
    setStats(result.value)
    setLoading(false)
  }, [onError])

  useEffect(() => { void load() }, [load])

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải số liệu…', 'Loading figures…')}</div></div>
  if (!stats) return <div className="panel"><Empty title={c('Chưa có số liệu', 'No figures yet')} description={c('Bấm "Tải lại" để đọc số liệu từ máy chủ.', 'Use "Reload" to read the figures from the server.')} action={<button className="button primary" onClick={() => void load()}><RefreshCw size={16} />{c('Tải lại', 'Reload')}</button>} /></div>

  const cards: { label: string; value: string; note: string; icon: 'teal' | 'amber' | 'blue' | 'purple' }[] = [
    { label: c('Người dùng', 'Users'), value: String(stats.users.total), note: c(`${stats.users.new7d} tài khoản mới trong 7 ngày · ${stats.users.suspended} bị khoá`, `${stats.users.new7d} new in 7 days · ${stats.users.suspended} suspended`), icon: 'teal' },
    { label: c('Bài viết', 'Essays'), value: String(stats.essays.total), note: c(`${stats.essays.new7d} bài trong 7 ngày · ${stats.essays.distinctPrompts} đề đã làm`, `${stats.essays.new7d} in 7 days · ${stats.essays.distinctPrompts} prompts used`), icon: 'amber' },
    { label: c('Lần chấm', 'Assessments'), value: String(stats.revisions.total), note: c('Số bài đã gửi AI chấm', 'Essays sent for AI grading'), icon: 'blue' },
    { label: c('Hàng đợi AI', 'AI queue'), value: `${stats.jobs.failed} / ${stats.jobs.queued + stats.jobs.processing}`, note: c(`${stats.jobs.failed} lỗi · ${stats.jobs.queued} đang chờ · ${stats.jobs.processing} đang chạy`, `${stats.jobs.failed} failed · ${stats.jobs.queued} queued · ${stats.jobs.processing} running`), icon: 'purple' },
    { label: c('Chi phí 30 ngày', 'Cost — 30 days'), value: stats.usage.costComplete ? `$${stats.usage.costUsd.toFixed(2)}` : '—', note: c(`${stats.usage.jobs} lượt · ${stats.usage.inputTokens.toLocaleString()} token vào`, `${stats.usage.jobs} calls · ${stats.usage.inputTokens.toLocaleString()} input tokens`), icon: 'teal' },
  ]

  return <>
    <section className="stats-grid admin-stats">{cards.map(card => <article className="stat-card" key={card.label}><div className="stat-top"><span>{card.label}</span><span className={`stat-icon ${card.icon}`}>{card.icon === 'teal' ? <Users size={19} /> : card.icon === 'amber' ? <FileText size={19} /> : card.icon === 'blue' ? <Sparkles size={19} /> : <Coins size={19} />}</span></div><strong className="stat-value">{card.value}</strong><small>{card.note}</small></article>)}</section>

    <div className="admin-columns">
      <section className="panel"><div className="panel-heading"><h2>{c('Người dùng tích cực nhất', 'Most active users')}</h2></div>
        {stats.topUsers.length ? <div className="usage-table">{stats.topUsers.map(row => <div className="usage-row" key={row.userId}><span>{row.displayName || row.userId.slice(0, 8)}</span><span>{row.essays}</span><span>{c('bài viết', 'essays')}</span><span /></div>)}</div> : <p className="helper-text">{c('Chưa có bài viết nào.', 'No essays yet.')}</p>}
      </section>
      <section className="panel"><div className="panel-heading"><h2>{c('Đề được làm nhiều nhất', 'Most used prompts')}</h2></div>
        {stats.topPrompts.length ? <div className="usage-table">{stats.topPrompts.map(row => <div className="usage-row" key={row.slug}><span>{promptLabel(row, language === 'en' ? 'en' : 'vi')}</span><span>{row.essays}</span><span>{c('lượt', 'times')}</span><span /></div>)}</div> : <p className="helper-text">{c('Chưa có dữ liệu.', 'No data yet.')}</p>}
      </section>
    </div>

    <section className="panel"><div className="panel-heading"><h2>{c('Đề chưa ai làm', 'Prompts nobody has written')}</h2></div>
      {stats.untouchedPrompts.length ? <div className="usage-table">{stats.untouchedPrompts.map(row => <div className="usage-row" key={row.slug}><span>{promptLabel(row, language === 'en' ? 'en' : 'vi')}</span><span>{row.task}</span><span>{row.slug}</span><span /></div>)}</div> : <Notice>{c('Mọi đề đã xuất hiện ít nhất một lần.', 'Every prompt has been used at least once.')}</Notice>}
    </section>
    <p className="helper-text">{c('Mẹo: bấm vào tab Người dùng để xem chi tiết từng người.', 'Tip: open the Users tab to inspect a single learner.')}</p>
  </>
}
