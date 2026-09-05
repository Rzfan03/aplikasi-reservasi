import { AlertTriangleIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WattVisionAlertProps {
  variant?: 'critical' | 'warning'
  title: string
  message: string
  onDismiss?: () => void
}

const VARIANTS = {
  critical: {
    bg: 'bg-[#FF453A]/10',
    border: 'border-l-4 border-[#FF453A]',
    icon: 'text-[#FF453A]',
    title: 'text-[#FF453A]',
    message: 'text-[#FF453A]/80',
  },
  warning: {
    bg: 'bg-[#FFD60A]/10',
    border: 'border-l-4 border-[#FFD60A]',
    icon: 'text-[#FFD60A]',
    title: 'text-[#FFD60A]',
    message: 'text-[#FFD60A]/80',
  },
}

export default function WattVisionAlert({
  variant = 'critical',
  title,
  message,
  onDismiss,
}: WattVisionAlertProps) {
  const v = VARIANTS[variant]

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md p-4',
        v.bg, v.border,
      )}
    >
      <AlertTriangleIcon className={cn('mt-0.5 size-4 shrink-0', v.icon)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', v.title)}>{title}</p>
        <p className={cn('mt-0.5 text-xs', v.message)}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn('shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity', v.icon)}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
