import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_LAYANAN = [
  { nama: 'Pelayanan Sosialisasi dan Informasi Publik', urutan: 1 },
  { nama: 'Pelayanan Radio Pemda', urutan: 2 },
  { nama: 'Pelayanan Konsultasi Media', urutan: 3 },
  { nama: 'Pelayanan Pengaduan', urutan: 4 },
  { nama: 'Pelayanan Nama Domain dan Subdomain', urutan: 5 },
  { nama: 'Pelayanan Media Daring/Zoom Meeting', urutan: 6 },
  { nama: 'Pelayanan Internet', urutan: 7 },
  { nama: 'Pelayanan Jaringan Telekomunikasi', urutan: 8 },
  { nama: 'Pelayanan Aplikasi dan Digitalisasi', urutan: 9 },
  { nama: 'Pelayanan Konsultasi Statistik', urutan: 10 },
  { nama: 'Pelayanan Metadata Statistik', urutan: 11 },
  { nama: 'Pelayanan Rekomendasi Survei Statistik Sektoral', urutan: 12 },
  { nama: 'Pelayanan Referensi Statistik', urutan: 13 },
  { nama: 'Pelayanan Literasi Keamanan Informasi', urutan: 14 },
  { nama: 'Pelayanan Sertifikasi Tanda Tangan Elektronik', urutan: 15 },
  { nama: 'Pelayanan Permohonan Data dan Informasi Statistik', urutan: 16 },
]

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email },
  })
  console.log(`Seeded admin: ${admin.email}`)

  for (const l of DEFAULT_LAYANAN) {
    const layanan = await prisma.layanan.upsert({
      where: { nama: l.nama },
      update: { urutan: l.urutan },
      create: l,
    })
    console.log(`Seeded layanan: ${layanan.nama}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })