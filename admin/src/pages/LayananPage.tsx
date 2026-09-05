import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
    <div className="space-y-4">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nama Layanan</TableHead>
                  <TableHead className="w-20 text-right">Urutan</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
              <LayoutGrid className="mb-3 size-8" />
              <p className="text-sm">Belum ada layanan</p>
              <Button onClick={openAdd} variant="outline" className="mt-4">
                <Plus className="mr-2 size-4" /> Tambah Layanan
              </Button>
            </div>
          ) : (
            <Table className="[&_th]:px-4 [&_th]:h-9 [&_td]:px-4 [&_td]:py-2.5">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">No</TableHead>
                  <TableHead>Nama Layanan</TableHead>
                  <TableHead className="w-16 text-right">Urutan</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-center text-muted-foreground tabular-nums">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {item.nama}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.urutan}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(item)}
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deleting === item.id}
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
                        >
                          {deleting === item.id ? (
                            <span className="size-3.5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border p-6">
            <SheetTitle>{edit ? 'Edit Layanan' : 'Tambah Layanan'}</SheetTitle>
            <SheetDescription>
              {edit
                ? 'Perbarui detail layanan yang sudah ada.'
                : 'Tambahkan layanan baru ke daftar.'}
            </SheetDescription>
          </SheetHeader>
          <form
            className="flex flex-col gap-5 p-6"
            id="layanan-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-sm font-medium">
                Nama layanan
              </Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Nama layanan"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="urutan" className="text-sm font-medium">
                Urutan
              </Label>
              <Input
                id="urutan"
                type="number"
                min={1}
                value={urutan}
                onChange={(e) => setUrutan(+e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Urutan tampilan di form permohonan.
              </p>
            </div>
          </form>
          <SheetFooter className="mt-auto border-t border-border px-6 py-4">
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                form="layanan-form"
                disabled={saving}
              >
                {saving ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}