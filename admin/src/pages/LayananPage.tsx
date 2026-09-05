import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { fetchLayanan, createLayanan, updateLayanan, deleteLayanan } from '@/lib/api'
import type { LayananData } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function LayananPage() {
  const [items, setItems] = useState<LayananData[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<LayananData | null>(null)
  const [nama, setNama] = useState('')
  const [urutan, setUrutan] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await fetchLayanan())
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEdit(null)
    setNama('')
    setUrutan(items.length + 1)
    setError('')
    setOpen(true)
  }

  function openEdit(item: LayananData) {
    setEdit(item)
    setNama(item.nama)
    setUrutan(item.urutan)
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    if (!nama.trim()) {
      setError('Nama layanan wajib diisi')
      return
    }
    setSaving(true)
    try {
      if (edit) {
        await updateLayanan(edit.id, { nama: nama.trim(), urutan })
      } else {
        await createLayanan(nama.trim(), urutan)
      }
      setOpen(false)
      load()
    } catch {
      setError('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await deleteLayanan(id)
      load()
    } catch {} finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Layanan</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar layanan</p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="mr-2 size-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <LayoutGrid className="mb-3 size-8" />
              <p>Belum ada layanan</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground tabular-nums w-6 text-right shrink-0">
                    {i + 1}
                  </span>
                  <p className="flex-1 min-w-0 truncate font-medium text-foreground">
                    {item.nama}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deleting === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{edit ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama layanan</Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Contoh: Penerbitan SK"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="urutan">Urutan</Label>
              <Input
                id="urutan"
                type="number"
                min={1}
                value={urutan}
                onChange={(e) => setUrutan(+e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
