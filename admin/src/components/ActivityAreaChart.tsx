import { useMemo } from 'react'
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ActivityAreaChartProps {
  data: { date: string; count: number }[]
}

interface TooltipPayload {
  value?: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-0.5">{label}</p>
      <p className="text-muted-foreground">
        Permohonan:{' '}
        <span className="font-semibold text-primary">{payload[0]?.value ?? 0}</span>
      </p>
    </div>
  )
}

export default function ActivityAreaChart({ data }: ActivityAreaChartProps) {
  const gradientId = useMemo(() => `area-grad-${Math.random().toString(36).slice(2, 8)}`, [])
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">Aktivitas 7 Hari</CardTitle>
            <p className="text-xs text-muted-foreground">Permohonan masuk per hari</p>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground/60 border border-border rounded px-1.5 py-0.5 uppercase tracking-wide">Contoh</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              dy={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, maxCount + 2]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickCount={4}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
