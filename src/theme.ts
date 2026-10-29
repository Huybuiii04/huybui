import { useSyncExternalStore } from 'react'
import { defaultTheme, legacyThemeStorageKey, themeStorageKey } from './agent/theme'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const storageKey = themeStorageKey
const listeners = new Set<() => void>()
let preference: ThemePreference = defaultTheme

try {
  const stored = localStorage.getItem(storageKey)
  if (stored === 'light' || stored === 'dark' || stored === 'system') preference = stored
  // Khoá cũ lưu mặc định "dark" từ trước khi đổi sang sáng: xoá để người dùng
  // cũ bắt đầu ở giao diện sáng, còn lựa chọn mới vẫn tôn trọng.
  localStorage.removeItem(legacyThemeStorageKey)
} catch { /* Browser storage may be disabled; use the default theme. */ }

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
function resolved(): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference
}
function apply() {
  const theme = resolved()
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}
function notify() { listeners.forEach(listener => listener()) }

apply()
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (preference === 'system') { apply(); notify() }
})

export function setThemePreference(next: ThemePreference) {
  preference = next
  try { localStorage.setItem(storageKey, next) } catch { /* Theme still applies for this session. */ }
  apply()
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, resolved, () => 'light' as ResolvedTheme)
  const stored = useSyncExternalStore(subscribe, () => preference, () => 'system' as ThemePreference)
  return {
    theme: current,
    preference: stored,
    setPreference: setThemePreference,
    toggle: () => setThemePreference(current === 'dark' ? 'light' : 'dark'),
  }
}
