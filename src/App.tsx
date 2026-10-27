import { lazy, Suspense } from 'react'
import { createRoutesFromElements, Route } from 'react-router'
import Layout from './components/Layout'
import { RouteGuard } from './components/RouteGuard'
import Dashboard from './pages/Dashboard'
import { Landing, Donate, Settings, NotFound } from './pages/Other'
import { Auth } from './pages/Auth'
import { Admin } from './pages/Admin'
import { Essays, EssayDetail } from './pages/Essays'
import { Vocabulary, Review, Errors } from './pages/Learning'

const Prompts = lazy(() => import('./pages/Prompts'))
import { useCopy } from './i18n'

const Writing = lazy(() => import('./pages/Writing'))
const Reading = lazy(() => import('./pages/Reading'))
const ReadingTest = lazy(() => import('./pages/ReadingTest'))
const ReadingResult = lazy(() => import('./pages/ReadingResult'))

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
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/reading" element={<Suspense fallback={<AppFallback />}><Reading /></Suspense>} />
          <Route path="/app/reading/result/:attemptId" element={<Suspense fallback={<AppFallback />}><ReadingResult /></Suspense>} />
          <Route path="/app/reading/:slug" element={<Suspense fallback={<AppFallback />}><ReadingTest /></Suspense>} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
}
