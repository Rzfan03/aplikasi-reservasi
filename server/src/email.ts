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
  `<div style="background:#F3F4F2;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E7E5E4;border-radius:12px;overflow:hidden;">
    <div style="background:{{tintColor}};height:6px;"></div>
    <div style="background:#18181b;padding:28px 32px;">
      <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">Diskominfotik Kabupaten Sumbawa</div>
      <div style="font-size:12px;color:#a1a1aa;margin-top:3px;">Notifikasi Status Permohonan Layanan</div>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:14px;color:#52525b;margin:0 0 16px;">Yth. <strong style="color:#18181b;">{{nama}}</strong> ({{instansi}}),</p>
      <h2 style="margin:0 0 8px;font-size:19px;color:#18181b;">{{heading}}</h2>
      <p style="font-size:14px;color:#3f3f46;margin:0 0 0;line-height:1.55;">
        Permohonan Anda untuk layanan "<strong style="color:#18181b;">{{layanan}}</strong>" pada tanggal
        <strong style="color:#18181b;">{{tanggal}}</strong> telah {{kataKerja}}.
      </p>
      <div style="background:{{tintBg}};border:1px solid {{tintColor}}40;border-radius:8px;padding:14px 16px;margin:18px 0;">
        <span style="display:inline-block;background:{{tintColor}};color:#ffffff;font-weight:700;font-size:12px;padding:4px 12px;border-radius:999px;letter-spacing:0.6px;">{{statusLabel}}</span>
        {{rejectReason}}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 6px;">
        <tr>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;width:110px;">Pemohon</td>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{nama}}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Instansi</td>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{instansi}}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Layanan</td>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{layanan}}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Tanggal</td>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#18181b;font-size:14px;font-weight:600;">{{tanggal}}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:#71717a;font-size:13px;">Status</td>
          <td style="padding:9px 0;border-top:1px solid #F4F4F5;color:{{tintColor}};font-size:14px;font-weight:700;">{{statusLabel}}</td>
        </tr>
      </table>
      {{statusLink}}
    </div>
    <div style="background:#FAFAF9;border-top:1px solid #E7E5E4;padding:22px 32px;text-align:center;">
      <p style="font-size:12.5px;color:#71717a;margin:0 0 10px;line-height:1.55;">Untuk detail dan dokumen lebih lanjut, hubungi admin Diskominfotik Kabupaten Sumbawa.</p>
      <p style="font-size:13.5px;color:#18181b;margin:0;">Salam,<br/><strong>Diskominfotik Kabupaten Sumbawa</strong></p>
    </div>
  </div>
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
  const tanggalkata = input.tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
  const layout = await getEmailLayout()
  const { subject, content } = await getEmailTemplate()
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
    html: renderStatusHtml(layout, content, vars),
  })
  console.log(`[email] ${input.status} notif sent to ${input.to}`)
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