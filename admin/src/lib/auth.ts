import { createInternalNeonAuth } from '@neondatabase/neon-js/auth'

export const { adapter: authClient } = createInternalNeonAuth(
  import.meta.env.VITE_NEON_AUTH_URL,
  { fetchOptions: { credentials: 'include' } },
)

type TokenResult = { data?: { token?: string } | null; error?: { message?: string } | null }
export type { TokenResult }

export async function getJWTToken(): Promise<string | null> {
  const result = (await authClient.token()) as unknown as TokenResult
  return result.data?.token ?? null
}

export type SessionUser = {
  id: string
  email: string
  name?: string
}