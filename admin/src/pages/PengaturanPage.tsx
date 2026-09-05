import { Monitor, Moon, Sun, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings, FONT_SIZES, FONTS, type Theme, type ColorPalette } from '@/components/SettingsProvider'

const THEMES: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'dark', label: 'Gelap', icon: Moon, desc: 'Latar belakang gelap' },
  { value: 'light', label: 'Terang', icon: Sun, desc: 'Latar belakang terang' },
  { value: 'system', label: 'Otomatis', icon: Monitor, desc: 'Ikuti sistem' },
]

const PALETTES: { value: ColorPalette; label: string; desc: string; bg: string }[] = [
  { value: 'zinc', label: 'Zinc', desc: 'Zinc-800 + white', bg: 'bg-zinc-800' },
  { value: 'blue', label: 'Blue', desc: 'Blue-500 + white', bg: 'bg-blue-500' },
  { value: 'emerald', label: 'Emerald', desc: 'Emerald-500 + white', bg: 'bg-emerald-500' },
]

export default function PengaturanPage() {
  const { fontSize, setFontSize, font, setFont, theme, setTheme, colorPalette, setColorPalette } = useSettings()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Tema ── */}
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Pilih tampilan warna aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => {
              const isActive = theme === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-2.5 rounded-md border-2 p-4 transition-all text-left ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/40 bg-transparent'
                  }`}
                >
                  <div className={`flex size-9 items-center justify-center rounded-md ${
                    isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <t.icon className="size-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground leading-snug">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Aktif</span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Font Family ── */}
      <Card>
        <CardHeader>
          <CardTitle>Jenis Font</CardTitle>
          <CardDescription>Pilih gaya tipografi yang nyaman dibaca</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {FONTS.map((f) => {
              const isActive = font === f.name
              return (
                <button
                  key={f.name}
                  onClick={() => setFont(f.name)}
                  className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 transition-all ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/40 bg-transparent'
                  }`}
                >
                  <span
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: f.value }}
                  >
                    Aa
                  </span>
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Aktif</span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Font Size ── */}
      <Card>
        <CardHeader>
          <CardTitle>Ukuran Font</CardTitle>
          <CardDescription>Sesuaikan ukuran teks di seluruh aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {FONT_SIZES.map((s) => {
              const isActive = fontSize === s.value
              return (
                <button
                  key={s.name}
                  onClick={() => setFontSize(s.value)}
                  className={`flex flex-col items-center gap-2 rounded-md border-2 p-3 transition-all ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/40 bg-transparent'
                  }`}
                >
                  <span
                    className="font-bold text-foreground"
                    style={{ fontSize: s.value }}
                  >
                    A
                  </span>
                  <p className="text-xs font-semibold text-foreground">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.value}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Palet Warna ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4" />
            Palet Warna
          </CardTitle>
          <CardDescription>Pilih warna aksen aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {PALETTES.map((p) => {
              const isActive = colorPalette === p.value
              return (
                <button
                  key={p.value}
                  onClick={() => setColorPalette(p.value)}
                  className={`flex flex-col items-center gap-2.5 rounded-md border-2 p-4 transition-all ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/40 bg-transparent'
                  }`}
                >
                  <div className={`flex size-9 items-center justify-center rounded-md ${p.bg}`} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground leading-snug">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{p.desc}</p>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Aktif</span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
