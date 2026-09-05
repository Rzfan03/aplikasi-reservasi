export type Status = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface RequestData {
  id: string
  instansi: string
  nama: string
  nip: string
  jabatan: string
  layanan: string
  tanggal: string
  deskripsi?: string | null
  pdfFile: string
  status: Status
  statusToken: string
  adminEmail?: string | null
  createdAt: string
  updatedAt: string
}

export interface LayananData {
  id: string
  nama: string
  urutan: number
  createdAt: string
}

export interface InstansiData {
  id: string
  nama: string
  createdAt: string
}

export interface StatsData {
  total: number
  pending: number
  approved: number
  rejected: number
  today: number
}

export const STATUS_LABEL: Record<Status, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
}
