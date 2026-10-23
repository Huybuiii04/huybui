import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import '@fontsource/work-sans/latin-400.css'
import '@fontsource/work-sans/latin-500.css'
import '@fontsource/work-sans/latin-600.css'
import '@fontsource/work-sans/latin-700.css'
import '@fontsource/work-sans/vietnamese-400.css'
import '@fontsource/work-sans/vietnamese-500.css'
import '@fontsource/work-sans/vietnamese-600.css'
import '@fontsource/work-sans/vietnamese-700.css'
import '@fontsource/outfit/latin-500.css'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/outfit/latin-700.css'
import './i18n'
import './styles.css'
import { routes } from './App'
import { StoreProvider } from './lib/store'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="fatal-error"><h1>{document.documentElement.lang === 'vi' ? 'Không mở được trang.' : 'This page could not open.'}</h1><p>{document.documentElement.lang === 'vi' ? 'Dữ liệu đã lưu vẫn ở trình duyệt. Thử tải lại trang.' : 'Saved data remains in this browser. Try reloading the page.'}</p><button className="button primary" onClick={() => window.location.reload()}>{document.documentElement.lang === 'vi' ? 'Tải lại' : 'Reload'}</button></main>
    return this.props.children
  }
}
const router = createBrowserRouter(routes())
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><StoreProvider><RouterProvider router={router} /></StoreProvider></ErrorBoundary></StrictMode>)
