import { Navigate, Route, Routes } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from './components/AppSidebar'
import SiteHeader from './components/SiteHeader'
import BottomNav from './components/BottomNav'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LayananPage from './pages/LayananPage'
import InstansiPage from './pages/InstansiPage'
import PermohonanPage from './pages/PermohonanPage'
import PermohonanDetailPage from './pages/PermohonanDetailPage'
import NotifPage from './pages/NotifPage'
import PengaturanPage from './pages/PengaturanPage'
import TestNotifPage from './pages/TestNotifPage'
import TestPermohonanPage from './pages/TestPermohonanPage'
import { SessionProvider, useSessionCtx } from './lib/SessionProvider'
import { NotifProvider } from './components/NotifProvider'
import { SettingsProvider } from './components/SettingsProvider'

function AdminLayout() {
  const { user, loading, signOut } = useSessionCtx()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Memuat…</span>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar user={user} onSignOut={signOut} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 pb-24 md:pb-0">
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="layanan" element={<LayananPage />} />
                <Route path="instansi" element={<InstansiPage />} />
                <Route path="permohonan" element={<PermohonanPage />} />
                <Route path="permohonan/:id" element={<PermohonanDetailPage />} />
                <Route path="notifikasi" element={<NotifPage />} />
                <Route path="pengaturan" element={<PengaturanPage />} />
                <Route path="test-notif" element={<TestNotifPage />} />
                <Route path="test-permohonan" element={<TestPermohonanPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}

function LoginPageGuard() {
  const { user, loading } = useSessionCtx()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Memuat…</span>
        </div>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  return <LoginPage />
}

export default function App() {
  return (
    <SettingsProvider>
      <SessionProvider>
        <NotifProvider>
          <Routes>
            <Route path="/login" element={<LoginPageGuard />} />
            <Route path="/*" element={<AdminLayout />} />
          </Routes>
        </NotifProvider>
      </SessionProvider>
    </SettingsProvider>
  )
}
