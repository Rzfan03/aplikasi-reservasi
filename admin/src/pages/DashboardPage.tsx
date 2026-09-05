import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardCheck,
  Clock,
  FileText,
  Inbox,
  CheckCircle2,
  FilePlus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCheck,
  BarChart2,
  Flame,
  TrendingUp,
  CalendarDays,
} from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import KpiCard from '@/components/KpiCard'
import SectionCards from '@/components/SectionCards'
import StatusChart from '@/components/StatusChart'
import ActivityAreaChart from '@/components/ActivityAreaChart'
import WattVisionAlert from '@/components/WattVisionAlert'
import { Button } from '@/components/ui/button'
import { fetchStats, fetchRequestsPaged, getToken, sseUrl } from '@/lib/api'
import { type RequestData, type StatsData } from '@/lib/types'
import { useNotificationStore } from '@/hooks/useNotificationStore'

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  const days = Math.floor(hrs / 24)
  return `${days} hari lalu`
}

function formatDateHeader() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const KPI_CARDS = [
  {
    key: 'total' as const,
    title: 'Total Permohonan',
    icon: ClipboardCheck,
    color: 'bg-primary/15 text-primary',
  },
  {
    key: 'pending' as const,
    title: 'Menunggu Tindakan',
    icon: Clock,
    color: 'bg-warning/15 text-warning',
  },
  {
    key: 'approved' as const,
    title: 'Disetujui',
    icon: CheckCircle2,
    color: 'bg-success/15 text-success',
  },
  {
    key: 'today' as const,
    title: 'Masuk Hari Ini',
    icon: FilePlus,
    color: 'bg-secondary/15 text-secondary',
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [recent, setRecent] = useState<RequestData[]>([])
  const [pendingList, setPendingList] = useState<RequestData[]>([])
  const [loading, setLoading] = useState(true)
  const addNotif = useNotificationStore((s) => s.add)
  const navigate = useNavigate()

  const loadStats = useCallback(async () => {
    try {
      const [s, p, pend] = await Promise.all([
        fetchStats(),
        fetchRequestsPaged({ limit: 5, page: 1 }),
        fetchRequestsPaged({ status: 'PENDING', limit: 4, page: 1 }),
      ])
      setStats(s)
      setRecent(p.data)
      setPendingList(pend.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()

    const callbacks = { onCreated: loadStats, onStatusChanged: loadStats }
    const refs = { current: callbacks }
    refs.current = callbacks

    let es: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retries = 0
    const MAX_RETRIES = 5

    function connect() {
      getToken()
        .then((token) => {
          const url = `${sseUrl()}?token=${token}`
          es = new EventSource(url)

          es.onmessage = (e) => {
            try {
              const data = JSON.parse(e.data)
              if (data.type === 'request_created') {
                addNotif({
                  id: crypto.randomUUID(),
                  title: 'Permohonan Baru',
                  message: `${data.nama} dari ${data.instansi}`,
                  createdAt: new Date().toISOString(),
                  requestId: data.id,
                })
                refs.current.onCreated()
              }
              if (data.type === 'status_changed') {
                addNotif({
                  id: crypto.randomUUID(),
                  title: 'Status Diperbarui',
                  message: `${data.nama} → ${data.status}`,
                  createdAt: new Date().toISOString(),
                  requestId: data.id,
                })
                refs.current.onStatusChanged()
              }
            } catch {}
          }

          es.onerror = () => {
            es?.close()
            es = null
            retries++
            if (retries < MAX_RETRIES) {
              const delay = Math.min(3000 * retries, 30000)
              retryTimer = setTimeout(connect, delay)
            }
          }

          retries = 0
        })
        .catch(() => {})
    }

    connect()

    return () => {
      es?.close()
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [loadStats, addNotif])

  const WEEKLY_DATA = [
    { date: 'Sen', count: 8 },
    { date: 'Sel', count: 12 },
    { date: 'Rab', count: 6 },
    { date: 'Kam', count: 15 },
    { date: 'Jum', count: 10 },
    { date: 'Sab', count: 3 },
    { date: 'Min', count: 1 },
  ]

  const weeklyTotal = WEEKLY_DATA.reduce((s, d) => s + d.count, 0)
  const weeklyAvg = Math.round(weeklyTotal / WEEKLY_DATA.length)
  const busiestDay = WEEKLY_DATA.reduce((best, d) => (d.count > best.count ? d : best), WEEKLY_DATA[0])
  const activeDays = WEEKLY_DATA.filter((d) => d.count > 0).length

  const WEEKLY_CARDS = [
    {
      label: 'Total Minggu Ini',
      value: weeklyTotal.toLocaleString('id-ID'),
      sub: '7 hari terakhir',
      icon: BarChart2,
      color: 'bg-primary/10 text-primary',
      iconColor: 'text-primary',
    },
    {
      label: 'Rata-rata / Hari',
      value: weeklyAvg.toLocaleString('id-ID'),
      sub: 'permohonan per hari',
      icon: TrendingUp,
      color: 'bg-success/10 text-success',
      iconColor: 'text-success',
    },
    {
      label: 'Hari Tersibuk',
      value: busiestDay.date,
      sub: `${busiestDay.count} permohonan`,
      icon: Flame,
      color: 'bg-warning/10 text-warning',
      iconColor: 'text-warning',
    },
    {
      label: 'Hari Aktif',
      value: String(activeDays),
      sub: 'dari 7 hari',
      icon: CalendarDays,
      color: 'bg-secondary/10 text-secondary',
      iconColor: 'text-secondary',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{formatDateHeader()}</p>
        </div>
        <button
          onClick={() => { setLoading(true); loadStats() }}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <RefreshCw className="size-3.5" />
          <span className="hidden sm:inline">Perbarui</span>
        </button>
      </div>

      {/* ── Alert ── */}
      {!loading && (stats?.pending ?? 0) > 0 && (
        <WattVisionAlert
          variant="warning"
          title={`${stats!.pending} permohonan menunggu tindakan`}
          message="Segera tinjau dan proses permohonan yang belum ditindaklanjuti."
        />
      )}

      {/* ── 4 Weekly Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {WEEKLY_CARDS.map((c) => (
          <div key={c.label} className="relative flex flex-col gap-2 rounded-xl border border-border bg-card p-5 overflow-hidden">
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold tabular-nums text-foreground leading-none">{c.value}</p>
            </div>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
            {/* large icon bg */}
            <c.icon
              className={`pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 size-20 rotate-12 opacity-[0.15] ${c.iconColor}`}
            />
          </div>
        ))}
      </div>

      {/* ── KPI Row (4 kartu) ── */}
      <SectionCards loading={loading}>
        {stats && KPI_CARDS.map((card) => (
          <KpiCard
            key={card.key}
            title={card.title}
            value={stats[card.key] ?? 0}
            icon={<card.icon className="size-4" />}
            color={card.color}
          />
        ))}
      </SectionCards>

      {/* ── Main: Chart (8 col) + Sidebar (4 col) ── */}
      <div className="grid gap-4 lg:grid-cols-12">

        {/* Chart area — 8 kolom */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-6 h-full">
              <div className="h-4 w-40 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-56 bg-muted animate-pulse rounded mb-6" />
              <div className="h-[220px] w-full bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <ActivityAreaChart data={WEEKLY_DATA} />
          )}
        </div>

        {/* Sidebar — 4 kolom: Status chart + Perlu Tindakan */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Status donut */}
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-4 w-32 bg-muted animate-pulse rounded mb-4" />
              <div className="flex justify-center mb-4">
                <div className="size-28 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-full bg-muted animate-pulse rounded" />
                    <div className="h-2 w-full bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : stats ? (
            <StatusChart
              pending={stats.pending}
              approved={stats.approved}
              rejected={stats.rejected}
            />
          ) : null}

          {/* Perlu Tindakan */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex-1">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-3.5 text-warning shrink-0" />
                <span className="text-sm font-semibold text-foreground">Perlu Tindakan</span>
              </div>
              <button
                onClick={() => navigate('/permohonan')}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Semua <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="px-1 py-1">
              {loading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                      <div className="size-8 rounded-lg bg-muted animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                        <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-1.5 text-muted-foreground">
                  <CheckCheck className="size-5 text-success" />
                  <p className="text-xs font-medium text-foreground">Semua beres!</p>
                  <p className="text-[11px] text-center">Tidak ada permohonan pending</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {pendingList.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/permohonan/${r.id}`)}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                        <Clock className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground">{r.nama}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{formatRelative(r.createdAt)}</p>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loading && pendingList.length > 0 && (
              <div className="px-3 py-2.5 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-8"
                  onClick={() => navigate('/permohonan')}
                >
                  Proses Semua
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Recent Permohonan (full width) ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Permohonan Terbaru</span>
          </div>
          <button
            onClick={() => navigate('/permohonan')}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Lihat Semua <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="px-2 py-2">
          {loading ? (
            <div className="space-y-1 px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-3">
                  <div className="size-9 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-36 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Inbox className="size-8" />
              <p className="text-sm font-medium text-foreground">Belum ada permohonan</p>
              <p className="text-xs">Data akan muncul ketika ada permohonan masuk</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/permohonan/${r.id}`)}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{r.nama}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {r.instansi}
                      <span className="mx-1.5 opacity-40">·</span>
                      {r.layanan}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatTanggal(r.createdAt)}, {formatTime(r.createdAt)}
                    </span>
                  </div>
                  <div className="sm:hidden shrink-0">
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
