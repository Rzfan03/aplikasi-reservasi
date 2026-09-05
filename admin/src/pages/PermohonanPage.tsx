import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, ClipboardList, Download, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import StatusBadge from '@/components/StatusBadge'
import { fetchRequestsPaged, bulkUpdateStatus } from '@/lib/api'
import { type RequestData, type Status, STATUS_LABEL } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

type Filter = Status | 'ALL'

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function csv(rows: Record<string, string>[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const cols = ['Nama', 'Instansi', 'NIP', 'Jabatan', 'Layanan', 'Tanggal', 'Status', 'Diajukan']
  const lines = [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c] ?? '')).join(';'))]
  return '\uFEFF' + lines.join('\n')
}

export default function PermohonanPage() {
  const [data, setData] = useState<RequestData[]>([])
  const [total, setTotal] = useState(1)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const navigate = useNavigate()
  const LIMIT = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchRequestsPaged({
        status: filter === 'ALL' ? undefined : (filter as Status),
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: LIMIT,
      })
      setData(res.data)
      setTotal(res.total)
      setSelectedIds(new Set())
    } catch {} finally {
      setLoading(false)
    }
  }, [filter, page, search, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  async function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  async function handleToggleAll() {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map((r) => r.id)))
    }
  }

  async function handleBulkApprove() {
    if (!selectedIds.size) return
    setBulkLoading(true)
    try {
      await bulkUpdateStatus([...selectedIds], 'APPROVED')
      setSelectedIds(new Set())
      load()
    } catch {} finally {
      setBulkLoading(false)
    }
  }

  async function handleBulkReject() {
    if (!selectedIds.size) return
    if (!window.confirm('Tolak semua permohonan yang dipilih?')) return
    setBulkLoading(true)
    try {
      await bulkUpdateStatus([...selectedIds], 'REJECTED', 'Ditolak admin')
      setSelectedIds(new Set())
      load()
    } catch {} finally {
      setBulkLoading(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetchRequestsPaged({
        status: filter === 'ALL' ? undefined : (filter as Status),
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: 1,
        limit: 10000,
      })
      const rows = res.data.map((r) => ({
        Nama: r.nama,
        Instansi: r.instansi,
        NIP: r.nip,
        Jabatan: r.jabatan,
        Layanan: r.layanan,
        Tanggal: formatTanggal(r.tanggal),
        Status: STATUS_LABEL[r.status],
        Diajukan: new Date(r.createdAt).toLocaleString('id-ID'),
      }))
      const blob = new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `permohonan-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {} finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Permohonan</h1>
        <p className="text-sm text-muted-foreground">Daftar permohonan masuk</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleAll}
          className="shrink-0"
          title="Pilih Semua"
        >
          <CheckCircle2 className="size-4" />
        </Button>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, instansi, NIP…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          className="w-[150px]"
          aria-label="Tanggal mulai"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          className="w-[150px]"
          aria-label="Tanggal akhir"
        />
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setDateFrom(''); setDateTo(''); setPage(1) }}
          >
            Reset tanggal
          </Button>
        )}
        <Select value={filter} onValueChange={(v) => { setFilter(v as Filter); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="PENDING">Menunggu</SelectItem>
            <SelectItem value="APPROVED">Disetujui</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 size-4" /> {exporting ? 'Menyiapkan…' : 'Export CSV'}
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} dipilih</span>
          <Button size="sm" onClick={handleBulkApprove} disabled={bulkLoading}>
            <CheckCircle2 className="mr-1.5 size-4" /> Setujui Semua
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkReject} disabled={bulkLoading}>
            <XCircle className="mr-1.5 size-4" /> Tolak Semua
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-10 w-10 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="mb-3 size-8" />
              <p>Tidak ada data</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
               {data.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-muted transition-colors cursor-pointer ${selectedIds.has(r.id) ? 'bg-muted/50' : ''}`}
                  onClick={() => navigate(`/permohonan/${r.id}`)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.id)}
                    onChange={() => handleToggle(r.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">{r.nama}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.instansi} · {r.layanan} · {formatTanggal(r.tanggal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    <Button size="sm" variant="ghost" className="shrink-0" onClick={(e) => { e.stopPropagation(); navigate(`/permohonan/${r.id}`) }}>
                      <FileText className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Halaman {page} / {totalPages} ({total} data)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
