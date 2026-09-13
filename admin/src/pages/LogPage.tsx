import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollText, Terminal, RefreshCw, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchLogs, logsSseUrl, getToken, type LogLevel, type SystemLog } from '@/lib/api'

const LEVEL_STYLES: Record<LogLevel, { badge: string; border: string }> = {
  error: { badge: 'bg-destructive/10 text-destructive border-destructive/30', border: 'border-l-destructive' },
  warn: { badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400 border-l-amber-500', border: 'border-l-amber-500' },
  info: { badge: 'bg-primary/10 text-primary border-primary/30', border: 'border-l-primary' },
  log: { badge: 'bg-muted text-muted-foreground border-border', border: 'border-l-border' },
}

const LEVEL_LABEL: Record<LogLevel, string> = { error: 'Error', warn: 'Warn', info: 'Info', log: 'Log' }

const SOURCE_STYLES: Record<string, string> = {
  wa: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  be: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-300',
  fe: 'bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400',
  email: 'bg-sky-500/10 text-sky-600 border-sky-500/30 dark:text-sky-400',
  vite: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
}

const MAX_LOGS = 500
type Filter = 'all' | LogLevel

export default function LogPage() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const idsRef = useRef(new Set<number>())

  const refresh = useCallback(async () => {
    try {
      const res = await fetchLogs()
      idsRef.current = new Set(res.map((l) => l.id))
      setLogs(res)
    } catch {}
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    let es: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retries = 0
    let closed = false
    let gen = 0

    const connect = () => {
      const g = ++gen
      getToken()
        .then((token) => {
          if (g !== gen || closed) return
          es?.close()
          const next = new EventSource(`${logsSseUrl()}?token=${token}`)
          es = next
          next.onopen = () => {
            retries = 0
            setLive(true)
          }
          next.onmessage = (e) => {
            try {
              const d = JSON.parse(e.data)
              if (d.type !== 'log' || !d.entry || typeof d.entry.id !== 'number') return
              const entry = d.entry as SystemLog
              setLogs((cur) => {
                if (idsRef.current.has(entry.id)) return cur
                idsRef.current.add(entry.id)
                const nextArr = [entry, ...cur]
                if (nextArr.length > MAX_LOGS) {
                  nextArr.length = MAX_LOGS
                  idsRef.current = new Set(nextArr.map((l) => l.id))
                }
                return nextArr
              })
            } catch {}
          }
          next.onerror = () => {
            next.close()
            if (es === next) es = null
            setLive(false)
            retries++
            retryTimer = setTimeout(connect, Math.min(3000 * retries, 30000))
          }
        })
        .catch(() => {})
    }
    connect()

    return () => {
      closed = true
      gen++
      es?.close()
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [refresh])

  const visible = useMemo(
    () => (filter === 'all' ? logs : logs.filter((l) => l.level === filter)),
    [logs, filter],
  )

  const count = (level: Filter) => (level === 'all' ? logs.length : logs.filter((l) => l.level === level).length)
  const fmt = (ts: number) =>
    new Date(ts).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="size-4" />
            Log Sistem
            <span
              className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                live ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className={`size-1.5 rounded-full ${live ? 'animate-pulse bg-emerald-500' : 'bg-muted-foreground'}`} />
              {live ? 'LIVE' : 'menyambung…'}
            </span>
          </CardTitle>
          <CardDescription>
            Streaming realtime dari proses server (SSE). Tag sumber: <code className="rounded bg-muted px-1">[be]</code>{' '}
            backend (HTTP/console), <code className="rounded bg-muted px-1">[wa]</code> WhatsApp,{' '}
            <code className="rounded bg-muted px-1">[fe]</code> error browser,{' '}
            <code className="rounded bg-muted px-1">[email]</code>. Buffer di memori &mdash; kosong saat server dimulai ulang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <Filter className="mr-1 size-3.5 text-muted-foreground" />
            {(['all', 'error', 'warn', 'info', 'log'] as Array<Filter | LogLevel>).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {f === 'all' ? 'Semua' : LEVEL_LABEL[f]}
                <span className={filter === f ? 'opacity-80' : 'text-muted-foreground/70'}>{count(f)}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => refresh()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            >
              <RefreshCw className="size-3" /> Muat ulang
            </button>
          </div>

          {loading && logs.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
              <Terminal className="mx-auto mb-2 size-6 opacity-40" />
              Belum ada log untuk filter ini.
            </div>
          ) : (
            <div className="max-h-[68vh] space-y-1.5 overflow-y-auto pr-1">
              {visible.map((l) => {
                const st = LEVEL_STYLES[l.level]
                return (
                  <div
                    key={l.id}
                    className={`rounded-md border border-l-2 bg-muted/30 ${st.border} px-3 py-2`}
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="w-[6.5rem] text-xs tabular-nums text-muted-foreground" title={new Date(l.ts).toLocaleString('id-ID')}>
                        {fmt(l.ts)}
                      </span>
                      <Badge variant="outline" className={`px-1.5 py-0 text-[10px] font-semibold ${st.badge}`}>
                        {LEVEL_LABEL[l.level]}
                      </Badge>
                      <span
                        className={`rounded border px-1 py-0 font-mono text-[10px] uppercase tracking-wide ${SOURCE_STYLES[l.source] ?? 'border-border bg-muted text-muted-foreground'}`}
                      >
                        {l.source === 'be' ? '[be]' : `[${l.source}]`}
                      </span>
                    </div>
                    <p className="mt-0.5 break-words font-mono text-xs leading-relaxed text-foreground">{l.message}</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}