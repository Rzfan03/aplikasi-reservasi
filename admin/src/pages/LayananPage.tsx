import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, Loader2, Pencil, Plus, Save, Tags, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLayanan, deleteLayanan, fetchLayanan, updateLayanan } from '@/lib/api'
import type { LayananData } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function LayananPage() {
  const [layanan, setLayanan] = useState<LayananData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nama, setNama] = useState('')
  const [urutan, setUrutan] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<LayananData | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setLayanan(await fetchLayanan())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat layanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setNama('')
    setUrutan('')
    setEditing(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = nama.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError('')
    try {
      if (editing) {
        const updated = await updateLayanan(editing.id, {
          nama: trimmed,
          urutan: urutan ? Number(urutan) : undefined,
        })
        setLayanan((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      } else {
        const created = await createLayanan(trimmed, urutan ? Number(urutan) : layanan.length + 1)
        setLayanan((prev) => [...prev, created])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan layanan')
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (item: LayananData) => {
    setEditing(item)
    setNama(item.nama)
    setUrutan(String(item.urutan))
    setError('')
  }

  const move = async (item: LayananData, dir: 1 | -1) => {
    const sorted = [...layanan].sort((a, b) => a.urutan - b.urutan)
    const idx = sorted.findIndex((x) => x.id === item.id)
    const swap = sorted[idx + dir]
    if (!swap) return
    setError('')
    try {
      await Promise.all([
        updateLayanan(item.id, { urutan: swap.urutan }),
        updateLayanan(swap.id, { urutan: item.urutan }),
      ])
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah urutan')
    }
  }

  const remove = async (item: LayananData) => {
    if (!confirm(`Hapus layanan "${item.nama}"?`)) return
    setError('')
    try {
      await deleteLayanan(item.id)
      setLayanan((prev) => prev.filter((x) => x.id !== item.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus layanan')
    }
  }

  const sorted = [...layanan].sort((a, b) => a.urutan - b.urutan)

  return (
    <main className="min-w-0 p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Tags className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Layanan</h1>
            <p className="text-sm text-muted-foreground">
              Atur pilihan layanan yang tampil di form permohonan.
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {editing ? (
                <>
                  <Pencil className="size-4" />
                  Ubah layanan
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Tambah layanan
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama layanan</Label>
                  <Input
                    id="nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="cth: Ruang Kelas, Pengadaan ATK"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urutan">Urutan</Label>
                  <Input
                    id="urutan"
                    type="number"
                    min={1}
                    value={urutan}
                    onChange={(e) => setUrutan(e.target.value)}
                    placeholder="Auto"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={busy || !nama.trim()}>
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan…
                    </>
                  ) : editing ? (
                    <>
                      <Save className="size-4" />
                      Simpan perubahan
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Tambah
                    </>
                  )}
                </Button>
                {editing && (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    <ChevronLeft className="size-4" />
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags className="size-4" />
              Daftar layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Memuat…
              </div>
            ) : sorted.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Belum ada layanan. Tambahkan layanan pertama dengan form di atas.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {sorted.map((item, i) => (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 py-3',
                      editing?.id === item.id && 'opacity-60'
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
                      {item.urutan}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.nama}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => move(item, -1)}
                        disabled={i === 0}
                        aria-label={`Naikkan ${item.nama}`}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => move(item, 1)}
                        disabled={i === sorted.length - 1}
                        aria-label={`Turunkan ${item.nama}`}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(item)}
                        aria-label={`Ubah ${item.nama}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => remove(item)}
                        aria-label={`Hapus ${item.nama}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}