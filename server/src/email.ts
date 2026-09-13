import 'dotenv/config'
import nodemailer from 'nodemailer'
import type { Status } from '@prisma/client'
import { getSmtpConfig } from './smtp.js'
import { prisma } from './db.js'

export type StatusEmailInput = {
  to: string
  nama: string
  instansi: string
  layanan: string
  tanggal: Date
  tanggalSelesai?: Date | null
  status: Status
  rejectReason?: string | null
  statusToken?: string
}

function makeTransport(cfg: { host: string; port: number; secure: boolean; user: string; pass: string }) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
}

export const DEFAULT_STATUS_TEMPLATE =
  `<!--
  Template Email - Notifikasi Status Permohonan
  Sistem Reservasi Layanan Diskominfotik Kabupaten Sumbawa
  Versi 2: layout lebih rapi, terstruktur per section, background anime + overlay
-->
<div style="margin:0; padding:0; background-color:#eef0f4; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef0f4; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08);">

          <!-- ============ SECTION 1: HERO / HEADER ============ -->
          <tr>
            <td style="padding:0;">
              <div style="
                background-image:url('https://i.pinimg.com/736x/d7/9a/ea/d79aead0823e257308627ffe99ff68a8.jpg');
                background-size:cover;
                background-position:center;
                background-repeat:no-repeat;
                -webkit-filter: blur(2px);
                filter: blur(2px);
              ">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:36px 32px;">
                      <div style="background-color:{{tintBg}}; border-radius:12px; padding:28px 24px; -webkit-filter:none; filter:none;">
                        <p style="margin:0 0 6px 0; font-size:12px; letter-spacing:0.5px; text-transform:uppercase; color:#666;">
                          Sistem Reservasi Layanan &middot; Diskominfotik Kab. Sumbawa
                        </p>
                        <h1 style="margin:0; font-size:24px; line-height:1.3; color:{{tintColor}};">
                          {{heading}}
                        </h1>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- ============ SECTION 2: STATUS BADGE ============ -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:{{tintBg}}; color:{{tintColor}}; font-weight:bold; font-size:13px; letter-spacing:0.5px; padding:8px 18px; border-radius:20px;">
                    {{statusLabel}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ SECTION 3: SALAM & RINGKASAN ============ -->
          <tr>
            <td style="padding:20px 32px 0 32px; color:#222;">
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6;">
                Yth. <strong>{{nama}}</strong><br>
                <span style="color:#666; font-size:13px;">{{instansi}}</span>
              </p>
              <p style="margin:0; font-size:15px; line-height:1.6;">
                Permohonan Anda untuk layanan <strong>{{layanan}}</strong> telah
                <strong>{{kataKerja}}</strong>.
              </p>
            </td>
          </tr>

          <!-- ============ SECTION 4: DETAIL JADWAL (card) ============ -->
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa; border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px; font-size:13px; color:#444; line-height:1.8;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#888; width:120px; vertical-align:top;">Jadwal</td>
                        <td style="font-weight:bold; color:#222;">{{tanggal}}</td>
                      </tr>
                      <tr>
                        <td style="color:#888; vertical-align:top;">Mulai</td>
                        <td>{{tanggalMulai}}</td>
                      </tr>
                      <tr>
                        <td style="color:#888; vertical-align:top;">Selesai</td>
                        <td>{{tanggalSelesai}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ SECTION 5: ALASAN PENOLAKAN (kosong jika disetujui) ============ -->
          <tr>
            <td style="padding:16px 32px 0 32px;">
              {{rejectReason}}
            </td>
          </tr>

          <!-- ============ SECTION 6: CTA BUTTON ============ -->
          <tr>
            <td style="padding:24px 32px 8px 32px;" align="center">
              {{statusLink}}
            </td>
          </tr>

          <!-- ============ SECTION 7: FOOTER ============ -->
          <tr>
            <td style="padding:24px 32px; background-color:#fafafa; border-top:1px solid #eee; text-align:center;">
              <p style="margin:0; font-size:12px; color:#999; line-height:1.6;">
                Email ini dikirim otomatis oleh Sistem Reservasi Layanan<br>
                Diskominfotik Kabupaten Sumbawa. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>`

