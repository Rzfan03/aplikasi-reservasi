import 'dotenv/config'
import QRCode from 'qrcode'
import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys'
import type { WASocket } from '@whiskeysockets/baileys'
import type { ConnectionState } from '@whiskeysockets/baileys/lib/Types/State.js'
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import pino from 'pino'
import type { Status } from '@prisma/client'
import { prisma } from './db.js'

const KEY = (name: string) => `whatsapp.${name}`
const PAIR_CODE_TTL_MS = 45_000
const SESSION_DIR = process.env.WA_SESSION_DIR ?? path.join(process.cwd(), 'data', 'wa-session')

mkdirSync(SESSION_DIR, { recursive: true })

export interface WaAdminState {
  enabled: boolean
  pairNumber: string
  status: {
    connecting: boolean
    connected: boolean
    paired: boolean
    meJid: string | null
    pairCode: string | null
    qr: string | null
    lastError: string | null
    lastSendError: string | null
    lastSendAt: number | null
  }
}

const state = {
  connecting: false,
  connected: false,
  paired: false,
  meJid: null as string | null,
  pairCode: null as string | null,
  pairCodeAt: 0,
  qr: null as string | null,
  lastError: null as string | null,
  lastSendError: null as string | null,
  lastSendAt: null as number | null,
}

let sock: WASocket | null = null
let initPromise: Promise<WASocket> | null = null
let loggingOut = false
let sendChain: Promise<unknown> = Promise.resolve()
let qrFor: string | null = null
let qrImg: string | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0

const FRIENDLY_ERRORS: Array<[RegExp, string]> = [
  [/qr refs attempts ended/i, 'Sesi QR habis dan koneksi berakhir (timeout). Pastikan jaringan server dapat mengakses web.whatsapp.com, lalu coba "Buat ulang".'],
  [/restart required|stream errored/i, 'Koneksi WhatsApp terganggu (server meminta restart). Periksa jaringan server agar dapat mengakses web.whatsapp.com, lalu coba "Buat ulang".'],
  [/ECONNRESET|socket hang up|Connection Closed|connection closed/i, 'Koneksi ke server WhatsApp terputus. Pastikan jaringan server dapat mengakses web.whatsapp.com (WebSocket port 443).'],
  [/timed out|timeout/i, 'Waktu koneksi ke server WhatsApp habis.'],
  [/logged out/i, 'Sesi WhatsApp diakhiri.'],
]
function friendlyError(msg: string): string {
  for (const [re, label] of FRIENDLY_ERRORS) if (re.test(msg)) return label
  return msg
}

function isRegistered(s: WASocket): boolean {
  return !!s.authState.creds.registered
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const p = sendChain.then(fn)
  sendChain = p.catch(() => {})
  return p
}

export async function getWaSettings(): Promise<{ enabled: boolean; pairNumber: string }> {
  const rows = await prisma.setting.findMany({ where: { key: { startsWith: KEY('') } } })
  const map = Object.fromEntries(rows.map((r) => [r.key.replace(KEY(''), ''), r.value]))
  return {
    enabled: map.enabled === 'true',
    pairNumber: map.pairNumber ?? process.env.WHATSAPP_NUMBER ?? '',
  }
}

export async function saveWaEnabled(enabled: boolean): Promise<void> {
  await prisma.setting.upsert({
    where: { key: KEY('enabled') },
    create: { key: KEY('enabled'), value: enabled ? 'true' : 'false' },
    update: { value: enabled ? 'true' : 'false' },
  })
}

async function saveWaPairNumber(number: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key: KEY('pairNumber') },
    create: { key: KEY('pairNumber'), value: number },
    update: { value: number },
  })
}

export function normalizeWaNumber(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.startsWith('62')) return d
  if (d.startsWith('0')) return `62${d.slice(1)}`
  if (d.startsWith('8')) return `62${d}`
  return d
}

async function buildQrImg(): Promise<string | null> {
  if (!state.qr) {
    qrFor = null
    qrImg = null
    return null
  }
  if (state.qr !== qrFor) {
    qrFor = state.qr
    qrImg = await QRCode.toDataURL(state.qr, { width: 480, margin: 1 })
  }
  return qrImg
}

