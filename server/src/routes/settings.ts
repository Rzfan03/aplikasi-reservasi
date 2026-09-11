import { Router } from 'express'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { wrap } from '../wrap.js'
import { getSmtpConfig, saveSmtpConfig, toPublic, type SmtpConfigPublic } from '../smtp.js'
import { sendTestEmail, getEmailTemplate, saveEmailTemplate, getEmailLayout, saveEmailLayout, DEFAULT_STATUS_TEMPLATE, DEFAULT_STATUS_SUBJECT, DEFAULT_STATUS_LAYOUT, type EmailBlock } from '../email.js'

export const settingsRouter = Router()

settingsRouter.get('/smtp', requireAdmin, wrap(async (_req, res) => {
  res.json(toPublic(await getSmtpConfig()))
}))

settingsRouter.put('/smtp', requireAdmin, wrap(async (req, res) => {
  const { host, port, secure, user, from, pass } = req.body ?? {}
  if (typeof host !== 'string' || !host.trim()) {
    res.status(400).json({ error: 'SMTP Host wajib diisi' })
    return
  }
  const p = Number(port)
  if (!Number.isInteger(p) || p < 1 || p > 65535) {
    res.status(400).json({ error: 'Port harus angka 1–65535' })
    return
  }
  if (typeof from !== 'string' || !from.trim()) {
    res.status(400).json({ error: 'Email pengirim (From) wajib diisi' })
    return
  }
  const saved: SmtpConfigPublic = await saveSmtpConfig({
    host: host.trim(),
    port: p,
    secure: secure === true,
    user: typeof user === 'string' ? user.trim() : '',
    from: from.trim(),
    pass: typeof pass === 'string' ? pass : undefined,
  })
  res.json(saved)
}))

settingsRouter.post('/smtp/test', requireAdmin, wrap(async (req, res) => {
  const { to } = req.body ?? {}
  if (typeof to !== 'string' || !to.trim()) {
    res.status(400).json({ error: 'Email tujuan uji wajib diisi' })
    return
  }
  await sendTestEmail(to.trim())
  res.json({ ok: true })
}))

settingsRouter.get('/email-template', requireAdmin, wrap(async (_req, res) => {
  const { subject, content } = await getEmailTemplate()
  const layout = await getEmailLayout()
  res.json({
    subject,
    content,
    layout,
    defaults: {
      subject: DEFAULT_STATUS_SUBJECT,
      content: DEFAULT_STATUS_TEMPLATE,
      layout: DEFAULT_STATUS_LAYOUT,
    },
  })
}))

settingsRouter.put('/email-template', requireAdmin, wrap(async (req, res) => {
  const { subject, layout } = req.body ?? {}
  if (typeof subject !== 'string' || !Array.isArray(layout)) {
    res.status(400).json({ error: 'subject (teks) dan layout (array blok) wajib diisi' })
    return
  }
  // layout menjadi sumber tampilan; hapus override HTML manual agar tidak bentrok
  await saveEmailTemplate(subject, '')
  await saveEmailLayout(layout as EmailBlock[])
  res.json({ ok: true })
}))