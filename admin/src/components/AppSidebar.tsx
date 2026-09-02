import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, MoreHorizontal, Tags } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type SessionUser } from '@/lib/auth'

interface Props {
  user: SessionUser | null
  onSignOut: () => Promise<void>
}

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/layanan', label: 'Layanan', icon: Tags },
]

function initials(user: SessionUser) {
  const name = user.name?.trim()
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  }
  return user.email.slice(0, 2).toUpperCase()
}

export default function AppSidebar({ user, onSignOut }: Props) {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 leading-tight">
                  <span className="truncate font-semibold">Reservasi Layanan</span>
                  <span className="text-xs text-muted-foreground">Area Admin</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.to}
                    className="py-3 data-[active=true]:px-5"
                  >
                    <NavLink to={item.to}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {user ? (
                    <>
                      <div className="flex aspect-square size-8 min-w-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                        {initials(user)}
                      </div>
                      <div className="grid flex-1 leading-tight text-left">
                        <span className="truncate font-medium">
                          {user.name?.trim() || user.email}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.name?.trim() ? user.email : 'Administrator'}
                        </span>
                      </div>
                      <MoreHorizontal className="ml-auto size-4" />
                    </>
                  ) : (
                    <span>Profil</span>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-56 rounded-lg"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="flex size-8 min-w-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                      {user ? initials(user) : '?'}
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate font-medium">
                        {user?.name?.trim() || user?.email || 'Belum masuk'}
                      </span>
                      {user?.name?.trim() && (
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="gap-2">
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}