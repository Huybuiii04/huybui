// Theme dùng chung cho app và các trang HTML tĩnh: khoá lưu trữ, mặc định và
// đoạn script chạy trước lần vẽ đầu tiên. src/theme.ts dùng lại đúng hai hằng
// số này nên app và bản tĩnh không thể lệch nhau.

export const themeStorageKey = 'ielts-theme'

// App mặc định giao diện tối, nên bản HTML tĩnh cũng phải tối khi người dùng
// chưa lưu lựa chọn nào.
export const defaultTheme = 'dark'

// Script inline chèn vào <head> của mọi trang: đặt data-theme trước lần vẽ đầu
// tiên để trang tĩnh khớp với app (tôn trọng lựa chọn đã lưu, mặc định là tối).
export function themeBootstrapScript() {
  return `try {
  const stored = localStorage.getItem("${themeStorageKey}")
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  const theme = stored === "light" || stored === "dark" ? stored : stored === "system" ? system : "${defaultTheme}"
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
} catch {
  document.documentElement.dataset.theme = "${defaultTheme}"
  document.documentElement.style.colorScheme = "${defaultTheme}"
}`
}
