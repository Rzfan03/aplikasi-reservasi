import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
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
import { fetchInstansi, createInstansi, updateInstansi, deleteInstansi } from '@/lib/api'
import type { InstansiData } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function InstansiPage() {
  const [items, setItems] = useState<InstansiData[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<InstansiData | null>(null)
  const [nama, setNama] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await fetchInstansi()) } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEdit(null)
    setNama('')
    setOpen(true)
  }

  function openEdit(item: InstansiData) {
    setEdit(item)
    setNama(item.nama)
    setOpen(true)
  }

  async function handleSave() {
    if (!nama.trim()) return
    setSaving(true)
    try {
      if (edit) await updateInstansi(edit.id, { nama })
      else await createInstansi(nama)
      setOpen(false)
      load()
    } catch {} finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus instansi ini?')) return
    await deleteInstansi(id)
    load()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Instansi</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar instansi</p>
        </div>
        <Button onClick={openAdd} className="shrink-0"><Plus className="mr-2 size-4" /> Tambah</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building2 className="mb-3 size-8" />
              <p>Belum ada instansi</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted transition-colors"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">{item.nama}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? 'Edit Instansi' : 'Tambah Instansi'}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nama</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama instansi" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
