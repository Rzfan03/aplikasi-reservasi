import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Layanan", href: "/#layanan" },
  { label: "Cara mengajukan", href: "/#cara" },
  { label: "FAQ", href: "/#faq" },
  { label: "Kontak", href: "/#kontak" },
];

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [light, setLight] = useState(() => document.documentElement.classList.contains("light"));

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }

  function handleLink(href: string) {
    const [path, hash] = href.split("#");
    if (pathname === path) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          aria-label="Diskominfotik Kabupaten Sumbawa"
          className="flex items-center shrink-0"
        >
          <span className="text-sm leading-tight">
            <span className="block font-semibold text-foreground">Diskominfotik</span>
            <span className="block text-muted-foreground text-xs">Kabupaten Sumbawa</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground" aria-label="Navigasi utama">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => {
                if (pathname === l.href.split("#")[0]) e.preventDefault();
                handleLink(l.href);
              }}
              className="transition-colors duration-200 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/status"
            onClick={(e) => { e.preventDefault(); navigate("/status"); }}
            className="transition-colors duration-200 hover:text-foreground"
          >
            Cek status
          </a>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={light ? "Aktifkan tema gelap" : "Aktifkan tema terang"}
            className="flex size-9 items-center justify-center rounded text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
          >
            {light ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
          </button>

          <button
            onClick={() => navigate("/ajukan")}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded bg-primary text-primary-foreground font-semibold transition-colors duration-200 hover:bg-primary-dim"
          >
            Ajukan layanan
            <ArrowRightIcon className="size-3.5" />
          </button>

          <button
            className="md:hidden text-foreground p-1.5 -mr-1.5"
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className={`transition-transform duration-200 ${navOpen ? "rotate-90" : ""}`}
              aria-hidden="true"
            >
              {navOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden border-t border-border px-4 sm:px-6 overflow-hidden transition-all duration-200 ease-in-out ${
          navOpen ? "max-h-72 py-4 opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!navOpen}
      >
        <nav className="flex flex-col gap-3 text-sm" aria-label="Navigasi mobile">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => { handleLink(l.href); setNavOpen(false); }}
              className="py-1 transition-colors duration-200 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a href="/status" onClick={() => setNavOpen(false)} className="py-1 transition-colors duration-200 hover:text-foreground">Cek status</a>
          <button
            onClick={() => { navigate("/ajukan"); setNavOpen(false); }}
            className="mt-1 px-4 py-2.5 bg-primary text-primary-foreground text-left rounded font-semibold transition-colors duration-200 hover:bg-primary-dim"
          >
            Ajukan layanan
          </button>
        </nav>
      </div>
    </header>
  );
}