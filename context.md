# context.md — Dashboard Sistem Reservasi Layanan

## Kegunaan Aplikasi

Dashboard admin untuk **Sistem Reservasi Layanan** milik instansi pemerintahan
(Diskominfo). Instansi lain mengajukan permohonan layanan — misalnya nama
domain/subdomain, internet, jaringan telekomunikasi, aplikasi dan digitalisasi,
konsultasi statistik, sertifikasi tanda tangan elektronik — lengkap dengan
lampiran PDF.

Admin bertugas:

- Meninjau permohonan masuk, menyetujui atau menolak (dengan alasan penolakan).
- Mengelola daftar **Layanan** (yang bisa dipilih pemohon) dan **Instansi**.
- Memantau dashboard: jumlah permohonan (total/menunggu/disetujui/hari ini),
  distribusi status, dan aktivitas permohonan.
- Mendapat **notifikasi realtime** saat pemohon mengirim permohonan baru.
- Mencari permohonan (nama/instansi/NIP), memfilter berdasarkan status dan
  rentang tanggal, serta mengekspor data ke CSV.

Pemohon mengirim permohonan dari sisi publik (`POST /api/requests` + PDF),
lalu memantau status lewat token unik yang diberikan saat pengiriman.

## Arsitektur

Monorepo dua aplikasi:

```
apps-reservasi/
├── admin/    # Dashboard admin (React SPA)
└── server/   # API backend (Express + Prisma + Neon Postgres)
```

## Tech Stack

### Frontend (`admin/`)
| Layer | Teknologi |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (OKLCH, CSS variables) |
| UI Components | shadcn/ui (Radix UI, paket `radix-ui` terpadu) |
| Routing | React Router v7 |
| State | Zustand (notifikasi, persist), React Context (session, settings) |
| Charts | Recharts (BarChart, AreaChart) |
| Auth | Neon Auth SDK (`@neondatabase/neon-js`) |
| Icons | lucide-react |
| Error Tracking | @sentry/react |
| Lint | oxlint (`noUnusedLocals`, `noUnusedParameters`) |

### Backend (`server/`)
| Layer | Teknologi |
|-------|-----------|
| Runtime | Node.js + Express |
| Database | Neon (PostgreSQL) via Prisma ORM |
| Auth | `jose` — verifikasi JWT via JWKS Neon Auth |
| Upload | Multer (PDF, maks 5MB) |
| Realtime | Server-Sent Events (SSE) + BroadcastChannel (cross-tab) |
| Env | dotenv |

### Database (Prisma schema)
- `Layanan` — daftar layanan (nama, urutan tampilan)
- `Instansi` — daftar instansi pemohon
- `Request` — permohonan (instansi, NIP, jabatan, layanan, tanggal, deskripsi,
  pdf, status PENDING/APPROVED/REJECTED, statusToken, adminEmail, rejectReason)
- `Admin` — email admin yang berhak login

## Auth Flow (ringkas)

1. Login: `authClient.signIn.email()` → `getSession()` (token diambil segar,
   tanpa cache custom — field token bisa `access_token`/`accessToken`/`token`).
2. Server memverifikasi JWT dengan `jose` + JWKS, lalu cek email di tabel `admin`.
3. `api.ts` menambah header `Authorization: Bearer <token>`; pada 401 retry
   sekali, lalu redirect ke `/login` (dengan cooldown 2s).

## Realtime

- Server: `GET /api/requests/events` (SSE, JWT via query).
- Event: `request_created`, `status_changed`.
- Client: `EventSource` (max 5 retry, exponential backoff); Dashboard dan
  halaman test mendengarkannya. Notifikasi zustand disinkronkan antar-tab via
  BroadcastChannel (`NotifProvider`).
- Halaman test: `/test-permohonan` (kirim permohonan uji, PDF dibuat otomatis)
  dan `/test-notif` (lihat event SSE live + pipeline notifikasi).

## Komponen Penting

| File | Peran |
|------|-------|
| `admin/src/App.tsx` | Layout, routing, provider |
| `admin/src/pages/*` | Dashboard, Layanan (tabel + side sheet), Instansi, Permohonan (paginasi/filter/export), Detail, Notifikasi, Pengaturan, Test |
| `admin/src/lib/api.ts` | API client (auth + retry + redirect) |
| `admin/src/lib/branding.ts` | Nama instansi + logo (login & sidebar) |
| `server/src/routes/requests.ts` | Submit publik, list/stats admin, update status, GET by id |
| `server/src/routes/layanan.ts` | CRUD Layanan + Instansi |
| `server/src/sse.ts` | Broadcast SSE ke semua client |