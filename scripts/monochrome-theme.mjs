/**
 * Chuyển giao diện sang đen–trắng tối giản:
 *   - nền #080808, thẻ #111111, viền #272727
 *   - chữ #ededed / #b0b0b0 / #949494
 *   - nút chính nền trắng chữ đen; nút phụ trong suốt viền xám
 *   - bỏ gradient xanh–tím, ánh sáng màu, nền sao
 *
 * Chạy: node scripts/monochrome-theme.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/styles.css', import.meta.url)
let css = readFileSync(path, 'utf8')

/** [mẫu cũ, mẫu mới] — thay đúng một lần, báo lại nếu không khớp. */
const swaps = [
  // Nút
  ['.button.primary { background: linear-gradient(135deg, #0f766e, #0d9488 52%, #14b8a6); color: #fff; box-shadow: var(--shadow-brand); }',
   '.button.primary { background: #ededed; color: #0a0a0a; border-color: transparent; box-shadow: none; }'],
  ['.button.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(13, 148, 136, .38); }',
   '.button.primary:hover:not(:disabled) { transform: translateY(-1px); background: #ffffff; }'],
  ['.button.outline { background: var(--surface-strong); border-color: var(--border-strong); color: var(--text); box-shadow: var(--shadow-sm); }',
   '.button.outline { background: transparent; border-color: var(--border-strong); color: var(--text); box-shadow: none; }'],
  ['.button.outline:hover:not(:disabled) { border-color: var(--brand); color: var(--brand-ink); transform: translateY(-1px); }',
   '.button.outline:hover:not(:disabled) { border-color: var(--text-muted); color: var(--text); transform: translateY(-1px); }'],
  ['.button.white { background: #fff; color: #10473f; box-shadow: 0 12px 30px rgba(3, 40, 34, .28); }',
   '.button.white { background: #ffffff; color: #0a0a0a; box-shadow: none; }'],

  // Thương hiệu
  ['.brand-mark { width: 40px; height: 42px; background: linear-gradient(140deg, #14b8a6, #0f766e 60%, #115e59); border-radius: 12px; color: #fff; display: grid; place-items: center; box-shadow: var(--shadow-brand); }',
   '.brand-mark { width: 40px; height: 42px; background: #ededed; border-radius: 12px; color: #0a0a0a; display: grid; place-items: center; }'],
  [".brand-sub { display: block; font-family: 'Work Sans', sans-serif; font-size: 7.5px; letter-spacing: .17em; color: var(--text-subtle); margin-top: 6px; font-weight: 600; }",
   ".brand-sub { display: block; font-family: var(--font-display); font-size: 7.5px; letter-spacing: .17em; color: var(--text-subtle); margin-top: 6px; font-weight: 600; }"],
  ['.brand-dot { width: 7px; height: 7px; background: linear-gradient(140deg, #fbbf24, #d97706); border-radius: 50%; margin: -13px 0 0 -5px; box-shadow: 0 0 0 3px rgba(217, 119, 6, .18); }',
   '.brand-dot { width: 7px; height: 7px; background: var(--text-muted); border-radius: 50%; margin: -13px 0 0 -5px; }'],
  ['.avatar { width: 38px; height: 38px; border-radius: 999px; background: linear-gradient(140deg, #14b8a6, #0f766e); color: #fff; font-size: 14px; font-weight: 700; display: grid; place-items: center; box-shadow: var(--shadow-brand); }',
   '.avatar { width: 38px; height: 38px; border-radius: 999px; background: #262626; color: #ededed; font-size: 14px; font-weight: 700; display: grid; place-items: center; border: 1px solid var(--border); }'],
  ['.nav-item.active::before { content: \'\'; position: absolute; left: -20px; top: 12px; bottom: 12px; width: 4px; border-radius: 0 4px 4px 0; background: linear-gradient(180deg, #2dd4bf, #0f766e); }',
   ".nav-item.active::before { content: ''; position: absolute; left: -20px; top: 12px; bottom: 12px; width: 3px; border-radius: 0 3px 3px 0; background: var(--text-muted); }"],

  // Hero tổng quan
  ['.hero-copy h2 > span { background: linear-gradient(100deg, #a7f3d0, #fcd34d 92%); -webkit-background-clip: text; background-clip: text; color: transparent; }',
   '.hero-copy h2 > span { color: var(--text-muted); }'],
  ['.writing-paper { width: 232px; height: 262px; background: linear-gradient(160deg, #fbf9ee, #f1efdd); box-shadow: 0 26px 60px rgba(4, 32, 27, .42); border-radius: 8px; position: absolute; top: 38px; left: 20%; transform: rotate(8deg); padding: 22px; z-index: 2; }',
   '.writing-paper { width: 232px; height: 262px; background: var(--surface-strong); border: 1px solid var(--border); box-shadow: var(--shadow-lg); border-radius: 8px; position: absolute; top: 38px; left: 20%; transform: rotate(8deg); padding: 22px; z-index: 2; }'],
  ['.floating-tag { position: absolute; z-index: 3; left: 0; bottom: 38px; transform: rotate(-6deg); color: #0c4a41; background: linear-gradient(135deg, #a7f3d0, #d9f99d); padding: 11px 14px; border-radius: 10px; display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; box-shadow: 0 10px 26px rgba(4, 40, 34, .3); }',
   '.floating-tag { position: absolute; z-index: 3; left: 0; bottom: 38px; transform: rotate(-6deg); color: var(--text); background: var(--surface-strong); border: 1px solid var(--border); padding: 11px 14px; border-radius: 10px; display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; }'],
  ['.floating-leaf { position: absolute; right: 4px; top: 42px; border-radius: 13px; width: 46px; height: 46px; display: grid; place-items: center; background: linear-gradient(140deg, #34d399, #0f766e); color: #eafaf3; transform: rotate(12deg); z-index: 4; box-shadow: 0 10px 24px rgba(4, 40, 34, .32); }',
   '.floating-leaf { position: absolute; right: 4px; top: 42px; border-radius: 13px; width: 46px; height: 46px; display: grid; place-items: center; background: #1f1f1f; border: 1px solid var(--border); color: var(--text-muted); transform: rotate(12deg); z-index: 4; }'],

  // Điểm chấm
  ['.overall-score { border-radius: var(--radius-lg); padding: 30px; min-width: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(24rem 18rem at 30% 20%, rgba(45, 212, 191, .4), transparent 65%), linear-gradient(140deg, #0b3f36, #0d7f74); color: #fff; box-shadow: var(--shadow-lg); }',
   '.overall-score { border-radius: var(--radius-lg); padding: 30px; min-width: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #111111; border: 1px solid var(--border); color: var(--text); box-shadow: none; }'],
  ['.score-bar span { display: block; width: 78%; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #2dd4bf, #0f766e); }',
   '.score-bar span { display: block; width: 78%; height: 100%; border-radius: 999px; background: var(--text-muted); }'],
  ['progress::-webkit-progress-value { background: linear-gradient(90deg, #2dd4bf, #0f766e); border-radius: 999px; }',
   'progress::-webkit-progress-value { background: var(--text-muted); border-radius: 999px; }'],

  // Kho đề bài
  ['.prompt-task-switch button.active { background: linear-gradient(135deg, #0f766e, #14b8a6); color: #fff; border-color: transparent; box-shadow: var(--shadow-brand); }',
   '.prompt-task-switch button.active { background: #ededed; color: #0a0a0a; border-color: transparent; box-shadow: none; }'],
  ['.prompt-hero-icon { position: absolute; right: 74px; top: 56px; width: 92px; height: 92px; border-radius: 26px; display: grid; place-items: center; background: linear-gradient(140deg, rgba(167, 243, 208, .95), rgba(45, 212, 191, .8)); color: #0b3f36; transform: rotate(8deg); box-shadow: 0 20px 40px rgba(4, 40, 34, .35); }',
   '.prompt-hero-icon { position: absolute; right: 74px; top: 56px; width: 92px; height: 92px; border-radius: 26px; display: grid; place-items: center; background: #262626; border: 1px solid var(--border); color: #ededed; transform: rotate(8deg); }'],
  ['.prompt-hero-chip { position: absolute; right: 22px; bottom: 44px; font-size: 11px; font-weight: 700; letter-spacing: .14em; color: #0c4a41; background: linear-gradient(135deg, #fcd34d, #fbbf24); padding: 9px 15px; border-radius: 999px; transform: rotate(-5deg); }',
   '.prompt-hero-chip { position: absolute; right: 22px; bottom: 44px; font-size: 11px; font-weight: 700; letter-spacing: .14em; color: #0a0a0a; background: #ededed; padding: 9px 15px; border-radius: 999px; transform: rotate(-5deg); }'],

  // Thẻ minh hoạ
  ['.art-0 { background: linear-gradient(140deg, rgba(45, 212, 191, .26), rgba(16, 185, 129, .14)); color: #0f766e; }',
   '.art-0 { background: #1a1a1a; color: var(--text-muted); }'],
  ['.art-1 { background: linear-gradient(140deg, rgba(251, 191, 36, .3), rgba(249, 115, 22, .14)); color: #b45309; }',
   '.art-1 { background: #1a1a1a; color: var(--text-muted); }'],
  ['.art-2 { background: linear-gradient(140deg, rgba(99, 102, 241, .24), rgba(56, 189, 248, .14)); color: #4f46e5; }',
   '.art-2 { background: #1a1a1a; color: var(--text-muted); }'],

  // Trang chủ: tiêu đề không gradient
  ['.landing-intro h1 em { font-style: normal; background: linear-gradient(100deg, var(--brand), #7dd3fc 52%, var(--accent)); -webkit-background-clip: text; background-clip: text; color: transparent; }',
   '.landing-intro h1 em { font-style: normal; color: var(--text-muted); }'],
  ['.studio-excerpt mark { background: var(--brand-soft); color: var(--brand-ink); padding: 2px 5px; border-radius: 4px; }',
   '.studio-excerpt mark { background: #262626; color: #ededed; padding: 2px 5px; border-radius: 4px; }'],
]

