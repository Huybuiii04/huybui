// Ngôn ngữ dùng chung giữa app và các trang HTML tĩnh: khoá lưu trữ và script
// inline đặt ngôn ngữ trước lần vẽ đầu tiên. src/i18n.ts dùng lại khoá này
// nên app và bản tĩnh không thể lệch nhau.

export const languageStorageKey = 'ielts-language'

// Script inline chèn vào <head> của landing: đặt ngôn ngữ theo lựa chọn đã lưu
// và gắn nút VI/EN của bản HTML tĩnh, để trang đổi được ngôn ngữ khi chưa có
// React. Script tự chạy, không cần bundle nào.
export function renderLanguageScript() {
  return `(function () {
  var root = document.documentElement
  function readStoredLanguage() {
    try {
      var stored = localStorage.getItem("${languageStorageKey}")
      return stored === "vi" || stored === "en" ? stored : "en"
    } catch (error) {
      return "en"
    }
  }
  function applyLanguage(language) {
    root.lang = language
    root.dataset.lang = language
    var buttons = document.querySelectorAll(".language-switch button[data-lang-switch]")
    for (var index = 0; index < buttons.length; index += 1) {
      var button = buttons[index]
      var active = button.getAttribute("data-lang-switch") === language
      button.setAttribute("aria-pressed", active ? "true" : "false")
    }
  }
  applyLanguage(readStoredLanguage())
  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest ? event.target.closest(".language-switch button[data-lang-switch]") : null
    var themeButton = event.target && event.target.closest ? event.target.closest("[data-theme-switch]") : null
    if (themeButton && !themeButton.closest("[data-landing-react]")) {
      var theme = root.dataset.theme === "dark" ? "light" : "dark"
      root.dataset.theme = theme
      root.style.colorScheme = theme
      try { localStorage.setItem("ielts-theme", theme) } catch (error) {}
      return
    }
    if (!target || target.closest("[data-landing-react]")) return
    var language = target.getAttribute("data-lang-switch")
    if (language !== "vi" && language !== "en") return
    applyLanguage(language)
    try { localStorage.setItem("${languageStorageKey}", language) } catch (error) {}
  })
  document.addEventListener("DOMContentLoaded", function () {
    applyLanguage(root.dataset.lang === "vi" ? "vi" : "en")
  })
})()`
}
