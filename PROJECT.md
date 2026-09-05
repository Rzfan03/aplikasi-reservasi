# PROJECT.md — Reservasi Layanan Admin

## Overview

A full-stack reservation management system ("Sistem Reservasi") for handling service requests from government agencies. Built as a monorepo with two main apps:

- **`admin/`** — React SPA (Vite + TypeScript), the admin dashboard
- **`server/`** — Express.js API backend with Prisma ORM + Neon (PostgreSQL)

The system allows agencies to submit service requests (with PDF attachments), and admins review/approve/reject them. Real-time updates via Server-Sent Events (SSE).

---

## Tech Stack

### Frontend (`admin/`)
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (OKLCH, `@theme inline`) |
| Components | shadcn/ui (Radix UI primitives, `radix-ui` + `class-variance-authority`) |
| State | Zustand (notifications), React Context (session, settings) |
| Routing | React Router v7 |
| Charts | Recharts (BarChart, AreaChart) |
| Auth | `@neondatabase/neon-js` Neon Auth SDK |
| Icons | Lucide React |
| Error Tracking | `@sentry/react` |
| Lint | oxlint |

### Backend (`server/`)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express |
| Database | Neon (PostgreSQL) via Prisma ORM |
| Auth | `jose` library — JWKS JWT verification against Neon Auth |
| File Upload | Multer (PDF files) |
| Real-time | Server-Sent Events (SSE) |
| Env | dotenv |

### Database (Neon)
- **Provider**: PostgreSQL (Neon serverless)
- **ORM**: Prisma Client
- **Connection**: `DATABASE_URL_UNPOOLED` for direct, `DATABASE_URL` for pooled
- **Schema**: `server/prisma/schema.prisma`

---

## Database Schema

```prisma
enum Status {
  PENDING
  APPROVED
  REJECTED
}

model Layanan {
  id        String   @id @default(cuid())
  nama      String   @unique
  urutan    Int      @default(0)
  createdAt DateTime @default(now())
}

model Instansi {
  id        String   @id @default(cuid())
  nama      String   @unique
  createdAt DateTime @default(now())
}

model Request {
  id          String   @id @default(cuid())
  instansi    String
  nama        String
  nip         String
  jabatan     String
  layanan     String
  tanggal     DateTime
  deskripsi   String?
  pdfFile     String
  status      Status   @default(PENDING)
  statusToken String   @unique
  adminEmail  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([status])
}

model Admin {
  id    String @id @default(cuid())
  email String @unique
}
```

---

## Project Structure

```
apps-reservasi/
├── admin/                          # React SPA (Vite)
│   ├── index.html                  # Entry HTML (Inter + JetBrains Mono fonts)
│   ├── src/
│   │   ├── App.tsx                 # Root: SettingsProvider > SessionProvider > NotifProvider > Routes
│   │   ├── main.tsx                # Entry point, Sentry init
│   │   ├── sentry.ts              # Sentry config
│   │   ├── index.css              # Tailwind + WattVision CSS variables
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui primitives
│   │   │   │   ├── button.tsx     # Cyan primary, rounded-lg, glow shadow
│   │   │   │   ├── card.tsx       # rounded-2xl, bg-card (#1E1E1E)
│   │   │   │   ├── dialog.tsx     # rounded-2xl, backdrop blur
│   │   │   │   ├── input.tsx      # bg-muted, cyan focus ring
│   │   │   │   ├── table.tsx      # border-border rows
│   │   │   │   ├── badge.tsx      # success/warning/destructive variants
│   │   │   │   ├── sidebar.tsx    # Collapsible sidebar (shadcn)
│   │   │   │   ├── select.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── label.tsx
│   │   │   ├── AppSidebar.tsx     # Main sidebar nav (Utama/Manajemen/Sistem groups)
│   │   │   ├── StatusBadge.tsx    # PENDING=amber, APPROVED=green, REJECTED=red
│   │   │   ├── KpiCard.tsx        # KPI stat card (JetBrains Mono 32px bold)
│   │   │   ├── WattVisionAlert.tsx # Critical/warning alert panel
│   │   │   ├── StatusChart.tsx    # Recharts BarChart (status distribution)
│   │   │   ├── ActivityAreaChart.tsx # Recharts AreaChart (7-day activity)
│   │   │   ├── SettingsProvider.tsx # Font size only (dark locked)
│   │   │   └── NotifProvider.tsx  # BroadcastChannel cross-tab sync
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx  # KPIs + Recharts + alerts + recent requests
│   │   │   ├── LayananPage.tsx    # CRUD card/list layout
│   │   │   ├── InstansiPage.tsx   # CRUD card/list layout
│   │   │   ├── PermohonanPage.tsx # Paged list with search/filter
│   │   │   ├── PermohonanDetailPage.tsx # Detail + approve/reject
│   │   │   ├── NotifPage.tsx      # Notification history
│   │   │   ├── PengaturanPage.tsx # Font size picker only
│   │   │   └── LoginPage.tsx      # Dark login with blue gradient
│   │   ├── hooks/
│   │   │   ├── useNotificationStore.ts # Zustand store (persisted)
│   │   │   └── use-mobile.ts
│   │   └── lib/
│   │       ├── api.ts            # API client (auto-retry on 401, redirect cooldown)
│   │       ├── auth.ts           # Neon Auth SDK client
│   │       ├── SessionProvider.tsx # Session context
│   │       ├── useSession.ts     # Session hook
│   │       ├── types.ts          # TypeScript types
│   │       └── utils.ts          # cn() utility
│   └── package.json
│
├── server/                         # Express API
│   ├── src/
│   │   ├── index.ts               # Express app, CORS, routes, SSE endpoint
│   │   ├── auth.ts                # JWKS JWT verification (jose)
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── sse.ts                 # SSE broadcast/subscribe
│   │   ├── upload.ts              # Multer PDF upload config
│   │   ├── middleware/
│   │   │   └── requireAdmin.ts    # Auth middleware (JWT + admin table check)
│   │   └── routes/
│   │       ├── requests.ts        # CRUD + stats + SSE + status update
│   │       └── layanan.ts         # Layanan + Instansi CRUD
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── package.json
│
├── AGENTS.md                       # AI agent rules & lessons learned
├── DESIGN.md                       # WattVision design spec
└── PROJECT.md                      # This file
```

