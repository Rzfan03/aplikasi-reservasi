import { NavLink } from 'react-router-dom'
import {
  Bell,
  Building2,
  ClipboardList,
  Home,
  LayoutGrid,
  Settings,
} from 'lucide-react'
import { useNotificationStore } from '@/hooks/useNotificationStore'

const NAV_ITEMS = [
  { title: 'Beranda', url: '/', icon: Home },
  { title: 'Layanan', url: '/layanan', icon: LayoutGrid },
  { title: 'Instansi', url: '/instansi', icon: Building2 },
  { title: 'Permohonan', url: '/permohonan', icon: ClipboardList },
  { title: 'Notifikasi', url: '/notifikasi', icon: Bell, showBadge: true },
  { title: 'Pengaturan', url: '/pengaturan', icon: Settings },
]

export default function BottomNav() {
  const unread = useNotificationStore((s) => s.unread)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <item.icon className="size-5" />
                  {item.showBadge && unread > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white leading-none">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </span>
                {isActive && (
                  <span className="h-1 w-1 rounded-full bg-primary" />
                )}
                <span className="leading-none">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}