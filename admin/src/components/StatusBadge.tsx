import { Badge } from '@/components/ui/badge'
import type { Status } from '@/lib/types'

const map: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: 'Menunggu',
    className: 'bg-warning text-warning-foreground',
  },
  APPROVED: {
    label: 'Disetujui',
    className: 'bg-success text-success-foreground',
  },
  REJECTED: {
    label: 'Ditolak',
    className: 'bg-destructive text-destructive-foreground',
  },
}

export default function StatusBadge({ status }: { status: Status }) {
  const s = map[status]
  return <Badge className={s.className}>{s.label}</Badge>
}