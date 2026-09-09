---
version: alpha
name: Sistem Reservasi Layanan (Diskominfo)
description: Dashboard admin untuk aplikasi Sistem Reservasi Layanan milik Dinas Komunikasi dan Informatika. Dark-first interface dengan 3 palet aksen (zinc, blue, emerald) dan 2 mode tema (gelap/terang).
colors:
  background: "#18181b"
  foreground: "#ffffff"
  card: "#27272a"
  card-foreground: "#ffffff"
  popover: "#27272a"
  popover-foreground: "#ffffff"
  primary: "#ffffff"
  primary-foreground: "#18181b"
  primary-dim: "#a1a1aa"
  secondary: "#3f3f46"
  secondary-foreground: "#ffffff"
  muted: "#27272a"
  muted-foreground: "#a1a1aa"
  accent: "#3f3f46"
  accent-foreground: "#ffffff"
  border: "#3f3f46"
  input: "#27272a"
  ring: "#ffffff"
  sidebar-bg: "#18181b"
  sidebar-foreground: "#e4e4e7"
  sidebar-border: "#27272a"
  sidebar-accent: "rgba(255, 255, 255, 0.08)"
  destructive: "#dc2626"
  success: "#16a34a"
  warning: "#d97706"
  pending: "#FFD60A"
  approved: "#32D74B"
  rejected: "#FF453A"
  light-background: "#ffffff"
  light-foreground: "#18181b"
  light-card: "#ffffff"
  light-primary: "#27272a"
  light-muted: "#f4f4f5"
  light-muted-foreground: "#52525b"
  light-border: "#e4e4e7"
  light-sidebar-bg: "#fafafa"
  blue-primary: "#3b82f5"
  blue-primary-dim: "#60a5fa"
  blue-secondary: "#2563eb"
  emerald-primary: "#10b981"
  emerald-primary-dim: "#34d399"
  emerald-secondary: "#059669"
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  h2:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 36px
  button-primary-hover:
    backgroundColor: "{colors.primary-dim}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 16px
    height: 36px
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 36px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: 24px
  status-badge-pending:
    backgroundColor: "rgba(255, 214, 10, 0.15)"
    textColor: "{colors.pending}"
    borderColor: "rgba(255, 214, 10, 0.3)"
    rounded: "{rounded.full}"
    padding: 4px
  status-badge-approved:
    backgroundColor: "rgba(50, 215, 75, 0.15)"
    textColor: "{colors.approved}"
    borderColor: "rgba(50, 215, 75, 0.3)"
    rounded: "{rounded.full}"
    padding: 4px
  status-badge-rejected:
    backgroundColor: "rgba(255, 69, 58, 0.15)"
    textColor: "{colors.rejected}"
    borderColor: "rgba(255, 69, 58, 0.3)"
    rounded: "{rounded.full}"
    padding: 4px
  avatar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
  sidebar:
    backgroundColor: "{colors.sidebar-bg}"
    foregroundColor: "{colors.sidebar-foreground}"
    borderColor: "{colors.sidebar-border}"
---

# DESIGN.md — Sistem Reservasi Layanan (Diskominfo)

## Overview

Sistem Reservasi Layanan adalah dashboard admin milik Dinas Komunikasi dan
Informatika untuk meninjau dan memproses permohonan layanan dari instansi lain
(domain, internet, jaringan, aplikasi, dll) lengkap dengan lampiran PDF.

Tampilan bersifat **dark-first**: semua palet dirancang dan diuji dalam mode
gelap, dengan mode terang sebagai opsi pendukung. Estetika **flat dan solid** —
tanpa gradien (kecuali latar halaman login), tanpa mock-3D, kejernihan dijaga
lewat kontras tinggi dan batas antar elemen, bukan bayangan.

Nada visual: **profesional, administratif, efisien**. Cocok dengan sifat
aplikasi perkantoran pemerintah: jelas, padat, dan mengurangi kelelahan layar
di lingkungan yang sering bekerja dalam ruang minim cahaya.

Warna aksen dapat diganti lewat 3 palet (zinc default, blue, emerald) dari
halaman Pengaturan — seluruh aplikasi merespons perubahan ini secara konsisten.

## Colors

Warna dikelola sebagai CSS variables di `index.css` dan dipetakan ke token
Tailwind melalui `@theme inline`. Seluruh komponen memakai token semantik —
**tidak ada warna hex hardcoded di komponen** kecuali 3 warna status.

### Tema gelap (default)

