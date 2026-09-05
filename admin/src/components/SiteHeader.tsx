import { useLocation } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/layanan': 'Layanan',
  '/instansi': 'Instansi',
  '/permohonan': 'Permohonan',
  '/notifikasi': 'Notifikasi',
  '/pengaturan': 'Pengaturan',
}

export default function SiteHeader() {
  const { pathname } = useLocation()

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    return { label: ROUTE_LABELS[href] ?? seg, href }
  })

  const isDetail = pathname.startsWith('/permohonan/') && segments.length >= 2

  // Current page label (shown on mobile as plain title)
  const currentLabel =
    isDetail
      ? 'Detail Permohonan'
      : crumbs.length > 0
      ? crumbs[crumbs.length - 1].label
      : 'Dashboard'

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
       <SidebarTrigger className="-ml-1 shrink-0 hidden md:flex" />
      <Separator orientation="vertical" className="h-4 shrink-0" />

      {/* Mobile: hanya tampil nama halaman saat ini */}
      <span className="text-sm font-medium text-foreground md:hidden">{currentLabel}</span>

      {/* Desktop: full breadcrumb */}
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className="text-sm text-muted-foreground">Admin</span>
          </BreadcrumbItem>
          {crumbs.map((crumb, i) => (
            <BreadcrumbItem key={crumb.href}>
              <BreadcrumbSeparator />
              {i === crumbs.length - 1 && !isDetail ? (
                <BreadcrumbPage className="text-sm font-medium">{crumb.label}</BreadcrumbPage>
              ) : (
                <span className="text-sm text-muted-foreground">{crumb.label}</span>
              )}
            </BreadcrumbItem>
          ))}
          {isDetail && (
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage className="text-sm font-medium">Detail</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex-1" />
    </header>
  )
}
