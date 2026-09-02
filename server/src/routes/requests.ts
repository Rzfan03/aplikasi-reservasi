import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { prisma } from '../db.js'
import { uploadPdf } from '../upload.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { broadcast } from '../sse.js'

export const requestsRouter = Router()

// User submit — multipart: fields + PDF file "pdf"
requestsRouter.post('/', uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'PDF file is required' })
      return
    }
    const { dinas, nama, nip, jabatan, layanan, tanggal, deskripsi } =
      req.body
    if (!dinas || !nama || !nip || !jabatan || !layanan || !tanggal) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    const statusToken = randomUUID()
    const request = await prisma.request.create({
      data: {
        dinas,
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
    broadcast({
      type: 'new_request',
      data: {
        id: request.id,
        dinas: request.dinas,
        layanan: request.layanan,
        nama: request.nama,
        createdAt: request.createdAt,
      },
    })
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
  if (!request) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json({
    id: request.id,
    dinas: request.dinas,
    nama: request.nama,
    layanan: request.layanan,
    tanggal: request.tanggal,
    status: request.status,
    adminEmail: request.adminEmail,
    createdAt: request.createdAt,
  })
})

// Admin: list all (filter by ?status=)
requestsRouter.get('/', requireAdmin, async (req, res) => {
  const { status } = req.query
  const requests = await prisma.request.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  res.json(requests)
})

// Admin: approve/reject
requestsRouter.put('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' })
    return
  }
  const updated = await prisma.request.update({
    where: { id: req.params.id },
    data: { status, adminEmail: req.user?.email },
  })
  res.json(updated)
})
