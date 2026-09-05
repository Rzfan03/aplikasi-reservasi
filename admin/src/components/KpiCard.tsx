import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: number | string
  unit?: string
  icon: ReactNode
  color: string
  /** Only pass when you have real comparative data to show */
  trend?: string
  trendUp?: boolean
}

export default function KpiCard({ title, value, unit, icon, color, trend, trendUp }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', color)}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {trend && (
        <p className={cn('text-xs', trendUp ? 'text-success' : 'text-destructive')}>{trend}</p>
      )}
    </div>
  )
}
