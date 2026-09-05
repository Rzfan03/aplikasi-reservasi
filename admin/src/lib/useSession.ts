import { useCallback, useEffect, useState } from 'react'
import { authClient, type SessionUser } from './auth'

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    console.log('[useSession] fetching session...')
    authClient
      .getSession()
      .then((result) => {
        if (!active) return
        console.log('[useSession] session result:', result)
        if (result.data?.user) {
          const u = result.data.user as SessionUser
          console.log('[useSession] user found:', u.email)
          setUser({ id: u.id, email: u.email, name: u.name })
        } else {
          console.log('[useSession] no user in session')
        }
      })
      .catch((err) => {
        console.error('[useSession] getSession error:', err)
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[useSession] signIn:', email)
    const result = await authClient.signIn.email({ email, password })
    if (result.error) throw new Error(result.error.message ?? 'Gagal masuk')
    console.log('[useSession] signIn success, fetching session...')
    const session = await authClient.getSession()
    console.log('[useSession] post-signIn session:', session)
    const u = session.data?.user as SessionUser | null
    if (u) {
      console.log('[useSession] setting user:', u.email)
      setUser({ id: u.id, email: u.email, name: u.name })
    } else {
      throw new Error('Sesi tidak ditemukan')
    }
  }, [])

  const signOut = useCallback(async () => {
    await authClient.signOut()
    setUser(null)
  }, [])

  return { user, loading, signIn, signOut }
}