export const DEFAULT_STATUS_SUBJECT = 'Permohonan Layanan {{label}} ({{statusLabel}})'

export type EmailBlock =
  | { t: 'header'; title: string; subtitle: string; color?: string; textColor?: string }
  | { t: 'greeting' }
  | { t: 'heading'; text: string; color?: string }
  | { t: 'text'; text: string; color?: string }
  | { t: 'badge' }
  | { t: 'summary' }
  | { t: 'button'; label: string; color?: string; textColor?: string }
  | { t: 'divider' }
  | { t: 'footer'; note: string; sign: string; color?: string }

export const DEFAULT_STATUS_LAYOUT: EmailBlock[] = [
  { t: 'header', title: 'Diskominfotik Kabupaten Sumbawa', subtitle: 'Notifikasi Status Permohonan Layanan' },
  { t: 'greeting' },
  { t: 'heading', text: '{{heading}}' },
  { t: 'text', text: 'Permohonan Anda untuk layanan "{{layanan}}" pada tanggal {{tanggal}} telah {{kataKerja}}.' },
  { t: 'badge' },
  { t: 'summary' },
  { t: 'button', label: 'Cek Status Permohonan' },
  { t: 'footer', note: 'Untuk detail dan dokumen lebih lanjut, hubungi admin Diskominfotik Kabupaten Sumbawa.', sign: 'Salam,\nDiskominfotik Kabupaten Sumbawa' },
]

const TEMPLATE_KEY = 'email.status.template'
const SUBJECT_KEY = 'email.status.subject'

export async function getEmailTemplate(): Promise<{ subject: string; content: string }> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [TEMPLATE_KEY, SUBJECT_KEY] } },
  })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    subject: map[SUBJECT_KEY] ?? '',
    content: map[TEMPLATE_KEY] ?? '',
  }
}

export async function saveEmailTemplate(subject: string, content: string): Promise<void> {
  await prisma.$transaction(
    [
      { key: SUBJECT_KEY, value: subject },
      { key: TEMPLATE_KEY, value: content },
    ].map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  )
}

const LAYOUT_KEY = 'email.status.layout'
const MODE_KEY = 'email.status.mode'

export async function getEmailMode(): Promise<'layout' | 'html'> {
  const row = await prisma.setting.findUnique({ where: { key: MODE_KEY } })
  return row?.value === 'html' ? 'html' : 'layout'
}

export async function saveEmailMode(mode: 'layout' | 'html'): Promise<void> {
  await prisma.setting.upsert({
    where: { key: MODE_KEY },
    create: { key: MODE_KEY, value: mode },
    update: { value: mode },
  })
}

export async function getEmailLayout(): Promise<EmailBlock[] | null> {
  const row = await prisma.setting.findUnique({ where: { key: LAYOUT_KEY } })
  if (!row) return null
  try {
    const arr = JSON.parse(row.value)
    return Array.isArray(arr) && arr.length ? (arr as EmailBlock[]) : null
  } catch {
    return null
  }
}

export async function saveEmailLayout(layout: EmailBlock[]): Promise<void> {
  await prisma.setting.upsert({
    where: { key: LAYOUT_KEY },
    create: { key: LAYOUT_KEY, value: JSON.stringify(layout) },
    update: { value: JSON.stringify(layout) },
  })
}

function escS(s: string | undefined): string {
  return esc(s ?? '')
}

