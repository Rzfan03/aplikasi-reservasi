import { randomUUID } from 'node:crypto'
import { open, unlink } from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import { prisma } from '../db.js'
import { uploadPdf, uploadsDir } from '../upload.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { sendStatusEmail, sendPlainEmail } from '../email.js'
import { sendWhatsApp, buildStatusMessage, getWaSettings } from '../whatsapp.js'
import { generateSurat } from '../pdf.js'
import { broadcast } from '../sse.js'
import { wrap } from '../wrap.js'

export const requestsRouter = Router()

const FMT_DATE = (d: Date) => d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const FMT_TIME = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })

function scheduleText(tanggal: Date, tanggalSelesai?: Date | null): string {
  const mulai = `${FMT_DATE(tanggal)}, ${FMT_TIME(tanggal)} WITA`
  if (!tanggalSelesai) return mulai
  const end = new Date(tanggalSelesai)
  return tanggal.toDateString() === end.toDateString()
    ? `${FMT_DATE(tanggal)}, ${FMT_TIME(tanggal)}–${FMT_TIME(end)} WITA`
    : `${mulai} s.d. ${FMT_DATE(end)} ${FMT_TIME(end)} WITA`
}

async function notifyAdminsNewRequest(r: {
  nama: string; instansi: string; layanan: string; tanggal: Date; tanggalSelesai?: Date | null
}): Promise<void> {
  const admins = await prisma.admin.findMany({ select: { email: true } })
  const text =
    `Permohonan baru masuk:\n\n` +
    `Nama: ${r.nama}\nInstansi: ${r.instansi}\nLayanan: ${r.layanan}\n` +
    `Jadwal: ${scheduleText(r.tanggal, r.tanggalSelesai)}\n\n` +
    `Buka dashboard admin untuk memproses permohonan ini.`
  await Promise.allSettled(admins.map((a) => sendPlainEmail(a.email, `Permohonan Baru — ${r.layanan}`, text)))
  const wa = await getWaSettings()
  if (wa.enabled && wa.pairNumber) {
    await sendWhatsApp(wa.pairNumber, text).catch(() => {})
  }
}

// Rate limit publik: maks 5 permohonan/IP/menit (tanpa dependency eksternal).
// ponytail: limiter in-memory per-IP, reset saat restart server; naikkan ke
// Redis/DB bila multi-instance atau butuh persisten.
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 5
const hits = new Map<string, number[]>()
function rateLimitPublic(req: { ip?: string }, res: { status: (c: number) => { json: (b: unknown) => void } }, next: () => void) {
  const ip = req.ip ?? 'unknown'
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (list.length >= RATE_MAX) {
    res.status(429).json({ error: 'Terlalu banyak permohonan dari alamat ini, coba lagi beberapa saat' })
    return
  }
  list.push(now)
  if (hits.size > 10_000) hits.clear()
  hits.set(ip, list)
  next()
}

// User submit
const rejectWithCleanup = async (req: { file?: { path?: string } | undefined }, res: { status: (c: number) => { json: (b: unknown) => void } }, message: string) => {
  if (req.file?.path) await unlink(req.file.path).catch(() => {})
  res.status(400).json({ error: message })
}
requestsRouter.post('/', rateLimitPublic, uploadPdf.single('pdf'), wrap(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'PDF file is required' })
      return
    }
    const { instansi, nama, nip, jabatan, email, noHp, layanan, tanggal, tanggalMulai, tanggalSelesai, deskripsi } = req.body
    if (!instansi || !nama || !nip || !jabatan || !email || !layanan || !(tanggalMulai || tanggal)) {
      await rejectWithCleanup(req, res, 'Missing required fields')
      return
    }
    const phone = (noHp ?? '').replace(/[\s-]/g, '')
    if (!/^(?:\+62|62|0)8\d{7,12}$/.test(phone)) {
      await rejectWithCleanup(req, res, 'Nomor HP tidak valid')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      await rejectWithCleanup(req, res, 'Format email tidak valid')
      return
    }
    // Validasi isi file: PDF asli (4 byte pertama %PDF), bukan sekadar ekstensi/mimetype.
    let isPdf = false
    try {
      const fh = await open(req.file.path, 'r')
      const head = Buffer.alloc(4)
      await fh.read(head, 0, 4, 0)
      await fh.close()
      isPdf = head.toString('latin1') === '%PDF'
    } catch {}
    if (!isPdf) {
      await rejectWithCleanup(req, res, 'File harus berupa PDF asli')
      return
    }
    const tanggalStart = new Date(tanggalMulai || tanggal)
    const tanggalEnd = tanggalSelesai ? new Date(tanggalSelesai) : null
    if (Number.isNaN(tanggalStart.getTime()) || (tanggalEnd && Number.isNaN(tanggalEnd.getTime()))) {
      await rejectWithCleanup(req, res, 'Tanggal kegiatan tidak valid')
      return
    }
    if (tanggalEnd && tanggalEnd < tanggalStart) {
      await rejectWithCleanup(req, res, 'Tanggal selesai tidak boleh sebelum tanggal mulai')
      return
    }
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    if (tanggalStart < startOfToday) {
      await rejectWithCleanup(req, res, 'Tanggal kegiatan tidak boleh di masa lampau')
      return
    }
    // Cek konflik jadwal: layanan yang sama tidak boleh dipesan dua kali di rentang yang sama.
    // ponytail: cek aplikasi ini rawan race saat create paralel; tambahkan unique index
    // (mis. partisi per hari) bila double-booking tetap jadi masalah.
    const end = tanggalEnd ?? new Date(tanggalStart.getTime() + 60_000)
    const clash = await prisma.request.findFirst({
      where: {
        layanan,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { tanggal: { lt: end }, tanggalSelesai: { gt: tanggalStart } },
          { tanggal: { lt: end }, tanggalSelesai: null },
        ],
      },
    })
    if (clash) {
      await rejectWithCleanup(req, res, 'Layanan tersebut sudah dipesan pada jadwal yang sama')
      return
    }
    try {
    const statusToken = randomUUID()
      const request = await prisma.request.create({
        data: {
          instansi,
          nama,
          nip,
          jabatan,
          email,
          noHp: phone,
          layanan,
          tanggal: tanggalStart,
          tanggalSelesai: tanggalEnd,
          deskripsi: deskripsi || null,
          pdfFile: req.file.filename,
          statusToken,
        },
      })
      broadcast({ type: 'request_created', id: request.id, nama: request.nama, instansi: request.instansi, layanan: request.layanan, createdAt: request.createdAt })
      notifyAdminsNewRequest(request).catch(() => {})
      res.status(201).json({ id: request.id, statusToken })
    } catch (err) {
      if (req.file?.path) await unlink(req.file.path).catch(() => {})
      throw err
    }
}))

