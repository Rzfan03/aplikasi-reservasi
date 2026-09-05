import { BRAND } from '@/lib/branding'
import { cn } from '@/lib/utils'

export default function BrandMark({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return BRAND.logo ? (
    <img src={BRAND.logo} alt={BRAND.nama} className={cn('shrink-0 size-8 rounded-md object-contain', className, imgClassName)} />
  ) : (
    <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground text-sm', className)}>
      {BRAND.inisial}
    </div>
  )
}