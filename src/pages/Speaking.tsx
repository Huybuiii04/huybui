import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Clock3, FileText, GraduationCap, ListChecks, Mic, Play, Search, X } from 'lucide-react'

import { Empty, PageHeader } from '../components/ui'
import { useCopy } from '../i18n'
import { loadSpeakingTests, type SpeakingQuestion } from '../lib/speaking.ts'
import { groupSpeakingTests, speakingDisplayTestNumber, type SpeakingMode, type SpeakingTestGroup } from '../lib/speakingLogic.ts'

export default function Speaking() {
  const { c } = useCopy()
  const [rows, setRows] = useState<SpeakingQuestion[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SpeakingTestGroup | null>(null)

  useEffect(() => {
    let alive = true
    void loadSpeakingTests().then((items) => {
      if (!alive) return
      setRows(items)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const groups = useMemo(() => groupSpeakingTests(rows), [rows])

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return keyword ? groups.filter((group) => groupMatches(group, keyword)) : groups
  }, [groups, search])

  return (
    <div className="page speaking-page">
      <PageHeader
        eyebrow={c('LUYỆN NÓI', 'SPEAKING')}
        title={c('Luyện nói', 'Speaking practice')}
        description={c(
          'Chọn đề Cambridge 12–20 để luyện cả bài hoặc từng phần.',
          'Choose a Cambridge 12–20 test to practise all three parts or one at a time.',
        )}
      />

      <div className="speaking-filters">
        <div className="speaking-search">
          <Search size={18} aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={c('Tìm đề hoặc chủ đề…', 'Search tests or topics…')}
            aria-label={c('Tìm chủ đề', 'Search topics')}
          />
        </div>
        <div className="filter-row">
          <span className="filter-chip is-active">Cambridge</span>
        </div>
      </div>

      {loading && (
        <div className="loading-state" role="status">
          {c('Đang tải…', 'Loading…')}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <Empty
          title={c('Chưa có đề', 'No tests yet')}
          description={c(
            search ? 'Thử tìm đề hoặc chủ đề khác.' : 'Đề Speaking Cambridge 12–20 sẽ xuất hiện ở đây.',
            search ? 'Try searching for another test or topic.' : 'Cambridge 12–20 speaking tests will appear here.',
          )}
        />
      )}

      {!loading && visible.length > 0 && (
        <div className="speaking-grid">
          {visible.map((group) => (
            <TestCard key={`${group.bookNumber}-${group.testNumber}`} group={group} onChoose={() => setSelected(group)} />
          ))}
        </div>
      )}
      {selected && <SpeakingTestDialog group={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function groupMatches(group: SpeakingTestGroup, keyword: string): boolean {
  const haystack = [
    group.label,
    group.part1?.topic ?? '',
    group.part2?.topic ?? '',
    ...group.part3.map((row) => row.topic),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(keyword)
}

function TestCard({ group, onChoose }: { group: SpeakingTestGroup; onChoose: () => void }) {
  const { c } = useCopy()
  const partCount = Number(Boolean(group.part1)) + Number(Boolean(group.part2)) + Number(group.part3.length > 0)

  return (
    <article className="speaking-card" aria-label={group.label}>
      <div className="speaking-card-badges">
        <span className="speaking-badge"><Mic size={12} aria-hidden /> SPEAKING</span>
        <span className="speaking-card-kind">{c('Đề luyện', 'Practice')}</span>
      </div>

      <p className="speaking-card-book">CAMBRIDGE {group.bookNumber}</p>
      <h2>Test {speakingDisplayTestNumber(group.bookNumber, group.testNumber)}</h2>
      <ul className="speaking-card-meta" aria-label={c('Thông tin đề', 'Test details')}>
        <li><ListChecks size={14} aria-hidden /> {partCount} {c('phần', 'parts')}</li>
        {partCount === 3 && <li><Clock3 size={14} aria-hidden /> {c('14 phút', '14 min')}</li>}
        <li><GraduationCap size={14} aria-hidden /> IELTS</li>
      </ul>

      <button
        type="button"
        className="speaking-start"
        onClick={onChoose}
        aria-haspopup="dialog"
        aria-label={`${c('Bắt đầu', 'Start')} ${group.label}`}
      >
        <Play size={15} aria-hidden /> {c('Bắt đầu', 'Start')}
      </button>
    </article>
  )
}

function SpeakingTestDialog({ group, onClose }: { group: SpeakingTestGroup; onClose: () => void }) {
  const { c } = useCopy()
  const dialog = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<SpeakingMode>(group.part1 && group.part2 && group.part3.length ? 'mock' : group.part1 ? 'part-1' : group.part2 ? 'part-2' : 'part-3')
  const [questionId, setQuestionId] = useState(group.part3[0]?.id ?? '')
  const parts = [
    { mode: 'part-1' as const, name: 'Part 1', title: c('Phỏng vấn', 'Interview'), topic: group.part1?.topic, available: Boolean(group.part1) },
    { mode: 'part-2' as const, name: 'Part 2', title: c('Nói dài theo chủ đề', 'Long turn'), topic: group.part2?.topic, available: Boolean(group.part2) },
    { mode: 'part-3' as const, name: 'Part 3', title: c('Thảo luận', 'Discussion'), topic: group.part3.map(row => row.topic).join(' · '), available: group.part3.length > 0 },
  ]
  const complete = parts.every(part => part.available)
  const query = mode === 'part-3' && questionId ? `&question=${encodeURIComponent(questionId)}` : ''
  const to = `/app/speaking/${mode}/${group.bookNumber}/${group.testNumber}${query}`
  const liveTo = `/app/speaking/live?mode=${mode}&book=${group.bookNumber}&test=${group.testNumber}${query}`

  useEffect(() => {
    const element = dialog.current
    if (element && !element.open) element.showModal()
  }, [])

  return (
    <dialog ref={dialog} className="modal speaking-dialog" aria-labelledby="speaking-test-title" aria-describedby="speaking-test-help" onClose={onClose} onClick={event => {
      if (event.target === event.currentTarget) event.currentTarget.close()
    }}>
      <header className="speaking-dialog-header">
        <div>
          <p className="speaking-dialog-badges"><span className="speaking-badge"><Mic size={12} aria-hidden /> SPEAKING</span><span>IELTS</span></p>
          <h2 id="speaking-test-title">{group.label}</h2>
        </div>
        <button type="button" className="icon-button" aria-label={c('Đóng', 'Close')} onClick={() => dialog.current?.close()}><X size={20} aria-hidden /></button>
      </header>
      <div className="speaking-dialog-body">
        <p id="speaking-test-help" className="speaking-dialog-help">{c('Chọn luyện từng Part hoặc luyện đầy đủ cả 3 Part.', 'Practise one part or take the full three-part test.')}</p>
        <fieldset className="speaking-mode-options">
          <legend className="sr-only">{c('Chọn chế độ luyện', 'Choose practice mode')}</legend>
          <label className="speaking-option speaking-full-option">
            <input className="sr-only" type="radio" name="speaking-mode" value="mock" checked={mode === 'mock'} disabled={!complete} onChange={() => setMode('mock')} />
            <span className="speaking-full-icon"><FileText size={20} aria-hidden /></span>
            <span><strong>{c('Đề đầy đủ', 'Full test')}</strong><small>{complete ? c('Luyện liên tục Part 1, Part 2 và Part 3', 'Practise Part 1, Part 2 and Part 3 in order') : c('Đề chưa đủ 3 Part', 'This test is missing a part')}</small></span>
          </label>
          <p className="speaking-mode-divider">{c('Hoặc luyện theo từng phần', 'Or practise by part')}</p>
          {parts.map(part => (
            <label key={part.mode} className="speaking-option">
              <input type="radio" name="speaking-mode" value={part.mode} checked={mode === part.mode} disabled={!part.available} onChange={() => setMode(part.mode)} />
              <span className="speaking-part-badge">{part.name}</span>
              <span><strong>{part.title}</strong><small>{part.topic || c('Chưa có câu hỏi', 'No questions available')}</small></span>
            </label>
          ))}
        </fieldset>
        {mode === 'part-3' && group.part3.length > 1 && (
          <label className="speaking-topic-select">{c('Chủ đề Part 3', 'Part 3 topic')}
            <select value={questionId} onChange={event => setQuestionId(event.target.value)}>
              {group.part3.map(row => <option key={row.id} value={row.id}>{row.topic}</option>)}
            </select>
          </label>
        )}
        {group.sourceLabel && <details className="speaking-dialog-source"><summary>{c('Nguồn đề', 'Test source')}</summary><p>{group.sourceLabel}</p></details>}
      </div>
      <footer className="speaking-dialog-footer">
        <Link className="speaking-start" to={to} onClick={() => dialog.current?.close()}><Play size={16} aria-hidden />{mode === 'mock' ? c('Bắt đầu đề đầy đủ', 'Start full test') : c(`Bắt đầu Part ${mode.slice(-1)}`, `Start Part ${mode.slice(-1)}`)}</Link>
        <Link className="button outline" to={liveTo} onClick={() => dialog.current?.close()}><Mic size={16} aria-hidden />{c('Luyện nói trực tiếp', 'Practise live')}</Link>
      </footer>
    </dialog>
  )
}
