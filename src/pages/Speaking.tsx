import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Layers, MessageSquare, Mic, Puzzle } from 'lucide-react'

import { Empty, PageHeader } from '../components/ui'
import { useCopy } from '../i18n'
import { loadSpeakingQuestions, type SpeakingQuestion } from '../lib/speaking.ts'
import type { SpeakingMode, SpeakingPart } from '../lib/speakingLogic.ts'

const MODES: Array<{
  mode: SpeakingMode
  icon: typeof Mic
  title: string
  sub: readonly [string, string]
}> = [
  { mode: 'part-1', icon: MessageSquare, title: 'Part 1', sub: ['5 câu · 60 giây', '5 questions · 60s'] },
  { mode: 'part-2', icon: Layers, title: 'Part 2', sub: ['Cue card · 120 giây', 'Cue card · 120s'] },
  { mode: 'part-3', icon: Puzzle, title: 'Part 3', sub: ['4 câu · 90 giây', '4 questions · 90s'] },
  { mode: 'mock', icon: Mic, title: 'Full mock', sub: ['Cả 3 phần · 14 phút', 'All three parts · 14 min'] },
]

export default function Speaking() {
  const { c } = useCopy()
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([])
  const [filter, setFilter] = useState<'' | SpeakingPart>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    void loadSpeakingQuestions().then((items) => {
      if (!alive) return
      setQuestions(items)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const visible = useMemo(
    () =>
      questions.filter((question) => {
        if (filter && question.part !== filter) return false
        if (search && !question.topic.toLowerCase().includes(search.toLowerCase())) return false
        return true
      }),
    [questions, filter, search],
  )

  return (
    <div className="page">
      <PageHeader
        eyebrow={c('LUYỆN NÓI', 'SPEAKING')}
        title={c('Luyện nói', 'Speaking practice')}
        description={c(
          'Ghi âm bài trả lời và nhận band trên cả bốn tiêu chí Speaking chính thức của IELTS.',
          'Record your answer and get a band on all four official IELTS Speaking criteria.',
        )}
      />

      <div className="card-grid">
        {MODES.map((item) => (
          <Link key={item.mode} to={`/app/speaking/${item.mode}`} className="skill-card">
            <span className="skill-card-icon">
              <item.icon size={20} aria-hidden />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p className="muted">{c(...item.sub)}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={c('Tìm chủ đề…', 'Search topics…')}
          aria-label={c('Tìm chủ đề', 'Search topics')}
        />
        <div className="filter-row">
          <button
            type="button"
            className={`filter-chip ${filter === '' ? 'is-active' : ''}`}
            onClick={() => setFilter('')}
          >
            {c('Tất cả', 'All')}
          </button>
          {(['part-1', 'part-2', 'part-3'] as SpeakingPart[]).map((part) => (
            <button
              key={part}
              type="button"
              className={`filter-chip ${filter === part ? 'is-active' : ''}`}
              onClick={() => setFilter(part)}
            >
              {part.toUpperCase()}
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
          title={c('Chưa có câu hỏi', 'No questions yet')}
          description={c(
            'Quản trị viên sẽ thêm câu hỏi vào kho.',
            'An administrator will publish questions here.',
          )}
        />
      )}

      {!loading && visible.length > 0 && (
        <div className="card-grid mt-4">
          {visible.map((question) => (
            <Link
              key={question.id}
              to={`/app/speaking/${question.part}`}
              className="skill-card"
            >
              <span className="skill-card-icon">
                <Mic size={20} aria-hidden />
              </span>
              <div>
                <p className="eyebrow">{question.part.toUpperCase()}</p>
                <h3>{question.topic}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