let missed = 0
for (const [from, to] of swaps) {
  if (!css.includes(from)) { console.log(`KHÔNG KHỚP: ${from.slice(0, 78)}…`); missed += 1; continue }
  css = css.replace(from, to)
}

// Hero tổng quan: nền đơn sắc thay vì gradient xanh–tím.
css = css.replace(
  /(\.dashboard-hero \{[^}]*?)background:\s*radial-gradient\(38rem 26rem at 88% 12%, rgba\(45, 212, 191, \.38\), transparent 62%\),\s*radial-gradient\(32rem 24rem at 72% 92%, rgba\(251, 191, 36, \.26\), transparent 60%\),\s*linear-gradient\(135deg, #0b3f36 0%, #10564a 42%, #0d7f74 100%\);/,
  '$1background: #111111; border: 1px solid var(--border);',
)
css = css.replace(
  /\[data-theme='dark'\] \.dashboard-hero \{ background: [^}]+\}/,
  "[data-theme='dark'] .dashboard-hero { background: #111111; border: 1px solid var(--border); }",
)
css = css.replace(
  /\.prompt-hero \{ position: relative; overflow: hidden; border-radius: 26px; padding: 34px 38px; color: #fff; margin-bottom: 22px; background: [^;]+; box-shadow: var\(--shadow-lg\); \}/,
  '.prompt-hero { position: relative; overflow: hidden; border-radius: 26px; padding: 34px 38px; color: var(--text); margin-bottom: 22px; background: #111111; border: 1px solid var(--border); box-shadow: none; }',
)
css = css.replace(
  /\.prompt-custom-card \{ display: flex; flex-direction: column; text-align: left; padding: 24px; border-radius: var\(--radius-lg\); color: #fff; background: [^;]+; box-shadow: var\(--shadow-lg\); border: none; \}/,
  '.prompt-custom-card { display: flex; flex-direction: column; text-align: left; padding: 24px; border-radius: var(--radius-lg); color: var(--text); background: #111111; box-shadow: none; border: 1px solid var(--border); }',
)
css = css.replace(
  /\.support-card \{ background: linear-gradient\(150deg, var\(--accent-soft\), var\(--surface-soft\)\);/,
  '.support-card { background: var(--surface-soft);',
)
css = css.replace(
  /\.daily-card \{ background: linear-gradient\(155deg, var\(--surface-strong\), var\(--surface\)\);/,
  '.daily-card { background: var(--surface);',
)
css = css.replace(
  /\.writing-tip \{ background: linear-gradient\(140deg, var\(--brand-soft\), transparent\);/,
  '.writing-tip { background: var(--surface-soft);',
)
css = css.replace(
  /\.demo-callout \{ display: flex; gap: 18px; align-items: center; background: linear-gradient\(140deg, var\(--brand-soft\), transparent\);/,
  '.demo-callout { display: flex; gap: 18px; align-items: center; background: var(--surface-soft);',
)
css = css.replace(
  /\.prompt-banner-inline \{ margin: 12px 26px 4px; padding: 14px 16px; border-radius: var\(--radius\); background: linear-gradient\(135deg, var\(--brand-soft\), transparent\);/,
  '.prompt-banner-inline { margin: 12px 26px 4px; padding: 14px 16px; border-radius: var(--radius); background: var(--surface-soft);',
)
css = css.replace(
  /\.review-banner \{ display: flex; align-items: center; gap: 22px; border-radius: var\(--radius-lg\); border: 1px solid var\(--border\); background: linear-gradient\(140deg, var\(--brand-soft\), transparent\);/,
  '.review-banner { display: flex; align-items: center; gap: 22px; border-radius: var(--radius-lg); border: 1px solid var(--border); background: var(--surface-soft);',
)
css = css.replace(
  /\.landing-cta \{ text-align: center; padding: 66px 25px; border-radius: 40px 40px 0 0; background: linear-gradient\(140deg, var\(--brand-soft\), transparent\); \}/,
  '.landing-cta { text-align: center; padding: 66px 25px; border-radius: 40px 40px 0 0; background: var(--surface-soft); }',
)

writeFileSync(path, css, 'utf8')
console.log(missed ? `xong, ${missed} mẫu không khớp` : 'xong, toàn bộ mẫu đã đổi')
