import 'dotenv/config'
import nodemailer from 'nodemailer'
import type { Status } from '@prisma/client'

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

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
})

export async function sendStatusEmail(input: StatusEmailInput) {
  if (!process.env.SMTP_HOST || !input.to) return
  const tanggalkata = input.tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const statusLabel = input.status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'
  const subject =
    input.status === 'APPROVED'
      ? 'Permohonan Layanan Disetujui'
      : 'Permohonan Layanan Ditolak'
  const textBody =
    `Yth. ${input.nama} (${input.instansi}),\n\n` +
    `Permohonan layanan "${input.layanan}" untuk tanggal ${tanggalkata} tercatat dengan status: ${statusLabel}.\n` +
    (input.rejectReason ? `Alasan penolakan: ${input.rejectReason}\n` : '') +
    `\nUntuk detail dan dokumen lebih lanjut, hubungi admin Diskominfotik Kabupaten Sumbawa.\n\nSalam,\nDiskominfotik Kabupaten Sumbawa`

  const baseUrl = process.env.APP_URL || ''
  const statusLink = input.statusToken && baseUrl ? `${baseUrl}/status?token=${input.statusToken}` : ''
  const badgeColor = input.status === 'APPROVED' ? '#16a34a' : '#dc2626'
  const badgeBg = input.status === 'APPROVED' ? '#dcfce7' : '#fee2e2'
  const htmlBody =
    `<div style="background:#F3F4F2;padding:24px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;padding:32px;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#021720;">Diskominfotik Kabupaten Sumbawa</h2>
    <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">Notifikasi status permohonan layanan</p>
    <p style="font-size:15px;color:#333;margin:0 0 16px;">Yth. <strong>${input.nama}</strong> (${input.instansi}),</p>
    <div style="display:inline-block;background:${badgeBg};color:${badgeColor};font-weight:bold;font-size:13px;padding:6px 14px;border-radius:4px;margin:0 0 16px;">${statusLabel}</div>
    <p style="font-size:15px;color:#333;margin:0 0 8px;">Permohonan layanan "<strong>${input.layanan}</strong>" untuk tanggal <strong>${tanggalkata}</strong> berstatus <strong>${statusLabel}</strong>.</p>
    ${input.rejectReason ? `<p style="font-size:14px;color:#dc2626;margin:0 0 8px;">Alasan penolakan: ${input.rejectReason}</p>` : ''}
    ${statusLink ? `<p style="margin:24px 0;"><a href="${statusLink}" style="display:inline-block;background:#4945FF;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:10px 20px;border-radius:4px;">Cek Status Permohonan</a></p>` : ''}
    <p style="font-size:13.5px;color:#6b7280;margin:0;">Untuk detail dan dokumen lebih lanjut, hubungi admin Diskominfotik Kabupaten Sumbawa.</p>
    <p style="font-size:13.5px;color:#333;margin:16px 0 0;">Salam,<br/>Diskominfotik Kabupaten Sumbawa</p>
  </div>
</div>`

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: input.to,
    subject,
    text: textBody,
    html: htmlBody,
  })
  console.log(`[email] ${input.status} notif sent to ${input.to}`)
}