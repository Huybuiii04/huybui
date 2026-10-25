// Biết người đang đăng nhập có phải admin không (để hiện lối vào bảng quản trị).
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

export function useAdminRole(): boolean {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    let active = true
    void supabase
      .from('user_access')
      .select('role,status')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        const row = data as { role?: string; status?: string } | null
        setIsAdmin(row?.role === 'admin' && row?.status === 'active')
      }, () => {
        if (active) setIsAdmin(false)
      })
    return () => { active = false }
  }, [user])

  return isAdmin
}
