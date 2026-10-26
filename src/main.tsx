import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
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
const router = createBrowserRouter(routes())
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><AuthProvider><StoreProvider><RouterProvider router={router} /></StoreProvider></AuthProvider></ErrorBoundary></StrictMode>)
