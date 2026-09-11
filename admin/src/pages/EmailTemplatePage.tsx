import { useEffect, useMemo, useState } from 'react'
import {
  Save, RotateCcw, Trash2, Plus, AlignLeft, Building2, User, Heading,
  BadgeCheck, Table, MousePointerClick, Minus, Library, FileCode2, GripVertical,
} from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { fetchEmailTemplate, saveEmailTemplate, type EmailBlock } from '@/lib/api'
import { toast, toastSuccess } from '@/lib/swal'
import { Skeleton } from '@/components/ui/skeleton'

const BLOCK_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; note: string; editable: boolean }> = {
  header: { label: 'Header Merek', icon: Building2, note: 'Banci gelap dengan judul & subjudul organisasi.', editable: true },
  greeting: { label: 'Salam Pembuka', icon: User, note: 'Otomatis: Yth. {{nama}} ({{instansi}}),', editable: false },
  heading: { label: 'Judul Status', icon: Heading, note: 'Judul besar: "Permohonan Anda Disetujui/Ditolak".', editable: true },
  text: { label: 'Paragraf Teks', icon: AlignLeft, note: 'Teks bebas, boleh isi token data.', editable: true },
  badge: { label: 'Lencana Status', icon: BadgeCheck, note: 'Pita STATUS + alasan penolakan (otomatis).', editable: false },
  summary: { label: 'Ringkasan Data', icon: Table, note: 'Pemohon · Instansi · Layanan · Tanggal · Status (otomatis).', editable: false },
  button: { label: 'Tombol Cek Status', icon: MousePointerClick, note: 'Tombol tautan ke halaman status permohonan.', editable: true },
  divider: { label: 'Garis Pemisah', icon: Minus, note: 'Garis tipis pemisah antar bagian.', editable: false },
  footer: { label: 'Footer', icon: Library, note: 'Catatan penutup & tanda tangan.', editable: true },
}

function newBlock(t: string): EmailBlock {
  switch (t) {
    case 'header': return { t: 'header', title: '', subtitle: '' }
    case 'heading': return { t: 'heading', text: '{{heading}}' }
    case 'text': return { t: 'text', text: '' }
    case 'button': return { t: 'button', label: 'Cek Status Permohonan' }
    case 'footer': return { t: 'footer', note: '', sign: '' }
    default: return { t: t } as EmailBlock
  }
}

const PRESETS = [
  'Permohonan Layanan {{label}} ({{statusLabel}})',
  'Permohonan Layanan {{label}}',
  'Status Permohonan Anda: {{statusLabel}}',
  '{{statusLabel}} — Permohonan Layanan',
]
const PRESET_DESC: Record<string, string> = {
  'Permohonan Layanan {{label}} ({{statusLabel}})': 'Permohonan Layanan Disetujui (DISETUJUI)',
  'Permohonan Layanan {{label}}': 'Permohonan Layanan Disetujui',
  'Status Permohonan Anda: {{statusLabel}}': 'Status Permohonan Anda: DISETUJUI',
  '{{statusLabel}} — Permohonan Layanan': 'DISETUJUI — Permohonan Layanan',
}
const CUSTOM_KEY = '__custom__'

type PreviewStatus = 'APPROVED' | 'REJECTED'

function previewVars(status: PreviewStatus): Record<string, string> {
  const success = status === 'APPROVED'
  return {
    nama: 'rizfan',
    instansi: 'Dinas Pendidikan Sumbawa',
    layanan: 'Pelayanan Internet',
    tanggal: 'Selasa, 15 September 2026',
    statusLabel: success ? 'DISETUJUI' : 'DITOLAK',
    heading: success ? 'Permohonan Anda Disetujui' : 'Permohonan Anda Ditolak',
    kataKerja: success ? 'disetujui' : 'ditolak',
    statusUrl: '#',
    rejectReason: success
      ? ''
      : 'Berkas persyaratan tidak lengkap.',
    tintColor: success ? '#16a34a' : '#dc2626',
    tintBg: success ? '#f0fdf4' : '#fef2f2',
  }
}

function wrap(s: string | undefined, vars: Record<string, string>): string {
  return (s ?? '').replace(/\{\{(\w+)\}\}/g, (_m, k: string) => vars[k] ?? '')
}

