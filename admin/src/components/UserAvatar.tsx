import { useProfilePhotoStore } from '@/hooks/useProfilePhotoStore'
import { cn } from '@/lib/utils'

interface Props {
  name?: string | null
  email?: string | null
  className?: string
}

export default function UserAvatar({ name, email, className }: Props) {
  const photo = useProfilePhotoStore((s) => s.photo)

  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : email?.[0]?.toUpperCase() ?? '?'

  if (photo) {
    return <img src={photo} alt={name ?? 'Profil'} className={cn('size-8 shrink-0 rounded-full bg-muted object-cover', className)} />
  }

  return (
    <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs', className)}>
      {initials}
    </div>
  )
}