import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'

export const FONT_SIZES = [
  { name: 'sm', label: 'Kecil', value: '13px' },
  { name: 'base', label: 'Normal', value: '14px' },
  { name: 'md', label: 'Sedang', value: '15px' },
  { name: 'lg', label: 'Besar', value: '16px' },
]

export const FONTS = [
  { name: 'inter', label: 'Inter', value: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  { name: 'poppins', label: 'Poppins', value: "'Poppins', ui-sans-serif, system-ui, sans-serif" },
]

export type Theme = 'dark' | 'light' | 'system'

export interface Settings {
  fontSize: string
  font: string
  theme: Theme
}

const DEFAULT: Settings = { fontSize: '14px', font: 'inter', theme: 'dark' }

interface SettingsCtx extends Settings {
  setFontSize: (s: string) => void
  setFont: (f: string) => void
  setTheme: (t: Theme) => void
}

const SettingsContext = createContext<SettingsCtx>({
  ...DEFAULT,
  setFontSize: () => {},
  setFont: () => {},
  setTheme: () => {},
})

function getStored(): Settings {
  try {
    const raw = localStorage.getItem('app-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        fontSize: parsed.fontSize || DEFAULT.fontSize,
        font: parsed.font || DEFAULT.font,
        theme: parsed.theme || DEFAULT.theme,
      }
    }
  } catch {}
  return DEFAULT
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return theme
}

function applyTheme(s: Settings) {
  const r = document.documentElement.style

  // Set root font-size so all rem-based Tailwind classes scale with it
  r.setProperty('font-size', s.fontSize)
  r.setProperty('--font-size-base', s.fontSize)

  const fonts: Record<string, string> = {
    inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
    poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif",
  }
  if (fonts[s.font]) r.setProperty('--font-sans', fonts[s.font])

  const resolved = resolveTheme(s.theme)
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(resolved)
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getStored)

  useLayoutEffect(() => { applyTheme(settings) }, [settings])

  useLayoutEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => applyTheme(settings)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme])

  const setFontSize = useCallback((fontSize: string) => {
    setSettings((s) => {
      const next = { ...s, fontSize }
      localStorage.setItem('app-settings', JSON.stringify(next))
      return next
    })
  }, [])

  const setFont = useCallback((font: string) => {
    setSettings((s) => {
      const next = { ...s, font }
      localStorage.setItem('app-settings', JSON.stringify(next))
      return next
    })
  }, [])

  const setTheme = useCallback((theme: Theme) => {
    setSettings((s) => {
      const next = { ...s, theme }
      localStorage.setItem('app-settings', JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ ...settings, setFontSize, setFont, setTheme }),
    [settings, setFontSize, setFont, setTheme],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
