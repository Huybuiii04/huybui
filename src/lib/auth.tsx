import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isConfigured, supabase } from './supabase'
import { authErrorCode, profileFromRow, type AuthErrorCode, type ProfileState } from './authLogic'
import { loadProfileRow, saveProfileRow } from './profile'

export type AuthResult = { ok: boolean; code?: AuthErrorCode; needsConfirmation?: boolean }

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  profile: ProfileState | null
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  sendReset: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileState | null>(null)

  const syncProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null)
      return
    }
    try {
      const row = await loadProfileRow(user.id)
      if (row) {
        setProfile(profileFromRow(row))
        return
      }
      // Chưa có hàng profiles → tạo từ metadata của user.
      const created: ProfileState = {
        name: (user.user_metadata?.display_name as string | undefined) ?? '',
        target: '7.0',
        feedback: 'vi',
      }
      await saveProfileRow(user.id, created)
      setProfile(created)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
      void syncProfile(data.session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return
      setSession(next)
      setLoading(false)
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') void syncProfile(next?.user ?? null)
      if (event === 'SIGNED_OUT') setProfile(null)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [syncProfile])

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<AuthResult> => {
    if (!isConfigured) return { ok: false, code: 'not_configured' }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) return { ok: false, code: authErrorCode(error) }
    return { ok: true, needsConfirmation: !data.session }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isConfigured) return { ok: false, code: 'not_configured' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, code: authErrorCode(error) }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    if (!isConfigured) return
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const sendReset = useCallback(async (email: string): Promise<AuthResult> => {
    if (!isConfigured) return { ok: false, code: 'not_configured' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) return { ok: false, code: authErrorCode(error) }
    return { ok: true }
  }, [])

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    if (!isConfigured) return { ok: false, code: 'not_configured' }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { ok: false, code: authErrorCode(error) }
    return { ok: true }
  }, [])

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    await syncProfile(data.session?.user ?? null)
  }, [syncProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isConfigured,
      profile,
      signUp,
      signIn,
      signOut,
      sendReset,
      updatePassword,
      refreshProfile,
    }),
    [session, loading, profile, signUp, signIn, signOut, sendReset, updatePassword, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider missing')
  return value
}
