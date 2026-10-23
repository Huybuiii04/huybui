import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'

let language = 'vi'
try { language = localStorage.getItem('ielts-language') === 'en' ? 'en' : 'vi' } catch { /* Browser storage may be disabled. */ }
void i18n.use(initReactI18next).init({ lng: language, fallbackLng: 'vi', resources: { vi: { translation: {} }, en: { translation: {} } }, interpolation: { escapeValue: false } })
document.documentElement.lang = language
i18n.on('languageChanged', value => {
  document.documentElement.lang = value
  try { localStorage.setItem('ielts-language', value) } catch { /* Language still works for this session. */ }
})

export function useCopy() {
  const { i18n: instance } = useTranslation()
  return { c: (vi: string, en: string) => instance.language === 'en' ? en : vi, language: instance.language, changeLanguage: (value: string) => instance.changeLanguage(value) }
}
