import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSession, type useSession as UseSession } from './useSession'

type SessionCtx = ReturnType<typeof UseSession>

const SessionContext = createContext<SessionCtx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSession()
  const value = useMemo(
    () => ({
      user: session.user,
      loading: session.loading,
      signIn: session.signIn,
      signOut: session.signOut,
    }),
    [session.user, session.loading, session.signIn, session.signOut],
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSessionCtx() {
  return useContext(SessionContext)
}
