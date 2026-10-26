import type { ContentPage } from './content.ts'
import { publicLinks } from './routes.ts'
import { site } from './site.ts'

// Ký tự inline có thể biến văn bản thuần thành cấu trúc Markdown (code span,
// nhấn mạnh, link, HTML, bảng). Chúng được escape ở mọi trường văn bản thuần.
const inlineSpecials = /([\\`*_[\]<>|#~])/g

function escapeInline(value: string) {
  return value.replace(inlineSpecials, '\\$1')
}

// Các dấu mở khối CommonMark chưa bị escapeInline xử lý: danh sách có số thứ tự,
// danh sách không đánh số, đường kẻ ngang và gạch ngang setext.
function escapeBlockStart(line: string) {
  return line
    // Danh sách có số thứ tự: "1." hoặc "1)" -> escape dấu phân cách.
    .replace(/^(\s*)(\d{1,9})([.)])(\s|$)/, (_match, indent, digits, delimiter, tail) => `${indent}${digits}\\${delimiter}${tail}`)
    // Danh sách không đánh số: "- " hoặc "+ ".
    .replace(/^(\s*)([-+])(\s|$)/, (_match, indent, marker, tail) => `${indent}\\${marker}${tail}`)
    // Đường kẻ ngang và gạch ngang setext: "---", "- - -", "--".
    .replace(/^(\s*)(-)([\s-]*)$/, (_match, indent, marker, tail) => `${indent}\\${marker}${tail}`)
    // Gạch ngang setext bằng "=".
    .replace(/^(\s*)(=+)([\s=]*)$/, (_match, indent, marker, tail) => `${indent}\\${marker}${tail}`)
}

// Dòng thụt lề từ 4 khoảng trắng (hoặc có tab) sẽ thành khối code thụt lề.
// Markdown không có cú pháp escape cho khoảng trắng, nên khoảng trắng được viết
// bằng entity HTML: dòng đó không còn tạo khối code (dù HTML sẽ gộp khoảng
// trắng khi hiển thị).
function escapeIndentation(line: string) {
  const indentation = /^[ \t]+/.exec(line)?.[0] ?? ''
  if (!indentation || (!indentation.includes('\t') && indentation.length < 4)) return line
  const entities = indentation.replace(/ /g, '&#32;').replace(/\t/g, '&#9;')
  return entities + line.slice(indentation.length)
}

// Nội dung thuần phải "vô hại": một dòng bắt đầu bằng dấu mở khối của CommonMark
// sẽ tạo cấu trúc Markdown thật — danh sách, heading, trích dẫn, khối code,
// đường kẻ ngang, hay định nghĩa link khiến các link khác trỏ sang đích khác.
// Nội dung có thể đến từ nguồn không tin cậy, nên mọi dấu mở khối ở đầu dòng
// đều được escape: văn bản vẫn hiện ra y nguyên nhưng không tạo khối.
export function escapePlainText(value: string) {
  return value
    .split('\n')
    .map(line => escapeIndentation(escapeBlockStart(escapeInline(line))))
    .join('\n')
}

// CommonMark: một code span mở bằng một chuỗi backtick và đóng bằng chuỗi
// backtick dài bằng, nên nội dung bên trong không được chứa chuỗi backtick nào
// dài bằng fence (backtick sẽ kết thúc span sớm). Vì vậy fence phải dài hơn
// chuỗi backtick dài nhất trong nội dung, và nội dung bắt đầu hoặc kết thúc bằng
// backtick cần thêm một khoảng trắng mỗi bên: CommonMark bỏ đúng một khoảng
// trắng ở hai đầu nội dung, nên fence không còn bị nhập nhằng và văn bản vẫn
// hiện ra đúng như cũ.
function codeSpan(value: string) {
  const content = value.replace(/[\u0000-\u001f\u007f]/g, '')
  // CommonMark không có code span rỗng: hai backtick liền nhau bị đọc thành một
  // backtick string chứ không phải code span, nên đường dẫn rỗng dùng fence hai
  // backtick với một khoảng trắng bên trong.
  if (!content) return '`` ``'
  const longestRun = (content.match(/`+/g) ?? []).reduce((longest, run) => Math.max(longest, run.length), 0)
  const fence = '`'.repeat(longestRun + 1)
  // Nội dung chỉ gồm khoảng trắng không được padding: CommonMark chỉ bỏ một
  // khoảng trắng ở hai đầu khi nội dung không chỉ gồm khoảng trắng.
  const needsPadding = content.startsWith('`') || content.endsWith('`')
  return `${fence}${needsPadding ? ` ${content} ` : content}${fence}`
}

export function renderMarkdown(page: ContentPage, lang: 0 | 1 = 1): string {
  const lines: string[] = [`# ${escapePlainText(page.title[lang])}`, '', `> ${escapePlainText(page.summary[lang])}`, '']
  for (const section of page.sections) {
    lines.push(`## ${escapePlainText(section.heading[lang])}`, '')
    for (const paragraph of section.body) lines.push(escapePlainText(paragraph[lang]), '')
    if (section.list) {
      for (const item of section.list) lines.push(`- ${escapePlainText(item[lang])}`)
      lines.push('')
    }
  }
  lines.push('---', '', 'Public pages on this site:', '')
  for (const link of publicLinks) lines.push(`- [${link.label}](${link.href})`)
  lines.push('', `Source: ${site.url}${page.path === '/' ? '/' : page.path}`, '')
  return lines.join('\n')
}

export function renderNotFoundMarkdown(path: string): string {
  return [
    `# 404 — Page not found`,
    '',
    `The path ${codeSpan(path)} does not exist on ${site.name}. The server answered with HTTP 404 because nothing is published at this address, so there is no page to read here.`,
    '',
    'Try one of these instead:',
    '',
    ...publicLinks.map(link => `- [${link.label}](${link.href})`),
    '',
    `The public pages are listed in the sitemap at ${site.url}/sitemap.xml, and ${site.url}/llms.txt is the index for agents.`,
    '',
  ].join('\n')
}
