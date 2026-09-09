import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    n: "1",
    title: "Isi formulir",
    desc: "Cantumkan nama instansi, jenis layanan, dan waktu kegiatan. Tidak perlu membuat akun.",
  },
  {
    n: "2",
    title: "Sistem cek jadwal",
    desc: "Permintaan otomatis dicocokkan dengan jadwal yang tersedia untuk menghindari bentrok.",
  },
  {
    n: "3",
    title: "Konfirmasi admin",
    desc: "Admin Diskominfotik meninjau dan mengonfirmasi. Status bisa dipantau lewat nomor tiket.",
  },
];

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:outline-2 focus:outline-ring focus:outline-offset-2">
        Langsung ke konten utama
      </a>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm leading-tight">
              <span className="block font-medium text-foreground">Diskominfotik</span>
              <span className="block text-muted-foreground text-xs">Kabupaten Sumbawa</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground" aria-label="Navigasi utama">
            <a href="#cara" className="transition-colors duration-200 hover:text-foreground">Cara mengajukan</a>
            <a href="#kontak" className="transition-colors duration-200 hover:text-foreground">Kontak</a>
          </nav>

          <button
            onClick={() => navigate("/ajukan")}
            className="hidden md:inline-flex items-center px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium transition-colors duration-200 hover:bg-primary-dim"
          >
            Ajukan layanan
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
            >
              {navOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        <div
          id="mobile-nav"
          className={`md:hidden border-t border-border px-4 sm:px-6 overflow-hidden transition-all duration-200 ease-in-out ${
            navOpen ? "max-h-64 py-4 opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!navOpen}
        >
          <nav className="flex flex-col gap-3 text-sm" aria-label="Navigasi mobile">
            <a href="#cara" onClick={() => setNavOpen(false)} className="py-1 transition-colors duration-200 hover:text-foreground">Cara mengajukan</a>
            <a href="#kontak" onClick={() => setNavOpen(false)} className="py-1 transition-colors duration-200 hover:text-foreground">Kontak</a>
            <button
              onClick={() => { navigate("/ajukan"); setNavOpen(false); }}
              className="mt-1 px-4 py-2 bg-primary text-primary-foreground text-left rounded-md font-medium transition-colors duration-200 hover:bg-primary-dim"
            >
              Ajukan layanan
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-20 md:pb-24 text-center">
          <p className="text-xs text-primary font-medium mb-4">No. Ref 001/DISKOMINFOTIK/2026</p>
          <h1 className="text-3xl sm:text-[2.5rem] md:text-[3.4rem] leading-[1.08] font-bold text-foreground tracking-tight max-w-3xl mx-auto">
            Ajukan layanan Kominfo tanpa antre ke kantor.
          </h1>
          <p className="text-muted-foreground mt-4 sm:mt-5 max-w-lg mx-auto leading-relaxed">
            Instansi di Kabupaten Sumbawa dapat mengajukan peminjaman ruang rapat,
            alat, dan bantuan teknis langsung dari sini. Cukup isi formulir -
            tidak perlu membuat akun.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6 sm:mt-8">
            <button
              onClick={() => navigate("/ajukan")}
              className="px-5 py-3 bg-primary text-primary-foreground text-sm rounded-md font-medium transition-colors duration-200 hover:bg-primary-dim"
            >
              Ajukan sekarang
            </button>
            <a
              href="#cara"
              className="px-5 py-3 border border-border text-foreground text-sm rounded-md font-medium transition-colors duration-200 hover:border-primary hover:bg-primary/5"
            >
              Lihat cara mengajukan
            </a>
          </div>
        </section>

        {/* Cara mengajukan */}
        <section id="cara" className="border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 sm:mb-10">Cara mengajukan</h2>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
              {steps.map((s, i) => (
                <div key={s.n} className={i > 0 ? "sm:pl-10 sm:border-l sm:border-border" : ""}>
                  <div className="text-3xl font-bold text-primary mb-3">{s.n}</div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kontak / info */}
        <section id="kontak" className="border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid sm:grid-cols-2 gap-10 sm:gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-5">Jam layanan</h2>
              <dl className="text-sm text-muted-foreground divide-y divide-border">
                <div className="flex justify-between py-2.5">
                  <dt>Senin - Kamis</dt>
                  <dd>08.00 - 16.00 WITA</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt>Jumat</dt>
                  <dd>08.00 - 11.30 WITA</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt>Sabtu - Minggu</dt>
                  <dd>Tutup</dd>
                </div>
              </dl>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-5">Kontak</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dinas Komunikasi, Informatika, Statistik dan Persandian<br />
                Kabupaten Sumbawa
              </p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Pertanyaan seputar pengajuan dapat disampaikan melalui admin
                yang tertera setelah formulir dikirim.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>Diskominfotik Kabupaten Sumbawa</span>
          <span>Layanan reservasi & bantuan instansi</span>
        </div>
      </footer>
    </div>
  );
}