export async function getWaAdminState(): Promise<WaAdminState> {
  if (!sock && !reconnectTimer) void start().catch(() => {})
  const { enabled, pairNumber } = await getWaSettings()
  const qr = await buildQrImg()
  return {
    enabled,
    pairNumber,
    status: {
      connecting: state.connecting,
      connected: state.connected,
      paired: state.paired,
      meJid: state.meJid,
      pairCode: state.pairCode,
      qr,
      lastError: state.lastError,
      lastSendError: state.lastSendError,
      lastSendAt: state.lastSendAt,
    },
  }
}

async function initSocket(): Promise<WASocket> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const { state: auth, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
    const s = makeWASocket({
      auth,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
    })
    s.ev.on('creds.update', () => {
      void saveCreds()
    })
    s.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      handleConnectionUpdate(s, update)
    })
    return s
  })()
  return initPromise
}

function handleConnectionUpdate(s: WASocket, update: Partial<ConnectionState>): void {
  const { connection, lastDisconnect } = update
  if (update.qr) {
    state.qr = update.qr
  }
  if (connection === 'connecting') {
    state.connecting = true
  } else if (connection === 'open') {
    state.connecting = false
    state.connected = true
    state.paired = isRegistered(s)
    state.meJid = s.authState.creds.me?.id ?? s.user?.id ?? state.meJid
    state.qr = null
    state.lastError = null
    reconnectAttempts = 0
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  } else if (connection === 'close') {
    state.connecting = false
    state.connected = false
    sock = null
    initPromise = null
    const boom = lastDisconnect?.error as { output?: { statusCode?: number } } | undefined
    const code = boom?.output?.statusCode
    if (code === DisconnectReason.loggedOut) {
      state.paired = false
      state.meJid = null
      state.pairCode = null
      state.qr = null
      state.lastError = 'Akun WhatsApp diakhiri (logged out). Lakukan pairing ulang.'
      rmSync(SESSION_DIR, { recursive: true, force: true })
      mkdirSync(SESSION_DIR, { recursive: true })
      return
    }
    if (!loggingOut) {
      const msg = (lastDisconnect?.error as Error | undefined)?.message
      if (msg) state.lastError = friendlyError(msg)
      scheduleReconnect()
    }
  }
}

function scheduleReconnect(): void {
  if (loggingOut || reconnectTimer) return
  void (async () => {
    const { enabled } = await getWaSettings()
    if (!enabled) return
    reconnectAttempts++
    const delay = Math.min(3000 * reconnectAttempts, 30000)
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      void start().catch(() => {})
    }, delay)
  })()
}

export async function start(): Promise<void> {
  if (loggingOut) return
  try {
    if (!sock) sock = await initSocket()
  } catch (err) {
    state.lastError = friendlyError((err as Error)?.message || 'Gagal memulai WhatsApp')
    console.error('[whatsapp] gagal init:', (err as Error)?.message)
  }
}

async function requestPairingCode(number: string): Promise<{ code: string | null; paired: boolean }> {
  if (!sock) sock = await initSocket()
  if (state.connected && isRegistered(sock)) return { code: null, paired: true }
  if (isRegistered(sock)) {
    rmSync(SESSION_DIR, { recursive: true, force: true })
    mkdirSync(SESSION_DIR, { recursive: true })
    sock = null
    initPromise = null
    sock = await initSocket()
  }
  const s = sock
  if (state.pairCode && Date.now() - state.pairCodeAt < PAIR_CODE_TTL_MS) {
    return { code: state.pairCode, paired: false }
  }
  state.lastError = null
  state.qr = null
  try {
    const code = await Promise.race([
      s.requestPairingCode(number),
      sleep(45_000).then(() => {
        throw new Error('Waktu menunggu koneksi WhatsApp habis. Coba lagi.')
      }),
    ])
    state.pairCode = code ?? null
    state.pairCodeAt = Date.now()
    return { code, paired: false }
  } catch (err) {
    const reason = state.lastError
      ? `Tidak dapat terhubung ke WhatsApp: ${state.lastError}`
      : (err as Error)?.message || 'Gagal membuat kode pairing'
    let final = friendlyError(reason)
    if (!state.connected) {
      final = `${final}\nPastikan jaringan dapat mengakses web.whatsapp.com (WebSocket 443). Jika gagal, coba pakai hotspot HP/data seluler.`
    }
    state.lastError = final
    console.error('[whatsapp] pembuatan kode pairing gagal:', reason)
    throw new Error(final)
  }
}

