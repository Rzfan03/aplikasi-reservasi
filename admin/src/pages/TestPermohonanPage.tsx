import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Wand2, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchLayanan, fetchInstansi } from '@/lib/api'
import type { InstansiData, LayananData } from '@/lib/types'

const API = import.meta.env.VITE_API_URL

function makePdf(text: string): Blob {
  const safe = text.replace(/[()\\]/g, '')
  const content = `BT /F1 14 Tf 40 780 Td (${safe}) Tj ET`
  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${content.length}>>stream
${content}
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R/Size 5>>
%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

const NAMES = ['Rizki', 'Andi', 'Budi', 'Citra', 'Dewi', 'Eka', 'Farhan', 'Gita']
const JABATAN = ['Analis TI', 'Pranata Komputer', 'Staf Pelayanan', 'Kepala Seksi', 'Operator Komputer']

function randomNip() {
  return `1987${[...Array(10)].map(() => Math.floor(Math.random() * 10)).join('')}`
}

export default function TestPermohonanPage() {
  const [layanan, setLayanan] = useState<LayananData[]>([])
  const [instansi, setInstansi] = useState<InstansiData[]>([])
  const [form, setForm] = useState({
    instansi: '',
    nama: '',
    nip: '',
    jabatan: '',
    layanan: '',
    tanggal: new Date().toISOString().slice(0, 10),
    deskripsi: 'Permohonan percobaan realtime',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ id: string; statusToken: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([fetchLayanan(), fetchInstansi()])
      .then(([l, i]) => {
        setLayanan(l)
        setInstansi(i)
        setForm((f) => ({
          ...f,
          layanan: f.layanan || l[0]?.nama || '',
          instansi: f.instansi || i[0]?.nama || '',
        }))
      })
      .catch(() => {})
  }, [])

  function patch(p: Partial<typeof form>) {
    setForm((f) => ({ ...f, ...p }))
  }

  function randomize() {
    patch({
      instansi: instansi[Math.floor(Math.random() * instansi.length)]?.nama || form.instansi,
      layanan: layanan[Math.floor(Math.random() * layanan.length)]?.nama || form.layanan,
      nama: `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${NAMES[Math.floor(Math.random() * NAMES.length)]}`,
      nip: randomNip(),
      jabatan: JABATAN[Math.floor(Math.random() * JABATAN.length)],
      tanggal: new Date().toISOString().slice(0, 10),
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('instansi', form.instansi)
      fd.append('nama', form.nama)
      fd.append('nip', form.nip)
      fd.append('jabatan', form.jabatan)
      fd.append('layanan', form.layanan)
      fd.append('tanggal', form.tanggal)
      fd.append('deskripsi', form.deskripsi)
      fd.append('pdf', makePdf(`Surat Permohonan ${form.nama}`), 'permohonan-uji.pdf')
      const res = await fetch(`${API}/api/requests`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Gagal mengirim permohonan')
      setResult(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim permohonan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Test Permohonan</h1>
        <p className="text-sm text-muted-foreground">
          Simulasi pemohon mengirim permohonan. Buka Dashboard atau /test-notif di tab lain untuk melihat event broadcast realtime.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Permohonan Uji</CardTitle>
          <CardDescription>PDF dibangkitkan otomatis di browser — tidak perlu upload manual</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input value={form.nama} onChange={(e) => patch({ nama: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Instansi</Label>
                <Select value={form.instansi} onValueChange={(v) => patch({ instansi: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih instansi" /></SelectTrigger>
                  <SelectContent>
                    {instansi.map((i) => <SelectItem key={i.id} value={i.nama}>{i.nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>NIP</Label>
                <Input value={form.nip} onChange={(e) => patch({ nip: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Jabatan</Label>
                <Input value={form.jabatan} onChange={(e) => patch({ jabatan: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Layanan</Label>
                <Select value={form.layanan} onValueChange={(v) => patch({ layanan: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih layanan" /></SelectTrigger>
                  <SelectContent>
                    {layanan.map((l) => <SelectItem key={l.id} value={l.nama}>{l.nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={form.tanggal} onChange={(e) => patch({ tanggal: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Deskripsi</Label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => patch({ deskripsi: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/30 outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border-l-4 border-destructive p-3 text-sm text-destructive">{error}</div>
            )}

            {result && (
              <div className="rounded-md border border-success/30 bg-success/10 p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">Permohonan terkirim!</p>
                <p className="text-xs text-muted-foreground break-all">
                  ID: <code className="text-foreground">{result.id}</code>
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  Token: <code className="text-foreground">{result.statusToken}</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Event <code>request_created</code> sudah di-broadcast — cek notifikasi di tab lain.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/permohonan/${result.id}`)}>
                    <Link2 className="mr-2 size-3.5" /> Buka detail
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setResult(null)}>Isi form lagi</Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                <Send className="mr-2 size-4" /> {submitting ? 'Mengirim…' : 'Kirim Permohonan Uji'}
              </Button>
              <Button type="button" variant="outline" onClick={randomize}>
                <Wand2 className="mr-2 size-4" /> Acak data
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}