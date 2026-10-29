import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, Check, CheckCircle2, Coffee, Heart, LogOut, Monitor, Moon, Sun, Target } from 'lucide-react'
import { Empty, PageHeader } from '../components/ui'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'
import { useTheme } from '../theme'
import { loadDonationSettings, type DonationSettings } from '../lib/donationRepository'
import { landingCopy } from '../agent/landing'
import { renderLandingHtml } from '../agent/html'

// React enhances the same escaped HTML served before the bundle loads.
const landingMarkup = renderLandingHtml()
export function Landing() {
  const { language, changeLanguage } = useCopy()
  const { toggle } = useTheme()
  const navigate = useNavigate()
  useEffect(() => {
    document.querySelectorAll('[data-landing-react] [data-lang-switch]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-lang-switch') === language))
    })
  }, [language])
  return <div data-landing-react onClick={event => {
    if (!(event.target instanceof Element)) return
    const languageButton = event.target.closest<HTMLElement>('[data-lang-switch]')
    if (languageButton) {
      const language = languageButton.dataset.langSwitch
      if (landingCopy.languageButtons.some(button => button.code === language)) void changeLanguage(language!)
      return
    }
    if (event.target.closest('[data-theme-switch]')) { toggle(); return }
    const link = event.target.closest<HTMLAnchorElement>('a[href]')
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return
    const url = new URL(link.href)
    if (url.origin === location.origin && !url.hash && !landingCopy.footerLinks.some(item => item.href === url.pathname)) {
      event.preventDefault()
      void navigate(url.pathname + url.search)
    }
  }} dangerouslySetInnerHTML={{ __html: landingMarkup }} />
}

export function Donate() {
  const { c, language } = useCopy()
  const [donation, setDonation] = useState<DonationSettings | null>(null)
  useEffect(() => {
    let active = true
    void loadDonationSettings().then(value => { if (active) setDonation(value) })
    return () => { active = false }
  }, [])
  const showQr = Boolean(donation?.isConfigured && donation.qrPath)
  return <><PageHeader eyebrow={c('CẢM ƠN VÌ BẠN Ở ĐÂY', 'THANK YOU FOR BEING HERE')} title={c('Cùng giữ tri thức mở', 'Keep learning open')} description={c('Một dự án nhỏ, một niềm tin lớn vào việc học.', 'A small project with a big belief in learning.')} /><section className="donate-card"><span className="donate-heart"><Heart size={45} strokeWidth={1.5} /></span><h2>{c('Một ly cà phê.', 'A cup of coffee.')}<br /><em>{c('Thêm nhiều cơ hội học tập.', 'More room for learning.')}</em></h2><p>{c('IELTS Studio được xây dựng để mọi người có thể luyện viết miễn phí. Việc ủng hộ hoàn toàn tự nguyện, giúp duy trì hạ tầng và phát triển tài liệu.', 'IELTS Studio is built to make writing practice free for everyone. Voluntary donations help maintain infrastructure and develop learning resources.')}</p><div className="donate-values"><span><CheckCircle2 size={18} />{c('Không mở khóa tính năng', 'No features to unlock')}</span><span><CheckCircle2 size={18} />{c('Không gói trả phí', 'No paid tiers')}</span></div>{showQr ? <div className="donate-qr"><img className="donate-qr-image" src={donation!.qrPath} alt={c('Mã QR nhận ủng hộ', 'Donation QR code')} width={433} height={604} /><div className="donate-qr-info">{donation!.methods.map(method => <div className="donate-method" key={method.label}><span>{method.label}</span><strong>{method.value}</strong>{method.note && <small>{method.note}</small>}</div>)}{donation!.instructions.vi && <p>{language === 'en' ? donation!.instructions.en : donation!.instructions.vi}</p>}</div></div> : <div className="donate-unconfigured"><Coffee size={25} /><h3>{c('Thông tin ủng hộ đang được chuẩn bị', 'Donation details are being prepared')}</h3><p>{c('Chưa cấu hình tài khoản hoặc mã QR nhận tiền. Bạn vẫn có thể dùng toàn bộ nội dung học tập.', 'No donation account or QR code has been configured. All learning content remains available.')}</p></div>}<Link className="text-link" to="/app">{c('Tiếp tục hành trình học', 'Back to learning')}<ArrowRight size={17} /></Link></section></>
}

