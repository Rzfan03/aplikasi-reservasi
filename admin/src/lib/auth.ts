import { createInternalNeonAuth } from '@neondatabase/neon-js/auth'

export const { adapter: authClient } = createInternalNeonAuth(
  import.meta.env.VITE_NEON_AUTH_URL,
  { fetchOptions: { credentials: 'include' } },
)

export type SessionUser = {
  id: string
  email: string
  name?: string
}

type SessionResult = {
  data?: {
    session?: Record<string, unknown>
    user?: { id: string; email: string; name?: string }
  }
}

export async function getSessionAccessToken(): Promise<string | null> {
  try {
    const result = (await authClient.getSession()) as unknown as SessionResult
    const session = result?.data?.session
    if (!session) {
      console.warn('[auth] no session in result')
      return null
    }
    const token =
      (session.access_token as string) ??
      (session.accessToken as string) ??
      (session.token as string) ??
      null
    if (!token) {
      console.warn('[auth] session exists but no token found. Keys:', Object.keys(session))
      return null
    }
    return token
  } catch (err) {
    console.error('[auth] getSessionAccessToken error:', err)
    return null
  }
}