// Admin: stats
requestsRouter.get('/stats', requireAdmin, wrap(async (_req, res) => {
  const [total, pending, approved, rejected, today] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { status: 'PENDING' } }),
    prisma.request.count({ where: { status: 'APPROVED' } }),
    prisma.request.count({ where: { status: 'REJECTED' } }),
    prisma.request.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ])
  res.json({ total, pending, approved, rejected, today })
}))

// Admin: weekly activity (last 7 days)
requestsRouter.get('/weekly', requireAdmin, wrap(async (_req, res) => {
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
    data.push({
      date: `${d.toLocaleDateString('id-ID', { weekday: 'short' })} ${d.getDate()}/${d.getMonth() + 1}`,
      count: counts[d.toISOString().slice(0, 10)],
    })
  }
  res.json(data)
}))

// Admin: list (paged + filters)
requestsRouter.get('/', requireAdmin, wrap(async (req, res) => {
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
}))

// Admin: get one by id
requestsRouter.get('/admin/:id', requireAdmin, wrap(async (req, res) => {
  const request = await prisma.request.findUnique({ where: { id: req.params.id } })
  if (!request) { res.status(404).json({ error: 'Not found' }); return }
  res.json(request)
}))

// Admin: update status
requestsRouter.put('/:id/status', requireAdmin, wrap(async (req, res) => {
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
  if (updated.email) {
    sendStatusEmail({ to: updated.email, nama: updated.nama, instansi: updated.instansi, layanan: updated.layanan, tanggal: updated.tanggal, status: updated.status, rejectReason: updated.rejectReason, statusToken: updated.statusToken })
      .catch((err) => console.error('[email] send failed:', err.message))
  }
  broadcast({ type: 'status_changed', id: updated.id, nama: updated.nama, status: updated.status, createdAt: updated.createdAt })
  res.json(updated)
}))

// Admin: bulk update status
requestsRouter.put('/bulk/status', requireAdmin, wrap(async (req, res) => {
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
  const targets = await prisma.request.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true, nama: true, instansi: true, layanan: true, tanggal: true, statusToken: true },
  })
  const updated = await prisma.request.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      adminEmail: req.user?.email,
      rejectReason: status === 'REJECTED' ? rejectReason.trim() : null,
    },
  })
  for (const t of targets) {
    if (t.email) {
      sendStatusEmail({ to: t.email, nama: t.nama, instansi: t.instansi, layanan: t.layanan, tanggal: t.tanggal, status, rejectReason, statusToken: t.statusToken })
        .catch((err) => console.error('[email] send failed:', err.message))
    }
  }
  broadcast({ type: 'bulk_status_changed', status, count: updated.count })
  res.json({ count: updated.count })
}))

// Admin: bulk delete
requestsRouter.delete('/bulk', requireAdmin, wrap(async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids harus diisi' }); return
  }
  const found = await prisma.request.findMany({
    where: { id: { in: ids } },
    select: { id: true, pdfFile: true },
  })
  await prisma.request.deleteMany({ where: { id: { in: ids } } })
  await Promise.allSettled(found.map((r) => unlink(path.join(uploadsDir, r.pdfFile))))
  broadcast({ type: 'bulk_request_deleted', count: found.length })
  res.json({ count: found.length })
}))

// Admin: delete
requestsRouter.delete('/:id', requireAdmin, wrap(async (req, res) => {
  const request = await prisma.request.findUnique({ where: { id: req.params.id } })
  if (!request) { res.status(404).json({ error: 'Not found' }); return }
  await prisma.request.delete({ where: { id: request.id } })
  try {
    await unlink(path.join(uploadsDir, request.pdfFile))
  } catch {}
  broadcast({ type: 'request_deleted', id: request.id })
  res.json({ ok: true })
}))

// User check status by token (must be last)
requestsRouter.get('/:statusToken', wrap(async (req, res) => {
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
    rejectReason: request.rejectReason, createdAt: request.createdAt,
  })
}))
