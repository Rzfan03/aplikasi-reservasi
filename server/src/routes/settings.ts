import { Router } from 'express'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { wrap } from '../wrap.js'
import { getSmtpConfig, saveSmtpConfig, toPublic, type SmtpConfigPublic } from '../smtp.js'
import { sendTestEmail, getEmailTemplate, saveEmailTemplate, getEmailLayout, saveEmailLayout, getEmailMode, saveEmailMode, DEFAULT_STATUS_TEMPLATE, DEFAULT_STATUS_SUBJECT, DEFAULT_STATUS_LAYOUT, type EmailBlock } from '../email.js'
import { getWaAdminState, saveWaEnabled, normalizeWaNumber, pairWhatsApp, logoutWhatsApp, sendTestWhatsApp } from '../whatsapp.js'

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
    mode: await getEmailMode(),
    layout,
    defaults: {
      subject: DEFAULT_STATUS_SUBJECT,
      content: DEFAULT_STATUS_TEMPLATE,
      layout: DEFAULT_STATUS_LAYOUT,
    },
  })
}))

settingsRouter.put('/email-template', requireAdmin, wrap(async (req, res) => {
  const { subject, mode, layout, content } = req.body ?? {}
  if (typeof subject !== 'string') {
    res.status(400).json({ error: 'Judul email (subjek) belum diisi' })
    return
  }
  const m = mode === 'html' ? 'html' : 'layout'
  if (m === 'html') {
    if (typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'File HTML kosong' })
      return
    }
    await saveEmailTemplate(subject, content)
    await saveEmailMode('html')
  } else {
    if (!Array.isArray(layout)) {
      res.status(400).json({ error: 'Susunan email masih kosong' })
      return
    }
    await saveEmailTemplate(subject, '')
    await saveEmailLayout(layout as EmailBlock[])
    await saveEmailMode('layout')
  }
  res.json({ ok: true })
}))

settingsRouter.get('/whatsapp', requireAdmin, wrap(async (_req, res) => {
  res.json(await getWaAdminState())
}))

settingsRouter.post('/whatsapp/enable', requireAdmin, wrap(async (req, res) => {
  const enabled = req.body?.enabled === true
  await saveWaEnabled(enabled)
  res.json({ enabled })
}))

settingsRouter.post('/whatsapp/pair', requireAdmin, wrap(async (req, res) => {
  const { number } = req.body ?? {}
  if (typeof number !== 'string' || !number.trim()) {
    res.status(400).json({ error: 'Nomor WhatsApp akun pembantu wajib diisi' })
    return
  }
  const n = normalizeWaNumber(number.trim())
  if (!/^62\d{8,14}$/.test(n)) {
    res.status(400).json({ error: 'Nomor WhatsApp tidak valid (contoh: 081234567890)' })
    return
  }
  const result = await pairWhatsApp(n)
  res.json({ ...result, number: n })
}))

settingsRouter.post('/whatsapp/test', requireAdmin, wrap(async (req, res) => {
  const { to, text } = req.body ?? {}
  if (typeof to !== 'string' || !to.trim()) {
    res.status(400).json({ error: 'Nomor tujuan wajib diisi' })
    return
  }
  if (typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Isi pesan uji wajib diisi' })
    return
  }
  try {
    await sendTestWhatsApp(to.trim(), text.trim())
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : 'Gagal mengirim pesan uji' })
    return
  }
  res.json({ ok: true })
}))

settingsRouter.post('/whatsapp/logout', requireAdmin, wrap(async (_req, res) => {
  await logoutWhatsApp()
  res.json({ ok: true })
}))