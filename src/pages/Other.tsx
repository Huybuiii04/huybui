import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ClipboardList, Coffee, Heart, Lightbulb, LogOut, Monitor, Moon, PenLine, ShieldCheck, Sparkles, Sun, Target, type LucideIcon } from 'lucide-react'
import { Brand, LanguageSwitch } from '../components/Layout'
import { Empty, PageHeader } from '../components/ui'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'
import { useTheme } from '../theme'
import { loadDonationSettings, type DonationSettings } from '../lib/donationRepository'
import { landingCopy, type LandingFeatureIcon } from '../agent/landing'

// Icon lucide tương ứng với icon ghi trong landing.ts, để bản React và bản HTML
// tĩnh dùng cùng một bộ icon cho ba thẻ tính năng.
const featureIcons = {
  pen: PenLine,
  clipboard: ClipboardList,
  lightbulb: Lightbulb,
} satisfies Record<LandingFeatureIcon, LucideIcon>

export function Landing() {
  const { c } = useCopy()
  const copy = landingCopy
  return <div className="landing">
    <a href="#landing-main" className="skip-link">{c(copy.skipToContent[0], copy.skipToContent[1])}</a>
    <header className="landing-nav">
      <Brand />
      <nav aria-label={c(copy.navLabel[0], copy.navLabel[1])}>
        <Link to="/app/prompts">{c(copy.navPromptLibrary[0], copy.navPromptLibrary[1])}</Link>
        <LanguageSwitch />
        <Link className="button outline" to="/app">{c(copy.navOpenStudio[0], copy.navOpenStudio[1])}<ArrowUpRight size={16} /></Link>
      </nav>
    </header>
    <main id="landing-main">
      <div className="landing-stage">
        <section className="landing-intro">
          <span className="landing-kicker"><span className="small-dot" />{c(copy.heroKicker[0], copy.heroKicker[1])}</span>
          <h1>{c(copy.heroTitle[0], copy.heroTitle[1])}<br />{c(copy.heroAccent[0], copy.heroAccent[1])}<em>{c(copy.heroEmphasis[0], copy.heroEmphasis[1])}</em></h1>
          <p>{c(copy.heroBody[0], copy.heroBody[1])}</p>
          <div className="button-row">
            <Link className="button primary large" to="/app/write">{c(copy.primaryCta[0], copy.primaryCta[1])}<ArrowRight size={18} /></Link>
            <Link className="button outline large" to="/app/essays/demo">{c(copy.secondaryCta[0], copy.secondaryCta[1])}<ArrowUpRight size={17} /></Link>
          </div>
          <div className="landing-perks">{copy.perks.map(perk => <span key={perk[1]}><Check size={15} />{c(perk[0], perk[1])}</span>)}</div>
          <a className="landing-explore" href="#learning-path">{c(copy.explore[0], copy.explore[1])}<ArrowRight size={16} /></a>
        </section>
        <section className="studio-preview" aria-label={c(copy.studioLabel[0], copy.studioLabel[1])}>
          <div className="studio-toolbar"><span><i /><i /><i /></span><span>{copy.studioToolbar}</span><PenLine size={15} /></div>
          <div className="studio-body">
            <div className="studio-meta"><span>{copy.studioMetaLabel}</span><span>{c(copy.studioMeta[0], copy.studioMeta[1])}</span></div>
            <h2>{c(copy.studioTitle[0], copy.studioTitle[1])}<br /><span>{c(copy.studioTitleAccent[0], copy.studioTitleAccent[1])}</span></h2>
            <p className="studio-prompt">{c(copy.studioPrompt[0], copy.studioPrompt[1])}</p>
            <div className="studio-excerpt" lang="en">{copy.studioExcerptBefore}<mark>{copy.studioExcerptHighlight}</mark>{copy.studioExcerptAfter}</div>
            <div className="studio-insight"><Sparkles size={19} /><div><strong>{c(copy.studioInsightTitle[0], copy.studioInsightTitle[1])}</strong><p>{c(copy.studioInsightBody[0], copy.studioInsightBody[1])}</p></div></div>
            <Link className="button primary full" to="/app/write">{c(copy.studioAction[0], copy.studioAction[1])}<ArrowRight size={17} /></Link>
          </div>
          <div className="studio-bottom"><span><ShieldCheck size={14} />{c(copy.studioBottom[0], copy.studioBottom[1])}</span><span>{copy.studioBottomLabel}</span></div>
        </section>
      </div>
      <section className="landing-learning" id="learning-path">
        <div className="landing-section-heading"><span className="eyebrow">{c(copy.learningKicker[0], copy.learningKicker[1])}</span><h2>{c(copy.learningTitle[0], copy.learningTitle[1])}</h2><p>{c(copy.learningBody[0], copy.learningBody[1])}</p></div>
        <div className="landing-features">{copy.features.map((item, index) => {
          const Icon = featureIcons[item.icon]
          return <Link to={item.href} className="landing-feature" key={item.href}>
            <div className="feature-top"><Icon size={23} /><span>0{index + 1}</span></div>
            <h3>{c(item.title[0], item.title[1])}</h3>
            <p>{c(item.body[0], item.body[1])}</p>
            <span className="feature-action">{c(item.action[0], item.action[1])}<ArrowUpRight size={17} /></span>
          </Link>
        })}</div>
      </section>
      <section className="landing-cta"><Heart size={24} /><span className="eyebrow">{c(copy.ctaKicker[0], copy.ctaKicker[1])}</span><h2>{c(copy.ctaTitle[0], copy.ctaTitle[1])}</h2><p>{c(copy.ctaBody[0], copy.ctaBody[1])}</p><Link className="button outline" to="/donate">{c(copy.donateCta[0], copy.donateCta[1])}<ArrowUpRight size={16} /></Link></section>
    </main>
    <footer className="landing-footer">
      <Brand />
      <span>{copy.footerCopyright}</span>
      <nav className="landing-footer-links" aria-label="Public information">{copy.footerLinks.map(link => <a key={link.href} href={link.href}>{c(link.label[0], link.label[1])}</a>)}</nav>
      <Link to="/app">{c(copy.footerStart[0], copy.footerStart[1])}<ArrowUpRight size={16} /></Link>
    </footer>
  </div>
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
  return <><PageHeader eyebrow={c('CẢM ƠN VÌ BẠN Ở ĐÂY', 'THANK YOU FOR BEING HERE')} title={c('Cùng giữ tri thức mở', 'Keep learning open')} description={c('Một dự án nhỏ, một niềm tin lớn vào việc học.', 'A small project with a big belief in learning.')} /><section className="donate-card"><span className="donate-heart"><Heart size={45} strokeWidth={1.5} /></span><h2>{c('Một ly cà phê.', 'A cup of coffee.')}<br /><em>{c('Thêm nhiều cơ hội học tập.', 'More room for learning.')}</em></h2><p>{c('IELTS Writing Studio được xây dựng để mọi người có thể luyện viết miễn phí. Việc ủng hộ hoàn toàn tự nguyện, giúp duy trì hạ tầng và phát triển tài liệu.', 'IELTS Writing Studio is built to make writing practice free for everyone. Voluntary donations help maintain infrastructure and develop learning resources.')}</p><div className="donate-values"><span><CheckCircle2 size={18} />{c('Không mở khóa tính năng', 'No features to unlock')}</span><span><CheckCircle2 size={18} />{c('Không gói trả phí', 'No paid tiers')}</span></div>{showQr ? <div className="donate-qr"><img className="donate-qr-image" src={donation!.qrPath} alt={c('Mã QR nhận ủng hộ', 'Donation QR code')} width={433} height={604} /><div className="donate-qr-info">{donation!.methods.map(method => <div className="donate-method" key={method.label}><span>{method.label}</span><strong>{method.value}</strong>{method.note && <small>{method.note}</small>}</div>)}{donation!.instructions.vi && <p>{language === 'en' ? donation!.instructions.en : donation!.instructions.vi}</p>}</div></div> : <div className="donate-unconfigured"><Coffee size={25} /><h3>{c('Thông tin ủng hộ đang được chuẩn bị', 'Donation details are being prepared')}</h3><p>{c('Chưa cấu hình tài khoản hoặc mã QR nhận tiền. Bạn vẫn có thể dùng toàn bộ nội dung học tập.', 'No donation account or QR code has been configured. All learning content remains available.')}</p></div>}<Link className="text-link" to="/app">{c('Tiếp tục hành trình học', 'Back to learning')}<ArrowRight size={17} /></Link></section></>
}

