import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requestsRouter } from './routes/requests.js'
import { layananRouter, instansiRouter } from './routes/layanan.js'
import { settingsRouter } from './routes/settings.js'
import { uploadsDir } from './upload.js'
import { requireAdmin } from './middleware/requireAdmin.js'
import { subscribe, subscribeLogs, broadcastLog } from './sse.js'
import { isPrismaError, wrap } from './wrap.js'
import { prisma } from './db.js'
import { maybeStartWhatsApp } from './whatsapp.js'
import { installConsoleLogger, getLogs, log, setLogEmitter } from './logger.js'

installConsoleLogger()
setLogEmitter((entry) => broadcastLog({ type: 'log', entry }))

process.on('unhandledRejection', (reason) => {
  log('error', 'process', reason instanceof Error ? reason.stack ?? reason.message : String(reason))
})
process.on('uncaughtException', (err) => {
  log('error', 'process', err.stack ?? err.message)
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.disable('x-powered-by')

// CORS allow-list — origin tak dikenal ditolak. Daftar lewat env CORS_ORIGINS.
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
  .split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Origin tidak diizinkan'))
  },
}))

// Security headers dasar. UI (vite) memakai header sendiri via server.headers.
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
  if (_req.secure || _req.get('x-forwarded-proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})
app.use(express.json())

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next()
  const t0 = performance.now()
  res.on('finish', () => {
    if (req.path.startsWith('/api/logs')) return
    const redacted = req.originalUrl.replace(/([?&])token=[^&]*/g, '$1token=REDACTED')
    log('info', 'http', `${req.method} ${redacted} ${res.statusCode} ${Math.round(performance.now() - t0)}ms`)
  })
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// Log sistem — buffer in-memory proses (server restart → buffer terisi ulang)
app.get('/api/logs', requireAdmin, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 1000)
  res.json({ logs: getLogs(limit) })
})

// Real-time streaming log ke halaman Log
app.get('/api/logs/events', requireAdmin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  res.write(': connected\n\n')
  subscribeLogs(res)
  const hb = setInterval(() => res.write(': ping\n\n'), 15000)
  req.on('close', () => clearInterval(hb))
})

// Ingest log sisi frontend (label [fe]) — error browser dikirim admin ke sini
app.post('/api/logs/ingest', requireAdmin, (req, res) => {
  const { level, message } = req.body ?? {}
  const lvl = ['log', 'info', 'warn', 'error'].includes(level) ? level : 'log'
  if (typeof message === 'string' && message) {
    log(lvl, 'fe', message.slice(0, 2000))
  }
  res.json({ ok: true })
})

// PDF lampiran — hanya untuk admin terautentikasi, nama file validasi ketat (uuid.pdf)
app.get('/uploads/:file', requireAdmin, (req, res) => {
  const file = req.params.file
  if (!/^[a-f0-9-]{36}\.pdf$/.test(file)) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.sendFile(path.join(uploadsDir, file), (err) => {
    if (err) res.status(404).json({ error: 'Not found' })
  })
})

// Admin SSE events — token via query (EventSource can't set headers)
app.get('/api/requests/events', requireAdmin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.write(': connected\n\n')
  subscribe(res)

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000)
  req.on('close', () => clearInterval(heartbeat))
})

// Publik: daftar instansi/layanan untuk formulir pengajuan (tanpa autentikasi)
app.get('/api/public/instansi', wrap(async (_req, res) => {
  res.json(await prisma.instansi.findMany({ orderBy: { createdAt: 'desc' } }))
}))

app.get('/api/public/layanan', wrap(async (_req, res) => {
  res.json(await prisma.layanan.findMany({ orderBy: { urutan: 'asc' } }))
}))

app.use('/api/requests', requestsRouter)
app.use('/api/layanan', layananRouter)
app.use('/api/instansi', instansiRouter)
app.use('/api/settings', settingsRouter)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message })
    return
  }
  const prismaErr = isPrismaError(err)
  if (prismaErr) {
    if (prismaErr.code === 'P2002') {
      res.status(409).json({ error: 'Data dengan nama yang sama sudah ada' })
      return
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ error: 'Data tidak ditemukan' })
      return
    }
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
  maybeStartWhatsApp().catch((err) => console.error('[whatsapp] init failed:', err?.message))
})
