import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'

let language = 'en'
try {
  const stored = localStorage.getItem('ielts-language')
  if (stored === 'vi' || stored === 'en') language = stored
} catch { /* Browser storage may be disabled. */ }
void i18n.use(initReactI18next).init({ lng: language, fallbackLng: 'en', resources: { vi: { translation: {} }, en: { translation: {} } }, interpolation: { escapeValue: false } })
document.documentElement.lang = language
i18n.on('languageChanged', value => {
  document.documentElement.lang = value
  try { localStorage.setItem('ielts-language', value) } catch { /* Language still works for this session. */ }
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
