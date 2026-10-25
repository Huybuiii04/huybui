import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty } from '../../components/ui'
import {
  createVocabularyEntry,
  deleteVocabularyEntry,
  fetchVocabularyEntries,
  fetchVocabularyTopics,
  updateVocabularyEntry,
  type AdminVocabularyEntry,
  type AdminVocabularyTopic,
} from '../../lib/adminRepository'

export function VocabularyTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [topics, setTopics] = useState<AdminVocabularyTopic[]>([])
  const [topicKey, setTopicKey] = useState('')
  const [entries, setEntries] = useState<AdminVocabularyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<string>('')
  const [draft, setDraft] = useState({ meaning: '', definition: '', ipa: '' })
  const [creating, setCreating] = useState(false)
  const [newTerm, setNewTerm] = useState({ term: '', meaning: '', definition: '', pos: '' })

  const loadTopics = useCallback(async () => {
    const list = await fetchVocabularyTopics()
    setTopics(list)
    setTopicKey(current => current || list[0]?.key || '')
  }, [])

  const loadEntries = useCallback(async () => {
    if (!topicKey) return
    setLoading(true)
    setEntries(await fetchVocabularyEntries(topicKey))
    setLoading(false)
  }, [topicKey])

  useEffect(() => { void loadTopics() }, [loadTopics])
  useEffect(() => { void loadEntries() }, [loadEntries])

  function startEdit(entry: AdminVocabularyEntry) {
    setEditing(entry.id)
    setDraft({ meaning: entry.meaning, definition: entry.definition, ipa: entry.ipa ?? '' })
  }

  async function saveEdit(id: string) {
    onBusy(true)
    const result = await updateVocabularyEntry({ id, meaning: draft.meaning, definition: draft.definition, ipa: draft.ipa })
    onBusy(false)
    if (!result.ok) { onError(c('Không lưu được mục từ.', 'Could not save the entry.')); return }
    setEditing('')
    await loadEntries()
  }

  async function remove(id: string) {
    if (!window.confirm(c('Xoá mục từ này?', 'Delete this vocabulary entry?'))) return
    onBusy(true)
    const result = await deleteVocabularyEntry(id)
    onBusy(false)
    if (!result.ok) { onError(c('Không xoá được mục từ.', 'Could not delete the entry.')); return }
    await loadEntries()
  }

  async function create() {
    if (!newTerm.term.trim()) return
    onBusy(true)
    const result = await createVocabularyEntry({ topicKey, term: newTerm.term, pos: newTerm.pos, meaning: newTerm.meaning, definition: newTerm.definition })
    onBusy(false)
    if (!result.ok) { onError(c('Không thêm được mục từ.', 'Could not create the entry.')); return }
    setCreating(false)
    setNewTerm({ term: '', meaning: '', definition: '', pos: '' })
    await loadEntries()
  }

  const visible = entries.filter(entry => {
    const needle = query.trim().toLowerCase()
    if (!needle) return true
    return `${entry.term} ${entry.meaning} ${entry.definition}`.toLowerCase().includes(needle)
  })

  return <>
    <div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm mục từ', 'Search entries')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm trong chủ đề…', 'Search in this topic…')} /></div><select aria-label={c('Chủ đề', 'Topic')} value={topicKey} onChange={event => { setTopicKey(event.target.value); setEditing('') }}>{topics.map(topic => <option key={topic.key} value={topic.key}>{String(topic.number).padStart(2, '0')} · {topic.title}</option>)}</select><button className="button primary" onClick={() => setCreating(value => !value)}><Plus size={16} />{c('Thêm từ', 'Add word')}</button></div>

    {creating && <div className="panel admin-vocab-form"><div className="panel-heading"><h2>{c('Thêm mục từ mới', 'New vocabulary entry')}</h2></div><div className="admin-form-grid"><input aria-label={c('Từ vựng', 'Term')} value={newTerm.term} onChange={event => setNewTerm({ ...newTerm, term: event.target.value })} placeholder={c('Từ vựng', 'Term')} /><input aria-label={c('Từ loại', 'Part of speech')} value={newTerm.pos} onChange={event => setNewTerm({ ...newTerm, pos: event.target.value })} placeholder={c('Từ loại (vd: n, v)', 'Part of speech')} /><input aria-label={c('Nghĩa', 'Meaning')} value={newTerm.meaning} onChange={event => setNewTerm({ ...newTerm, meaning: event.target.value })} placeholder={c('Nghĩa', 'Meaning')} /><input aria-label={c('Ghi chú cách dùng', 'Usage note')} value={newTerm.definition} onChange={event => setNewTerm({ ...newTerm, definition: event.target.value })} placeholder={c('Ghi chú cách dùng', 'Usage note')} /></div><div className="button-row"><button className="button primary" disabled={busy || !newTerm.term.trim()} onClick={() => void create()}>{c('Lưu', 'Save')}</button><button className="button outline" onClick={() => setCreating(false)}>{c('Huỷ', 'Cancel')}</button></div></div>}

    {loading ? <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải từ vựng…', 'Loading vocabulary…')}</div></div> : !visible.length ? <div className="panel"><Empty title={c('Không có mục từ', 'No entries')} description={c('Thử từ khác.', 'Try another word.')} /></div> : <div className="panel"><div className="usage-table"><div className="usage-row usage-head"><span>{c('Từ', 'Term')}</span><span>{c('Nghĩa', 'Meaning')}</span><span>{c('Thao tác', 'Actions')}</span></div>{visible.map(entry => <div className="usage-row" key={entry.id}>
      {editing === entry.id
        ? <><span className="admin-prompt-cell"><strong>{entry.term}</strong><input aria-label={c('Nghĩa', 'Meaning')} value={draft.meaning} onChange={event => setDraft({ ...draft, meaning: event.target.value })} /></span><span><input aria-label={c('Ghi chú', 'Usage note')} value={draft.definition} onChange={event => setDraft({ ...draft, definition: event.target.value })} /><input aria-label="IPA" value={draft.ipa} onChange={event => setDraft({ ...draft, ipa: event.target.value })} /></span><span className="row-actions"><button className="icon-button" aria-label={c('Lưu', 'Save')} disabled={busy} onClick={() => void saveEdit(entry.id)}><Check size={16} /></button><button className="icon-button" aria-label={c('Huỷ', 'Cancel')} onClick={() => setEditing('')}><X size={16} /></button></span></>
        : <><span className="admin-prompt-cell"><strong>{entry.term}</strong><small>{entry.pos}{entry.ipa ? ` · /${entry.ipa}/` : ''}</small></span><span className="admin-prompt-cell"><span>{entry.meaning}</span><small>{entry.definition}</small></span><span className="row-actions"><button className="icon-button" aria-label={c('Sửa mục từ', 'Edit entry')} onClick={() => startEdit(entry)}><Pencil size={15} /></button><button className="icon-button danger-text" aria-label={c('Xoá mục từ', 'Delete entry')} disabled={busy} onClick={() => void remove(entry.id)}><Trash2 size={15} /></button></span></>}
    </div>)}</div></div>}
  </>
}
