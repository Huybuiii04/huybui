import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import { AI_ERROR_MESSAGES } from '../../lib/aiLogic'
import { fetchAdminUsage, type AdminUsage } from '../../lib/ai'

export function UsageTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [usage, setUsage] = useState<AdminUsage | null>(null)

  async function load() {
    onBusy(true)
    onError('')
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
    const result = await fetchAdminUsage(from.toISOString(), to.toISOString())
    onBusy(false)
    if (!result.ok) { onError(c(...AI_ERROR_MESSAGES[result.code])); return }
    setUsage(result.value)
  }

  useEffect(() => { void load() }, [])

  if (!usage) return <div className="panel"><Empty title={c('Chưa có dữ liệu', 'No data yet')} description={c('Bấm "Tải dữ liệu" để đọc số liệu từ máy chủ.', 'Use "Load usage" to read the figures from the server.')} action={<button className="button primary" disabled={busy} onClick={() => void load()}>{busy ? c('Đang tải…', 'Loading…') : c('Tải dữ liệu', 'Load usage')}</button>} /></div>

  return <div className="panel"><div className="panel-heading"><h2>{c('Token & chi phí 30 ngày', 'Tokens & costs — last 30 days')}</h2><button className="button outline" disabled={busy} onClick={() => void load()}><RefreshCw size={16} />{busy ? c('Đang tải…', 'Loading…') : c('Tải lại', 'Reload')}</button></div><div className="usage-table"><div className="usage-row usage-head"><span>{c('Mô hình', 'Model')}</span><span>{c('Input', 'Input')}</span><span>{c('Output', 'Output')}</span><span>{c('Độ trễ', 'Latency')}</span></div>{usage.rows.map((row, index) => <div className="usage-row" key={`${row.model}-${index}`}><span>{row.model}</span><span>{row.input_tokens.toLocaleString()}</span><span>{row.output_tokens.toLocaleString()}</span><span>{row.latency_ms} ms</span></div>)}</div><p className="helper-text">{c(`Tổng: ${usage.totals.jobs} lượt · ${usage.totals.inputTokens.toLocaleString()} token vào · ${usage.totals.outputTokens.toLocaleString()} token ra.`, `Total: ${usage.totals.jobs} calls · ${usage.totals.inputTokens.toLocaleString()} input tokens · ${usage.totals.outputTokens.toLocaleString()} output tokens.`)}</p></div>
}
