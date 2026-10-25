import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { AdminGate } from '../components/AdminGate'
import { useCopy } from '../i18n'
import { PageHeader } from '../components/ui'
import { DashboardTab } from './admin/DashboardTab'
import { UsersTab } from './admin/UsersTab'
import { PromptsTab } from './admin/PromptsTab'
import { VocabularyTab } from './admin/VocabularyTab'
import { JobsTab } from './admin/JobsTab'
import { AuditTab } from './admin/AuditTab'
import { ContentTab } from './admin/ContentTab'
import { UsageTab } from './admin/UsageTab'

export function Admin() {
  const { c } = useCopy()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'overview'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const tabs: [string, string][] = [
    ['overview', c('Tổng quan', 'Overview')],
    ['users', c('Người dùng', 'Users')],
    ['prompts', c('Đề bài', 'Prompts')],
    ['vocabulary', c('Từ vựng', 'Vocabulary')],
    ['jobs', c('Tác vụ AI', 'AI jobs')],
    ['audit', c('Nhật ký', 'Audit log')],
    ['content', c('Nội dung', 'Content')],
    ['usage', c('Token & chi phí', 'Tokens & costs')],
  ]

  return <AdminGate>
    <PageHeader eyebrow="ADMIN" title={c('Quản trị', 'Administration')} description={c('Theo dõi người dùng, đề bài, từ vựng và chi phí AI.', 'Track users, prompts, vocabulary and AI costs.')} />
    <div className="tabs">{tabs.map(([value, label]) => <button key={value} className={tab === value ? 'active' : ''} aria-pressed={tab === value} onClick={() => setParams({ tab: value })}>{label}</button>)}</div>
    {tab === 'overview' && <DashboardTab onError={setError} />}
    {tab === 'users' && <UsersTab onError={setError} onBusy={setBusy} busy={busy} />}
    {tab === 'prompts' && <PromptsTab onError={setError} onBusy={setBusy} busy={busy} />}
    {tab === 'vocabulary' && <VocabularyTab onError={setError} onBusy={setBusy} busy={busy} />}
    {tab === 'jobs' && <JobsTab onError={setError} onBusy={setBusy} busy={busy} />}
    {tab === 'audit' && <AuditTab />}
    {tab === 'content' && <ContentTab onError={setError} onBusy={setBusy} busy={busy} />}
    {tab === 'usage' && <UsageTab onError={setError} onBusy={setBusy} busy={busy} />}
    {error && <p className="helper-text danger-text">{error}</p>}
  </AdminGate>
}
