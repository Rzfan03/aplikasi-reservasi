import 'dotenv/config'
import { prisma } from './db.js'

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

export interface SmtpConfigPublic {
  host: string
  port: number
  secure: boolean
  user: string
  from: string
  hasPass: boolean
}

const DEFAULTS: SmtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.EMAIL_FROM || '',
}

const KEY = (name: string) => `smtp.${name}`

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const rows = await prisma.setting.findMany({
    where: { key: { startsWith: KEY('') } },
  })
  const overrides = Object.fromEntries(
    rows.map((r) => [r.key.replace(KEY(''), ''), r.value]),
  )
  const cfg = { ...DEFAULTS }
  if (overrides.host !== undefined) cfg.host = overrides.host
  if (overrides.port !== undefined) cfg.port = Number(overrides.port) || cfg.port
  if (overrides.secure !== undefined) cfg.secure = overrides.secure === 'true'
  if (overrides.user !== undefined) cfg.user = overrides.user
  if (overrides.pass !== undefined) cfg.pass = overrides.pass
  if (overrides.from !== undefined) cfg.from = overrides.from
  return cfg
}

export async function saveSmtpConfig(input: {
  host: string
  port: number
  secure: boolean
  user: string
  from: string
  pass?: string
}): Promise<SmtpConfigPublic> {
  const current = await getSmtpConfig()
  const entries = [
    ['host', input.host],
    ['port', String(input.port || 587)],
    ['secure', input.secure ? 'true' : 'false'],
    ['user', input.user],
    ['from', input.from],
  ]
  if (typeof input.pass === 'string' && input.pass !== '') {
    entries.push(['pass', input.pass])
  }
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key: KEY(key) },
        create: { key: KEY(key), value },
        update: { value },
      }),
    ),
  )
  return toPublic({
    host: input.host,
    port: input.port || 587,
    secure: input.secure,
    user: input.user,
    from: input.from,
    pass: typeof input.pass === 'string' && input.pass !== '' ? input.pass : current.pass,
  })
}

export function toPublic(cfg: SmtpConfig): SmtpConfigPublic {
  return {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    user: cfg.user,
    from: cfg.from,
    hasPass: cfg.pass !== '',
  }
}