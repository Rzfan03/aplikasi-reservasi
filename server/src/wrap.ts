import type { NextFunction, Request, RequestHandler, Response } from 'express'

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export function wrap(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

export function isPrismaError(e: unknown): { code: string; message: string } | null {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    const code = String((e as { code: unknown }).code)
    if (code.startsWith('P2')) {
      return { code, message: (e as { message?: string }).message ?? 'Database error' }
    }
  }
  return null
}