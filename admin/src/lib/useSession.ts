import { useEffect, useState } from 'react'
import { authClient, type SessionUser } from './auth'

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authClient
      .getSession()
      .then((result) => {
        if (!active) return
        if (result.data?.user) {
          const u = result.data.user as SessionUser
          setUser({ id: u.id, email: u.email, name: u.name })
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password })
    if (result.error) throw new Error(result.error.message ?? 'Gagal masuk')
    const session = await authClient.getSession()
    const u = session.data?.user as SessionUser | null
    if (u) setUser({ id: u.id, email: u.email, name: u.name })
    else throw new Error('Sesi tidak ditemukan')
  }

  const signOut = async () => {
    await authClient.signOut()
    setUser(null)
  }

  return { user, loading, signIn, signOut }
}