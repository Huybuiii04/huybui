import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Layers, MessageSquare, Mic, Puzzle } from 'lucide-react'

import { Empty, PageHeader } from '../components/ui'
import { useCopy } from '../i18n'
import { loadSpeakingTests, type SpeakingQuestion } from '../lib/speaking.ts'
import { groupSpeakingTests, type SpeakingTestGroup } from '../lib/speakingLogic.ts'

const BOOKS = [12, 13, 14, 15, 16, 17, 18, 19, 20]

export default function Speaking() {
  const { c } = useCopy()
  const [rows, setRows] = useState<SpeakingQuestion[]>([])
  const [book, setBook] = useState<number>(BOOKS[0])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

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

  const books = useMemo(() => {
    const found = [...new Set(groups.map((group) => group.bookNumber))].sort((a, b) => a - b)
    return found.length ? found : BOOKS
  }, [groups])

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return groups.filter((group) => {
      if (group.bookNumber !== book) return false
      if (!keyword) return true
      return groupMatches(group, keyword)
    })
  }, [groups, book, search])

  return (
    <div className="page">
      <PageHeader
        eyebrow={c('LUYỆN NÓI', 'SPEAKING')}
        title={c('Luyện nói', 'Speaking practice')}
        description={c(
          'Đề Speaking Cambridge 12–20. Chọn cuốn, chọn test, rồi luyện từng part hoặc luyện cả 3 phần.',
          'Cambridge 12–20 Speaking tests. Pick a book and a test, then drill one part or all three.',
        )}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={c('Tìm chủ đề…', 'Search topics…')}
          aria-label={c('Tìm chủ đề', 'Search topics')}
        />
        <div className="filter-row" role="group" aria-label={c('Chọn cuốn Cambridge', 'Choose a Cambridge book')}>
          {books.map((number) => (
            <button
              key={number}
              type="button"
              className={`filter-chip ${book === number ? 'is-active' : ''}`}
              onClick={() => setBook(number)}
            >
              {`C${number}`}
            </button>
          ))}
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
            'Đề Speaking Cambridge 12–20 sẽ xuất hiện ở đây.',
            'Cambridge 12–20 speaking tests will appear here.',
          )}
        />
      )}

      {!loading && visible.length > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          {visible.map((group) => (
            <TestCard key={`${group.bookNumber}-${group.testNumber}`} group={group} />
          ))}
        </div>
      )}
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

function TestCard({ group }: { group: SpeakingTestGroup }) {
  const { c } = useCopy()
  const base = `/app/speaking`
  const parts: Array<{
    key: string
    icon: typeof MessageSquare
    label: string
    topic: string
    to: string | null
  }> = []

  if (group.part1) {
    parts.push({
      key: 'part-1',
      icon: MessageSquare,
      label: 'Part 1',
      topic: group.part1.topic,
      to: `${base}/part-1/${group.bookNumber}/${group.testNumber}`,
    })
  }
  if (group.part2) {
    parts.push({
      key: 'part-2',
      icon: Layers,
      label: 'Part 2',
      topic: group.part2.topic,
      to: `${base}/part-2/${group.bookNumber}/${group.testNumber}`,
    })
  }
  group.part3.forEach((row, index) => {
    parts.push({
      key: `part-3-${index}`,
      icon: Puzzle,
      label: c('Part 3', 'Part 3'),
      topic: row.topic,
      to: `${base}/part-3/${group.bookNumber}/${group.testNumber}?question=${row.id}`,
    })
  })

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{group.label}</p>
          <h2>{c('Test', 'Test')} {group.testNumber}</h2>
        </div>
        <Link
          className="button primary small"
          to={`${base}/mock/${group.bookNumber}/${group.testNumber}`}
        >
          <Mic size={15} aria-hidden /> {c('Luyện cả 3 phần', 'All three parts')}
        </Link>
      </div>

      {group.sourceLabel && (
        <p className="muted text-[12px] mb-3">
          {c('Nguồn', 'Source')}: {group.sourceLabel}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {parts.map((part) => (
          <li
            key={part.key}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0"
          >
            <span className="flex items-center gap-2 text-[14px]">
              <part.icon size={16} aria-hidden className="text-[var(--text-subtle)]" />
              <strong>{part.label}</strong>
              <span className="muted">{part.topic ?? c('(chưa có)', '(missing)')}</span>
            </span>
            {part.to ? (
              <Link className="button small" to={part.to}>
                {c('Luyện', 'Practice')}
              </Link>
            ) : (
              <span className="muted text-[12px]">{c('Thiếu dữ liệu', 'Missing data')}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
