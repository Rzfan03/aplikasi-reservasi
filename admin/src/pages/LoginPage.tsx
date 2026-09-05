import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionCtx } from '@/lib/SessionProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d47a1, #2196f3)' }}
      >
        <div className="z-10 text-center text-white px-12">
          <h1 className="text-4xl font-bold mb-4">Sistem Reservasi</h1>
          <p className="text-lg opacity-90">Manajemen permohonan layanan instansi</p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Masuk</h2>
            <p className="text-muted-foreground mt-1">Gunakan akun Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 border-l-4 border-destructive p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/30 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/30 outline-none transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dim disabled:opacity-50 transition-all"
            >
              {loading ? 'Masuk…' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
