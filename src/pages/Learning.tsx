import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BookOpen, Check, CheckCircle2, Eye, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { Empty, PageHeader } from '../components/ui'
import { VocabularyCardDialog } from '../components/VocabularyCardDialog'
import { fetchAllErrorLogs } from '../lib/featuresRepository'
import { VocabularyLibrary } from '../components/VocabularyLibrary'
import type { ErrorLogEntry } from '../lib/aiLogic.ts'

export function Vocabulary() {
  const { c } = useCopy()
  const { state, addCard, update } = useStore()
  const [tab, setTab] = useState<'mine' | 'library'>('mine')
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const due = state.cards.filter(card => card.dueAt <= Date.now()).length
  const cards = state.cards.filter(card => (kind === 'all' || card.kind === kind) && `${card.term} ${card.meaning}`.toLowerCase().includes(search.toLowerCase()))
  return <><PageHeader eyebrow={c('GOM GÓP TỪNG CÁCH DIỄN ĐẠT', 'COLLECT WORDS. FIND YOUR VOICE.')} title={c('Sổ từ vựng', 'Your word collection')} description={c('Những từ, cụm từ và cấu trúc bạn muốn biến thành của mình.', 'Words, phrases and structures you want to make your own.')} action={<button className="button primary" onClick={() => setDialogOpen(true)}><Plus size={17} />{c('Thêm thẻ mới', 'Add a card')}</button>} /><div className="tabs"><button type="button" className={tab === 'mine' ? 'active' : ''} aria-pressed={tab === 'mine'} onClick={() => setTab('mine')}>{c('Sổ của tôi', 'My notebook')}</button><button type="button" className={tab === 'library' ? 'active' : ''} aria-pressed={tab === 'library'} onClick={() => setTab('library')}>{c('Thư viện 25 chủ đề', '25-topic library')}</button></div>{tab === 'library' ? <VocabularyLibrary /> : <><div className="review-banner"><span className="task-icon teal"><RotateCcw size={26} /></span><div><h3>{c(`${due} thẻ đến lịch ôn`, `${due} cards ready to review`)}</h3><p>{c('Ôn ngắn, nhớ lâu. Dành một chút thời gian cho những điều đã học.', 'Short reviews, lasting memories. Revisit what you have learned.')}</p></div><Link className="button primary" to="/app/review">{c('Ôn tập ngay', 'Review now')}<ArrowRight size={17} /></Link></div><div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm từ vựng', 'Search vocabulary')} value={search} onChange={event => setSearch(event.target.value)} placeholder={c('Tìm từ hoặc ý nghĩa…', 'Search a word or meaning…')} /></div><select aria-label={c('Loại thẻ', 'Card type')} value={kind} onChange={event => setKind(event.target.value)}><option value="all">{c('Tất cả thẻ', 'All cards')}</option><option value="vocabulary">{c('Từ vựng', 'Vocabulary')}</option><option value="structure">{c('Cấu trúc', 'Structures')}</option><option value="error">{c('Lỗi cần nhớ', 'Errors to remember')}</option></select></div>{cards.length ? <div className="vocab-grid">{cards.map(card => <article className="panel vocab-card" key={card.id}><div className="card-topline"><span className="badge teal">{card.kind === 'structure' ? c('Cấu trúc', 'Structure') : card.kind === 'error' ? c('Lỗi cần nhớ', 'Error') : c('Từ vựng', 'Vocabulary')}</span><button className="icon-button" aria-label={c('Xóa thẻ', 'Delete card')} onClick={() => { if (window.confirm(c('Xóa thẻ này khỏi bộ từ cá nhân?', 'Delete this card from your collection?'))) void update(current => ({ ...current, cards: current.cards.filter(item => item.id !== card.id) })).catch(() => {}) }}><Trash2 size={16} /></button></div><h3>{card.term}</h3><p>{card.meaning}</p>{card.example && <blockquote>{card.example}</blockquote>}<div className="card-bottom"><span>{c('Mức ghi nhớ', 'Memory level')} {card.level}/6</span><span className={card.dueAt <= Date.now() ? 'text-teal' : 'muted'}>{card.dueAt <= Date.now() ? c('Đến lịch ôn', 'Due now') : c('Đã lên lịch', 'Scheduled')}</span></div></article>)}</div> : <div className="panel"><Empty title={c('Bộ sưu tập bắt đầu từ một từ', 'Your collection starts with a word')} description={c('Thêm thẻ của riêng bạn hoặc lưu cụm từ từ bài đã chấm.', 'Add your own card or save a useful phrase from a graded essay.')} action={<Link className="button outline" to="/app/prompts"><BookOpen size={17} />{c('Khám phá kho đề bài', 'Explore the prompt library')}</Link>} /></div>}</>}<VocabularyCardDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={async values => { await addCard(values); setDialogOpen(false) }} /></>
}

export function Review() {
  const { c } = useCopy()
  const { state, review } = useStore()
  const [ids] = useState(() => state.cards.filter(card => card.dueAt <= Date.now()).map(card => card.id))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [busy, setBusy] = useState(false)
  const card = state.cards.find(item => item.id === ids[index])
  function answer(remembered: boolean) {
    if (!card || busy) return
    setBusy(true)
    void review(card.id, remembered).then(() => { setRevealed(false); setIndex(current => current + 1) }).catch(() => {}).finally(() => setBusy(false))
  }
  return <><PageHeader eyebrow={c('ÔN NGẮN, NHỚ LÂU', 'A LITTLE REVIEW GOES A LONG WAY')} title={c('Một chút ôn tập', 'Time for a little review')} description={c('Thử nhớ trước khi xem đáp án. Không cần vội.', 'Try recalling the answer before revealing it. Take your time.')} /><div className="review-container">{card ? <><div className="review-progress"><span>{c('Tiến độ phiên ôn', 'Session progress')}</span><strong>{index + 1} / {ids.length}</strong></div><progress value={index} max={ids.length} /><div className="flashcard"><span className="badge teal">{card.kind === 'structure' ? c('CẤU TRÚC', 'STRUCTURE') : c('THẺ GHI NHỚ', 'FLASHCARD')}</span><h2>{card.term}</h2>{revealed ? <div className="flashcard-answer"><p>{card.meaning}</p>{card.example && <blockquote>{card.example}</blockquote>}</div> : <p className="muted">{c('Bạn có nhớ ý nghĩa và cách dùng không?', 'Can you recall the meaning and how to use it?')}</p>}</div>{revealed ? <div className="review-actions"><button className="button outline" disabled={busy} onClick={() => answer(false)}><RotateCcw size={18} />{c('Chưa nhớ', 'Not yet')}</button><button className="button primary" disabled={busy} onClick={() => answer(true)}><Check size={18} />{c('Đã nhớ', 'Remembered')}</button></div> : <button className="button primary full" onClick={() => setRevealed(true)}><Eye size={18} />{c('Xem đáp án', 'Reveal answer')}</button>}<p className="helper-text centered">{c('Lịch ôn được lưu trên trình duyệt này.', 'Review schedules are saved in this browser.')}</p></> : <div className="panel review-complete"><CheckCircle2 size={48} /><h2>{ids.length ? c('Một bước tiến nhỏ, đã xong.', 'A small step forward. Done.') : c('Chưa có thẻ đến hạn', 'You’re all caught up')}</h2><p>{ids.length ? c(`Bạn vừa ôn ${index} thẻ. Hẹn gặp lại ở lần ôn tiếp theo.`, `You reviewed ${index} cards. See you next time.`) : c('Thêm từ mới hoặc quay lại khi thẻ đến lịch ôn.', 'Save new words or return when your cards are due.')}</p><Link className="button primary" to="/app/vocabulary">{c('Về sổ từ vựng', 'Back to your collection')}<ArrowRight size={17} /></Link></div>}</div></>
}
export function Errors() {
  const { c } = useCopy()
  const { state, addCard } = useStore()
  const [remote, setRemote] = useState<ErrorLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    void fetchAllErrorLogs().then(rows => { if (active) { setRemote(rows); setLoading(false) } })
    return () => { active = false }
  }, [])
  const cards = state.cards.filter(card => card.kind === 'error')
  return <><PageHeader eyebrow={c('BIẾN LỖI SAI THÀNH BÀI HỌC', 'TURN MISTAKES INTO PROGRESS')} title={c('Sổ lỗi sai', 'Your error logbook')} description={c('Nhìn ra một lỗi, tiến gần hơn một chút đến cách viết tốt.', 'Every error you notice is a step towards better writing.')} />
    {remote.length > 0 && <section className="panel grading-panel"><span className="eyebrow">{c('LỖI AI ĐÃ TÌM RA', 'MISTAKES FOUND BY AI')}</span><ul className="grading-list">{remote.map(item => <li key={item.id} className="error-item"><span className="error-quote">{item.quote}</span><span className="error-correction">{item.correction}</span>{item.explanation && <em>{item.explanation}</em>}<span className="error-meta">{item.category}</span><button className="button outline small" onClick={() => void addCard({ term: item.quote, meaning: item.correction, example: item.explanation, kind: 'error' })}>{c('Ôn lại', 'Review')}</button></li>)}</ul></section>}
    {cards.length > 0 && <div className="panel">{cards.map(card => <div className="essay-row" key={card.id}><span className="file-icon"><BookOpen size={20} /></span><div className="essay-row-main"><strong>{card.term}</strong><p>{card.meaning}</p><small>{card.example}</small></div><Link className="text-link" to="/app/review">{c('Ôn lại', 'Review')}<ArrowRight size={16} /></Link></div>)}</div>}
    {!loading && remote.length === 0 && cards.length === 0 && <div className="panel"><Empty title={c('Một trang mới để học từ lỗi sai', 'A fresh page for lessons learned')} description={c('Chấm một bài và các lỗi AI tìm ra sẽ xuất hiện ở đây. Bạn cũng có thể tự thêm thẻ loại “Lỗi cần nhớ”.', 'Grade an essay and the mistakes AI finds will appear here. You can also add an “Error to remember” card yourself.')} action={<Link className="button outline" to="/app/vocabulary"><Plus size={17} />{c('Thêm lỗi cần nhớ', 'Add an error card')}</Link>} /></div>}
  </>
}
