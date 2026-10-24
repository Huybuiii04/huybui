import { Navigate, Outlet, useLocation } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../lib/auth'
import { useCopy } from '../i18n'
import { Notice } from './ui'

/**
 * Bảo vệ các route cần đăng nhập (/app/**, /admin/**).
 * Chưa đăng nhập → chuyển hướng /auth, giữ lại đường dẫn để quay lại sau khi đăng nhập.
 *
 * Dùng được hai kiểu:
 *   <Route element={<RouteGuard />}>…</Route>            (layout route, dùng Outlet)
 *   <RouteGuard><Dashboard /></RouteGuard>                (bọc trực tiếp)
 */
export function RouteGuard({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { c } = useCopy()

  if (loading) return <div className="loading-state" role="status">{c('Đang kiểm tra phiên đăng nhập…', 'Checking your session…')}</div>
  if (!user) return <Navigate to="/auth" replace state={{ from: `${location.pathname}${location.search}` }} />
  return <>{children ?? <Outlet />}</>
}

/** Route công khai: nếu đã đăng nhập thì đưa thẳng vào workspace. */
export function PublicOnly({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="loading-state" role="status" />
  if (user) return <Navigate to={(location.state as { from?: string } | null)?.from ?? '/app'} replace />
  return <>{children ?? <Outlet />}</>
}

/** Thông báo cho người dùng bị suspend — dùng khi RPC trả lỗi 42501. */
export function SuspendedNotice() {
  const { c } = useCopy()
  return <Notice error>{c('Tài khoản đang bị tạm khóa. Bạn không thể lưu dữ liệu lúc này.', 'This account is suspended. You cannot save data right now.')}</Notice>
}
