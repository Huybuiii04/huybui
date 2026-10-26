import { StrictMode, Component, useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import '@fontsource/be-vietnam-pro/latin-400.css'
import '@fontsource/be-vietnam-pro/latin-500.css'
import '@fontsource/be-vietnam-pro/latin-600.css'
import '@fontsource/be-vietnam-pro/latin-700.css'
import '@fontsource/be-vietnam-pro/vietnamese-400.css'
import '@fontsource/be-vietnam-pro/vietnamese-500.css'
import '@fontsource/be-vietnam-pro/vietnamese-600.css'
import '@fontsource/be-vietnam-pro/vietnamese-700.css'
import './i18n'
import './theme'
import './styles.css'
import { routes } from './App'
import { AuthProvider } from './lib/auth'
import { StoreProvider } from './lib/store'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="fatal-error"><h1>{document.documentElement.lang === 'vi' ? 'Không mở được trang.' : 'This page could not open.'}</h1><p>{document.documentElement.lang === 'vi' ? 'Dữ liệu đã lưu vẫn ở trình duyệt. Thử tải lại trang.' : 'Saved data remains in this browser. Try reloading the page.'}</p><button className="button primary" onClick={() => window.location.reload()}>{document.documentElement.lang === 'vi' ? 'Tải lại' : 'Reload'}</button></main>
    return this.props.children
  }
}
// Bản nội dung tĩnh trong HTML được ẩn đi khi app đã render xong phần đầu tiên,
// để người dùng không thấy nháy nội dung nhưng crawler vẫn đọc được HTML gốc.
function ReadySignal() {
  useEffect(() => { document.documentElement.dataset.app = 'ready' }, [])
  return null
}

const router = createBrowserRouter(routes())
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><AuthProvider><StoreProvider><ReadySignal /><RouterProvider router={router} /></StoreProvider></AuthProvider></ErrorBoundary></StrictMode>)
