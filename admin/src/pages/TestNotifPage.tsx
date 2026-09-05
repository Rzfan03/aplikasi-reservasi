import { useContext, useEffect, useState } from 'react'
import { Radio, Send, CheckCheck, Eraser, BellRing, Bell, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { NotifContext } from '@/components/NotifProvider'
import { useNotificationStore } from '@/hooks/useNotificationStore'
import { getToken, sseUrl } from '@/lib/api'

type LogEntry = { time: string; type: string; title: string }

export default function TestNotifPage() {
  const [connected, setConnected] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const items = useNotificationStore((s) => s.items)
  const unread = useNotificationStore((s) => s.unread)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const clear = useNotificationStore((s) => s.clear)
  const { show, requestPermission } = useContext(NotifContext)

  useEffect(() => {
    let es: EventSource | null = null
    let cancelled = false
    const push = (type: string, title: string) =>
      setLog((prev) => [...prev, { time: new Date().toLocaleTimeString('id-ID'), type, title }].slice(-20))

    getToken().then((token) => {
      if (cancelled || !token) return
      es = new EventSource(`${sseUrl()}?token=${token}`)
      es.onopen = () => setConnected(true)
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'request_created') push(data.type, `${data.nama} dari ${data.instansi}`)
          else if (data.type === 'status_changed') push(data.type, `${data.nama} → ${data.status}`)
          else push(data.type, JSON.stringify(data))
        } catch {}
      }
      es.onerror = () => {
        setConnected(false)
        es?.close()
      }
    })

    return () => {
      cancelled = true
      es?.close()
    }
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Test Notif</h1>
        <p className="text-sm text-muted-foreground">
          Pantau event SSE realtime dan pipeline notifikasi (zustand + BroadcastChannel). Kirim permohonan dari
          /test-permohonan di tab lain lalu lihat eventnya muncul di sini secara live.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="size-4 text-primary" />
              Event Realtime (SSE)
            </CardTitle>
            <CardDescription>
              {connected ? (
                <span className="flex items-center gap-1.5 text-success">
                  <Wifi className="size-3.5" /> Terhubung
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-destructive">
                  <WifiOff className="size-3.5" /> Tidak terhubung
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {log.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Belum ada event. Kirim permohonan uji untuk memicu <code>request_created</code>.</p>
            ) : (
              <div className="space-y-1.5">
                {log.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs rounded-md border border-border bg-muted/30 px-3 py-2">
                    <span className="text-muted-foreground tabular-nums">{l.time}</span>
                    <code className="text-primary">{l.type}</code>
                    <span className="text-foreground truncate">{l.title}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="size-4 text-primary" />
              Pipeline Notifikasi
            </CardTitle>
            <CardDescription>
              {unread} belum dibaca · {items.length} total (cross-tab via BroadcastChannel)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => show('Notif Uji', `Dikirim dari /test-notif ${new Date().toLocaleTimeString('id-ID')}`)}>
                <Send className="mr-2 size-3.5" /> Kirim notif uji
              </Button>
              <Button size="sm" variant="outline" onClick={() => requestPermission()}>
                <BellRing className="mr-2 size-3.5" /> Izin browser
              </Button>
              <Button size="sm" variant="outline" onClick={markAllRead}>
                <CheckCheck className="mr-2 size-3.5" /> Tandai terbaca
              </Button>
              <Button size="sm" variant="ghost" onClick={clear}>
                <Eraser className="mr-2 size-3.5" /> Bersihkan
              </Button>
            </div>

            <div className="rounded-md border border-border overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
                <span className="text-xs font-semibold text-foreground">Riwayat notifikasi</span>
                <span className="text-[10px] text-muted-foreground">{items.length} item</span>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-center">
                  <Bell className="mb-3 size-8" />
                  <p>Belum ada notifikasi</p>
                  <p className="text-xs mt-1">Badge di sidebar akan naik saat notif masuk</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-start gap-2.5 px-3 py-2.5 text-xs">
                      <span className={`mt-1 size-2 shrink-0 rounded-full ${it.read ? 'bg-muted-foreground/40' : 'bg-primary'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground font-medium truncate">{it.title}</p>
                        <p className="text-muted-foreground truncate">{it.message}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                        {new Date(it.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}