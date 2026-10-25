import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty, Notice } from '../../components/ui'
import {
  deleteEssay,
  fetchPrompts,
  fetchUserCards,
  fetchUserErrorLogs,
  fetchUserEssays,
  type AdminPrompt,
} from '../../lib/adminRepository'
import { coveragePercent, groupDonePrompts, promptLabel, remainingPrompts, shortPrompt, type AdminEssay } from '../../lib/adminLogic'

type RevisionRow = { id: string; essay_id: string; created_at: string; grading_results: { overall_display: number | null }[] }

const TASKS: { key: string; labelVi: string; labelEn: string }[] = [
  { key: 'task2', labelVi: 'Task 2', labelEn: 'Task 2' },
  { key: 'academic_task1', labelVi: 'Task 1 Academic', labelEn: 'Task 1 Academic' },
  { key: 'general_task1', labelVi: 'Task 1 General', labelEn: 'Task 1 General' },
]

export function UserDetail({ userId, displayName, onBack, onError, onBusy, busy }: { userId: string; displayName: string; onBack: () => void; onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c, language } = useCopy()
  const [essays, setEssays] = useState<AdminEssay[]>([])
  const [prompts, setPrompts] = useState<AdminPrompt[]>([])
  const [revisions, setRevisions] = useState<RevisionRow[]>([])
  const [cardCount, setCardCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState('task2')

  const load = useCallback(async () => {
    setLoading(true)
    const [essayRows, promptRows, cardRows, errorRows, revisionRows] = await Promise.all([
      fetchUserEssays(userId),
      fetchPrompts(),
      fetchUserCards(userId),
      fetchUserErrorLogs(userId),
      supabaseRevisions(userId),
    ])
    setEssays(essayRows)
    setPrompts(promptRows)
    setCardCount(cardRows.length)
    setErrorCount(errorRows.length)
    setRevisions(revisionRows)
    setLoading(false)
  }, [userId])

  useEffect(() => { void load() }, [load])

  const done = useMemo(() => groupDonePrompts(essays, prompts), [essays, prompts])
  const remaining = useMemo(() => remainingPrompts(essays, prompts, task), [essays, prompts, task])
  const coverage = useMemo(() => coveragePercent(essays, prompts, task), [essays, prompts, task])

  const bandByEssay = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const revision of revisions) {
      const band = revision.grading_results?.[0]?.overall_display
      if (typeof band !== 'number') continue
      const list = map.get(revision.essay_id) ?? []
      list.push(band)
      map.set(revision.essay_id, list)
    }
    return map
  }, [revisions])

  async function removeEssay(essayId: string) {
    if (!window.confirm(c('Xoá bài viết này của người dùng?', 'Delete this user essay?'))) return
    onBusy(true)
    const result = await deleteEssay(essayId)
    onBusy(false)
    if (!result.ok) { onError(c('Không xoá được bài viết.', 'Could not delete the essay.')); return }
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải hồ sơ người dùng…', 'Loading the learner profile…')}</div></div>

  return <>
    <button className="button outline" onClick={onBack}><ArrowLeft size={16} />{c('Quay lại danh sách', 'Back to the list')}</button>
    <div className="panel-heading admin-detail-heading"><h2>{displayName || userId.slice(0, 8)}</h2><small className="muted">{userId}</small></div>
    <section className="stats-grid admin-stats">
      <article className="stat-card"><div className="stat-top"><span>{c('Bài viết', 'Essays')}</span></div><strong className="stat-value">{essays.length}</strong><small>{c('đề khác nhau', 'distinct prompts')}: {done.length}</small></article>
      <article className="stat-card"><div className="stat-top"><span>{c('Lần chấm', 'Assessments')}</span></div><strong className="stat-value">{revisions.length}</strong><small>{c('revision đã gửi AI', 'revisions sent to AI')}</small></article>
      <article className="stat-card"><div className="stat-top"><span>{c('Thẻ từ vựng', 'Word cards')}</span></div><strong className="stat-value">{cardCount}</strong><small>{c('thẻ trong sổ', 'cards in the notebook')}</small></article>
      <article className="stat-card"><div className="stat-top"><span>{c('Lỗi sai đã ghi', 'Logged errors')}</span></div><strong className="stat-value">{errorCount}</strong><small>{c('mục trong sổ lỗi', 'entries in the error log')}</small></article>
      <article className="stat-card"><div className="stat-top"><span>{c('Độ phủ', 'Coverage')}</span></div><strong className="stat-value">{coverage}%</strong><small>{TASKS.find(item => item.key === task)?.labelVi}</small></article>
    </section>

    <section className="panel"><div className="panel-heading"><h2>{c('Đề đã làm', 'Prompts written')}</h2></div>
      {done.length ? <div className="usage-table">{done.map(group => {
        const bands = group.essays.flatMap(essay => bandByEssay.get(essay.id) ?? [])
        const average = bands.length ? (bands.reduce((sum, band) => sum + band, 0) / bands.length).toFixed(1) : null
        return <div className="usage-row" key={group.slug}><span className="admin-prompt-cell"><strong>{shortPrompt(group.text, 70)}</strong><small>{group.slug}</small></span><span>{group.count} {c('lượt', 'times')}</span><span>{average ? `${average} ${c('điểm', 'band')}` : '—'}</span><span className="row-actions">{group.essays.slice(0, 3).map(essay => <button key={essay.id} className="icon-button danger-text" aria-label={c('Xoá bài viết', 'Delete essay')} disabled={busy} onClick={() => void removeEssay(essay.id)}><Trash2 size={15} /></button>)}</span></div>
      })}</div> : <Empty title={c('Chưa làm đề nào', 'No prompts yet')} description={c('Người dùng này chưa viết bài nào.', 'This learner has not written anything yet.')} />}
    </section>

    <section className="panel"><div className="panel-heading"><h2>{c('Đề còn lại', 'Prompts not written yet')}</h2><div className="tabs admin-inline-tabs">{TASKS.map(item => <button key={item.key} className={task === item.key ? 'active' : ''} onClick={() => setTask(item.key)}>{language === 'en' ? item.labelEn : item.labelVi}</button>)}</div></div>
      {remaining.length ? <div className="usage-table">{remaining.slice(0, 50).map(prompt => <div className="usage-row" key={prompt.slug}><span className="admin-prompt-cell"><strong>{promptLabel(prompt, language === 'en' ? 'en' : 'vi')}</strong><small>{prompt.slug}</small></span><span>{prompt.task}</span><span>{shortPrompt(prompt.text ?? '', 50)}</span><span /></div>)}</div> : <Notice>{c('Người dùng đã làm hết đề của loại bài này.', 'This learner has covered every prompt of this task type.')}</Notice>}
      {remaining.length > 50 && <p className="helper-text">{c(`Còn ${remaining.length - 50} đề khác trong danh sách.`, `${remaining.length - 50} more prompts in the list.`)}</p>}
    </section>
  </>
}

/** Lấy revision + điểm của người dùng (bảng essay_revisions có cột user_id). */
async function supabaseRevisions(userId: string): Promise<RevisionRow[]> {
  const { supabase } = await import('../../lib/supabase')
  const { data } = await supabase
    .from('essay_revisions')
    .select('id,essay_id,created_at,grading_results(overall_display)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500)
  return (data ?? []) as RevisionRow[]
}
