/**
 * Probe: `extractJson` có cắt đúng JSON khi chuỗi chứa `{` bên trong giá trị không?
 * Đây là đường đi của `parseProviderResponse` → `JSON.stringify(toolUse.input)` → `extractJson`.
 */
import { extractJson } from '../supabase/functions/_shared/provider.ts'

const input = {
  errors: [{ quote: 'a { b } c', correction: 'x' }],
  summary: 'has { braces } inside a string',
}
const rawText = JSON.stringify(input)
console.log('rawText:', rawText)
const parsed = extractJson(rawText)
console.log('parsed.errors.length =', parsed?.errors?.length)
console.log('parsed.summary =', parsed?.summary)
console.log('khớp với input:', JSON.stringify(parsed) === JSON.stringify(input))