export function Settings() {
  const { c, language, changeLanguage } = useCopy()
  const { state, update } = useStore()
  const { signOut, user } = useAuth()
  const { preference, setPreference } = useTheme()
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  return <><PageHeader eyebrow={c('KHÔNG GIAN THEO CÁCH CỦA BẠN', 'MAKE THIS SPACE YOURS')} title={c('Cài đặt', 'Settings')} description={c('Một vài điều nhỏ để việc học dễ chịu hơn.', 'A few little things to make learning feel right.')} /><div className="panel settings-panel"><h2>{c('Tài khoản', 'Account')}</h2><p>{user?.email ?? c('Chưa đăng nhập.', 'Not signed in.')}</p><button className="button danger-outline" disabled={signingOut} onClick={() => { setSigningOut(true); void signOut().finally(() => setSigningOut(false)) }}><LogOut size={17} />{signingOut ? c('Đang đăng xuất…', 'Signing out…') : c('Đăng xuất', 'Sign out')}</button></div><form className="panel settings-panel" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); void update(current => ({ ...current, profile: { name: String(data.get('name')).trim(), target: String(data.get('target')), feedback: String(data.get('feedback')) } })).then(() => setSaved(true)).catch(() => {}).finally(() => setBusy(false)) }}><h2>{c('Hồ sơ học tập', 'Learning profile')}</h2><label>{c('Bạn muốn được gọi là gì?', 'What should we call you?')}<input name="name" maxLength={60} defaultValue={state.profile.name} placeholder={c('Tên của bạn', 'Your name')} /></label><div className="form-columns"><label>{c('Band mục tiêu', 'Target band')}<select name="target" defaultValue={state.profile.target}>{['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(item => <option key={item}>{item}</option>)}</select></label><label>{c('Ngôn ngữ feedback', 'Feedback language')}<select name="feedback" defaultValue={state.profile.feedback}><option value="vi">{language === 'en' ? 'Vietnamese' : 'Tiếng Việt'}</option><option value="en">{language === 'en' ? 'English' : 'Tiếng Anh'}</option></select></label></div><label>{c('Ngôn ngữ giao diện', 'Interface language')}<select value={language} onChange={event => void changeLanguage(event.target.value)}><option value="vi">{language === 'en' ? 'Vietnamese' : 'Tiếng Việt'}</option><option value="en">{language === 'en' ? 'English' : 'Tiếng Anh'}</option></select></label><button className="button primary" disabled={busy}><Check size={17} />{busy ? c('Đang lưu…', 'Saving…') : c('Lưu thay đổi', 'Save changes')}</button>{saved && <p className="text-teal" role="status">{c('Đã lưu cài đặt trên trình duyệt.', 'Settings saved in this browser.')}</p>}</form><div className="panel settings-panel"><h2>{c('Giao diện', 'Appearance')}</h2><div className="theme-choices">{([['light', c('Sáng', 'Light'), c('Nền sáng, dễ đọc ban ngày.', 'Bright background, easy to read by day.')], ['dark', c('Tối', 'Dark'), c('Nền nâu ấm, dịu mắt ban đêm.', 'Warm brown background, easier on the eyes at night.')], ['system', c('Theo hệ thống', 'System'), c('Tự đổi theo thiết bị của bạn.', 'Follows your device setting.')]] as const).map(([value, title, description]) => <button key={value} className={`theme-choice ${preference === value ? 'active' : ''}`} aria-pressed={preference === value} onClick={() => setPreference(value)}>{value === 'light' ? <Sun size={20} /> : value === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}<span>{title}</span><small>{description}</small></button>)}</div></div><div className="panel settings-panel"><h2>{c('Dữ liệu trên thiết bị', 'Data on this device')}</h2><p>{c('Nháp, ảnh, thẻ và tiến độ đọc đã đồng bộ lên tài khoản của bạn. Nút này chỉ xoá bản cache trong trình duyệt này.', 'Drafts, images, cards and reading progress are synced to your account. This only clears the local cache in this browser.')}</p><button className="button danger-outline" onClick={() => { if (window.confirm(c('Xóa toàn bộ nháp, ảnh, thẻ và tiến độ học trên trình duyệt này? Thao tác không thể hoàn tác.', 'Delete all drafts, images, cards and learning progress in this browser? This cannot be undone.'))) void update(current => ({ ...current, drafts: [], cards: [], completed: [] })).catch(() => {}) }}>{c('Xóa dữ liệu học tập trên thiết bị', 'Clear learning data on this device')}</button></div></>
}


export function NotFound() {
  const { c } = useCopy()
  return <Empty title={c('Trang này chưa có ở đây', 'This page is not here')} description={c('Quay lại không gian học tập để tiếp tục.', 'Return to your workspace to continue.')} action={<Link className="button primary" to="/app"><Target size={18} />{c('Về tổng quan', 'Back to overview')}</Link>} />
}
