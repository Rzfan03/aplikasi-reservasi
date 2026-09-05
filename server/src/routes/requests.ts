import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { prisma } from '../db.js'
import { uploadPdf } from '../upload.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { broadcast } from '../sse.js'

export const requestsRouter = Router()

// User submit
requestsRouter.post('/', uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'PDF file is required' })
      return
    }
    const { instansi, nama, nip, jabatan, layanan, tanggal, deskripsi } = req.body
    if (!instansi || !nama || !nip || !jabatan || !layanan || !tanggal) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    const statusToken = randomUUID()
    const request = await prisma.request.create({
      data: {
        instansi,
        nama,
        nip,
        jabatan,
        layanan,
        tanggal: new Date(tanggal),
        deskripsi: deskripsi || null,
        pdfFile: req.file.filename,
        statusToken,
      },
    })
    broadcast({ type: 'request_created', id: request.id, nama: request.nama, instansi: request.instansi, layanan: request.layanan, createdAt: request.createdAt })
    res.status(201).json({ id: request.id, statusToken })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// User check status by token
requestsRouter.get('/:statusToken', async (req, res) => {
  const request = await prisma.request.findUnique({
    where: { statusToken: req.params.statusToken },
  })
  if (!request) { res.status(404).json({ error: 'Not found' }); return }
  res.json({
    id: request.id, instansi: request.instansi, nama: request.nama,
    layanan: request.layanan, tanggal: request.tanggal, status: request.status,
    adminEmail: request.adminEmail, createdAt: request.createdAt,
  })
})

// Admin: stats
requestsRouter.get('/stats', requireAdmin, async (_req, res) => {
  const [total, pending, approved, rejected, today] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { status: 'PENDING' } }),
    prisma.request.count({ where: { status: 'APPROVED' } }),
    prisma.request.count({ where: { status: 'REJECTED' } }),
    prisma.request.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ])
  res.json({ total, pending, approved, rejected, today })
})

// Admin: list (paged + filters)
requestsRouter.get('/', requireAdmin, async (req, res) => {
  const { status, dateFrom, dateTo, search, page = '1', limit = '10' } = req.query
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (dateFrom || dateTo) {
    where.tanggal = {}
    if (dateFrom) (where.tanggal as Record<string, unknown>).gte = new Date(dateFrom as string)
    if (dateTo) (where.tanggal as Record<string, unknown>).lte = new Date(dateTo as string)
  }
  if (search) {
    where.OR = [
      { nama: { contains: search as string, mode: 'insensitive' } },
      { instansi: { contains: search as string, mode: 'insensitive' } },
    ]
  }
  const p = Math.max(1, Number(page))
  const l = Math.max(1, Math.min(100, Number(limit)))
  const [data, total] = await Promise.all([
    prisma.request.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (p - 1) * l, take: l }),
    prisma.request.count({ where }),
  ])
  res.json({ data, total, page: p, limit: l })
})

// Admin: update status
requestsRouter.put('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' }); return
  }
  const updated = await prisma.request.update({
    where: { id: req.params.id },
    data: { status, adminEmail: req.user?.email },
  })
  broadcast({ type: 'status_changed', id: updated.id, nama: updated.nama, status: updated.status, createdAt: updated.createdAt })
  res.json(updated)
})