---

## Architecture

### Route Structure (`App.tsx`)

```
SettingsProvider > SessionProvider > NotifProvider > Routes
  /login → LoginPageGuard (redirects to / if logged in)
  /* → AdminLayout (SidebarProvider > SidebarInset > Routes)
    / → DashboardPage
    /layanan → LayananPage
    /instansi → InstansiPage
    /permohonan → PermohonanPage
    /permohonan/:id → PermohonanDetailPage
    /notifikasi → NotifPage
    /pengaturan → PengaturanPage
    * → Redirect to /
```

- `AdminLayout` stays mounted — only `<Outlet>` child swaps
- `LoginPageGuard` handles redirect: user → `/`, no user → LoginPage

### Auth Flow (CRITICAL)

**Frontend → Neon Auth SDK:**
1. `signIn.email({ email, password })` via `authClient`
2. `authClient.getSession()` returns `{ data: { session: { access_token }, user: { id, email, name } } }`
3. `getSessionAccessToken()` extracts the token (checks `access_token`, `accessToken`, `token` fields)
4. **NO custom token caching** — always call `getSession()` fresh

**Backend → JWT Verification:**
1. `server/src/auth.ts` uses `jose` library with JWKS (`NEON_AUTH_JWKS_URL`)
2. `verifyToken()` validates JWT signature + issuer (`NEON_AUTH_BASE_URL`)
3. `requireAdmin` middleware checks admin email exists in `admin` table

**API Client (`api.ts`):**
1. `getToken()` → `getSessionAccessToken()` → `authClient.getSession()` → extract token
2. All requests include `Authorization: Bearer <token>` header
3. On 401: retry once, then `redirectToLogin()` (with 2s cooldown)
4. On no token: throw `UnauthorizedError` → catch → `redirectToLogin()`

### State Management

- **Session**: `useSession()` → `SessionProvider` → `useSessionCtx()` (React Context)
- **Settings**: `SettingsProvider` → `useSettings()` — fontSize only (dark locked)
- **Notifications**: Zustand store `useNotificationStore` + `NotifProvider` for cross-tab sync via BroadcastChannel

### Real-time (SSE)

- Server: `GET /api/requests/events` with JWT in query param
- Events: `request_created`, `status_changed`
- Client: `EventSource` with retry logic (max 5 retries, exponential backoff)
- DashboardPage listens for SSE and refreshes stats + adds notifications

---

## Design System — WattVision

### Color Tokens (CSS Variables in `index.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#121212` | Page background |
| `--card` | `#1E1E1E` | Card/panel background |
| `--primary` | `#00E5FF` | Cyan accent, buttons, links |
| `--primary-dim` | `#00B8D4` | Hover state for primary |
| `--secondary` | `#2196F3` | Secondary actions |
| `--muted` | `#2C2C2E` | Borders, input bg, muted bg |
| `--muted-foreground` | `#98989D` | Secondary text |
| `--foreground` | `#FFFFFF` | Primary text |
| `--destructive` | `#FF453A` | Error, delete, alerts |
| `--success` | `#32D74B` | Approved status |
| `--warning` | `#FFD60A` | Pending status |
| `--border` | `#2C2C2E` | All borders |
| `--sidebar-bg` | `#1A1A1A` | Sidebar background |

### Typography

- **Body**: Inter (400, 500, 600, 700)
- **Monospace/Numbers**: JetBrains Mono (400, 700) — KPI values, stats
- **Font size**: Configurable via PengaturanPage (13px/14px/15px/16px)
- **Font family**: Also configurable (Inter default, Poppins available)

