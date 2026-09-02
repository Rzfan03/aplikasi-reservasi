import { useState } from 'react'
import {
  AlertCircle,
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>
}

const pillars = [
  { icon: ClipboardList, title: 'Satu pintu', desc: 'Semua pengajuan layanan terkumpul rapi.' },
  { icon: CalendarCheck, title: 'Tindakan cepat', desc: 'Tinjau dan putuskan langsung dari sini.' },
  { icon: FileCheck2, title: 'Lampiran lengkap', desc: 'Setiap permohonan membawa berkas PDF.' },
]

export default function LoginPage({ onSignIn }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSignIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            <LayoutDashboard className="size-5" />
          </div>
          <span className="text-lg font-semibold">Reservasi Layanan</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Kelola permohonan layanan dalam satu dasbor.
          </h1>
          <div className="space-y-4">
            {pillars.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <p.icon className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm opacity-80">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm opacity-70">Area administrator · Hanya untuk petugas terverifikasi.</p>
      </aside>

      <main className="flex items-center justify-center p-4">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? 'Memasuki…' : 'Masuk'}
          </Button>
        </form>
      </main>
    </div>
  )
}