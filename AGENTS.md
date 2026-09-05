# AGENTS.md — Rules & Lessons Learned

## Auth Flow (CRITICAL)

### Frontend → Neon Auth SDK
- `authClient.getSession()` returns `{ data: { session: { access_token }, user: { id, email, name } } }`
- `signIn.email({ email, password })` then `getSession()` to get user
- **NO custom token caching** — always call `getSession()` fresh
- Access token field may be `access_token`, `accessToken`, or `token` — check all

### Backend → JWT Verification
- Server uses `jose` library with JWKS to verify JWT (NOT SQL query to neon_auth.session)
- `NEON_AUTH_JWKS_URL` and `NEON_AUTH_BASE_URL` must be set in `.env`
- `requireAdmin` middleware checks admin email exists in `admin` table

### Common Pitfalls
- **NEVER** use `window.location.href` for navigation during initial page load — causes refresh loops
- **NEVER** do `broadcastChannel.postMessage()` inside Zustand store `add()` — causes infinite re-render loop with BroadcastChannel listener
- `redirectToLogin()` must have cooldown to prevent redirect loops
- `AdminLayout` must redirect to `/login` when user is null (not just show "Memuat…" forever)

## Architecture

### Layout Route Pattern (App.tsx)
```
SettingsProvider > SessionProvider > NotifProvider > Routes
  /login → LoginPageGuard
  /* → AdminLayout (SidebarProvider > SidebarInset > Routes)
```
- `AdminLayout` stays mounted — only `<Outlet>` child swaps
- `LoginPageGuard` handles redirect: user → `/`, no user → LoginPage

### State Management
- **Session**: `useSession()` → `SessionProvider` → `useSessionCtx()`
- **Settings**: `SettingsProvider` → `useSettings()` — palette, font, fontSize, darkMode
- **Notifications**: Zustand store `useNotificationStore` + `NotifProvider` for cross-tab sync

### API Calls
- `api.ts` → `getToken()` → `getSessionAccessToken()` → `authClient.getSession()` → `session.access_token`
- On 401: retry once, then `redirectToLogin()` (with cooldown)
- On no token: throw `UnauthorizedError`, catch → `redirectToLogin()`

## UI Rules

### Design
- Font: Poppins
- Colors: OKLCH flat solid (no gradients except login bg)
- 11 color palettes: blue, red, green, purple, orange, teal, indigo, pink, amber, cyan, slate
- Sidebar collapsed: 5.5rem width, icons only, text hidden
- Sidebar buttons: `size="lg"` for bigger hit targets
- Dark mode: `.dark` class on `<html>`, CSS variables in `index.css`

### Page Consistency
- All pages use `<main className="flex-1 p-6 space-y-6">`
- Consistent card/list layouts with skeleton loading
- All CRUD pages: card-based list (not table) + dialog for add/edit
- No `max-w-*` constraints on pages — full width always
- Remove unused imports (Label, Download, etc.)

### Sidebar Navigation
```
Utama: Dashboard
Manajemen: Layanan, Instansi, Permohonan
Sistem: Notifikasi (badge), Pengaturan
```
- Profile dropdown at footer (floating panel with user info + sign out)
- No standalone logout button — all in dropdown

## Development

### Port Conflicts
- Use `lsof -ti tcp:$port` (not `pkill -f`) to check/kill processes

### Prisma
- After schema change: `npx prisma generate`
- `DATABASE_URL_UNPOOLED` for direct connection, `DATABASE_URL` for pooled

### TypeScript
- Run `./node_modules/.bin/tsc --noEmit` to verify
- `noUnusedLocals: true`, `noUnusedParameters: true`

### npm install
- `@neondatabase/neon-js` has many deps — can timeout on slow networks
- Use `--legacy-peer-deps` if peer dep conflicts
- `zustand` needed for notification store
- `@sentry/react` for error tracking
