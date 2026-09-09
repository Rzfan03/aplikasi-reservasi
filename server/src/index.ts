import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requestsRouter } from './routes/requests.js'
import { layananRouter, instansiRouter } from './routes/layanan.js'
import { uploadsDir } from './upload.js'
import { requireAdmin } from './middleware/requireAdmin.js'
import { subscribe } from './sse.js'
import { isPrismaError } from './wrap.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
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

app.use('/api/requests', requestsRouter)
app.use('/api/layanan', layananRouter)
app.use('/api/instansi', instansiRouter)

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
})
