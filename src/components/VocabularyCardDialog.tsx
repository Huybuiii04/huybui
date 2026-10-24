import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { useCopy } from '../i18n'
import type { Card } from '../lib/store'

export type NewCardValues = { term: string; meaning: string; example: string; kind: Card['kind'] }

/** Hộp thoại thêm thẻ từ vựng / cấu trúc / lỗi — dùng chung cho Sổ từ vựng và kết quả chấm. */
export function VocabularyCardDialog({
  open,
  onClose,
  defaultKind = 'vocabulary',
  onSave,
}: {
  open: boolean
  onClose: () => void
  defaultKind?: Card['kind']
  onSave: (values: NewCardValues) => Promise<void> | void
}) {
  const { c } = useCopy()
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    void Promise.resolve(onSave({
      term: String(data.get('term')).trim(),
      meaning: String(data.get('meaning')).trim(),
      example: String(data.get('example')).trim(),
      kind: (data.get('kind') as Card['kind']) ?? defaultKind,
    })).then(() => { dialog.current?.close(); form.reset() }).catch(() => {}).finally(() => setBusy(false))
  }

  return <dialog ref={dialog} className="modal" onClose={onClose}><form onSubmit={submit}>
    <div className="section-heading"><h2>{c('Thêm điều muốn nhớ', 'Something to remember')}</h2><button type="button" className="icon-button" onClick={onClose} aria-label={c('Đóng', 'Close')}><X size={20} /></button></div>
    <label>{c('Loại thẻ', 'Card type')}<select name="kind" defaultValue={defaultKind}><option value="vocabulary">{c('Từ / cụm từ', 'Word / phrase')}</option><option value="structure">{c('Cấu trúc câu', 'Sentence structure')}</option><option value="error">{c('Lỗi cần nhớ', 'Error to remember')}</option></select></label>
    <label>{c('Từ / cấu trúc', 'Word / structure')}<input name="term" required maxLength={200} pattern=".*\S.*" placeholder="play a pivotal role" autoFocus /></label>
    <label>{c('Ý nghĩa / giải thích', 'Meaning / explanation')}<textarea name="meaning" required maxLength={1000} rows={3} /></label>
    <label>{c('Câu ví dụ', 'Example sentence')}<textarea name="example" maxLength={2000} rows={3} /></label>
    <button className="button primary full" disabled={busy}><Plus size={17} />{busy ? c('Đang lưu…', 'Saving…') : c('Lưu vào sổ', 'Save to collection')}</button>
  </form></dialog>
}
