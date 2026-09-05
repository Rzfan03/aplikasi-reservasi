import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import { fetchRequestsPaged, updateStatus } from '@/lib/api'
import type { RequestData, Status } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3 py-1.5">
      <span className="w-28 sm:w-32 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words text-sm text-foreground">{value}</span>
    </div>
  )
}

function attach(r: RequestData) {
  const API = import.meta.env.VITE_API_URL
  return `${API}/uploads/${r.pdfFile}`
}

export default function PermohonanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<RequestData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetchRequestsPaged({ limit: 100 })
      const found = res.data.find((r) => r.id === id)
      if (found) setItem(found)
    } catch {} finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleStatus(status: Status) {
    if (!id) return
    await updateStatus(id, status)
    load()
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-7 w-48" />
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <p className="text-muted-foreground">Data tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => navigate('/permohonan')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Detail Permohonan</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="truncate text-foreground">{item.nama}</span>
            <StatusBadge status={item.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <DetailRow label="Instansi" value={item.instansi} />
          <DetailRow label="NIP" value={item.nip} />
          <DetailRow label="Jabatan" value={item.jabatan} />
          <DetailRow label="Layanan" value={item.layanan} />
          <DetailRow label="Tanggal" value={new Date(item.tanggal).toLocaleDateString('id-ID')} />
          <DetailRow label="Deskripsi" value={item.deskripsi || '-'} />
          {item.adminEmail && <DetailRow label="Diperbarui oleh" value={item.adminEmail} />}
          <div className="pt-2">
            <a
              href={attach(item)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dim"
            >
              <FileText className="size-4" />
              Buka lampiran PDF
            </a>
          </div>
        </CardContent>
      </Card>

      {item.status === 'PENDING' && (
        <div className="flex gap-3">
          <Button onClick={() => handleStatus('APPROVED')}>
            <Check className="mr-2 size-4" /> Setujui
          </Button>
          <Button variant="destructive" onClick={() => handleStatus('REJECTED')}>
            <X className="mr-2 size-4" /> Tolak
          </Button>
        </div>
      )}
    </div>
  )
}
