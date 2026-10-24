/**
 * Trích ảnh từ file .docx và đặt tên chuẩn theo từng đề.
 *
 *   node supabase/seed/extract-task1-images.mjs
 *
 * Nguồn ảnh: debai/task1/IELTS_Task1_7_Types_70_Illustrated_Prompts.docx (word/media)
 * Đích:      debai/task1/images/<tên trong trường `image` của JSON>
 *
 * Thứ tự ảnh trong docx khớp với thứ tự mảng `prompts` trong JSON
 * (đã kiểm chứng: image1 = W1-001 Cambridge 15 Test 2, image11 = W1-011 Cambridge 15 Test 1).
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

const root = process.cwd()
const jsonPath = join(root, 'debai', 'task1', 'IELTS_Task1_7_Types_70_Prompts.json')
const docxPath = join(root, 'debai', 'task1', 'IELTS_Task1_7_Types_70_Illustrated_Prompts.docx')
const outDir = join(root, 'debai', 'task1', 'images')

const { prompts } = JSON.parse(readFileSync(jsonPath, 'utf8'))
if (!existsSync(docxPath)) {
  console.error('Không tìm thấy file docx nguồn:', docxPath)
  process.exit(1)
}

const temp = mkdtempSync(join(tmpdir(), 'task1-'))
execFileSync('tar', ['-xf', docxPath, '-C', temp])
const mediaDir = join(temp, 'word', 'media')
mkdirSync(outDir, { recursive: true })

let copied = 0
for (const [index, prompt] of prompts.entries()) {
  const source = join(mediaDir, `image${index + 1}.png`)
  if (!existsSync(source)) {
    console.error(`Thiếu ảnh cho ${prompt.id} (image${index + 1}.png)`)
    process.exit(1)
  }
  const target = join(outDir, prompt.image.replace('/', '__'))
  copyFileSync(source, target)
  copied += 1
}

rmSync(temp, { recursive: true, force: true })
console.log(`Đã trích ${copied} ảnh vào ${outDir}`)
console.log('Tên file: <thư mục>__<tên file> — ví dụ task1_visuals__01_01.png')
void dirname
