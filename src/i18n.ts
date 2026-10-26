import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { languageStorageKey } from './agent/language'

let language = 'en'
try {
  const stored = localStorage.getItem(languageStorageKey)
  if (stored === 'vi' || stored === 'en') language = stored
} catch { /* Browser storage may be disabled. */ }
void i18n.use(initReactI18next).init({ lng: language, fallbackLng: 'en', resources: { vi: { translation: {} }, en: { translation: {} } }, interpolation: { escapeValue: false } })
// Một chỗ duy nhất sở hữu hợp đồng ngôn ngữ: lang cho trình đọc màn hình và
// data-lang cho CSS hiển thị đúng biến thể của bản HTML tĩnh.
function applyLanguage(value: string) {
  document.documentElement.lang = value
  document.documentElement.dataset.lang = value
}
applyLanguage(language)
i18n.on('languageChanged', value => {
  applyLanguage(value)
  try { localStorage.setItem(languageStorageKey, value) } catch { /* Language still works for this session. */ }
})

export function useCopy() {
  const { i18n: instance } = useTranslation()
  const english = instance.language === 'en'
  return {
    c: (vi: string, en: string) => (english ? en : vi),
    pick: (pair: [string, string] | readonly [string, string]) => (english ? pair[1] : pair[0]),
    language: instance.language,
    changeLanguage: (value: string) => instance.changeLanguage(value),
  }
}
