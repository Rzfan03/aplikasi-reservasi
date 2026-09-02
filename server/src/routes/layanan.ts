import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

export const layananRouter = Router()

// Public: list active services, ordered — consumed by the user form
layananRouter.get('/', async (_req, res) => {
  const layanan = await prisma.layanan.findMany({
    orderBy: { urutan: 'asc' },
  })
  res.json(layanan)
})

// Admin: create
layananRouter.post('/', requireAdmin, async (req, res) => {
  const { nama, urutan } = req.body
  if (!nama || typeof nama !== 'string' || !nama.trim()) {
    res.status(400).json({ error: 'Nama layanan wajib diisi' })
    return
  }
  try {
    const layanan = await prisma.layanan.create({
      data: { nama: nama.trim(), urutan: urutan ?? 0 },
    })
    res.status(201).json(layanan)
  } catch (e) {
    res.status(409).json({ error: 'Layanan dengan nama tersebut sudah ada' })
  }
})

// Admin: rename / reorder
layananRouter.put('/:id', requireAdmin, async (req, res) => {
  const { nama, urutan } = req.body
  const data: { nama?: string; urutan?: number } = {}
  if (nama !== undefined) {
    if (!nama.trim()) {
      res.status(400).json({ error: 'Nama layanan tidak boleh kosong' })
      return
    }
    data.nama = nama.trim()
  }
  if (urutan !== undefined) data.urutan = Number(urutan)
  try {
    const layanan = await prisma.layanan.update({
      where: { id: req.params.id },
      data,
    })
    res.json(layanan)
  } catch (e) {
    res.status(409).json({ error: 'Layanan dengan nama tersebut sudah ada' })
  }
})

// Admin: delete
layananRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.layanan.delete({ where: { id: req.params.id } })
  res.status(204).end()
})