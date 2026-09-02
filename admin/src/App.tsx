import { Navigate, Route, Routes } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import AppSidebar from './components/AppSidebar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LayananPage from './pages/LayananPage'
import { useSession } from './lib/useSession'

function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: ReturnType<typeof useSession>['user']
}) {
  const { signOut } = useSession()

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={signOut} />
      <SidebarInset className="bg-background">
        <header className="flex items-center gap-2 border-b bg-card px-4 py-2">
          <SidebarTrigger>
            <Button variant="ghost" size="icon">
              <PanelLeft className="size-4" />
            </Button>
          </SidebarTrigger>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

function Guard({
  user,
  loading,
  children,
}: {
  user: ReturnType<typeof useSession>['user']
  loading: boolean
  children: React.ReactNode
}) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Memuat…
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user, loading, signIn } = useSession()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage onSignIn={signIn} />}
      />
      <Route
        path="/"
        element={
          <Guard user={user} loading={loading}>
            <AdminLayout user={user}>
              <DashboardPage />
            </AdminLayout>
          </Guard>
        }
      />
      <Route
        path="/layanan"
        element={
          <Guard user={user} loading={loading}>
            <AdminLayout user={user}>
              <LayananPage />
            </AdminLayout>
          </Guard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}