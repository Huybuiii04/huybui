export function countWords(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length ?? 0
}

export function scheduleReview(level: number, remembered: boolean, now = Date.now()) {
  const intervals = [1, 3, 7, 14, 30, 60]
  const next = remembered ? Math.min(6, Math.max(0, level) + 1) : 0
  return { level: next, dueAt: now + intervals[Math.max(0, next - 1)] * 86400000 }
}

export function validateImages(files: { type: string; size: number }[]) {
  if (files.length > 2) return 'imageCount'
  if (files.some(file => !['image/png', 'image/jpeg', 'image/webp'].includes(file.type))) return 'imageType'
  if (files.some(file => file.size > 5 * 1024 * 1024)) return 'imageSize'
  return null
}