- **Background (#18181b):** Zinc-900. Kanvas dasar seluruh halaman.
- **Foreground (#ffffff):** Teks utama; putih murni untuk kontras maksimal di
  atas surface gelap.
- **Card / Popover (#27272a):** Surface satu tingkat di atas background;
  dipakai untuk kartu, dialog, dan sheet.
- **Muted-foreground (#a1a1aa):** Teks sekunder, caption, placeholder.
- **Border (#3f3f46):** Pemisah antar elemen — alat utama pemisah visual.
- **Primary (#ffffff):** Warna aksen default (zinc). Tombol primary adalah
  surface putih dengan teks gelap (inverted).
- **Destructive (#dc2626), Success (#16a34a), Warning (#d97706):** Warna
  status untuk aksi destruktif, indikator sukses, dan peringatan.

### Palet aksen (override `primary`/`secondary`/`ring`)

- **Zinc (default):** primary `#ffffff`, primary-dim `#a1a1aa`, secondary
  `#3f3f46`.
- **Blue:** primary `#3b82f5`, primary-dim `#60a5fa`, secondary `#2563eb`.
- **Emerald:** primary `#10b981`, primary-dim `#34d399`, secondary `#059669`.

Ketika palet aksen aktif, surface (background/card/border) tetap mengikuti
tema, hanya warna aksen yang berubah.

### Tema terang

Background `#ffffff`, foreground `#18181b`, card `#ffffff`, muted `#f4f4f5`,
muted-foreground `#52525b`, border `#e4e4e7`, sidebar `#fafafa`. Warna status
tetap sama pada kedua tema.

### Status permohonan

Tiga warna khusus yang konsisten di semua halaman (badge, chart, KPI):

- **Pending (#FFD60A):** kuning — menunggu tindakan.
- **Approved (#32D74B):** hijau — disetujui.
- **Rejected (#FF453A):** merah — ditolak.

### Design Tokens

Lihat blok YAML `colors` di atas. Nama token mengikuti konvensi: token tanpa
prefiks = tema gelap, `light-*` = tema terang, `blue-*`/`emerald-*` = palet
aksen.

## Typography

Stack font: **Inter** sebagai default untuk seluruh antarmuka, dengan opsi
**Poppins** yang bisa dipilih user dari Pengaturan. **JetBrains Mono** tersedia
untuk data teknis (nomor, kode). Ukuran font dasar adalah **14px** dengan opsi
13–16px (dikontrol sebagai CSS variable `--font-size-base` yang mengubah skala
seluruh aplikasi sekaligus).

- **Halaman & judul (h1):** Inter 700, 24px. Dipakai untuk judul besar route
  (mis. "Selamat pagi, Admin" di Dashboard).
- **Section title (title-sm):** Inter 600, 14px. Headline kartu.
- **Body (body-md):** Inter 400, 14px. Teks utama—paragraf, konten kartu, row
  data.
- **Body kecil (body-sm):** Inter 400, 13px. Teks pendukung.
- **Label & badge (label-sm):** Inter 500, 12px. Label form, badge, tombol
  kecil, breadcrumb.
- **Caption (#caption):** Inter 400, 11px. Metadata, timestamp, keterangan.
- **Mono (mono):** JetBrains Mono 400, 13px. NIP, data tabular.

Kontras teks memenuhi WCAG AA: foregound putih di atas zinc-900, foreground
gelap di atas surface terang. Angka pada KPI memakai `tabular-nums` agar
sejajar saat berubah realtime.

### Design Tokens

Lihat blok YAML `typography` di atas. Baris tabel dan daftar memakai skala
caption→title-sm; tidak ada body di bawah 13px.

## Layout

Halaman memakai **layout fluid full-width** — tidak ada constraint `max-w-*`
pada konten. Halaman dibatasi padding `p-6` dengan jarak antar-section
`space-y-6` (4–6 pada layar kecil).

- **App shell:** Sidebar kiri (collapsible, 5.5rem saat kolaps) + header di
  atas konten + content. Sidebar tetap ter-mount; hanya konten yang berganti
  antar-route.
- **Dashboard:** grid 12 kolom responsif — area chart 8 kolom, kolom statistik
  4 kolom. Deretan 4 kartu ringkasan mingguan (2 kolom di bawah `lg`), diikuti
  4 kartu KPI.
- **Spacing:** skala 4px (`base`), nilai umum 8/12/16/24/32px. Padding kartu
  seragam 24px; padding baris daftar 12–16px.
- **Daftar (CRUD):** berbasis kartu/daftar dengan `divide-y` separator antar
  baris — bukan tabel, kecuali layanan yang memakai tabel.
- **Dialog & Side sheet:** muncul di atas content dengan blur backdrop,
  `max-w-3xl` untuk PDF viewer, `sm:max-w-lg` untuk dialog umum.

## Elevation & Depth

Aplikasi ini **flat 2D secara konsisten** — tidak memakai bayangan besar.
Hierarki visual dibangun dari:

1. **Tonal layers:** `background` → `card` → `popover` naik satu tingkat
   kecerahan. Konten primer selalu pada surface paling terang.
2. **Borders:** batas 1px `border-border` memisahkan kartu, baris, dan daerah.
3. **Aksen warna:** tombol primary dan elemen interaktif menonjol lewat warna
   `primary`, bukan bayangan.

Satu-satunya penggunaan shadow: konfirmasi dialog SweetAlert dan elemen
overlay (navbar sticky `backdrop-blur-sm`). Untuk print, semua shadow dan
elemen navigasi disembunyikan dan kartu diberi border solid.

## Shapes

Radius dasar `0.75rem` (12px) dengan skala turunan: `sm` 8px, `md` 10px,
`lg` 12px, `xl` 16px.

- **Card, dialog, input, tombol:** `rounded-md` (10px) — bentuk dominan.
- **Badge status & avatar:** `rounded-full` (pill) — satu-satunya sudut penuh.
- Konsistensi dijaga: jangan campur sudut tajam dan sudut penuh dalam satu
  view; elemen sejenis memakai radius yang sama.

## Components

### Button

- **Default (primary):** `bg-primary text-primary-foreground`, hover
  `bg-primary-dim`. Satu-satunya CTA utama per layar.
- **Destructive:** `bg-destructive text-white`, hover `bg-destructive/90`.
  Hanya untuk aksi berbahaya (hapus, tolak).
- **Outline:** `border border-border bg-transparent text-foreground`, hover
  `bg-muted`. Aksi sekunder netral.
- **Secondary:** `bg-secondary`, hover `bg-secondary/80`.
- **Ghost:** hover `bg-muted`. Aksi ringan dalam daftar/baris (edit, hapus).
- **Link:** `text-primary underline-offset-4`.
- **Ukuran:** `default` h-9, `sm` h-8, `lg` h-10, `xs` h-6, `icon`/`icon-*`
  (h-9/h-6/h-8/h-10). Sidebar memakai `size="lg"` untuk hit-target besar.
- Fokus: `ring-[3px] ring-ring/50`. Disabled: `opacity-50 pointer-events-none`.

### Card

`bg-card border border-border rounded-md` dengan header berisi title
(`title-sm`) + description, dan content `p-6`. Kartu berisi daftar memakai
`divide-y` untuk memisahkan baris `py-3.5`.

### Status Badge

Pill `rounded-full` dengan kombinasi tiga warna per status:

- **Pending:** bg `rgba(255,214,10,0.15)`, text `#FFD60A`, border
  `rgba(255,214,10,0.3)`.
- **Approved:** bg `rgba(50,215,75,0.15)`, text `#32D74B`, border
  `rgba(50,215,75,0.3)`.
- **Rejected:** bg `rgba(255,69,58,0.15)`, text `#FF453A`, border
  `rgba(255,69,58,0.3)`.

### Avatar

Lingkaran penuh (`rounded-full`), `bg-primary/10` dengan inisial user
`text-primary`, atau foto profil bila diunggah (`object-cover`). Berukuran
`size-8` (default), `size-11` di header dashboard, `size-20` di halaman
pengaturan.

### Input & Form

`rounded-md border border-border bg-muted px-3 py-2 text-sm`. Fokus:
`border-primary ring-[3px] ring-primary/30`. Placeholder kelabu. Label
`label-sm`. Textarea memakai kelas yang sama dengan `resize-none`.

### Sidebar

Background `sidebar-bg`, text `sidebar-foreground`, border kanan
`sidebar-border`. Kolaps ke 5.5rem (ikon saja, teks tersembunyi) melalui
`collapsible="icon"`. Judul grup uppercase 10px. Item aktif:
`bg-primary/10 text-primary`.

### Dialog

`bg-card border rounded-md`, backdrop blur. Header berisi title + desc,
body konten, opsional `DialogFooter` untuk aksi. PDF viewer memakai iframe
`h-[70vh]` dalam dialog `max-w-3xl`.

## Do's and Don'ts

- **Do** gunakan token semantik (`bg-card`, `text-muted-foreground`) — jangan
  hardcode hex kecuali 3 warna status.
- **Don't** gunakan gradien atau bayangan tebal di dalam konten; flat untuk
  surface, warna untuk aksen.
- **Do** jaga kontras ACCAA minimum 4.5:1 untuk teks normal.
- **Don't** campur sudut tajam dengan `rounded-full` dalam satu view.
- **Do** gunakan satu CTA primary per layar (button default), aksi lain pakai
  outline/ghost.
- **Don't** gunakan warna status di luar makna: kuning=pending, hijau=approve,
  merah=reject.
- **Do** uji tampilan di mode gelap (default) sebelum terang.
- **Don't** menambah font baru tanpa registrasi di `SettingsProvider` +
  `index.css`; keduanya harus sinkron.