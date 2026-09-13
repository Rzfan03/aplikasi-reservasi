import { useCallback, useEffect, useState } from 'react'
import { MessageCircle, Link2, Unlink, Copy, ScanLine, QrCode, LockKeyhole, Bell, CheckCircle2, AlertCircle, Loader2, RefreshCw, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchWhatsapp, saveWhatsappEnabled, pairWhatsapp, logoutWhatsapp, testWhatsApp, type WaAdminState } from '@/lib/api'
import { toast, toastSuccess } from '@/lib/swal'

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<WaAdminState | null>(null)
  const [number, setNumber] = useState('')
  const [pairing, setPairing] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [method, setMethod] = useState<'otp' | 'qr'>('otp')
  const [testNo, setTestNo] = useState('')
  const [testMsg, setTestMsg] = useState('hello world')
  const [testing, setTesting] = useState(false)

  const refresh = useCallback(async (silent = false) => {
    try {
      const s = await fetchWhatsapp()
      setState(s)
      setNumber((prev) => prev || s.pairNumber)
    } catch {
      if (!silent) toast.fire({ icon: 'error', title: 'Gagal memuat status WhatsApp' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(() => refresh(true), 5000)
    return () => clearInterval(t)
  }, [refresh])

  const s = state?.status
  const isConnected = !!s?.connected
  const isPaired = !!s?.paired
  const isConnecting = !!s?.connecting && !isConnected
  const isDisconnected = isPaired && !isConnected && !isConnecting

  async function toggleEnabled(next: boolean) {
    const prev = state
    setState((cur) => (cur ? { ...cur, enabled: next } : cur))
    try {
      await saveWhatsappEnabled(next)
      toastSuccess(next ? 'Notifikasi WhatsApp diaktifkan' : 'Notifikasi WhatsApp dimatikan')
    } catch (e) {
      setState(prev)
      toast.fire({ icon: 'error', title: e instanceof Error ? e.message : 'Gagal menyimpan' })
    }
  }

  async function handlePair() {
    const n = number.replace(/[^0-9]/g, '')
    if (!n) {
      toast.fire({ icon: 'warning', title: 'Nomor WhatsApp wajib diisi' })
      return
    }
    setPairing(true)
    try {
      const r = await pairWhatsapp(n)
      setNumber(r.number)
      await refresh()
      if (r.paired) toastSuccess('WhatsApp telah terhubung')
      else toastSuccess('Kode pairing berhasil dibuat')
    } catch (e) {
      toast.fire({ icon: 'error', title: 'Gagal membuat kode pairing', html: e instanceof Error ? e.message : undefined })
    } finally {
      setPairing(false)
    }
  }

  async function copyCode() {
    if (!s?.pairCode) return
    await navigator.clipboard.writeText(s.pairCode)
    toastSuccess('Kode disalin')
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logoutWhatsapp()
      setState((cur) => (cur ? { ...cur, status: { ...cur.status, connected: false, paired: false, meJid: null, pairCode: null } } : cur))
      toastSuccess('WhatsApp diputuskan')
    } catch (e) {
      toast.fire({ icon: 'error', title: e instanceof Error ? e.message : 'Gagal memutus koneksi' })
    } finally {
      setLoggingOut(false)
    }
  }

  async function handleTestSend() {
    setTesting(true)
    try {
      await testWhatsApp(testNo.trim(), testMsg.trim())
      toastSuccess('Pesan uji terkirim')
    } catch (e) {
      toast.fire({ icon: 'error', title: 'Gagal kirim pesan uji', html: e instanceof Error ? e.message : undefined })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ===== Status & Notifikasi ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            Notifikasi WhatsApp
          </CardTitle>
          <CardDescription>
            Hubungkan akun WhatsApp untuk mengirim pemberitahuan status permohonan ke nomor HP pemohon.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Banner jaringan — wajib wss terbuka */}
          {!isConnected && (
            <div className="border-b bg-muted/40 px-6 py-3 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Koneksi WhatsApp butuh jaringan yang membuka web.whatsapp.com (port 443/WebSocket).</strong>{' '}
              Jika gagal (kode 1006), hubungkan laptop ke <b>hotspot HP / data seluler</b> saat pairing — sesi tersimpan otomatis di folder{' '}
              <code className="rounded bg-background px-1 py-0.5">server/data/wa-session</code>.
            </div>
          )}
          {/* Status */}
          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                isConnected ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
              }`}
            >
              {isConnected ? (
                <CheckCircle2 className="size-5" />
              ) : isConnecting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <MessageCircle className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">
                  {isConnected ? 'Terhubung' : isConnecting ? 'Menghubungkan…' : isDisconnected ? 'Terputus' : 'Belum terhubung'}
                </span>
                <Badge variant={isConnected ? 'default' : 'outline'} className="px-2">
                  {isConnected ? 'Aktif' : isConnecting ? 'Memuat' : 'Offline'}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {isConnected
                  ? `Mengirim notifikasi sebagai ${s?.meJid ?? 'akun WhatsApp'}`
                  : isPaired
                    ? 'Akun tertaut, namun koneksi ke WhatsApp terputus.'
                    : 'Tautkan akun WhatsApp di bawah untuk mengaktifkan notifikasi.'}
              </p>
            </div>
            {isPaired && (
              <Button variant="destructive" size="sm" onClick={handleLogout} disabled={loggingOut} className="shrink-0">
                <Unlink className="size-4" />
                {loggingOut ? 'Memutuskan…' : 'Putuskan Koneksi'}
              </Button>
            )}
          </div>

          {/* Error */}
          {s?.lastError && (
            <div className="flex flex-col gap-3 border-t bg-destructive/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 flex-1 text-sm text-destructive">{s.lastError}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePair}
                disabled={pairing || !number.trim()}
                className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {pairing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Mencoba…
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" /> Coba Lagi
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Toggle notifikasi — terkunci sampai terhubung */}
          <div
            className={`flex items-start gap-4 border-t px-6 py-5 transition-opacity ${
              isPaired ? '' : 'opacity-60'
            }`}
          >
            <div className="mt-0.5 shrink-0 text-muted-foreground">
              <Bell className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <label
                className={`flex items-center gap-2 text-sm font-medium ${
                  isPaired ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  disabled={!isPaired}
                  checked={state?.enabled ?? false}
                  onChange={(e) => toggleEnabled(e.target.checked)}
                />
                Kirim notifikasi saat status permohonan berubah
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                {isPaired
                  ? 'Mengirim otomatis ke No. HP pemohon saat pengajuan disetujui atau ditolak.'
                  : 'Fitur ini terbuka setelah akun WhatsApp terhubung.'}
              </p>
            </div>
            {!isPaired && <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />}
          </div>

          {/* Kirim pesan uji */}
          <div className="border-t px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0 text-muted-foreground">
                <Send className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Kirim pesan uji</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isConnected
                    ? 'Verifikasi pengiriman WhatsApp ke nomor tujuan.'
                    : 'Fitur ini terbuka setelah akun WhatsApp terhubung.'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Input
                placeholder="Nomor tujuan, cth: 083824425487"
                type="tel"
                inputMode="numeric"
                value={testNo}
                onChange={(e) => setTestNo(e.target.value)}
                disabled={testing || !isConnected}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Isi pesan…"
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  className="flex-1"
                  disabled={testing || !isConnected}
                />
                <Button
                  variant="outline"
                  onClick={handleTestSend}
                  disabled={testing || !isConnected || !testNo.trim() || !testMsg.trim()}
                >
                  {testing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Mengirim…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" /> Kirim
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Hasil kirim terakhir */}
          {s?.lastSendAt && (
            <div
              className={`flex items-start gap-2 border-t px-6 py-3 text-xs ${
                s.lastSendError ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {s.lastSendError ? <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />}
              <p className="min-w-0 flex-1">
                {s.lastSendError ? (
                  <>
                    <b>Kiriman terakhir gagal</b> ({new Date(s.lastSendAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}) —{' '}
                    {s.lastSendError}
                  </>
                ) : (
                  <>
                    Pesan terakhir terkirim {new Date(s.lastSendAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}.
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Pairing (hanya saat belum terhubung) ===== */}
      {!isPaired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4" />
              Hubungkan Akun WhatsApp
            </CardTitle>
            <CardDescription>
              Pilih cara menautkan akun WhatsApp: dengan kode (OTP) atau scan QR dari HP Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="inline-flex w-full rounded-md border bg-muted/50 p-0.5 sm:w-auto">
              <button
                type="button"
                onClick={() => setMethod('otp')}
                className={`inline-flex flex-1 items-center justify-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  method === 'otp' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ScanLine className="size-3" />
                Kode (OTP)
              </button>
              <button
                type="button"
                onClick={() => setMethod('qr')}
                className={`inline-flex flex-1 items-center justify-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  method === 'qr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrCode className="size-3" />
                QR
              </button>
            </div>

            {method === 'otp' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="waNumber">Nomor akun WhatsApp</Label>
                  <Input
                    id="waNumber"
                    type="tel"
                    placeholder="085239123456"
                    inputMode="numeric"
                    value={number}
                    disabled={pairing}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nomor yang tetap aktif untuk mengirim notifikasi. Format: 08xx atau 628xx.
                  </p>
                </div>

                {!s?.pairCode && (
                  <Button onClick={handlePair} disabled={pairing || !number.trim()}>
                    <Link2 className="size-4" />
                    {pairing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Membuat kode…
                      </>
                    ) : (
                      'Buat Kode Pairing'
                    )}
                  </Button>
                )}

                {s?.pairCode && (
                  <div className="space-y-4 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ScanLine className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Masukkan kode berikut di HP Anda</p>
                          <p className="text-xs text-muted-foreground">
                            Berlaku sekali pakai & dibuat untuk nomor yang dipilih.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={copyCode}>
                          <Copy className="size-4" />
                          Salin
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handlePair} disabled={pairing || !number.trim()}>
                          <Loader2 className={`size-4 ${pairing ? 'animate-spin' : ''}`} />
                          Buat ulang
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center rounded-md bg-background px-4 py-4">
                      <code className="text-center text-2xl font-bold tracking-[0.35em] text-primary">
                        {s.pairCode.match(/.{1,4}/g)?.join('-') ?? s.pairCode}
                      </code>
                      {pairing && <Loader2 className="ml-3 size-4 animate-spin shrink-0 text-muted-foreground" />}
                    </div>
                    <ol className="space-y-1.5 pl-4 text-sm text-muted-foreground">
                      <li>Buka <b>WhatsApp</b> di HP Anda.</li>
                      <li>Masuk ke <b>Perangkat tertaut → Tautkan dengan nomor telepon</b>.</li>
                      <li>Ketik kode di atas, lalu ikuti langkahnya.</li>
                    </ol>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-6">
                {s?.qr ? (
                  <img src={s.qr} alt="QR WhatsApp" className="size-56 rounded-lg bg-white p-2" />
                ) : (
                  <div className="flex size-56 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    Menyiapkan QR…
                    <span className="text-xs">QR diperbarui otomatis tiap beberapa detik.</span>
                  </div>
                )}
                <ol className="w-full space-y-1.5 pl-4 text-sm text-muted-foreground">
                  <li>Buka <b>WhatsApp</b> di HP Anda.</li>
                  <li>Masuk ke <b>Perangkat tertaut → Tautkan sebuah perangkat</b>.</li>
                  <li>Scan <b>QR code</b> di atas, lalu ikuti langkahnya.</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}