import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BellRing,
  Check,
  ClipboardList,
  FileText,
  History,
  Inbox,
  Loader2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import StatusBadge from '@/components/StatusBadge'
import { fetchRequests, getToken, sseUrl, updateStatus } from '@/lib/api'
import { type RequestData, type Status } from '@/lib/types'
import { cn } from '@/lib/utils'

type Filter = Status | 'ALL'

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<RequestData[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<RequestData | null>(null)
  const [notif, setNotif] = useState('')
  const [notifs, setNotifs] = useState<RequestData[]>([])

  const load = useCallback(async (f: Filter) => {
    setLoading(true)
    setError('')
    try {
      setRequests(await fetchRequests(f === 'ALL' ? undefined : f))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(filter)
  }, [filter, load])

  useEffect(() => {
    let es: EventSource | null = null
    let mounted = true
    ;(async () => {
      const token = await getToken()
      if (!token || !mounted) return
      es = new EventSource(`${sseUrl()}?token=${encodeURIComponent(token)}`)
      es.onmessage = (event) => {
        if (!mounted) return
        const payload: { type?: string; data?: Partial<RequestData> } = JSON.parse(event.data)
        if (payload.type === 'new_request' && payload.data?.nama) {
          setNotifs((prev) => [payload.data as RequestData, ...prev].slice(0, 5))
          setNotif(`Permohonan baru dari ${payload.data!.nama} (${payload.data!.layanan})`)
          load(filter)
        }
      }
      es.onerror = () => es?.close()
    })()
    return () => {
      mounted = false
      es?.close()
    }
  }, [filter, load])

  const stats = useMemo(() => {
    const count = (s: Status) => requests.filter((r) => r.status === s).length
    return {
      total: requests.length,
      pending: count('PENDING'),
      approved: count('APPROVED'),
      rejected: count('REJECTED'),
    }
  }, [requests])

  const last7Days = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - i))
      return d
    })
    const counts = days.map((d) => {
      const next = new Date(d)
      next.setDate(d.getDate() + 1)
      const n = requests.filter((r) => {
        const t = new Date(r.tanggal)
        return t >= d && t < next
      }).length
      return { day: d.getDay(), count: n }
    })
    const max = Math.max(1, ...counts.map((c) => c.count))
    return { counts, max }
  }, [requests])

  const attach = (r: RequestData) =>
    `${import.meta.env.VITE_API_URL}/uploads/${r.pdfFile}`

  const decide = async (r: RequestData, status: Status) => {
    try {
      const updated = await updateStatus(r.id, status)
      setRequests((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      setSelected((cur) => (cur?.id === updated.id ? updated : cur))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status')
    }
  }

  const recent = useMemo(
    () =>
      [...requests]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [requests]
  )

  const statCards = useMemo(
    () => [
      {
        label: 'Total permohonan',
        value: stats.total,
        icon: Users,
        cls: 'bg-primary text-primary-foreground',
      },
      {
        label: 'Menunggu keputusan',
        value: stats.pending,
        icon: Inbox,
        cls: 'bg-warning text-warning-foreground',
      },
      {
        label: 'Disetujui',
        value: stats.approved,
        icon: Check,
        cls: 'bg-primary/10 text-primary',
      },
      {
        label: 'Ditolak',
        value: stats.rejected,
        icon: X,
        cls: 'bg-destructive/10 text-destructive',
      },
    ],
    [stats]
  )

  return (
    <main className="min-w-0 p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola permohonan layanan yang masuk.
            </p>
          </div>
          {notif && (
            <div className="flex max-w-md items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
              <BellRing className="size-4 shrink-0 text-primary" />
              <span className="line-clamp-1">{notif}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 size-6 p-0"
                onClick={() => setNotif('')}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg',
                    s.cls
                  )}
                >
                  <s.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">
                  {loading ? '…' : s.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4" />
                Permohonan per hari
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              ) : (
                <div className="flex h-32 items-end gap-2">
                  {last7Days.counts.map((c, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-1"
                      title={`${c.count} permohonan`}
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {c.count}
                      </div>
                      <div
                        className={cn(
                          'w-full rounded-t-md',
                          i === 6 ? 'bg-primary' : 'bg-primary/30'
                        )}
                        style={{
                          height: `${(c.count / last7Days.max) * 100}%`,
                          minHeight: c.count > 0 ? '0.5rem' : '2px',
                        }}
                      />
                      <div className="text-xs text-muted-foreground">
                        {
                          ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][
                            c.day
                          ]
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4" />
                Permintaan terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Memuat…
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <Inbox className="size-8" />
                  <p>Belum ada permintaan.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {recent.map((r) => (
                    <li key={r.id} className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {r.nama
                          .split(' ')
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.nama}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.layanan} · {formatTanggal(r.tanggal)}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="size-4" />
              Daftar Permohonan
            </CardTitle>
            {notifs.length > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {notifs.length} baru
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Select value={filter} onValueChange={(v: Filter) => setFilter(v)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Memuat…
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Inbox className="size-8" />
                <p>Belum ada permohonan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.nama}</TableCell>
                        <TableCell>{r.dinas}</TableCell>
                        <TableCell>{r.layanan}</TableCell>
                        <TableCell>{formatTanggal(r.tanggal)}</TableCell>
                        <TableCell>
                          <StatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelected(r)}
                            >
                              <FileText className="size-4" />
                              Detail
                            </Button>
                            {r.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => decide(r, 'APPROVED')}
                                >
                                  <Check className="size-4" />
                                  Setujui
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => decide(r, 'REJECTED')}
                                >
                                  <X className="size-4" />
                                  Tolak
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Permohonan</DialogTitle>
            <DialogDescription>
              Permohonan yang diajukan, lengkap dengan lampiran.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <DetailRow label="Nama" value={selected.nama} />
              <DetailRow label="NIP" value={selected.nip} />
              <DetailRow label="Jabatan" value={selected.jabatan} />
              <DetailRow label="Unit" value={selected.dinas} />
              <DetailRow label="Layanan" value={selected.layanan} />
              <DetailRow label="Tanggal" value={formatTanggal(selected.tanggal)} />
              <DetailRow label="Deskripsi" value={selected.deskripsi || '-'} />
              <DetailRow label="Status" value={<StatusBadge status={selected.status} />} />
              {selected.adminEmail && (
                <DetailRow label="Diperbarui oleh" value={selected.adminEmail} />
              )}
              <a
                href={attach(selected)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
              >
                <FileText className="size-4" />
                Buka lampiran PDF
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words">{value}</span>
    </div>
  )
}