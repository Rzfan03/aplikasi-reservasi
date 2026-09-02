import type { NextFunction, Request, Response } from 'express'
import { verifyToken, type AuthUser } from '../auth.js'
import { prisma } from '../db.js'

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  const token =
    (header?.startsWith('Bearer ') ? header.slice(7) : undefined) ??
    (typeof req.query.token === 'string' ? req.query.token : undefined)
  const user = token ? await verifyToken(token) : null

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const admin = await prisma.admin.findUnique({
    where: { email: user.email },
  })
  if (!admin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  req.user = {
    ...user,
    // admin flag via local type
    role: 'admin',
  }
  next()
}
