// Đọc dữ liệu quản trị (PostgREST, RLS private.is_admin()) + các thao tác ghi qua admin-data.

import { supabase } from './supabase'
import { adminAction } from './adminSession'
import { adminUsersList } from './ai'
import type { AdminEssay, AdminPrompt, AdminUserRow } from './adminLogic'

export type { AdminPrompt }

export type AdminProfileRow = { id: string; display_name: string | null; email: string; created_at: string }
export type AdminAccessRow = { user_id: string; role: string; status: string }
export type AdminJobRow = {
  id: string
  operation: string
  status: string
  error_code: string | null
  user_id: string
  created_at: string
}
export type AdminAuditRow = { id: string; actor_id: string | null; action: string; target: string; metadata: Record<string, unknown>; created_at: string }
export type AdminVocabularyTopic = { key: string; number: number; title: string; description: string }
export type AdminVocabularyEntry = {
  id: string
  topic_key: string
  term: string
  pos: string
  meaning: string
  definition: string
  examples: string[]
  ipa: string | null
}

export type DashboardStats = {
  users: { total: number; new7d: number; admins: number; suspended: number }
  essays: { total: number; new7d: number; distinctPrompts: number }
  revisions: { total: number }
  jobs: { queued: number; processing: number; succeeded: number; retry_wait: number; failed: number; cancelled: number }
  usage: { jobs: number; inputTokens: number; outputTokens: number; costUsd: number; costComplete: boolean }
  topUsers: { userId: string; displayName: string; essays: number }[]
  topPrompts: { slug: string; task: string; titleVi: string; titleEn: string; status: string; essays: number }[]
  untouchedPrompts: { slug: string; task: string; titleVi: string; titleEn: string; status: string; essays: number }[]
}

/** Vai trò của chính người đang đăng nhập. */
export async function fetchMyAdminRole(): Promise<'admin' | 'user' | null> {
  const { data: sessionData } = await supabase.auth.getUser()
  const userId = sessionData.user?.id
  if (!userId) return null
  // Admin đọc được cả bảng user_access nên phải lọc theo id của chính mình.
  const { data, error } = await supabase.from('user_access').select('role,status').eq('user_id', userId).maybeSingle()
  if (error || !data) return null
  const role = (data as { role?: string }).role
  return role === 'admin' ? 'admin' : 'user'
}

export type AdminOverview = { users: number; essays: number; queued: number; failed: number }

/** Số liệu nhanh cho thẻ quản trị trên dashboard (đọc bằng RLS admin). */
export async function fetchAdminOverview(): Promise<AdminOverview> {
  const [users, essays, queued, failed] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('essays').select('id', { count: 'exact', head: true }),
    supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).in('status', ['queued', 'processing']),
    supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
  ])
  return {
    users: users.count ?? 0,
    essays: essays.count ?? 0,
    queued: queued.count ?? 0,
    failed: failed.count ?? 0,
  }
}

/**
 * Danh sách user quản trị, đọc qua Edge Function `admin-users` vì email nằm
 * trong auth.users (PostgREST không trả được). Hàm trả về hai mảng cùng
 * nội dung như trước để call-site không phải đổi; lỗi thì trả mảng rỗng.
 */
export async function fetchAdminUsers(): Promise<{ profiles: AdminProfileRow[]; access: AdminAccessRow[] }> {
  const result = await adminUsersList()
  if (!result.ok) return { profiles: [], access: [] }
  const rows: AdminUserRow[] = result.value ?? []
  return {
    profiles: rows.map(row => ({ id: row.user_id, display_name: row.display_name || null, email: row.email ?? '', created_at: row.created_at ?? '' })),
    access: rows.map(row => ({ user_id: row.user_id, role: row.role, status: row.status })),
  }
}

export async function fetchUserEssays(userId: string): Promise<AdminEssay[]> {
  const { data } = await supabase
    .from('essays')
    .select('id,prompt_text,task_type,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500)
  return (data ?? []) as AdminEssay[]
}

export async function fetchUserCards(userId: string): Promise<{ term: string; kind: string; created_at: string }[]> {
  const { data } = await supabase
    .from('study_cards')
    .select('front,kind,created_at')
    .eq('user_id', userId)
    .limit(500)
  return ((data ?? []) as { front: string; kind: string; created_at: string }[]).map(row => ({ term: row.front, kind: row.kind, created_at: row.created_at }))
}

export async function fetchUserErrorLogs(userId: string): Promise<{ criterion: string; quote: string; correction: string; created_at: string }[]> {
  const { data } = await supabase
    .from('error_logs')
    .select('criterion,quote,correction,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as { criterion: string; quote: string; correction: string; created_at: string }[]
}

export async function fetchPrompts(): Promise<AdminPrompt[]> {
  const { data } = await supabase.from('prompts').select('slug,task,text,title_vi,title_en,status').limit(2000)
  return ((data ?? []) as { slug: string; task: string; text: string; title_vi: string; title_en: string; status: string }[])
    .map(row => ({ slug: row.slug, task: row.task, text: row.text, titleVi: row.title_vi, titleEn: row.title_en, status: row.status }))
}

export async function fetchJobs(): Promise<AdminJobRow[]> {
  const { data } = await supabase
    .from('ai_jobs')
    .select('id,operation,status,error_code,user_id,created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  return (data ?? []) as AdminJobRow[]
}

export async function fetchAuditLogs(): Promise<AdminAuditRow[]> {
  const { data } = await supabase
    .from('admin_audit_logs')
    .select('id,actor_id,action,target,metadata,created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  return (data ?? []) as AdminAuditRow[]
}

export async function fetchVocabularyTopics(): Promise<AdminVocabularyTopic[]> {
  const { data } = await supabase.from('vocabulary_topics').select('key,number,title,description').order('number', { ascending: true })
  return (data ?? []) as AdminVocabularyTopic[]
}

export async function fetchVocabularyEntries(topicKey: string): Promise<AdminVocabularyEntry[]> {
  const { data } = await supabase
    .from('vocabulary_entries')
    .select('id,topic_key,term,pos,meaning,definition,examples,ipa')
    .eq('topic_key', topicKey)
    .order('sort_order', { ascending: true })
    .limit(500)
  return (data ?? []) as AdminVocabularyEntry[]
}

/** Thao tác ghi qua Edge Function (có token + audit log). */
export function fetchDashboard() {
  return adminAction<DashboardStats>('dashboard')
}

export function deleteEssay(essayId: string) {
  return adminAction<{ deleted: boolean }>('delete_essay', { essayId })
}

export function setPromptStatus(slug: string, status: 'published' | 'hidden') {
  return adminAction<{ slug: string; status: string }>('prompt_set_status', { slug, status })
}

export function updateVocabularyEntry(payload: { id: string; meaning?: string; definition?: string; ipa?: string }) {
  return adminAction<AdminVocabularyEntry>('vocabulary_update', payload)
}

export function deleteVocabularyEntry(id: string) {
  return adminAction<{ deleted: boolean }>('vocabulary_delete', { id })
}

export function createVocabularyEntry(payload: { topicKey: string; term: string; pos?: string; meaning?: string; definition?: string; examples?: string[]; ipa?: string }) {
  return adminAction<{ id: string; term: string }>('vocabulary_create', payload)
}

export function retryJob(jobId: string) {
  return adminAction<{ jobId: string; status: string }>('job_retry', { jobId })
}

export function retryFailedJobs() {
  return adminAction<{ retried: number }>('jobs_retry_failed')
}
