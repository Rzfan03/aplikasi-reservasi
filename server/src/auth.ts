import 'dotenv/config'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const jwks = createRemoteJWKSet(
  new URL(process.env.NEON_AUTH_JWKS_URL!),
)

export type AuthUser = {
  sub: string
  email: string
  role: string
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  const issuer = new URL(process.env.NEON_AUTH_BASE_URL!).origin
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      algorithms: ['EdDSA'],
    })
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as string) ?? 'authenticated',
    }
  } catch {
    return null
  }
}
