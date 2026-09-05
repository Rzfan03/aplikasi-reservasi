import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import StatusBadge from '@/components/StatusBadge'
import { fetchRequest, updateStatus } from '@/lib/api'
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
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const found = await fetchRequest(id)
      setItem(found)
    } catch {} finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleStatus(status: Status) {
    if (!id) return
    if (status === 'REJECTED') {
      setRejectReason('')
      setRejectOpen(true)
      return
    }
    await updateStatus(id, status)
    load()
  }

  async function handleReject() {
    if (!id || !rejectReason.trim()) return
    setSaving(true)
    try {
      await updateStatus(id, 'REJECTED', rejectReason.trim())
      setRejectOpen(false)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
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
          {item.status === 'REJECTED' && item.rejectReason && (
            <div className="mt-2 rounded-md border-l-4 border-destructive bg-destructive/10 p-3">
              <p className="text-sm font-semibold text-destructive">Alasan penolakan</p>
              <p className="mt-1 text-sm text-foreground">{item.rejectReason}</p>
            </div>
          )}
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

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Permohonan</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Alasan penolakan <span className="text-destructive">*</span></Label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Tuliskan alasan yang akan dilihat pemohon"
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/30 outline-none transition-colors resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleReject} disabled={saving || !rejectReason.trim()}>
              {saving ? 'Menyimpan…' : 'Tolak Permohonan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
