import { useEffect, useState } from 'react'
import { Server, Mail, Send, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { fetchSmtp, saveSmtp, testSmtp, type SmtpSettings } from '@/lib/api'
import { toast, toastSuccess } from '@/lib/swal'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionCtx } from '@/lib/SessionProvider'

export default function SmtpPage() {
  const { user } = useSessionCtx()

  const [loading, setLoading] = useState(true)
  const [host, setHost] = useState('')
  const [port, setPort] = useState('587')
  const [secure, setSecure] = useState(false)
  const [userName, setUserName] = useState('')
  const [from, setFrom] = useState('')
  const [pass, setPass] = useState('')
  const [hasPass, setHasPass] = useState(false)
  const [saving, setSaving] = useState(false)

  const [testOpen, setTestOpen] = useState(false)
  const [testTo, setTestTo] = useState('')
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchSmtp()
      .then((s) => {
        setHost(s.host)
        setPort(String(s.port))
        setSecure(s.secure)
        setUserName(s.user)
        setFrom(s.from)
        setHasPass(s.hasPass)
      })
      .catch(() => toast.fire({ icon: 'error', title: 'Gagal memuat konfigurasi SMTP' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!host.trim() || !from.trim()) {
      toast.fire({ icon: 'warning', title: 'Host & Email pengirim (From) wajib diisi' })
      return
    }
    setSaving(true)
    try {
      const s: SmtpSettings = await saveSmtp({
        host: host.trim(),
        port: Number(port) || 587,
        secure,
        user: userName.trim(),
        from: from.trim(),
        pass: pass || undefined,
      })
      setHasPass(s.hasPass)
      setPass('')
      toastSuccess('Pengaturan SMTP disimpan')
    } catch (e) {
      toast.fire({ icon: 'error', title: e instanceof Error ? e.message : 'Gagal menyimpan' })
    } finally {
      setSaving(false)
    }
  }

  function handleTest() {
    setTestTo(user?.email ?? '')
    setTestOpen(true)
  }

  async function doTest() {
    if (!testTo.trim()) return
    setTesting(true)
    try {
      await testSmtp(testTo.trim())
      setTestOpen(false)
      toastSuccess('Email uji terkirim')
    } catch (e) {
      toast.fire({ icon: 'error', title: 'Gagal kirim email uji', html: e instanceof Error ? e.message : undefined })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="size-4" />
            Konfigurasi SMTP
          </CardTitle>
          <CardDescription>
            Server email untuk mengirim notifikasi. Perubahan berlaku untuk email berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="smtp.resend.com"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    min={1}
                    max={65535}
                    placeholder="465"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={secure}
                  onChange={(e) => setSecure(e.target.checked)}
                />
                <label htmlFor="secure" className="text-sm font-medium text-foreground">
                  TLS / SSL (secure)
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="user">Username</Label>
                  <Input
                    id="user"
                    placeholder="resend"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass">Password</Label>
                  <Input
                    id="pass"
                    type="password"
                    placeholder={hasPass ? '•••••••••• (biarkan kosong untuk tidak mengubah)' : 'Password SMTP'}
                    value={pass}
                    autoComplete="new-password"
                    onChange={(e) => setPass(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">Email pengirim (From)</Label>
                <Input
                  id="from"
                  type="email"
                  placeholder="Diskominfotik Kabupaten Sumbawa <no-reply@sumbawakab.go.id>"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="size-4" />
                  {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
                </Button>
                <Button variant="outline" onClick={handleTest} disabled={saving || !host.trim()}>
                  <Send className="size-4" />
                  Kirim Email Uji
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kirim Email Uji</DialogTitle>
            <DialogDescription>
              Email uji akan dikirim ke alamat di bawah untuk memastikan konfigurasi berfungsi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="testTo" className="flex items-center gap-1.5">
              <Mail className="size-4" />
              Alamat email tujuan
            </Label>
            <Input
              id="testTo"
              type="email"
              placeholder="admin@sumbawakab.go.id"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)} disabled={testing}>
              Batal
            </Button>
            <Button onClick={doTest} disabled={testing || !testTo.trim()}>
              {testing ? 'Mengirim…' : 'Kirim'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}