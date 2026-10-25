import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Plus, Search } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { Empty, Notice } from './ui'
import { loadVocabularyEntries, loadVocabularyTopics } from '../lib/vocabularyRepository.ts'
import { entryToCard, filterEntries, isInNotebook, type VocabularyEntry, type VocabularyTopic } from '../lib/vocabularyLogic.ts'

/** Thư viện từ vựng IELTS: 25 chủ đề, mỗi chủ đề 200 mục. */
export function VocabularyLibrary() {
  const { c } = useCopy()
  const { state, addCard } = useStore()
  const [topics, setTopics] = useState<VocabularyTopic[]>([])
  const [topicKey, setTopicKey] = useState('')
  const [entries, setEntries] = useState<VocabularyEntry[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const panelRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let active = true
    void loadVocabularyTopics().then(items => {
      if (!active) return
      setTopics(items)
      setTopicKey(items[0]?.key ?? '')
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!topicKey) return
    let active = true
    void loadVocabularyEntries({ topic: topicKey }).then(items => {
      if (active) setEntries(items)
    })
    return () => { active = false }
  }, [topicKey])

  const visible = useMemo(() => filterEntries(entries, query), [entries, query])
  const activeTopic = topics.find(topic => topic.key === topicKey)

  function selectTopic(key: string) {
    setTopicKey(key)
    setQuery('')
    // Lưới 25 chủ đề đẩy danh sách từ xuống thấp — cuộn tới khu vực từ vựng.
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  async function save(entry: VocabularyEntry) {
    setSaving(entry.id)
    try {
      await addCard(entryToCard(entry))
    } finally {
      setSaving('')
    }
  }

  if (!topics.length) {
    return <Notice error={!loading}>{loading ? c('Đang tải thư viện từ vựng…', 'Loading the vocabulary library…') : c('Chưa tải được thư viện từ vựng.', 'The vocabulary library could not be loaded.')}</Notice>
  }

  return <>
    <div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm trong chủ đề', 'Search this topic')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm từ hoặc nghĩa…', 'Search a word or meaning…')} /></div></div>
    <div className="vocab-topic-grid">{topics.map(topic => <button type="button" key={topic.key} className={`vocab-topic-card ${topic.key === topicKey ? 'active' : ''}`} aria-pressed={topic.key === topicKey} onClick={() => selectTopic(topic.key)}><span className="number-dot">{String(topic.number).padStart(2, '0')}</span><strong>{topic.title}</strong><small>{topic.description}</small></button>)}</div>
    {activeTopic ? <section className="vocab-library-panel" ref={panelRef}>
      <header className="panel-heading"><div><h2>{activeTopic.title}</h2><p className="muted">{activeTopic.description}</p></div><span className="badge teal">{visible.length} / {entries.length}</span></header>
      {visible.length ? <div className="vocab-grid">{visible.map(entry => {
        const added = isInNotebook(entry, state.cards)
        return <article className="panel vocab-card" key={entry.id}>
          <div className="card-topline"><span className="badge teal">{entry.pos || c('Từ vựng', 'Word')}</span>{entry.ipa && <span className="muted">/{entry.ipa}/</span>}</div>
          <h3>{entry.term}</h3>
          <p>{entry.meaning}</p>
          {entry.definition && <p className="muted">{entry.definition}</p>}
          {entry.examples[0] && <blockquote>{entry.examples[0]}</blockquote>}
          <button type="button" className="button outline full" disabled={added || saving === entry.id} onClick={() => void save(entry)}>{added ? <><Check size={16} />{c('Đã có trong sổ', 'In your notebook')}</> : <><Plus size={16} />{c('Thêm vào sổ', 'Add to notebook')}</>}</button>
        </article>
      })}</div> : <Empty title={c('Không tìm thấy từ nào', 'No words found')} description={c('Thử một từ khác trong chủ đề này.', 'Try another word in this topic.')} />}
      <p className="helper-text centered">{c('Nguồn dữ liệu: ForumFlash.', 'Data source: ForumFlash.')}</p>
    </section> : null}
  </>
}
