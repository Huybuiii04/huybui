// Logic thuần cho bảng quản trị: gom đề đã làm, tính đề còn lại, độ phủ.

export type AdminPrompt = {
  slug: string
  task: string
  text?: string
  titleVi?: string
  titleEn?: string
  status?: string
}

export type AdminEssay = {
  id: string
  prompt_text: string
  task_type: string
  created_at: string
}

export type DonePrompt = {
  slug: string
  task: string
  text: string
  count: number
  lastAt: string
  essays: AdminEssay[]
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Gom bài viết theo đề (khớp `prompt_text` với `prompts.text`). */
export function groupDonePrompts(essays: AdminEssay[], prompts: AdminPrompt[]): DonePrompt[] {
  const byText = new Map(prompts.map(prompt => [normalize(prompt.text ?? ''), prompt]))
  const groups = new Map<string, DonePrompt>()
  for (const essay of essays) {
    const key = normalize(essay.prompt_text ?? '')
    if (!key) continue
    const prompt = byText.get(key)
    const slug = prompt?.slug ?? `custom:${key.slice(0, 40)}`
    const existing = groups.get(slug)
    if (existing) {
      existing.count += 1
      existing.essays.push(essay)
      if (essay.created_at > existing.lastAt) existing.lastAt = essay.created_at
    } else {
      groups.set(slug, {
        slug,
        task: prompt?.task ?? essay.task_type,
        text: essay.prompt_text,
        count: 1,
        lastAt: essay.created_at,
        essays: [essay],
      })
    }
  }
  return [...groups.values()].sort((left, right) => right.count - left.count || (right.lastAt > left.lastAt ? 1 : -1))
}

/** Các đề published của một loại bài mà user chưa làm. */
export function remainingPrompts(essays: AdminEssay[], prompts: AdminPrompt[], task: string): AdminPrompt[] {
  const done = new Set(essays.filter(essay => essay.task_type === task).map(essay => normalize(essay.prompt_text ?? '')))
  return prompts.filter(prompt => prompt.task === task && prompt.status !== 'hidden' && !done.has(normalize(prompt.text ?? '')))
}

/** Phần trăm đề của một loại bài mà user đã làm. */
export function coveragePercent(essays: AdminEssay[], prompts: AdminPrompt[], task: string): number {
  const total = prompts.filter(prompt => prompt.task === task && prompt.status !== 'hidden').length
  if (!total) return 0
  const done = remainingPrompts(essays, prompts, task).length
  return Math.round(((total - done) / total) * 100)
}

/** Cắt chuỗi dài để hiển thị. */
export function shortPrompt(text: string, max = 80): string {
  const clean = (text ?? '').trim().replace(/\s+/g, ' ')
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

/** Nhãn của một đề: tiêu đề theo ngôn ngữ, thiếu thì dùng slug. */
export function promptLabel(prompt: AdminPrompt, language: 'vi' | 'en'): string {
  const title = language === 'en' ? prompt.titleEn : prompt.titleVi
  return title?.trim() || prompt.slug
}

/** Một dòng trong danh sách user của bảng quản trị (đã có email). */
export type AdminUserRow = {
  user_id: string
  email: string
  display_name: string
  role: string
  status: string
  created_at?: string
}

/** Lọc danh sách user theo tên hiển thị, email hoặc id. */
export function filterAdminUsers(rows: AdminUserRow[], query: string): AdminUserRow[] {
  const needle = (query ?? '').trim().toLowerCase()
  if (!needle) return rows
  return rows.filter(row => [row.display_name, row.email, row.user_id].some(field => (field ?? '').toLowerCase().includes(needle)))
}

/** Chỉ xoá được tài khoản user thường: không tự xoá và không xoá admin. */
export function canDeleteUser(input: { role: string; isSelf: boolean }): boolean {
  return input.role !== 'admin' && !input.isSelf
}

/** So khớp email xác nhận: bỏ khoảng trắng thừa, không phân biệt hoa thường. */
export function deleteConfirmationMatches(input: string, email: string): boolean {
  const left = (input ?? '').trim().toLowerCase()
  const right = (email ?? '').trim().toLowerCase()
  return left.length > 0 && left === right
}
