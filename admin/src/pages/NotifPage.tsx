import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotificationStore } from '@/hooks/useNotificationStore'
import { useNavigate } from 'react-router-dom'

function formatWaktu(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function NotifPage() {
  const { items, markAllRead, clear } = useNotificationStore()
  const navigate = useNavigate()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Notifikasi</h1>
          <p className="text-sm text-muted-foreground">Riwayat notifikasi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 size-4" /> <span className="hidden sm:inline">Tandai semua dibaca</span><span className="sm:hidden">Baca</span>
          </Button>
          <Button variant="outline" size="sm" onClick={clear}>
            <Trash2 className="mr-2 size-4" /> <span className="hidden sm:inline">Hapus semua</span><span className="sm:hidden">Hapus</span>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="mb-3 size-8" />
            <p>Belum ada notifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card
              key={n.id}
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => {
                if (n.requestId) navigate(`/permohonan/${n.requestId}`)
              }}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatWaktu(n.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