async function resolveSendable(rawNumber: string): Promise<{ number: string; s: WASocket }> {
  const settings = await getWaSettings()
  if (!settings.enabled) throw new Error('Notifikasi WhatsApp belum diaktifkan.')
  const number = normalizeWaNumber(rawNumber)
  if (!/^62\d{8,14}$/.test(number)) throw new Error(`Nomor tidak valid: ${rawNumber}`)
  let s = sock
  if (!s) {
    s = await initSocket()
    sock = s
  }
  if (!state.connected || !isRegistered(s)) {
    throw new Error('WhatsApp belum terhubung. Lakukan pairing (OTP/QR) dahulu dan pastikan koneksi terbuka.')
  }
  return { number, s }
}

export async function sendWhatsApp(rawNumber: string, text: string): Promise<void> {
  try {
    const { number, s } = await resolveSendable(rawNumber)
    await enqueue(() => s.sendMessage(`${number}@s.whatsapp.net`, { text }))
    state.lastSendError = null
    state.lastSendAt = Date.now()
  } catch (err) {
    const msg = (err as Error).message
    state.lastSendError = friendlyError(msg)
    state.lastSendAt = Date.now()
    console.warn(`[whatsapp] tidak terkirim ke ${rawNumber}: ${msg}`)
  }
}

export async function sendTestWhatsApp(to: string, text: string): Promise<{ ok: true }> {
  try {
    const { number, s } = await resolveSendable(to)
    await enqueue(() => s.sendMessage(`${number}@s.whatsapp.net`, { text }))
    state.lastSendError = null
    state.lastSendAt = Date.now()
    return { ok: true }
  } catch (err) {
    state.lastSendError = friendlyError((err as Error).message)
    state.lastSendAt = Date.now()
    throw err
  }
}

export async function logoutWhatsApp(): Promise<void> {
  loggingOut = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectAttempts = 0
  if (sock) {
    try {
      await sock.logout()
    } catch {
      // abaikan
    }
  }
  sock = null
  initPromise = null
  rmSync(SESSION_DIR, { recursive: true, force: true })
  mkdirSync(SESSION_DIR, { recursive: true })
  state.connected = false
  state.paired = false
  state.meJid = null
  state.pairCode = null
  state.pairCodeAt = 0
  state.qr = null
  state.lastError = null
  loggingOut = false
}

export async function maybeStartWhatsApp(): Promise<void> {
  const settings = await getWaSettings()
  if (settings.enabled || settings.pairNumber) {
    void start().catch(() => {})
  }
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatJadwal(tanggal: Date, tanggalSelesai?: Date | null): string {
  const fmt = (d: Date) =>
    `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}.${d.getMinutes().toString().padStart(2, '0')}`
  if (tanggalSelesai) return `Mulai: ${fmt(tanggal)} WITA\nSelesai: ${fmt(tanggalSelesai)} WITA`
  return `Mulai: ${fmt(tanggal)} WITA`
}

export function buildStatusMessage(input: {
  nama: string
  layanan: string
  status: Status
  tanggal: Date
  tanggalSelesai?: Date | null
  rejectReason?: string | null
}): string {
  const { status, tanggal } = input
  const jadwal = formatJadwal(tanggal, input.tanggalSelesai)
  const hour = Number(new Date().toLocaleTimeString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Asia/Makassar' }))
  const salam = hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam'
  const intro =
    status === 'APPROVED'
      ? `Selamat ${salam} *${input.nama}*,\n\nPermohonan Anda untuk layanan *${input.layanan}* telah *DISETUJUI*.`
      : `Selamat ${salam} *${input.nama}*,\n\nMohon maaf, permohonan Anda untuk layanan *${input.layanan}* belum dapat disetujui.`
  const scheduleLine = `\n\nJadwal:\n${jadwal}`
  const reasonLine = input.rejectReason ? `\nAlasan: ${input.rejectReason}` : ''
  return `${intro}${scheduleLine}${reasonLine}\n\nTerima kasih.\n_Diskominfotik Kabupaten Sumbawa_`
}

export async function pairWhatsApp(number: string): Promise<{ code: string | null; paired: boolean }> {
  await saveWaPairNumber(number)
  state.pairCode = null
  state.pairCodeAt = 0
  return enqueue(() => requestPairingCode(number))
}