// Quản lý nội dung Reading trong trang Quản trị.
//
// Client dùng publishable key + JWT của admin. Bảng `skill_tests` không cấp quyền
// ghi cho client, nên mọi thay đổi đi qua Edge Function `admin-skills` (service role).

import { supabase } from './supabase'

export type AdminSkillTest = {
  id: string
  skill: 'reading' | 'listening'
  slug: string
  series: string
  title: string
  status: 'draft' | 'published' | 'hidden'
  questionCount: number
  sections: { id: string; sectionNo: number; title: string }[]
}

type TestRow = { id: string; skill: string; slug: string; series: string | null; title: string; status: string; question_count: number | null }
type SectionRow = { id: string; test_id: string; section_no: number; title: string | null }

/** Đọc toàn bộ đề (kể cả draft) cho trang quản trị. */
export async function loadAdminSkillTests(): Promise<AdminSkillTest[]> {
  const { data: tests, error } = await supabase
    .from('skill_tests')
    .select('id,skill,slug,series,title,status,question_count')
    .order('skill')
    .order('sort_order')
  if (error || !tests?.length) return []

  const { data: sections } = await supabase
    .from('skill_sections')
    .select('id,test_id,section_no,title')
    .order('section_no')
  const rows = (sections ?? []) as SectionRow[]
  const byTest = new Map<string, SectionRow[]>()
  for (const section of rows) {
    const list = byTest.get(section.test_id) ?? []
    list.push(section)
    byTest.set(section.test_id, list)
  }

  return (tests as TestRow[]).map(test => ({
    id: test.id,
    skill: test.skill as 'reading' | 'listening',
    slug: test.slug,
    series: test.series ?? '',
    title: test.title,
    status: test.status as 'draft' | 'published' | 'hidden',
    questionCount: test.question_count ?? 0,
    sections: (byTest.get(test.id) ?? []).map(section => ({
      id: section.id,
      sectionNo: section.section_no,
      title: section.title ?? '',
    })),
  }))
}

/** Đổi trạng thái hiển thị của một đề. */
export async function setSkillTestStatus(testId: string, status: 'draft' | 'published' | 'hidden'): Promise<boolean> {
  const { error } = await supabase.functions.invoke('admin-skills', {
    body: { action: 'set-status', testId, status },
  })
  return !error
}
