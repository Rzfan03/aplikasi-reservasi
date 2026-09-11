import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionCtx } from '@/lib/SessionProvider'
import BrandMark from '@/components/BrandMark'
import { BRAND } from '@/lib/branding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Check, ShieldCheck, BellRing } from 'lucide-react'
import loginBg from '@/assets/login-bg.jpg'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useSessionCtx()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <img src={loginBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none"
          style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(24,24,27,0.55))' }}
        />

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-12 py-14">
          <div className="text-white">
            <h1 className="text-4xl font-bold">{BRAND.nama}</h1>
            <p className="mt-1 text-lg text-white/85">{BRAND.instansi}</p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
              Kelola pengajuan peminjaman ruang rapat, alat, dan bantuan teknis instansi
              dari satu dashboard — tanpa antre ke kantor.
            </p>
          </div>

          <div>
            <div className="mb-8 h-px w-16 bg-white/25" />
            <ul className="max-w-sm space-y-3.5">
              {[
                { icon: Check, label: 'Kelola layanan, instansi & permohonan di satu tempat' },
                { icon: ShieldCheck, label: 'Pantau status permohonan secara real-time' },
                { icon: BellRing, label: 'Notifikasi diteruskan otomatis ke email' },
              ].map((f) => (
                <li key={f.label} className="flex items-start gap-3 text-sm text-white/85">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <f.icon className="size-3 text-white" aria-hidden="true" />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/45">© {new Date().getFullYear()} Diskominfotik Kabupaten Sumbawa</p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-8 lg:p-12">
        <div className="w-full max-w-lg space-y-8">
          <div>
            <div className="mb-6 flex justify-center lg:hidden">
              <BrandMark className="size-12 rounded-md text-xl bg-primary" imgClassName="size-12 rounded-md" />
            </div>
            <h2 className="text-center text-3xl font-bold text-foreground lg:text-left">Masuk</h2>
            <p className="mt-2 text-center text-muted-foreground lg:text-left">Gunakan akun admin untuk mengelola dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md bg-destructive/10 border-l-4 border-destructive p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@instansi.go.id"
                autoComplete="email"
                className="h-11 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 pr-10 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full h-11" disabled={loading}>
              {loading ? 'Masuk…' : 'Masuk'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Halaman ini khusus admin Diskominfotik Kabupaten Sumbawa.
          </p>
        </div>
      </div>
    </div>
  )
}
