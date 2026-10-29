import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, Clock3, GraduationCap, ListChecks, Play, Search } from 'lucide-react'
import { Empty, PageHeader, Notice } from '../components/ui'
import { useCopy } from '../i18n'
import { loadSkillTests } from '../lib/skillRepository.ts'
import type { SkillTest } from '../lib/skillLogic.ts'

export default function Reading() {
  const { c } = useCopy()
  const [tests, setTests] = useState<SkillTest[]>([])
  const [series, setSeries] = useState('')
  const [search, setSearch] = useState('')
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
  const keyword = search.trim().toLowerCase()
  const visible = tests.filter(test => (!series || test.series === series) && (!keyword || [test.title, test.series, test.description, test.level].join(' ').toLowerCase().includes(keyword)))

  return <div className="page library-page">
    <PageHeader
      eyebrow={c('LUYỆN ĐỌC', 'READING')}
      title={c('Kho đề Reading', 'Reading library')}
      description={c('Chọn đề Cambridge 9–21, Essential Words hoặc TID để bắt đầu luyện đọc.', 'Choose a Cambridge 9–21, Essential Words or TID test to start reading practice.')}
    />
    {failed && <Notice error><div><strong>{c('Không tải được kho đề.', 'The library could not be loaded.')}</strong><p>{c('Kiểm tra kết nối tới backend rồi tải lại trang.', 'Check the backend connection and reload the page.')}</p></div></Notice>}
    <div className="library-filters">
      <div className="library-search">
        <Search size={18} aria-hidden />
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={c('Tìm đề hoặc chủ đề…', 'Search tests or topics…')} aria-label={c('Tìm đề Reading', 'Search reading tests')} />
      </div>
      {seriesOptions.length > 1 && <div className="filter-row" role="group" aria-label={c('Bộ đề Reading', 'Reading collections')}>
        <button type="button" className={`filter-chip ${series === '' ? 'is-active' : ''}`} aria-pressed={series === ''} onClick={() => setSeries('')}>{c('Tất cả', 'All')}</button>
        {seriesOptions.map(item => <button key={item} type="button" className={`filter-chip ${series === item ? 'is-active' : ''}`} aria-pressed={series === item} onClick={() => setSeries(item)}>{item}</button>)}
      </div>}
    </div>
    {loading && <div className="loading-state" role="status">{c('Đang tải…', 'Loading…')}</div>}
    {!loading && !visible.length && <Empty title={search || series ? c('Không tìm thấy đề', 'No matching tests') : c('Chưa có đề Reading', 'No reading tests yet')} description={search || series ? c('Thử từ khóa hoặc bộ đề khác.', 'Try another search or collection.') : c('Quản trị viên sẽ thêm đề vào kho.', 'An administrator will publish tests here.')} />}
    <div className="library-grid">
      {visible.map(test => <Link key={test.id} to={`/app/reading/${test.slug}`} className="skill-card library-card" aria-label={`${c('Bắt đầu', 'Start')} ${test.title}`}>
        <div className="library-card-badges">
          <span className="library-badge"><BookOpen size={12} aria-hidden /> READING</span>
          <span className="library-card-kind">{c('Đề luyện', 'Practice')}</span>
        </div>
        <p className="library-card-book">{test.series}</p>
        <h2>{test.title}</h2>
        {test.level && <p className="library-card-level">{test.level}</p>}
        <ul className="library-card-meta" aria-label={c('Thông tin đề', 'Test details')}>
          <li><ListChecks size={14} aria-hidden />{test.questionCount} {c('câu', 'questions')}</li>
          <li><Clock3 size={14} aria-hidden />{test.durationMinutes} {c('phút', 'min')}</li>
          <li><GraduationCap size={14} aria-hidden />{test.testType === 'general' ? 'General Training' : 'Academic'}</li>
        </ul>
        <span className="library-start" aria-hidden><Play size={15} />{c('Bắt đầu', 'Start')}</span>
      </Link>)}
    </div>
  </div>
}
