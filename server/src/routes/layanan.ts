import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

export const layananRouter = Router()

layananRouter.get('/', requireAdmin, async (_req, res) => {
  const items = await prisma.layanan.findMany({ orderBy: { urutan: 'asc' } })
  res.json(items)
})

layananRouter.post('/', requireAdmin, async (req, res) => {
  const { nama, urutan } = req.body
  if (!nama) { res.status(400).json({ error: 'nama is required' }); return }
  const item = await prisma.layanan.create({ data: { nama, urutan: urutan ?? 0 } })
  res.status(201).json(item)
})

layananRouter.put('/:id', requireAdmin, async (req, res) => {
  const { nama, urutan } = req.body
  const item = await prisma.layanan.update({
    where: { id: req.params.id },
    data: { ...(nama !== undefined && { nama }), ...(urutan !== undefined && { urutan }) },
  })
  res.json(item)
})

layananRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.layanan.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

// Instansi CRUD
export const instansiRouter = Router()

instansiRouter.get('/', requireAdmin, async (_req, res) => {
  const items = await prisma.instansi.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

instansiRouter.post('/', requireAdmin, async (req, res) => {
  const { nama } = req.body
  if (!nama) { res.status(400).json({ error: 'nama is required' }); return }
  const item = await prisma.instansi.create({ data: { nama } })
  res.status(201).json(item)
})

instansiRouter.put('/:id', requireAdmin, async (req, res) => {
  const { nama } = req.body
  const item = await prisma.instansi.update({ where: { id: req.params.id }, data: { nama } })
  res.json(item)
})

instansiRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.instansi.delete({ where: { id: req.params.id } })
  res.status(204).end()
})
