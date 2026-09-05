import type { Status } from '@/lib/types'
import { cn } from '@/lib/utils'

const STYLES: Record<Status, { bg: string; text: string; border: string }> = {
  PENDING: {
    bg: 'bg-[#FFD60A]/15',
    text: 'text-[#FFD60A]',
    border: 'border-[#FFD60A]/30',
  },
  APPROVED: {
    bg: 'bg-[#32D74B]/15',
    text: 'text-[#32D74B]',
    border: 'border-[#32D74B]/30',
  },
  REJECTED: {
    bg: 'bg-[#FF453A]/15',
    text: 'text-[#FF453A]',
    border: 'border-[#FF453A]/30',
  },
}

const LABEL: Record<Status, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
}

export default function StatusBadge({ status }: { status: Status }) {
  const s = STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        s.bg, s.text, s.border,
      )}
    >
      {LABEL[status]}
    </span>
  )
}
