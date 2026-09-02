import type { NextFunction, Request, Response } from 'express'
import { verifyToken, type AuthUser } from '../auth.js'

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  const user = token ? await verifyToken(token) : null

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  req.user = user
  next()
}
