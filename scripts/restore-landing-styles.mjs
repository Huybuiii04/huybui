/**
 * Thay khối style landing cũ (hero 1 cột) bằng style landing mới
 * (hero 2 cột + khung xem trước không gian viết) — khớp với JSX ở Other.tsx.
 *
 * Chạy: node scripts/restore-landing-styles.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/styles.css', import.meta.url)
const lines = readFileSync(path, 'utf8').split('\n')

const startMarker = '.landing { min-height: 100vh; }'
const endMarker = '.landing-footer > span, .landing-footer > a:last-child'

const start = lines.findIndex(line => line.trim() === startMarker)
let end = -1
for (let i = start + 1; i < lines.length; i += 1) {
  if (lines[i].trim().startsWith(endMarker)) { end = i; break }
}
if (start < 0 || end < 0) {
  console.error(`không tìm thấy khối landing (start=${start}, end=${end})`)
  process.exit(1)
}

const replacement = `.landing { min-height: 100vh; }
.landing-nav { max-width: 1280px; margin: auto; display: flex; justify-content: space-between; align-items: center; padding: 26px 36px; }
.landing-nav > nav { display: flex; align-items: center; gap: 30px; font-size: 13.5px; color: var(--text-muted); }

/* ---------- Hero hai cột ---------- */
.landing-stage { max-width: 1280px; margin: auto; padding: 56px 36px 40px; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: 64px; align-items: center; }
.landing-kicker { display: inline-flex; align-items: center; gap: 9px; font-size: 10.5px; letter-spacing: .16em; color: var(--text-subtle); text-transform: uppercase; }
.landing-kicker .small-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand); }
.landing-intro h1 { font-size: clamp(38px, 5vw, 64px); line-height: 1.12; letter-spacing: -.045em; margin: 22px 0 0; }
.landing-intro h1 em { font-style: normal; background: linear-gradient(100deg, var(--brand), #7dd3fc 52%, var(--accent)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.landing-intro > p { max-width: 560px; margin: 22px 0 30px; color: var(--text-muted); font-size: 16px; line-height: 1.7; }
.landing-intro .button-row { justify-content: flex-start; }
.landing-perks { display: flex; align-items: center; gap: 22px; margin-top: 26px; color: var(--text-subtle); font-size: 12.5px; flex-wrap: wrap; }
.landing-perks > span { display: flex; align-items: center; gap: 6px; }
.landing-perks > span > svg { color: var(--brand); }
.landing-explore { margin-top: 30px; display: inline-flex; align-items: center; gap: 8px; color: var(--text-subtle); font-size: 12.5px; text-decoration: none; border-bottom: 1px solid var(--border-strong); padding-bottom: 3px; transition: color .2s, border-color .2s; }
.landing-explore:hover { color: var(--brand-ink); border-color: var(--brand); }

/* ---------- Khung xem trước không gian viết ---------- */
.studio-preview { border: 1px solid var(--border); border-radius: 22px; background: var(--surface); backdrop-filter: var(--glass); -webkit-backdrop-filter: var(--glass); box-shadow: var(--shadow-lg); overflow: hidden; }
.studio-toolbar { display: flex; align-items: center; gap: 12px; padding: 13px 18px; background: var(--surface-soft); border-bottom: 1px solid var(--border); font-size: 9.5px; letter-spacing: .16em; color: var(--text-subtle); }
.studio-toolbar > span:first-child { display: flex; gap: 6px; }
.studio-toolbar i { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); }
.studio-toolbar > span:nth-child(2) { margin: 0 auto; }
.studio-body { padding: 26px 28px 28px; }
.studio-meta { display: flex; justify-content: space-between; gap: 12px; font-size: 10px; letter-spacing: .14em; color: var(--text-subtle); }
.studio-body h2 { font-size: 27px; line-height: 1.22; letter-spacing: -.035em; margin: 18px 0 14px; }
.studio-body h2 > span { color: var(--text-muted); }
.studio-prompt { font-size: 13px; color: var(--text-muted); font-style: italic; margin-bottom: 14px; }
.studio-excerpt { font-size: 13.5px; line-height: 1.8; color: var(--text); border-left: 2px solid var(--brand); padding-left: 16px; }
.studio-excerpt mark { background: var(--brand-soft); color: var(--brand-ink); padding: 2px 5px; border-radius: 4px; }
.studio-insight { display: flex; gap: 13px; align-items: flex-start; margin: 22px 0; padding: 15px 16px; border-radius: var(--radius); background: var(--surface-soft); border: 1px solid var(--border); }
.studio-insight > svg { color: var(--brand); flex-shrink: 0; margin-top: 2px; }
.studio-insight strong { font-size: 13.5px; display: block; }
.studio-insight p { font-size: 12.5px; color: var(--text-muted); margin-top: 4px; }
.studio-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px; border-top: 1px solid var(--border); background: var(--surface-soft); font-size: 11.5px; color: var(--text-subtle); }
.studio-bottom > span { display: flex; align-items: center; gap: 6px; }

/* ---------- Khu học theo lộ trình ---------- */
.landing-learning { max-width: 1280px; margin: auto; padding: 40px 36px 20px; }
.landing-section-heading { max-width: 620px; margin-bottom: 30px; }
.landing-section-heading h2 { font-size: clamp(24px, 3vw, 34px); letter-spacing: -.03em; margin: 12px 0 10px; }
.landing-section-heading p { color: var(--text-muted); font-size: 14.5px; }
.landing-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.landing-feature { display: flex; flex-direction: column; padding: 26px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); backdrop-filter: var(--glass); -webkit-backdrop-filter: var(--glass); text-decoration: none; transition: border-color .2s, transform .2s, box-shadow .2s; }
.landing-feature:hover { border-color: var(--border-strong); transform: translateY(-3px); box-shadow: var(--shadow-md); }
.feature-top { display: flex; align-items: center; justify-content: space-between; color: var(--brand); }
.feature-top > span { font-size: 11px; letter-spacing: .12em; color: var(--text-subtle); }
.landing-feature h3 { font-size: 19px; margin: 18px 0 9px; }
.landing-feature p { font-size: 13.5px; color: var(--text-muted); flex: 1; }
.feature-action { display: inline-flex; align-items: center; gap: 7px; margin-top: 18px; font-size: 12.5px; color: var(--brand-ink); font-weight: 600; }

.landing-cta { text-align: center; padding: 66px 25px; border-radius: 40px 40px 0 0; background: linear-gradient(140deg, var(--brand-soft), transparent); }
.landing-cta > svg { color: var(--brand); margin: 0 auto 22px; }
.landing-cta h2 { font-size: 29px; }
.landing-cta p { max-width: 580px; margin: 18px auto 26px; font-size: 14px; color: var(--text-muted); }
.landing-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 32px; max-width: 1240px; margin: auto; }
.landing-footer > span, .landing-footer > a:last-child { color: var(--text-subtle); font-size: 12.5px; display: flex; align-items: center; gap: 7px; }`

const kept = [...lines.slice(0, start), ...replacement.split('\n'), ...lines.slice(end + 1)]
writeFileSync(path, kept.join('\n'), 'utf8')
console.log(`đã thay style landing: dòng ${start + 1}–${end + 1} → ${replacement.split('\n').length} dòng`)