function PreviewBlock({ b, vars }: { b: EmailBlock; vars: Record<string, string> }) {
  switch (b.t) {
    case 'header':
      return (
        <div className="px-8 py-6" style={{ background: b.color || '#18181b' }}>
          <div className="text-[17px] font-bold tracking-wide" style={{ color: b.textColor || '#ffffff' }}>{wrap(b.title, vars)}</div>
          <div className="mt-0.5 text-[11.5px] text-zinc-400">{wrap(b.subtitle, vars)}</div>
        </div>
      )
    case 'divider':
      return <div className="mx-8 my-4 h-px bg-zinc-200" />
    case 'greeting':
      return (
        <p className="px-8 pt-5 text-[13.5px] leading-relaxed text-zinc-500">
          Yth. <strong className="text-zinc-900">{vars.nama}</strong> ({vars.instansi}),
        </p>
      )
    case 'heading':
      return <h2 className="px-8 pt-3 text-lg font-bold leading-snug" style={{ color: b.color || '#18181b' }}>{wrap(b.text, vars)}</h2>
    case 'text':
      return <p className="px-8 pt-2 text-[13.5px] leading-relaxed" style={{ color: b.color || '#3f3f46' }}>{wrap(b.text, vars)}</p>
    case 'badge':
      return (
        <div className="px-8 pt-3">
          <div className="inline-block rounded-lg border border-input px-3.5 py-2.5" style={{ background: vars.tintBg, borderColor: `${vars.tintColor}40` }}>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-white"
              style={{ background: vars.tintColor }}
            >
              {vars.statusLabel}
            </span>
            {vars.rejectReason && (
              <div className="mt-1.5 text-xs leading-relaxed text-red-700">
                <strong>Alasan penolakan:</strong> {vars.rejectReason}
              </div>
            )}
          </div>
        </div>
      )
    case 'summary':
      return (
        <div className="px-8 pt-3">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {(
                [
                  ['Pemohon', vars.nama, undefined],
                  ['Instansi', vars.instansi, undefined],
                  ['Layanan', vars.layanan, undefined],
                  ['Tanggal', vars.tanggal, undefined],
                  ['Status', vars.statusLabel, vars.tintColor],
                ] as [string, string, string | undefined][]
              ).map(([label, val, color]) => (
                <tr key={label}>
                  <td className="w-[110px] border-t border-zinc-100 py-2 text-[13px] text-zinc-500">{label}</td>
                  <td className="border-t border-zinc-100 py-2 font-semibold text-zinc-900" style={color ? { color } : undefined}>
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'button':
      return vars.statusUrl ? (
        <div className="px-8 pt-4 text-center">
          <a className="inline-block rounded-md px-6 py-2.5 text-sm font-bold no-underline" style={{ background: b.color || '#4945FF', color: b.textColor || '#FFFFFF' }} href="#">
            {wrap(b.label, vars)}
          </a>
        </div>
      ) : null
    case 'footer':
      return (
        <div className="mt-5 border-t border-zinc-200 bg-[#FAFAF9] px-8 py-4 text-center">
          <p className="text-[12.5px] leading-relaxed" style={{ color: b.color || '#71717a' }}>{wrap(b.note, vars)}</p>
          <p className="mt-1.5 whitespace-pre-line text-[13.5px]" style={{ color: b.color || '#18181b' }}>{wrap(b.sign, vars)}</p>
        </div>
      )
  }
}

function BlockFields({ block, onChange }: { block: EmailBlock; onChange: (b: EmailBlock) => void }) {
  const field = (key: 'title' | 'subtitle' | 'text' | 'label' | 'note' | 'sign', placeholder: string, textArea = false) => (
    <Label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">
        {key === 'title' ? 'Judul' : key === 'subtitle' ? 'Subjudul' : key === 'label' ? 'Teks tombol' : key === 'note' ? 'Catatan' : key === 'sign' ? 'Tanda tangan' : 'Isi teks'}
      </span>
      {textArea ? (
        <textarea
          rows={2}
          spellCheck={false}
          placeholder={placeholder}
          value={(block as Record<string, string>)[key] ?? ''}
          onChange={(e) => onChange({ ...block, [key]: e.target.value } as EmailBlock)}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <Input
          placeholder={placeholder}
          value={(block as Record<string, string>)[key] ?? ''}
          onChange={(e) => onChange({ ...block, [key]: e.target.value } as EmailBlock)}
        />
      )}
    </Label>
  )
  const colorField = (key: 'color' | 'textColor', defaultHex: string, label: string) => {
    const cur = (block as Record<string, string | undefined>)[key] ?? defaultHex
    return (
      <Label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={cur}
            onChange={(e) => onChange({ ...block, [key]: e.target.value.toLowerCase() } as EmailBlock)}
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
          />
          <Input
            value={cur}
            onChange={(e) => onChange({ ...block, [key]: e.target.value } as EmailBlock)}
            className="font-mono"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            title={`Kembalikan warna bawaan (${defaultHex})`}
            onClick={() => {
              const rest = { ...block } as Record<string, unknown>
              delete rest[key]
              onChange(rest as EmailBlock)
            }}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </Label>
    )
  }
  switch (block.t) {
    case 'header':
      return (
        <div className="space-y-2">
          {field('title', 'Diskominfotik Kabupaten Sumbawa')}
          {field('subtitle', 'Notifikasi Status Permohonan Layanan')}
          {colorField('color', '#18181b', 'Warna latar header')}
          {colorField('textColor', '#ffffff', 'Warna teks judul')}
        </div>
      )
    case 'heading':
      return (
        <div className="space-y-2">
          {field('text', '{{heading}}')}
          {colorField('color', '#18181b', 'Warna teks')}
        </div>
      )
    case 'text':
      return (
        <div className="space-y-2">
          {field('text', 'Tulis teks… boleh pakai token ({{nama}}, {{layanan}}, …)', true)}
          {colorField('color', '#3f3f46', 'Warna teks')}
        </div>
      )
    case 'button':
      return (
        <div className="space-y-2">
          {field('label', 'Cek Status Permohonan')}
          {colorField('color', '#4945FF', 'Warna latar tombol')}
          {colorField('textColor', '#FFFFFF', 'Warna teks tombol')}
        </div>
      )
    case 'footer':
      return (
        <div className="space-y-2">
          {field('note', 'Catatan footer…', true)}
          {field('sign', 'Tanda tangan', true)}
          {colorField('color', '#71717a', 'Warna teks footer')}
        </div>
      )
    default:
      return null
  }
}

export default function EmailTemplatePage() {
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [layout, setLayout] = useState<EmailBlock[]>([])
  const [defaults, setDefaults] = useState<{ subject: string; layout: EmailBlock[] }>({ subject: '', layout: [] })
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('APPROVED')
  const [sel, setSel] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [dragNew, setDragNew] = useState(false)

  useEffect(() => {
    fetchEmailTemplate()
      .then((t) => {
        setSubject(t.subject)
        setLayout(t.layout && t.layout.length ? t.layout : t.defaults.layout)
        setDefaults({ subject: t.defaults.subject, layout: t.defaults.layout })
      })
      .catch(() => toast.fire({ icon: 'error', title: 'Gagal memuat template email' }))
      .finally(() => setLoading(false))
  }, [])

  const vars = useMemo(() => previewVars(previewStatus), [previewStatus])

  const dirty = useMemo(
    () => JSON.stringify(layout) !== JSON.stringify(defaults.layout) || subject !== defaults.subject,
    [layout, defaults, subject],
  )

  function updateBlock(i: number, b: EmailBlock) {
    setLayout((prev) => prev.map((x, k) => (k === i ? b : x)))
  }

  function moveBlock(from: number, to: number) {
    setLayout((prev) => {
      const arr = [...prev]
      if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return arr
      const [m] = arr.splice(from, 1)
      arr.splice(to, 0, m)
      return arr
    })
    setSel(to)
  }

  function deleteBlock(i: number) {
    setLayout((prev) => prev.filter((_, k) => k !== i))
    setSel((prev) => (prev === null ? null : prev === i ? null : prev > i ? prev - 1 : prev))
  }

  function addBlock(t: string) {
    setLayout((prev) => [...prev, newBlock(t)])
    setSel(layout.length)
  }

  async function handleSave() {
    if (!subject.trim()) {
      toast.fire({ icon: 'warning', title: 'Subjek email wajib diisi' })
      return
    }
    if (!layout.length) {
      toast.fire({ icon: 'warning', title: 'Layout email masih kosong — tambahkan minimal satu blok' })
      return
    }
    setSaving(true)
    try {
      await saveEmailTemplate(subject.trim(), layout)
      setDefaults({ subject: subject.trim(), layout: layout.map((b) => ({ ...b })) })
      toastSuccess('Template email disimpan')
    } catch (e) {
      toast.fire({ icon: 'error', title: e instanceof Error ? e.message : 'Gagal menyimpan template' })
    } finally {
      setSaving(false)
    }
  }

  const selBlock = sel !== null && sel < layout.length ? layout[sel] : null
  const selBlockMeta = selBlock ? BLOCK_META[selBlock.t] : null
  const SelBlockIcon = selBlockMeta?.icon ?? AlignLeft

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCode2 className="size-4" />
                Template Email Notifikasi
              </CardTitle>
              <CardDescription className="mt-1">
                Susun tata letak email dengan drag-and-drop. Klik blok di kanvas untuk mengubah teksnya.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={previewStatus} onValueChange={(v) => setPreviewStatus(v as PreviewStatus)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Pratinjau DISETUJUI</SelectItem>
                  <SelectItem value="REJECTED">Pratinjau DITOLAK</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" onClick={() => { setSubject(defaults.subject); setLayout(defaults.layout.map((b) => ({ ...b }))); setSel(null) }}>
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving || !dirty}>
                <Save className="size-4" />
                {saving ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Kanvas email */}
          <div className="min-w-0 flex-1">
            <div className="max-w-xl space-y-2 pb-3">
                <Label htmlFor="subject">Subjek email</Label>
                <Select
                  value={PRESETS.includes(subject) ? subject : CUSTOM_KEY}
                  onValueChange={(v) => setSubject(v === CUSTOM_KEY ? (defaults.subject || '') : v)}
                >
                  <SelectTrigger id="subject" className="w-full">
                    <SelectValue placeholder="Pilih preset subjek…" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p} value={p}>
                        <span className="block">{p}</span>
                        <span className="block text-xs text-muted-foreground">→ {PRESET_DESC[p]}</span>
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_KEY}>Kustom (tulis sendiri)…</SelectItem>
                  </SelectContent>
                </Select>
                {!PRESETS.includes(subject) && (
                  <Input
                    placeholder={defaults.subject || 'Permohonan Layanan {{label}} ({{statusLabel}})'}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Contoh saat {previewStatus === 'APPROVED' ? 'disetujui' : 'ditolak'}:{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5">
                    {subject
                      .replace(/\{\{label\}\}/g, previewStatus === 'APPROVED' ? 'Disetujui' : 'Ditolak')
                      .replace(/\{\{statusLabel\}\}/g, previewStatus === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK')}
                  </code>{' '}
                  · token: <code className="rounded bg-muted px-1">{"{{label}}"}</code>{' '}
                  <code className="rounded bg-muted px-1">{"{{statusLabel}}"}</code>
                </p>
              </div>

            <div
              className={`rounded-xl bg-accent/40 p-3 transition-colors ${dragNew ? 'ring-2 ring-primary' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragNew(true)
              }}
              onDragLeave={() => setDragNew(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragNew(false)
                const t = e.dataTransfer.getData('application/x-block')
                if (t) addBlock(t)
              }}
            >
              <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                <div style={{ background: vars.tintColor, height: 6 }} />
                <div>
                  {layout.map((b, i) => (
                    <div
                      key={i}
                      draggable
                      onClick={() => setSel(i)}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', String(i))
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const from = Number(e.dataTransfer.getData('text/plain'))
                        if (Number.isInteger(from)) {
                          const to = i
                          setLayout((prev) => {
                            const arr = [...prev]
                            if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return arr
                            const [m] = arr.splice(from, 1)
                            arr.splice(to, 0, m)
                            return arr
                          })
                          setSel(to)
                        }
                      }}
                      className={`group relative cursor-pointer transition-shadow ${sel === i ? 'z-10 ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/30'}`}
                    >
                      <PreviewBlock b={b} vars={vars} />
                      {sel === i && (
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-border bg-background p-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveBlock(i, i - 1) }}
                            disabled={i === 0}
                            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                            title="Ke atas"
                          >
                            <ChevronUpIcon />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveBlock(i, i + 1) }}
                            disabled={i === layout.length - 1}
                            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                            title="Ke bawah"
                          >
                            <ChevronDownIcon />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteBlock(i) }}
                            className="flex size-6 items-center justify-center rounded text-destructive hover:bg-destructive/10"
                            title="Hapus blok"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {layout.length === 0 && (
                  <div className="flex h-44 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
                    <AlignLeft className="size-8 text-muted-foreground/40" />
                    Kanvas kosong. Klik blok di panel kanan untuk menambahkan.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel kanan: palet & properti */}
          <div className="w-full shrink-0 space-y-4 lg:w-72">
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tambah blok
              </p>
              <div className="space-y-1">
                {Object.entries(BLOCK_META).map(([t, meta]) => (
                  <button
                    key={t}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'copy'
                      e.dataTransfer.setData('application/x-block', t)
                    }}
                    onClick={() => addBlock(t)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <meta.icon className="size-4 shrink-0 text-primary" />
                    {meta.label}
                    <Plus className="ml-auto size-3.5 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Properti blok
              </p>
              {selBlockMeta && selBlock && sel !== null ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <SelBlockIcon className="size-4 shrink-0 text-primary" />
                    <span className="text-sm font-semibold">{selBlockMeta.label}</span>
                  </div>
                  {selBlockMeta.editable ? (
                    <BlockFields block={selBlock} onChange={(b) => updateBlock(sel, b)} />
                  ) : (
                    <p className="px-1 text-sm leading-relaxed text-muted-foreground">{selBlockMeta.note}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => moveBlock(sel, sel - 1)} disabled={sel === 0}>
                      ↑ Naik
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => moveBlock(sel, sel + 1)} disabled={sel === layout.length - 1}>
                      ↓ Turun
                    </Button>
                    <Button type="button" variant="destructive" size="sm" className="ml-auto" onClick={() => deleteBlock(sel)}>
                      <Trash2 className="size-3.5" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="flex items-center gap-2 px-1 text-sm leading-relaxed text-muted-foreground">
                  <GripVertical className="size-4 shrink-0" />
                  Klik blok di kanvas untuk mengedit teks, urutan, atau menghapus.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}