function renderLayoutBlock(b: EmailBlock, vars: Record<string, string>): string {
  switch (b.t) {
    case 'header':
      return (
        `<div style="background:${b.color || '#18181b'};padding:28px 32px;">` +
        `<div style="font-size:18px;font-weight:700;color:${b.textColor || '#ffffff'};letter-spacing:0.2px;">${escS(b.title)}</div>` +
        `<div style="font-size:12px;color:#a1a1aa;margin-top:3px;">${escS(b.subtitle)}</div></div>`
      )
    case 'divider':
      return `<div style="height:1px;background:#F4F4F5;margin:18px 32px;"></div>`
    case 'greeting':
      return `<p style="font-size:14px;color:#52525b;margin:24px 32px 0;line-height:1.55;">Yth. <strong style="color:#18181b;">{{nama}}</strong> ({{instansi}}),</p>`
    case 'heading':
      return `<h2 style="margin:16px 32px 0;font-size:19px;color:${b.color || '#18181b'};line-height:1.4;">${escS(b.text)}</h2>`
    case 'text':
      return `<p style="font-size:14px;color:${b.color || '#3f3f46'};margin:12px 32px 0;line-height:1.55;">${escS(b.text)}</p>`
    case 'badge':
      return (
        `<div style="padding:0 32px;margin:16px 0 0;">` +
        `<div style="background:${vars.tintBg};border:1px solid ${vars.tintColor}40;border-radius:8px;padding:14px 16px;display:inline-block;">` +
        `<span style="display:inline-block;background:${vars.tintColor};color:#ffffff;font-weight:700;font-size:12px;padding:4px 12px;border-radius:999px;letter-spacing:0.6px;">{{statusLabel}}</span>` +
        `${vars.rejectReason}</div></div>`
      )
    case 'summary':
      return (
        `<div style="padding:0 32px;margin:14px 0 0;"><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">` +
        `<tr><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;width:110px;">Pemohon</td><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{nama}}</td></tr>` +
        `<tr><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Instansi</td><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{instansi}}</td></tr>` +
        `<tr><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Layanan</td><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{layanan}}</td></tr>` +
        `<tr><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Tanggal</td><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{tanggal}}</td></tr>` +
        `<tr><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Status</td><td style="padding:9px 0;border-top:1px solid #F4F4F5;color:${vars.tintColor};font-size:14px;font-weight:700;">{{statusLabel}}</td></tr>` +
        `</table></div>`
      )
    case 'button':
      return vars.statusUrl
        ? `<p style="margin:20px 32px 0;text-align:center;"><a href="${vars.statusUrl}" style="display:inline-block;background:${b.color || '#4945FF'};color:${b.textColor || '#FFFFFF'};text-decoration:none;font-weight:700;font-size:14px;padding:11px 24px;border-radius:6px;">${escS(b.label)}</a></p>`
        : ''
    case 'footer':
      return (
        `<div style="background:#FAFAF9;border-top:1px solid #E7E5E4;margin-top:24px;padding:22px 32px;text-align:center;">` +
        `<p style="font-size:12.5px;color:${b.color || '#71717a'};margin:0 0 10px;line-height:1.55;">${escS(b.note)}</p>` +
        `<p style="font-size:13.5px;color:${b.color || '#18181b'};margin:0;line-height:1.6;">${escS(b.sign)}</p></div>`
      )
  }
}

export function renderStatusHtml(
  layout: EmailBlock[] | null,
  contentOverride: string,
  vars: Record<string, string>,
): string {
  if (layout && layout.length) {
    const inner = layout.map((b) => renderLayoutBlock(b, vars)).join('')
    const body =
      `<div style="background:#F3F4F2;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">` +
      `<div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E7E5E4;border-radius:12px;overflow:hidden;">` +
      `<div style="background:${vars.tintColor};height:6px;"></div>${inner}</div></div>`
    return renderTemplate(body, vars)
  }
  return renderTemplate(contentOverride || DEFAULT_STATUS_TEMPLATE, vars)
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )
}

function renderTemplate(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => vars[k] ?? '')
}

