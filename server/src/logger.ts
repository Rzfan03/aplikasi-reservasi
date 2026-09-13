export type LogLevel = 'log' | 'info' | 'warn' | 'error'

export interface LogEntry {
  id: number
  ts: number
  level: LogLevel
  source: string
  message: string
}

const MAX_LOGS = 1000
const MAX_MSG = 2000
let nextId = 1
const logs: LogEntry[] = []

const SOURCE_MAP: Record<string, string> = {
  whatsapp: 'wa',
  wa: 'wa',
  http: 'be',
  process: 'be',
  system: 'be',
  sse: 'be',
  ws: 'be',
  api: 'fe',
  viteclient: 'fe',
}

function sourceOf(source: string, message: string): string {
  if (source === 'console') {
    const m = /^\s*\[([a-z0-9_.-]+)\]/i.exec(message.trim())
    const tag = m ? m[1].toLowerCase() : ''
    return SOURCE_MAP[tag] ?? (tag || 'be')
  }
  return SOURCE_MAP[source.toLowerCase()] ?? source.toLowerCase()
}

let emit: ((entry: LogEntry) => void) | undefined
export function setLogEmitter(fn: ((entry: LogEntry) => void) | undefined): void {
  emit = fn
}

export function log(level: LogLevel, source: string, message: string): void {
  const truncated = message.length > MAX_MSG ? `${message.slice(0, MAX_MSG)}…` : message
  const entry: LogEntry = { id: nextId++, ts: Date.now(), level, source: sourceOf(source, message), message: truncated }
  logs.push(entry)
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS)
  emit?.(entry)
}

export function getLogs(limit = 200): LogEntry[] {
  return [...logs].reverse().slice(0, limit)
}

function formatArg(arg: unknown): string {
  if (arg instanceof Error) return arg.stack ?? arg.message
  if (typeof arg === 'string') return arg
  try {
    return JSON.stringify(arg)
  } catch {
    return String(arg)
  }
}

export function installConsoleLogger(): void {
  ;(['log', 'info', 'warn', 'error'] as const).forEach((level) => {
    const original = console[level].bind(console)
    console[level] = (...args: unknown[]) => {
      log(level, 'console', args.map(formatArg).join(' '))
      original(...args)
    }
  })
}