### Component Patterns

- **Cards**: `rounded-2xl`, `border border-border`, `bg-card` (#1E1E1E)
- **Buttons**: `rounded-lg`, cyan primary with glow shadow `shadow-[0_0_12px_rgba(0,229,255,0.3)]`
- **Inputs**: `bg-muted` (#2C2C2E), `border-border`, cyan focus ring
- **Tables**: Row borders `border-border`, hover `hover:bg-[#252525]`
- **Status badges**: PENDING=amber, APPROVED=green, REJECTED=red (all with 15% opacity bg)
- **Alerts**: `border-l-4`, critical=red bg, warning=amber bg
- **Sidebar**: `bg-sidebar` (#1A1A1A), active item `bg-primary/10 text-primary` with glow

### Page Consistency

All pages use:
```tsx
<main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
  {/* Page header */}
  <div>
    <h1 className="text-xl sm:text-2xl font-bold text-foreground">Title</h1>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
  {/* Content */}
</main>
```

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/requests` | Submit new request (multipart: PDF + fields) |
| GET | `/api/requests/:statusToken` | Check request status by token |
| GET | `/api/health` | Health check |

### Admin (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/requests` | List requests (paged, filterable) |
| GET | `/api/requests/stats` | Dashboard stats |
| PUT | `/api/requests/:id/status` | Approve/reject request |
| GET | `/api/requests/events` | SSE stream |
| GET | `/api/layanan` | List services |
| POST | `/api/layanan` | Create service |
| PUT | `/api/layanan/:id` | Update service |
| DELETE | `/api/layanan/:id` | Delete service |
| GET | `/api/instansi` | List agencies |
| POST | `/api/instansi` | Create agency |
| PUT | `/api/instansi/:id` | Update agency |
| DELETE | `/api/instansi/:id` | Delete agency |

---

## Environment Variables

### Frontend (`admin/.env`)
```
VITE_API_URL=http://localhost:4000
VITE_NEON_AUTH_URL=<neon-auth-project-url>
```

### Backend (`server/.env`)
```
PORT=4000
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
NEON_AUTH_JWKS_URL=<jwks-endpoint>
NEON_AUTH_BASE_URL=<auth-base-url>
```

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `admin/src/App.tsx` | Root layout, routing, providers |
| `admin/src/lib/auth.ts` | Neon Auth client, token extraction |
| `admin/src/lib/api.ts` | API client with auth + retry |
| `admin/src/lib/types.ts` | TypeScript interfaces |
| `admin/src/components/SettingsProvider.tsx` | Font size settings |
| `admin/src/hooks/useNotificationStore.ts` | Zustand notification store |
| `admin/src/components/NotifProvider.tsx` | BroadcastChannel cross-tab |
| `admin/src/index.css` | WattVision CSS variables |
| `server/src/auth.ts` | JWKS JWT verification |
| `server/src/middleware/requireAdmin.ts` | Auth middleware |
| `server/src/routes/requests.ts` | Request CRUD + SSE |
| `server/src/routes/layanan.ts` | Layanan + Instansi CRUD |
| `server/prisma/schema.prisma` | Database schema |
| `AGENTS.md` | AI agent rules & lessons |
| `DESIGN.md` | WattVision design spec |

---

## Common Pitfalls (from AGENTS.md)

1. **NEVER** use `window.location.href` for navigation during initial page load — causes refresh loops
2. **NEVER** do `broadcastChannel.postMessage()` inside Zustand store `add()` — causes infinite re-render loop
3. `redirectToLogin()` must have cooldown (2s) to prevent redirect loops
4. `AdminLayout` must redirect to `/login` when user is null (not show "Memuat…" forever)
5. Token field may be `access_token`, `accessToken`, or `token` — check all three
6. After Prisma schema change: run `npx prisma generate`
7. Use `DATABASE_URL_UNPOOLED` for direct connections, `DATABASE_URL` for pooled
8. Port conflicts: use `lsof -ti tcp:$port` (not `pkill -f`) to check/kill

---

## Development Commands

```bash
# Frontend
cd admin
npm run dev          # Start Vite dev server
npm run build        # Production build (tsc + vite build)
npm run lint         # oxlint
./node_modules/.bin/tsc --noEmit  # Type check

# Backend
cd server
npm run dev          # Start Express with tsx watch
npx prisma generate  # After schema changes
npx prisma db push   # Push schema to DB
```

---

## Current State (as of latest session)

- **Theme**: WattVision dark (fixed, no light mode toggle)
- **Fonts**: Inter + JetBrains Mono (Poppins available as option)
- **Charts**: Recharts (BarChart for status, AreaChart for activity)
- **Components**: KpiCard, WattVisionAlert, StatusChart, ActivityAreaChart
- **PengaturanPage**: Font size picker only
- **Build**: Clean (`tsc --noEmit` + `npm run build` pass)
- **Known**: Bundle is 1.4MB (recharts + react) — code splitting recommended for optimization