export function Settings() {
  const { c, language, changeLanguage } = useCopy()
  const { state, update } = useStore()
  const { signOut, user } = useAuth()
  const { preference, setPreference } = useTheme()
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  return <><PageHeader eyebrow={c('KHÔNG GIAN THEO CÁCH CỦA BẠN', 'MAKE THIS SPACE YOURS')} title={c('Cài đặt', 'Settings')} description={c('Một vài điều nhỏ để việc học dễ chịu hơn.', 'A few little things to make learning feel right.')} /><div className="panel settings-panel"><h2>{c('Tài khoản', 'Account')}</h2><p>{user?.email ?? c('Chưa đăng nhập.', 'Not signed in.')}</p><button className="button danger-outline" disabled={signingOut} onClick={() => { setSigningOut(true); void signOut().finally(() => setSigningOut(false)) }}><LogOut size={17} />{signingOut ? c('Đang đăng xuất…', 'Signing out…') : c('Đăng xuất', 'Sign out')}</button></div><form className="panel settings-panel" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); void update(current => ({ ...current, profile: { name: String(data.get('name')).trim(), target: String(data.get('target')), feedback: String(data.get('feedback')) } })).then(() => setSaved(true)).catch(() => {}).finally(() => setBusy(false)) }}><h2>{c('Hồ sơ học tập', 'Learning profile')}</h2><label>{c('Bạn muốn được gọi là gì?', 'What should we call you?')}<input name="name" maxLength={60} defaultValue={state.profile.name} placeholder={c('Tên của bạn', 'Your name')} /></label><div className="form-columns"><label>{c('Band mục tiêu', 'Target band')}<select name="target" defaultValue={state.profile.target}>{['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(item => <option key={item}>{item}</option>)}</select></label><label>{c('Ngôn ngữ feedback', 'Feedback language')}<select name="feedback" defaultValue={state.profile.feedback}><option value="vi">{language === 'en' ? 'Vietnamese' : 'Tiếng Việt'}</option><option value="en">{language === 'en' ? 'English' : 'Tiếng Anh'}</option></select></label></div><label>{c('Ngôn ngữ giao diện', 'Interface language')}<select value={language} onChange={event => void changeLanguage(event.target.value)}><option value="vi">{language === 'en' ? 'Vietnamese' : 'Tiếng Việt'}</option><option value="en">{language === 'en' ? 'English' : 'Tiếng Anh'}</option></select></label><button className="button primary" disabled={busy}><Check size={17} />{busy ? c('Đang lưu…', 'Saving…') : c('Lưu thay đổi', 'Save changes')}</button>{saved && <p className="text-teal" role="status">{c('Đã lưu cài đặt trên trình duyệt.', 'Settings saved in this browser.')}</p>}</form><div className="panel settings-panel"><h2>{c('Giao diện', 'Appearance')}</h2><div className="theme-choices">{([['light', c('Sáng', 'Light'), c('Nền sáng, dễ đọc ban ngày.', 'Bright background, easy to read by day.')], ['dark', c('Tối', 'Dark'), c('Nền navy sâu, dịu mắt ban đêm.', 'Deep navy background, easier on the eyes at night.')], ['system', c('Theo hệ thống', 'System'), c('Tự đổi theo thiết bập của bạn.', 'Follows your device setting.')]] as const).map(([value, title, description]) => <button key={value} className={`theme-choice ${preference === value ? 'active' : ''}`} aria-pressed={preference === value} onClick={() => setPreference(value)}>{value === 'light' ? <Sun size={20} /> : value === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}<span>{title}</span><small>{description}</small></button>)}</div></div><div className="panel settings-panel"><h2>{c('Dữ liệu trên thiết bị', 'Data on this device')}</h2><p>{c('Nháp, ảnh, thẻ và tiến độ đọc đã đồng bộ lên tài khoản của bạn. Nút này chỉ xoá bản cache trong trình duyệt này.', 'Drafts, images, cards and reading progress are synced to your account. This only clears the local cache in this browser.')}</p><button className="button danger-outline" onClick={() => { if (window.confirm(c('Xóa toàn bộ nháp, ảnh, thẻ và tiến độ học trên trình duyệt này? Thao tác không thể hoàn tác.', 'Delete all drafts, images, cards and learning progress in this browser? This cannot be undone.'))) void update(current => ({ ...current, drafts: [], cards: [], completed: [] })).catch(() => {}) }}>{c('Xóa dữ liệu học tập trên thiết bị', 'Clear learning data on this device')}</button></div></>
}


export function NotFound() {
  const { c } = useCopy()
  return <Empty title={c('Trang này chưa có ở đây', 'This page is not here')} description={c('Quay lại không gian học tập để tiếp tục.', 'Return to your workspace to continue.')} action={<Link className="button primary" to="/app"><Target size={18} />{c('Về tổng quan', 'Back to overview')}</Link>} />
}
