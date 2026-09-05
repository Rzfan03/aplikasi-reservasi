import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatusChartProps {
  pending: number
  approved: number
  rejected: number
}

interface BarRow {
  label: string
  value: number
  color: string
  bg: string
  dot: string
}

function StatusProgressBar({
  label,
  value,
  total,
  color,
  bg,
  dot,
}: BarRow & { total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full shrink-0', dot)} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-foreground tabular-nums">{value.toLocaleString('id-ID')}</span>
          <span className="text-xs text-muted-foreground">({pct}%)</span>
        </div>
      </div>
      <div className={cn('h-2 w-full rounded-full', bg)}>
        <div
          className={cn('h-2 rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function StatusChart({ pending, approved, rejected }: StatusChartProps) {
  const total = pending + approved + rejected

  const rows: BarRow[] = useMemo(
    () => [
      {
        label: 'Disetujui',
        value: approved,
        color: 'bg-success',
        bg: 'bg-success/15',
        dot: 'bg-success',
      },
      {
        label: 'Menunggu',
        value: pending,
        color: 'bg-warning',
        bg: 'bg-warning/15',
        dot: 'bg-warning',
      },
      {
        label: 'Ditolak',
        value: rejected,
        color: 'bg-destructive',
        bg: 'bg-destructive/15',
        dot: 'bg-destructive',
      },
    ],
    [pending, approved, rejected],
  )

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">Status Permohonan</CardTitle>
      </CardHeader>
      <CardContent>
        {/* big donut-style ring using CSS */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex size-32 items-center justify-center">
            {/* SVG donut */}
            <DonutChart approved={approved} pending={pending} rejected={rejected} total={total} />
            {/* center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums text-foreground">{total.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Total</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <StatusProgressBar key={row.label} {...row} total={total} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DonutChart({
  approved,
  pending,
  rejected,
  total,
}: {
  approved: number
  pending: number
  rejected: number
  total: number
}) {
  const r = 52
  const cx = 64
  const cy = 64
  const circumference = 2 * Math.PI * r
  const gap = total > 0 ? 3 : 0 // gap in px between segments

  const segments = [
    { value: approved, color: 'var(--success)' },
    { value: pending, color: 'var(--warning)' },
    { value: rejected, color: 'var(--destructive)' },
  ]

  let offset = 0
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0
    const dash = Math.max(0, pct * circumference - gap)
    const arc = { color: seg.color, dasharray: `${dash} ${circumference - dash}`, dashoffset: -offset }
    offset += pct * circumference
    return arc
  })

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
      {/* track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        className="text-muted/40"
      />
      {total === 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          className="text-muted/40"
        />
      )}
      {arcs.map((arc, i) =>
        arc.dasharray.startsWith('0') ? null : (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="14"
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.dashoffset}
            strokeLinecap="round"
          />
        ),
      )}
    </svg>
  )
}
