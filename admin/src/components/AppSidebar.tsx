import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Home,
  LayoutGrid,
  Settings,
  ClipboardList,
  Building2,
  ChevronsUpDown,
  LogOut,
  User,
} from 'lucide-react'
import { useNotificationStore } from '@/hooks/useNotificationStore'
import BrandMark from '@/components/BrandMark'
import { BRAND } from '@/lib/branding'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { title: 'Dashboard', url: '/', icon: Home },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { title: 'Layanan', url: '/layanan', icon: LayoutGrid },
      { title: 'Instansi', url: '/instansi', icon: Building2 },
      { title: 'Permohonan', url: '/permohonan', icon: ClipboardList },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { title: 'Notifikasi', url: '/notifikasi', icon: Bell, showBadge: true },
      { title: 'Pengaturan', url: '/pengaturan', icon: Settings },
    ],
  },
]

interface Props {
  user: { name?: string | null; email?: string | null } | null
  onSignOut: () => void
}

export default function AppSidebar({ user, onSignOut }: Props) {
  const unread = useNotificationStore((s) => s.unread)
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const { state } = useSidebar()
  const navigate = useNavigate()

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <BrandMark />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">{BRAND.nama}</span>
              <span className="truncate text-[10px] text-sidebar-foreground/60 leading-tight">{BRAND.instansi}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-1">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/50 px-2 mb-0.5">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium h-9 px-2.5"
                    >
                      <NavLink
                        to={item.url}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 rounded-md transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                            }`
                        }
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate text-sm">{item.title}</span>
                        {item.showBadge && unread > 0 && (
                          <span className="ml-auto shrink-0 rounded-full bg-[#FF453A] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none min-w-[18px] text-center">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-2 py-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu open={openUserMenu} onOpenChange={setOpenUserMenu}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-muted h-11 px-2.5"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </div>
                  {!isCollapsed && (
                    <div className="grid flex-1 text-start text-sm leading-tight min-w-0">
                      <span className="truncate font-semibold text-sidebar-foreground">{user?.name ?? 'Admin'}</span>
                      <span className="truncate text-xs text-sidebar-foreground/60">{user?.email}</span>
                    </div>
                  )}
                  {!isCollapsed && <ChevronsUpDown className="ml-auto size-3.5 text-sidebar-foreground/50" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-md border-border bg-card"
                side="right"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-2 py-2 text-sm">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {initials}
                    </div>
                    <div className="grid flex-1 text-start text-sm leading-tight min-w-0">
                      <span className="truncate font-semibold">{user?.name ?? 'Admin'}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/pengaturan')}>
                    <User className="size-4" />
                    <span>Profil & Pengaturan</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={onSignOut}
                >
                  <LogOut className="size-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
