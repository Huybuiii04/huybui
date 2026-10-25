/**
 * Xoá các khối style không còn dùng sau khi bỏ phần Explore:
 * Library & Guide, Tools. Mỗi khối là một nhóm rule liên tiếp.
 *
 * Script an toàn: chỉ xoá rule BẰNG ĐẦY ĐỦ (mở ngoặc + đóng ngoặc),
 * không đụng vào rule nhiều dòng.
 *
 * Chạy: node scripts/prune-explore-styles.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/styles.css', import.meta.url)
const lines = readFileSync(path, 'utf8').split('\n')

/** Selector của rule (phần trước dấu `{`). */
function selectorOf(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('.')) return ''
  return trimmed.split('{')[0].trim()
}

/** Rule có dùng selector nào trong danh sách không. */
const prefixes = [
  'guide-promo', 'guide-mini-icon', 'guide-grid', 'guide-card', 'guide-progress-panel',
  'guide-toc', 'personal-guide', 'master-hero', 'master-layout', 'chapter-',
  'reading-layout', 'reading-article', 'reading-action', 'library-banner',
  'library-grid', 'resource-card', 'tool-grid', 'tool-card', 'tool-workspace',
  'back-link', 'article-footer', 'source-note', 'prompt-library-callout',
]

const drop = new Set()
let i = 0
while (i < lines.length) {
  const line = lines[i]
  const selector = selectorOf(line)
  const mentions = selector
    ? selector.split(',').some(part => {
        const name = part.trim().split(/[\s{]/)[0]
        return prefixes.some(prefix => name.startsWith(`.${prefix}`))
      })
    : false
  if (!mentions) { i += 1; continue }

  // Rule một dòng: `.x { ... }`
  if (line.trim().endsWith('}') && line.includes('{')) {
    drop.add(i)
    i += 1
    continue
  }
  // Rule nhiều dòng: xoá tới dấu `}` đóng cùng cấp.
  let depth = 0
  let j = i
  for (; j < lines.length; j += 1) {
    depth += (lines[j].match(/\{/g) ?? []).length
    depth -= (lines[j].match(/\}/g) ?? []).length
    drop.add(j)
    if (depth <= 0 && j > i) break
  }
  i = j + 1
}

const kept = lines.filter((_, index) => !drop.has(index))
writeFileSync(path, kept.join('\n'), 'utf8')
console.log(`đã xoá ${drop.size} dòng style, còn ${kept.length} dòng`)
