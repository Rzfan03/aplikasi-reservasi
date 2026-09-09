import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'

export const FONT_SIZES = [
  { name: 'sm', label: 'Kecil', value: '13px' },
  { name: 'base', label: 'Normal', value: '14px' },
  { name: 'md', label: 'Sedang', value: '15px' },
  { name: 'lg', label: 'Besar', value: '16px' },
]

export const FONTS = [
  { name: 'poppins', label: 'Poppins (default)', value: "'Poppins', ui-sans-serif, system-ui, sans-serif" },
  { name: 'inter', label: 'Inter', value: "'Inter', ui-sans-serif, system-ui, sans-serif" },
]

export type Theme = 'dark' | 'light' | 'system'
export type ColorPalette = 'blue' | 'emerald' | 'putih'
export type RadiusChoice = 'off' | 'md' | 'lg'

export const RADIUS_OPTIONS: { name: RadiusChoice; label: string; desc: string; radius: string }[] = [
  { name: 'off', label: 'Siku', desc: 'Tanpa sudut membulat', radius: '0px' },
  { name: 'md', label: 'Bulat md', desc: 'Sudut sedikit membulat', radius: '8px' },
  { name: 'lg', label: 'Bulat lg', desc: 'Sudut sangat membulat', radius: '16px' },
]

export interface Settings {
  fontSize: string
  font: string
  theme: Theme
  colorPalette: ColorPalette
  radius: RadiusChoice
}

const DEFAULT: Settings = { fontSize: '14px', font: 'poppins', theme: 'light', colorPalette: 'blue', radius: 'off' }

interface SettingsCtx extends Settings {
  setFontSize: (s: string) => void
  setFont: (f: string) => void
  setTheme: (t: Theme) => void
  setColorPalette: (p: ColorPalette) => void
  setRadius: (r: RadiusChoice) => void
}

const SettingsContext = createContext<SettingsCtx>({
  ...DEFAULT,
  setFontSize: () => {},
  setFont: () => {},
  setTheme: () => {},
  setColorPalette: () => {},
  setRadius: () => {},
})

function getStored(): Settings {
  try {
    const raw = localStorage.getItem('app-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      const palette: ColorPalette = ['emerald', 'putih'].includes(parsed.colorPalette) ? parsed.colorPalette : 'blue'
      return {
        fontSize: parsed.fontSize || DEFAULT.fontSize,
        font: parsed.font || DEFAULT.font,
        theme: parsed.theme || DEFAULT.theme,
        colorPalette: palette,
        radius: ['off', 'md', 'lg'].includes(parsed.radius) ? parsed.radius : DEFAULT.radius,
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

function applySettings(s: Settings) {
  const r = document.documentElement.style

  r.setProperty('font-size', s.fontSize)
  r.setProperty('--font-size-base', s.fontSize)

  const fonts: Record<string, string> = {
    inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
    poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif",
  }
  if (fonts[s.font]) r.setProperty('--font-sans', fonts[s.font])

  const radii: Record<RadiusChoice, string> = { off: '0rem', md: '0.5rem', lg: '1rem' }
  r.setProperty('--radius', radii[s.radius])

  const resolved = resolveTheme(s.theme)
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(resolved)

  document.documentElement.dataset.palette = s.colorPalette
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getStored)

  useLayoutEffect(() => { applySettings(settings) }, [settings])

  useLayoutEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => applySettings(settings)
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

  const setColorPalette = useCallback((colorPalette: ColorPalette) => {
    setSettings((s) => {
      const next = { ...s, colorPalette }
      localStorage.setItem('app-settings', JSON.stringify(next))
      return next
    })
  }, [])

  const setRadius = useCallback((radius: RadiusChoice) => {
    setSettings((s) => {
      const next = { ...s, radius }
      localStorage.setItem('app-settings', JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ ...settings, setFontSize, setFont, setTheme, setColorPalette, setRadius }),
    [settings, setFontSize, setFont, setTheme, setColorPalette, setRadius],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
