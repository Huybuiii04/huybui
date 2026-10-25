import { useCallback, useEffect, useState } from 'react'
import { Coffee, Loader2, QrCode, Upload } from 'lucide-react'
import { useCopy } from '../../i18n'
import { Empty, Notice } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { adminAction } from '../../lib/adminSession'
import { loadDonationSettings, type DonationSettings } from '../../lib/donationRepository'

const BUCKET = 'donation-media'

export function DonateTab({ onError, onBusy, busy }: { onError: (value: string) => void; onBusy: (value: boolean) => void; busy: boolean }) {
  const { c } = useCopy()
  const [settings, setSettings] = useState<DonationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [instructionsVi, setInstructionsVi] = useState('')
  const [instructionsEn, setInstructionsEn] = useState('')
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const current = await loadDonationSettings()
    setSettings(current)
    setInstructionsVi(current?.instructions.vi ?? '')
    setInstructionsEn(current?.instructions.en ?? '')
    const first = current?.methods[0]
    setLabel(first?.label ?? '')
    setValue(first?.value ?? '')
    setNote(first?.note ?? '')
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function upload(file: File) {
    onBusy(true)
    onError('')
    setNotice('')
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      const path = `qr-${Date.now()}.${extension}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || 'image/png', upsert: true })
      if (error) throw new Error(error.message)
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const result = await adminAction<{ qr_path: string }>('donation_update', { qrPath: data.publicUrl, isConfigured: true })
      if (!result.ok) throw new Error('Không lưu được cấu hình')
      setNotice(c('Đã cập nhật mã QR.', 'The QR code has been updated.'))
      await load()
    } catch (failure) {
      onError(failure instanceof Error ? failure.message : c('Không upload được ảnh.', 'Could not upload the image.'))
    } finally {
      onBusy(false)
    }
  }

  async function save() {
    onBusy(true)
    onError('')
    const result = await adminAction('donation_update', {
      qrPath: settings?.qrPath ?? '',
      isConfigured: Boolean(settings?.qrPath),
      methods: label && value ? [{ label, value, note }] : [],
      instructions: { vi: instructionsVi, en: instructionsEn },
    })
    onBusy(false)
    if (!result.ok) { onError(c('Không lưu được cấu hình ủng hộ.', 'Could not save the donation settings.')); return }
    setNotice(c('Đã lưu thông tin ủng hộ.', 'Donation details saved.'))
    await load()
  }

  if (loading) return <div className="panel"><div className="loading-state" role="status"><Loader2 size={18} className="spin" />{c('Đang tải cấu hình ủng hộ…', 'Loading donation settings…')}</div></div>

  return <>
    {notice && <Notice>{notice}</Notice>}
    <section className="panel admin-donate">
      <div className="panel-heading"><h2>{c('Mã QR ủng hộ', 'Donation QR code')}</h2></div>
      {settings?.qrPath
        ? <div className="admin-donate-preview"><img src={settings.qrPath} alt={c('Mã QR hiện tại', 'Current QR code')} /><div><p className="helper-text">{settings.qrPath}</p><label className="button outline"><Upload size={16} />{c('Thay ảnh QR', 'Replace QR image')}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file) }} /></label></div></div>
        : <Empty title={c('Chưa có mã QR', 'No QR code yet')} description={c('Tải ảnh QR lên để hiện trong trang ủng hộ.', 'Upload a QR image to show it on the donation page.')} action={<label className="button primary"><Upload size={16} />{c('Tải ảnh QR', 'Upload QR image')}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file) }} /></label>} />}
    </section>

    <section className="panel admin-donate">
      <div className="panel-heading"><h2>{c('Thông tin tài khoản', 'Account details')}</h2></div>
      <div className="admin-form-grid">
        <label>{c('Ngân hàng / ví', 'Bank or wallet')}<input value={label} onChange={event => setLabel(event.target.value)} placeholder="MB Bank · VietQR" /></label>
        <label>{c('Số tài khoản', 'Account number')}<input value={value} onChange={event => setValue(event.target.value)} placeholder="8888282222" /></label>
        <label>{c('Chủ tài khoản', 'Account holder')}<input value={note} onChange={event => setNote(event.target.value)} placeholder="BUI DINH ANH HUY" /></label>
      </div>
      <div className="admin-form-grid">
        <label>{c('Hướng dẫn (VI)', 'Instructions (VI)')}<textarea rows={3} value={instructionsVi} onChange={event => setInstructionsVi(event.target.value)} /></label>
        <label>{c('Hướng dẫn (EN)', 'Instructions (EN)')}<textarea rows={3} value={instructionsEn} onChange={event => setInstructionsEn(event.target.value)} /></label>
      </div>
      <div className="button-row"><button className="button primary" disabled={busy} onClick={() => void save()}><Coffee size={16} />{c('Lưu thông tin', 'Save details')}</button><button className="button outline" disabled={busy} onClick={() => void load()}><QrCode size={16} />{c('Tải lại', 'Reload')}</button></div>
    </section>
  </>
}
