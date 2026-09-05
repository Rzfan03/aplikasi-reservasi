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

// Admin: weekly activity (last 7 days)
requestsRouter.get('/weekly', requireAdmin, async (_req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const records = await prisma.request.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  const counts: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    counts[d.toISOString().slice(0, 10)] = 0
  }
  for (const r of records) {
    const key = r.createdAt.toISOString().slice(0, 10)
    counts[key] = (counts[key] ?? 0) + 1
  }
  const data: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    data.push({ date: d.toLocaleDateString('id-ID', { weekday: 'short' }), count: counts[d.toISOString().slice(0, 10)] })
  }
  res.json(data)
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
      { nip: { contains: search as string, mode: 'insensitive' } },
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

// Admin: get one by id
requestsRouter.get('/admin/:id', requireAdmin, async (req, res) => {
  const request = await prisma.request.findUnique({ where: { id: req.params.id } })
  if (!request) { res.status(404).json({ error: 'Not found' }); return }
  res.json(request)
})

// Admin: update status
requestsRouter.put('/:id/status', requireAdmin, async (req, res) => {
  const { status, rejectReason } = req.body
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' }); return
  }
  if (status === 'REJECTED' && !rejectReason?.trim()) {
    res.status(400).json({ error: 'Alasan penolakan wajib diisi' }); return
  }
  const updated = await prisma.request.update({
    where: { id: req.params.id },
    data: {
      status,
      adminEmail: req.user?.email,
      rejectReason: status === 'REJECTED' ? rejectReason.trim() : null,
    },
  })
  broadcast({ type: 'status_changed', id: updated.id, nama: updated.nama, status: updated.status, createdAt: updated.createdAt })
  res.json(updated)
})

// Admin: bulk update status
requestsRouter.put('/bulk/status', requireAdmin, async (req, res) => {
  const { ids, status, rejectReason } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids harus diisi' }); return
  }
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' }); return
  }
  if (status === 'REJECTED' && !rejectReason?.trim()) {
    res.status(400).json({ error: 'Alasan penolakan wajib diisi' }); return
  }
  const updated = await prisma.request.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      adminEmail: req.user?.email,
      rejectReason: status === 'REJECTED' ? rejectReason.trim() : null,
    },
  })
  broadcast({ type: 'bulk_status_changed', status, count: updated.count })
  res.json({ count: updated.count })
})

// User check status by token (must be last)
requestsRouter.get('/:statusToken', async (req, res) => {
  const { statusToken } = req.params
  if (['stats', 'weekly', 'bulk', 'admin'].includes(statusToken)) {
    res.status(404).json({ error: 'Not found' }); return
  }
  const request = await prisma.request.findUnique({
    where: { statusToken },
  })
  if (!request) { res.status(404).json({ error: 'Not found' }); return }
  res.json({
    id: request.id, instansi: request.instansi, nama: request.nama,
    layanan: request.layanan, tanggal: request.tanggal, status: request.status,
    adminEmail: request.adminEmail, rejectReason: request.rejectReason, createdAt: request.createdAt,
  })
})
