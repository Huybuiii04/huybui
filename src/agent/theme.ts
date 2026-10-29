// Theme dùng chung cho app và các trang HTML tĩnh: khoá lưu trữ, mặc định và
// đoạn script chạy trước lần vẽ đầu tiên. src/theme.ts dùng lại đúng hai hằng
// số này nên app và bản tĩnh không thể lệch nhau.

export const themeStorageKey = 'ielts-theme-v2'

// V2: khoá cũ 'ielts-theme' lưu mặc định 'dark' từ trước khi đổi sang sáng.
// Đổi khoá để người đã từng vào trang không bị kẹt nền tối; lựa chọn mới vẫn
// được lưu và tôn trọng như cũ.
export const legacyThemeStorageKey = 'ielts-theme'

// App mặc định giao diện sáng, nên bản HTML tĩnh cũng phải sáng khi người dùng
// chưa lưu lựa chọn nào.
export const defaultTheme = 'light'

// Script inline chèn vào <head> của mọi trang: đặt data-theme trước lần vẽ đầu
// tiên để trang tĩnh khớp với app (tôn trọng lựa chọn đã lưu, mặc định là sáng).
export function themeBootstrapScript() {
  return `try {
  const stored = localStorage.getItem("${themeStorageKey}")
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  const theme = stored === "light" || stored === "dark" ? stored : stored === "system" ? system : "${defaultTheme}"
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  try { localStorage.removeItem("${legacyThemeStorageKey}") } catch (error) {}
} catch {
  document.documentElement.dataset.theme = "${defaultTheme}"
  document.documentElement.style.colorScheme = "${defaultTheme}"
}`
}