export async function sendStatusEmail(input: StatusEmailInput) {
  const cfg = await getSmtpConfig()
  if (!cfg.host || !cfg.from || !input.to) return
  const fmtTanggal = (d: Date) => d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const jam = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  const mulaiTxt = `${fmtTanggal(input.tanggal)}, ${jam(input.tanggal)} WITA`
  let tanggalkata = mulaiTxt
  let selesaiTxt = ''
  if (input.tanggalSelesai) {
    const end = new Date(input.tanggalSelesai)
    selesaiTxt = `${fmtTanggal(end)}, ${jam(end)} WITA`
    tanggalkata = input.tanggal.toDateString() === end.toDateString()
      ? `${fmtTanggal(input.tanggal)}, ${jam(input.tanggal)}\u2013${jam(end)} WITA`
      : `${mulaiTxt} \u2013 ${selesaiTxt}`
  }
  const success = input.status === 'APPROVED'
  const statusLabel = success ? 'DISETUJUI' : 'DITOLAK'
  const heading = success ? 'Permohonan Anda Disetujui' : 'Permohonan Anda Ditolak'
  const kataKerja = success ? 'disetujui' : 'ditolak'
  const baseUrl = process.env.APP_URL || ''
  const statusUrl = input.statusToken && baseUrl ? `${baseUrl}/status?token=${input.statusToken}` : ''
  const statusLink = statusUrl
    ? `<p style="margin:24px 0 0;text-align:center;"><a href="${statusUrl}" style="display:inline-block;background:#4945FF;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:11px 24px;border-radius:6px;">Cek Status Permohonan</a></p>`
    : ''
  const vars = {
    nama: esc(input.nama),
    instansi: esc(input.instansi),
    layanan: esc(input.layanan),
    tanggal: esc(tanggalkata),
    tanggalMulai: esc(mulaiTxt),
    tanggalSelesai: esc(selesaiTxt),
    statusLabel,
    heading,
    kataKerja,
    statusLink,
    statusUrl: esc(statusUrl),
    rejectReason: input.rejectReason
      ? `<div style="margin-top:10px;font-size:13px;color:#b91c1c;line-height:1.5;"><strong>Alasan penolakan:</strong> ${esc(input.rejectReason)}</div>`
      : '',
    tintColor: success ? '#16a34a' : '#dc2626',
    tintBg: success ? '#f0fdf4' : '#fef2f2',
  }
  const { subject } = await getEmailTemplate()
  const textBody =
    `Yth. ${input.nama} (${input.instansi}),\n\n` +
    `Permohonan Anda untuk layanan "${input.layanan}" pada tanggal ${tanggalkata} telah berstatus: ${statusLabel}.\n` +
    (input.rejectReason ? `Alasan penolakan: ${input.rejectReason}\n` : '') +
    `\nUntuk detail dan dokumen lebih lanjut, hubungi admin Diskominfotik Kabupaten Sumbawa.\n\nSalam,\nDiskominfotik Kabupaten Sumbawa`

  await makeTransport({ host: cfg.host, port: cfg.port, secure: cfg.secure, user: cfg.user, pass: cfg.pass }).sendMail({
    from: cfg.from,
    to: input.to,
    subject: renderTemplate(subject || DEFAULT_STATUS_SUBJECT, { label: success ? 'Disetujui' : 'Ditolak', statusLabel }),
    text: textBody,
    html: renderTemplate(DEFAULT_STATUS_TEMPLATE, vars),
  })
  console.log(`[email] ${input.status} notif sent to ${input.to}`)
}

export async function sendPlainEmail(to: string, subject: string, text: string): Promise<void> {
  const cfg = await getSmtpConfig()
  if (!cfg.host || !cfg.from || !to || !subject) return
  await makeTransport({ host: cfg.host, port: cfg.port, secure: cfg.secure, user: cfg.user, pass: cfg.pass }).sendMail({
    from: cfg.from,
    to,
    subject,
    text,
  })
  console.log(`[email] "${subject}" sent to ${to}`)
}

export async function sendTestEmail(to: string) {
  const cfg = await getSmtpConfig()
  if (!cfg.host || !cfg.from) throw new Error('Konfigurasi SMTP belum lengkap (host & from wajib diisi)')
  await makeTransport({ host: cfg.host, port: cfg.port, secure: cfg.secure, user: cfg.user, pass: cfg.pass }).sendMail({
    from: cfg.from,
    to,
    subject: 'Uji Email — Diskominfotik Kabupaten Sumbawa',
    text: 'Ini adalah email uji dari halaman pengaturan SMTP. Jika Anda menerima email ini, konfigurasi SMTP berfungsi dengan baik.',
  })
  console.log(`[email] test sent to ${to}`)
}