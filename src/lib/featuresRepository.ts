import { supabase } from './supabase'
import { errorLogsFromRows, featuresFromRow, type ErrorLogEntry, type EssayFeatures } from './aiLogic.ts'

/** Revision mới nhất của một bài viết — dùng chung với `fetchLatestGrading`. */
export async function fetchLatestRevisionId(essayId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('essay_revisions')
    .select('id')
    .eq('essay_id', essayId)
    .order('revision_no', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return (data as { id: string }).id
}

/** Phản hồi sâu (cấu trúc, từ vựng, điểm chưa hợp lý, lộ trình) của một revision. */
export async function fetchEssayFeatures(revisionId: string): Promise<EssayFeatures | null> {
  const { data, error } = await supabase.from('essay_features').select('*').eq('revision_id', revisionId).maybeSingle()
  if (error || !data) return null
  return featuresFromRow(data)
}

/** Lỗi AI ghi nhận cho một revision. */
export async function fetchErrorLogs(revisionId: string): Promise<ErrorLogEntry[]> {
  const { data, error } = await supabase.from('error_logs').select('*').eq('revision_id', revisionId)
  if (error || !data) return []
  return errorLogsFromRows(data)
}

/** Toàn bộ lỗi của người dùng (RLS lọc theo `auth.uid()`) — cho Sổ lỗi sai. */
export async function fetchAllErrorLogs(limit = 200): Promise<ErrorLogEntry[]> {
  const { data, error } = await supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (error || !data) return []
  return errorLogsFromRows(data)
}

/**
 * Chờ pipeline `enrich` xong (chạy sau `grade` vài giây).
 * Trả về `features: null` nếu hết giờ — đây không phải lỗi.
 */
export async function pollEssayFeatures(
  revisionId: string,
  timeoutMs = 90_000,
  intervalMs = 3_000,
): Promise<{ features: EssayFeatures | null; errors: ErrorLogEntry[] }> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const features = await fetchEssayFeatures(revisionId)
    if (features) return { features, errors: await fetchErrorLogs(revisionId) }
    if (Date.now() >= deadline) return { features: null, errors: [] }
    await new Promise<void>(resolve => window.setTimeout(resolve, intervalMs))
  }
}
