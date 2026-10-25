// Cấu hình trang ủng hộ: mã QR + thông tin tài khoản (bảng donation_settings, đọc công khai).
import { supabase } from './supabase'

export type DonationMethod = { label: string; value: string; note?: string }

export type DonationSettings = {
  qrPath: string
  isConfigured: boolean
  methods: DonationMethod[]
  instructions: { vi: string; en: string }
}

type DonationRow = {
  qr_path: string | null
  is_configured: boolean | null
  methods: unknown
  instructions: unknown
}

function toMethods(value: unknown): DonationMethod[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    const row = item as Partial<DonationMethod>
    if (!row || typeof row.label !== 'string' || typeof row.value !== 'string') return []
    return [{ label: row.label, value: row.value, note: typeof row.note === 'string' ? row.note : undefined }]
  })
}

function toInstructions(value: unknown): { vi: string; en: string } {
  const row = (value ?? {}) as Partial<{ vi: string; en: string }>
  return { vi: typeof row.vi === 'string' ? row.vi : '', en: typeof row.en === 'string' ? row.en : '' }
}

export async function loadDonationSettings(): Promise<DonationSettings | null> {
  try {
    const { data, error } = await supabase.from('donation_settings').select('qr_path,is_configured,methods,instructions').maybeSingle()
    if (error || !data) return null
    const row = data as DonationRow
    return {
      qrPath: row.qr_path ?? '',
      isConfigured: Boolean(row.is_configured),
      methods: toMethods(row.methods),
      instructions: toInstructions(row.instructions),
    }
  } catch {
    return null
  }
}
