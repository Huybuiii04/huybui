import { lazy, Suspense } from 'react'
import { createRoutesFromElements, Route } from 'react-router'
import Layout from './components/Layout'
import { RouteGuard } from './components/RouteGuard'
import Dashboard from './pages/Dashboard'
import { Landing, Tools, Donate, Settings, Admin, NotFound } from './pages/Other'
import { Auth } from './pages/Auth'
import { Essays, EssayDetail } from './pages/Essays'
import { Vocabulary, Review, Errors } from './pages/Learning'
import { Library, LibraryDetail } from './pages/Library'
import Guide from './pages/Guide'

const Prompts = lazy(() => import('./pages/Prompts'))
import { useCopy } from './i18n'

const Writing = lazy(() => import('./pages/Writing'))

export function AppFallback() {
  const { c } = useCopy()
  return <div className="loading-state" role="status">{c('Đang tải…', 'Loading…')}</div>
}

export function routes() {
  return createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<Auth />} />
      <Route path="/auth/reset-password" element={<Auth />} />
      <Route element={<Layout />}>
        <Route path="/library" element={<Library />} />
        <Route path="/library/:kind/:slug" element={<LibraryDetail />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/guide/:slug" element={<Guide />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/app/prompts" element={<Suspense fallback={<AppFallback />}><Prompts /></Suspense>} />
        <Route element={<RouteGuard />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/write" element={<Suspense fallback={<AppFallback />}><Writing /></Suspense>} />
          <Route path="/app/essays" element={<Essays />} />
          <Route path="/app/essays/:id" element={<EssayDetail />} />
          <Route path="/app/vocabulary" element={<Vocabulary />} />
          <Route path="/app/review" element={<Review />} />
          <Route path="/app/errors" element={<Errors />} />
          <Route path="/app/tools" element={<Tools />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
}
