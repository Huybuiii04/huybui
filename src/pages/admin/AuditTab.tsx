import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { fetchAuditLogs, type AdminAuditRow } from '../../lib/adminRepository'

export function AuditTab() {
  const { c } = useCopy()
  const [rows, setRows] = useState<AdminAuditRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setRows(await fetchAuditLogs())
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải nhật ký…', 'Loading the audit log…')}</div></div>
  if (!rows.length) return <div className="panel"><Empty title={c('Chưa có thao tác nào', 'No admin actions yet')} description={c('Mọi thao tác quản trị sẽ được ghi lại ở đây.', 'Every admin action is recorded here.')} /></div>

  return <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Thời gian', 'Time')}</span><span>{c('Hành động', 'Action')}</span><span>{c('Đối tượng', 'Target')}</span><span>{c('Người thực hiện', 'Actor')}</span></div>{rows.map(row => <div className="usage-row" key={row.id}><span>{new Date(row.created_at).toLocaleString()}</span><span>{row.action}</span><span className="admin-prompt-cell"><span>{row.target || '—'}</span></span><span>{(row.actor_id ?? '').slice(0, 8) || '—'}</span></div>)}</div></div>
}
