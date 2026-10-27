import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, Clock } from 'lucide-react'
import { Empty, PageHeader, Notice } from '../components/ui'
import { useCopy } from '../i18n'
import { loadSkillTests } from '../lib/skillRepository.ts'
import type { SkillTest } from '../lib/skillLogic.ts'

export default function Reading() {
  const { c } = useCopy()
  const [tests, setTests] = useState<SkillTest[]>([])
  const [series, setSeries] = useState('')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    void loadSkillTests('reading').then(items => {
      if (!alive) return
      setTests(items)
      setLoading(false)
      setFailed(items.length === 0)
    })
    return () => { alive = false }
  }, [])

  const seriesOptions = useMemo(() => [...new Set(tests.map(test => test.series).filter(Boolean))], [tests])
  const visible = series ? tests.filter(test => test.series === series) : tests

  return <div className="page">
    <PageHeader
      eyebrow={c('LUYỆN ĐỌC', 'READING')}
      title={c('Kho đề Reading', 'Reading library')}
      description={c('Toàn bộ đề Reading của Cambridge 9–20, Essential Words và các bộ TID. Đọc với đồng hồ, đánh dấu câu khó và xem lại đáp án ngay sau khi nộp.', 'The full Reading library from Cambridge 9–20, Essential Words and the TID sets. Read under a timer, flag tricky questions and review the answers right after you submit.')}
    />
    {failed && <Notice error><div><strong>{c('Không tải được kho đề.', 'The library could not be loaded.')}</strong><p>{c('Kiểm tra kết nối tới backend rồi tải lại trang.', 'Check the backend connection and reload the page.')}</p></div></Notice>}
    {seriesOptions.length > 1 && <div className="filter-row">
      <button type="button" className={`filter-chip ${series === '' ? 'is-active' : ''}`} onClick={() => setSeries('')}>{c('Tất cả', 'All')}</button>
      {seriesOptions.map(item => <button key={item} type="button" className={`filter-chip ${series === item ? 'is-active' : ''}`} onClick={() => setSeries(item)}>{item}</button>)}
    </div>}
    {loading && <div className="loading-state" role="status">{c('Đang tải…', 'Loading…')}</div>}
    {!loading && !visible.length && <Empty title={c('Chưa có đề Reading', 'No reading tests yet')} description={c('Quản trị viên sẽ thêm đề vào kho.', 'An administrator will publish tests here.')} />}
    <div className="card-grid">
      {visible.map(test => <Link key={test.id} to={`/app/reading/${test.slug}`} className="skill-card">
        <span className="skill-card-icon"><BookOpen size={20} /></span>
        <div>
          <p className="eyebrow">{test.series}</p>
          <h3>{test.title}</h3>
          <p className="muted">{test.level}</p>
          <p className="skill-card-meta"><Clock size={14} />{test.durationMinutes} {c('phút', 'min')} · {test.questionCount} {c('câu', 'questions')}</p>
        </div>
      </Link>)}
    </div>
  </div>
}
