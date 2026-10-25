import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ClipboardList, Coffee, Heart, Lightbulb, LogOut, Monitor, Moon, PenLine, ShieldCheck, Sparkles, Sun, Target } from 'lucide-react'
import { Brand, LanguageSwitch } from '../components/Layout'
import { Empty, PageHeader } from '../components/ui'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'
import { useTheme } from '../theme'
import { loadDonationSettings, type DonationSettings } from '../lib/donationRepository'

export function Landing() {
  const { c } = useCopy()
  return <div className="landing">
    <a href="#landing-main" className="skip-link">{c('Đến nội dung', 'Skip to content')}</a>
    <header className="landing-nav">
      <Brand />
      <nav aria-label={c('Điều hướng chính', 'Main navigation')}>
        <Link to="/app/prompts">{c('Kho đề bài', 'Prompt library')}</Link>
        <LanguageSwitch />
        <Link className="button outline" to="/app">{c('Vào học ngay', 'Open studio')}<ArrowUpRight size={16} /></Link>
      </nav>
    </header>
    <main id="landing-main">
      <div className="landing-stage">
        <section className="landing-intro">
          <span className="landing-kicker"><span className="small-dot" />{c('KHÔNG GIAN CHO BƯỚC TIẾN MỚI', 'A LITTLE BETTER. EVERY DAY.')}</span>
          <h1>{c('Ý tưởng của bạn.', 'Your ideas.')}<br />{c('Diễn đạt ', 'Beautifully ')}<em>{c('tốt hơn.', 'expressed.')}</em></h1>
          <p>{c('Từ ý tưởng đầu tiên đến bài viết bạn tự hào. Luyện IELTS Writing, khám phá cách viết hay và xây dựng vốn từ của riêng bạn.', 'From your first idea to an essay you are proud of. Practise IELTS Writing, discover great writing and build a vocabulary of your own.')}</p>
          <div className="button-row">
            <Link className="button primary large" to="/app/write">{c('Bắt đầu viết', 'Start writing')}<ArrowRight size={18} /></Link>
            <Link className="button outline large" to="/app/essays/demo">{c('Xem bài mẫu', 'Explore sample feedback')}<ArrowUpRight size={17} /></Link>
          </div>
          <div className="landing-perks"><span><Check size={15} />{c('Miễn phí học tập', 'Free to learn')}</span><span><Check size={15} />Task 1 & Task 2</span><span><Check size={15} />VI / EN</span></div>
          <a className="landing-explore" href="#learning-path">{c('Khám phá cách học', 'Find your learning flow')}<ArrowRight size={16} /></a>
        </section>
        <section className="studio-preview" aria-label={c('Xem trước không gian viết', 'Writing studio preview')}>
          <div className="studio-toolbar"><span><i /><i /><i /></span><span>WRITING STUDIO</span><PenLine size={15} /></div>
          <div className="studio-body">
            <div className="studio-meta"><span>ACADEMIC · TASK 2</span><span>{c('Bài viết minh họa', 'Sample essay')}</span></div>
            <h2>{c('Một trang trắng.', 'A blank page.')}<br /><span>{c('Vô vàn khả năng.', 'Endless possibilities.')}</span></h2>
            <p className="studio-prompt">{c('Giáo dục trực tuyến có thể thay thế lớp học truyền thống?', 'Can online education replace the traditional classroom?')}</p>
            <div className="studio-excerpt" lang="en">Education is no longer confined to the classroom. <mark>As technology continues to evolve,</mark> learners have more opportunities to shape their own journey.</div>
            <div className="studio-insight"><Sparkles size={19} /><div><strong>{c('Mỗi câu viết, một bước tiến.', 'One sentence. One step forward.')}</strong><p>{c('Luyện cách nối ý, chọn từ và diễn đạt rõ ràng hơn.', 'Practise connecting ideas, choosing words and writing with clarity.')}</p></div></div>
            <Link className="button primary full" to="/app/write">{c('Viết câu đầu tiên của bạn', 'Write your first sentence')}<ArrowRight size={17} /></Link>
          </div>
          <div className="studio-bottom"><span><ShieldCheck size={14} />{c('Học theo nhịp của bạn', 'Learn at your own pace')}</span><span>IELTS Writing</span></div>
        </section>
      </div>
      <section className="landing-learning" id="learning-path">
        <div className="landing-section-heading"><span className="eyebrow">{c('TỪNG BƯỚC, MỖI NGÀY', 'BUILD YOUR WRITING RITUAL')}</span><h2>{c('Một nơi. Trọn vẹn hành trình.', 'Your whole journey, in one place.')}</h2><p>{c('Viết, khám phá, ghi nhớ. Chọn bước tiếp theo của bạn.', 'Write, explore, remember. Choose your next step.')}</p></div>
        <div className="landing-features">{[
          { icon: PenLine, path: '/app/write', title: c('Viết với mục đích', 'Write with purpose'), body: c('Luyện biểu đồ, thư và luận. Giữ dòng ý tưởng với nháp tự lưu.', 'Practise charts, letters and essays. Keep your ideas flowing with autosaved drafts.'), action: c('Mở không gian viết', 'Open your writing space') },
          { icon: ClipboardList, path: '/app/prompts', title: c('Chọn đề ngay', 'Pick a prompt'), body: c('Kho đề bài sẵn có đề Task 1 và Task 2 kèm hình ảnh và đề bài đầy đủ.', 'The prompt library holds ready Task 1 and Task 2 questions with charts and full task text.'), action: c('Mở kho đề bài', 'Open the prompt library') },
          { icon: Lightbulb, path: '/app/vocabulary', title: c('Biến từ mới thành vốn riêng', 'Make new words yours'), body: c('Lưu cụm từ, cấu trúc và ôn tập theo lịch để ghi nhớ lâu hơn.', 'Save phrases and structures, then revisit them over time to remember more.'), action: c('Mở sổ từ vựng', 'Build your vocabulary') },
        ].map((item, index) => <Link to={item.path} className="landing-feature" key={item.path}><div className="feature-top"><item.icon size={23} /><span>0{index + 1}</span></div><h3>{item.title}</h3><p>{item.body}</p><span className="feature-action">{item.action}<ArrowUpRight size={17} /></span></Link>)}</div>
      </section>
      <section className="landing-cta"><Heart size={24} /><span className="eyebrow">{c('CÙNG NHAU TIẾN XA', 'ROOM FOR EVERYONE')}</span><h2>{c('Tri thức tốt hơn khi được sẻ chia.', 'Learning is better when it is shared.')}</h2><p>{c('Không gói Premium. Không rào cản học tập. Một không gian để bạn tiến bộ mỗi ngày.', 'No premium tiers. No learning paywalls. A space to grow a little every day.')}</p><Link className="button outline" to="/donate">{c('Ủng hộ dự án', 'Support the project')}<ArrowUpRight size={16} /></Link></section>
    </main>
    <footer className="landing-footer"><Brand /><span>© 2026 IELTS Writing Studio</span><Link to="/app">{c('Bắt đầu học', 'Start learning')}<ArrowUpRight size={16} /></Link></footer>
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
