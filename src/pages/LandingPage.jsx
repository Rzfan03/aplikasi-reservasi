import { useState } from "react";

const defaultLayanan = [
  {
    title: "Ruang Rapat",
    desc: "Pinjam ruang rapat untuk kegiatan instansi, lengkap dengan jadwal yang bisa dicek langsung.",
    detail: "Kapasitas 10-60 orang, proyektor & sound system tersedia",
    icon: "room",
  },
  {
    title: "Peminjaman Alat",
    desc: "Ajukan peminjaman proyektor, sound system, atau perangkat pendukung acara lainnya.",
    detail: "Pengembalian maks. 1x24 jam setelah kegiatan selesai",
    icon: "tool",
  },
  {
    title: "Bantuan Teknis",
    desc: "Minta pendampingan tim Kominfo untuk dokumentasi, jaringan, atau kebutuhan IT acara.",
    detail: "Jadwalkan minimal 2 hari kerja sebelum kegiatan",
    icon: "support",
  },
];

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

function Icon({ name, className }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  };
  if (name === "room") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="M3 10h18" />
        <path d="M8 14h3" />
      </svg>
    );
  }
  if (name === "tool") {
    return (
      <svg {...common}>
        <path d="M14.5 3.5 20.5 9.5" />
        <path d="M17 2 22 7l-2.5 2.5L14.5 4.5z" />
        <path d="M3 21l6.5-6.5" />
        <path d="M8 12.5 3 17.5" />
        <path d="M11.5 6 6 11.5 12.5 18 18 12.5z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
      <path d="M4 8h1.6M18.4 8H20M12 3v1.4M12 12.6V14" />
    </svg>
  );
}

function Seal() {
  return (
    <svg viewBox="0 0 220 220" className="w-full h-full" aria-hidden="true">
      <circle cx="110" cy="110" r="104" fill="none" stroke="#B8862B" strokeWidth="1.5" />
      <circle cx="110" cy="110" r="90" fill="none" stroke="#B8862B" strokeWidth="1" strokeDasharray="2 5" />
      <circle cx="110" cy="110" r="70" fill="none" stroke="#1C2B45" strokeWidth="1" />
      <text x="110" y="103" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="30" fill="#1C2B45">KS</text>
      <text x="110" y="126" textAnchor="middle" fontFamily="Public Sans, sans-serif" fontSize="8" letterSpacing="1" fill="#6B6355">
        DISKOMINFOTIK
      </text>
      <text x="110" y="137" textAnchor="middle" fontFamily="Public Sans, sans-serif" fontSize="8" letterSpacing="1" fill="#6B6355">
        SUMBAWA
      </text>
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#F6F3EC] p-7 flex flex-col animate-pulse">
      <div className="w-7 h-7 rounded bg-[#1C2B45]/10 mb-5" />
      <div className="h-4 w-28 bg-[#1C2B45]/10 rounded mb-2" />
      <div className="h-3 w-full bg-[#1C2B45]/10 rounded mb-1" />
      <div className="h-3 w-3/4 bg-[#1C2B45]/10 rounded mb-4" />
      <div className="h-3 w-1/2 bg-[#B8862B]/10 rounded mt-auto" />
    </div>
  );
}

export default function LandingPage({ onAjukan, layanan = defaultLayanan, layananLoading = false }) {
  const [navOpen, setNavOpen] = useState(false);
  const handleAjukan = () => (onAjukan ? onAjukan() : undefined);

  const showLayanan = layanan && layanan.length > 0;

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#22201B]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Public+Sans:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Public Sans', sans-serif; }
        .skip-link:focus { position: absolute; top: 0; left: 0; padding: 0.75rem 1.5rem; background: #1C2B45; color: #F6F3EC; z-index: 50; outline: 2px solid #B8862B; outline-offset: 2px; }
      `}</style>

      <a href="#main-content" className="skip-link font-body sr-only focus:not-sr-only">
        Langsung ke konten utama
      </a>

      {/* Header */}
      <header className="font-body sticky top-0 z-20 bg-[#F6F3EC]/95 backdrop-blur border-b border-[#1C2B45]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#B8862B] flex items-center justify-center text-[#1C2B45] font-display text-sm" aria-hidden="true">
              KS
            </div>
            <span className="text-sm leading-tight">
              <span className="block font-medium text-[#1C2B45]">Diskominfotik</span>
              <span className="block text-[#6B6355] text-xs">Kabupaten Sumbawa</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#3A362E]" aria-label="Navigasi utama">
            <a href="#layanan" className="transition-colors duration-200 hover:text-[#1C2B45]">Pelayanan</a>
            <a href="#cara" className="transition-colors duration-200 hover:text-[#1C2B45]">Cara mengajukan</a>
            <a href="#kontak" className="transition-colors duration-200 hover:text-[#1C2B45]">Kontak</a>
          </nav>

          <button
            onClick={handleAjukan}
            className="hidden md:inline-flex items-center px-4 py-2 text-sm bg-[#1C2B45] text-[#F6F3EC] transition-colors duration-200 hover:bg-[#16223A]"
          >
            Ajukan layanan
          </button>

          <button
            className="md:hidden text-[#1C2B45] p-1.5 -mr-1.5"
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
          className={`md:hidden border-t border-[#1C2B45]/15 px-4 sm:px-6 overflow-hidden transition-all duration-200 ease-in-out ${
            navOpen ? "max-h-64 py-4 opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!navOpen}
        >
          <nav className="flex flex-col gap-3 text-sm font-body" aria-label="Navigasi mobile">
            <a href="#layanan" onClick={() => setNavOpen(false)} className="py-1 transition-colors duration-200 hover:text-[#1C2B45]">Pelayanan</a>
            <a href="#cara" onClick={() => setNavOpen(false)} className="py-1 transition-colors duration-200 hover:text-[#1C2B45]">Cara mengajukan</a>
            <a href="#kontak" onClick={() => setNavOpen(false)} className="py-1 transition-colors duration-200 hover:text-[#1C2B45]">Kontak</a>
            <button
              onClick={() => { handleAjukan(); setNavOpen(false); }}
              className="mt-1 px-4 py-2 bg-[#1C2B45] text-[#F6F3EC] text-left transition-colors duration-200 hover:bg-[#16223A]"
            >
              Ajukan layanan
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-20 md:pb-24 grid md:grid-cols-[1.2fr_0.8fr] gap-8 sm:gap-12 items-center">
          <div>
            <p className="font-body text-xs text-[#8A5A1E] mb-4">No. Ref 001/DISKOMINFOTIK/2026</p>
            <h1 className="font-display text-3xl sm:text-[2.5rem] md:text-[3.4rem] leading-[1.08] text-[#1C2B45]">
              Ajukan layanan Kominfo tanpa antre ke kantor.
            </h1>
            <p className="font-body text-[#3A362E] mt-4 sm:mt-5 max-w-md leading-relaxed">
              Instansi di Kabupaten Sumbawa dapat mengajukan peminjaman ruang rapat,
              alat, dan bantuan teknis langsung dari sini. Cukup isi formulir -
              tidak perlu membuat akun.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 sm:mt-8">
              <button
                onClick={handleAjukan}
                className="font-body px-5 py-3 bg-[#1C2B45] text-[#F6F3EC] text-sm transition-colors duration-200 hover:bg-[#16223A]"
              >
                Ajukan sekarang
              </button>
              <a
                href="#cara"
                className="font-body px-5 py-3 border border-[#1C2B45]/30 text-[#1C2B45] text-sm transition-colors duration-200 hover:border-[#1C2B45] hover:bg-[#1C2B45]/5"
              >
                Lihat cara mengajukan
              </a>
            </div>
          </div>

          <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 mx-auto">
            <Seal />
          </div>
        </section>

        {/* Cara mengajukan */}
        <section id="cara" className="border-t border-[#1C2B45]/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="font-display text-2xl text-[#1C2B45] mb-8 sm:mb-10">Cara mengajukan</h2>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
              {steps.map((s, i) => (
                <div key={s.n} className={i > 0 ? "sm:pl-10 sm:border-l sm:border-[#1C2B45]/15" : ""}>
                  <div className="font-display text-3xl text-[#B8862B] mb-3">{s.n}</div>
                  <h3 className="font-body font-semibold text-[#1C2B45] mb-2">{s.title}</h3>
                  <p className="font-body text-sm text-[#3A362E] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pelayanan */}
        <section id="layanan" className="border-t border-[#1C2B45]/15 bg-white/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="font-display text-2xl text-[#1C2B45] mb-2">Pelayanan yang tersedia</h2>
            <p className="font-body text-sm text-[#6B6355] mb-8 sm:mb-10">
              Daftar layanan yang dapat diajukan oleh instansi pemerintah.
            </p>

            {layananLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1C2B45]/15 border border-[#1C2B45]/15">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : showLayanan ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1C2B45]/15 border border-[#1C2B45]/15">
                {layanan.map((l) => (
                  <div
                    key={l.title}
                    className="bg-[#F6F3EC] p-6 sm:p-7 flex flex-col transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(28,43,69,0.08)]"
                  >
                    <Icon name={l.icon} className="w-7 h-7 text-[#1C2B45] mb-5" />
                    <h3 className="font-body font-semibold text-[#1C2B45] mb-2">{l.title}</h3>
                    <p className="font-body text-sm text-[#3A362E] leading-relaxed mb-4">{l.desc}</p>
                    <p className="font-body text-xs text-[#8A5A1E] mt-auto">{l.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[#1C2B45]/20 bg-[#F6F3EC]">
                <Icon name="support" className="w-10 h-10 text-[#1C2B45]/30 mx-auto mb-3" />
                <p className="font-body text-sm text-[#6B6355]">Belum ada layanan yang tersedia saat ini.</p>
              </div>
            )}
          </div>
        </section>

        {/* Kontak / info */}
        <section id="kontak" className="border-t border-[#1C2B45]/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid sm:grid-cols-2 gap-10 sm:gap-12">
            <div>
              <h2 className="font-display text-2xl text-[#1C2B45] mb-5">Jam layanan</h2>
              <dl className="font-body text-sm text-[#3A362E] divide-y divide-[#1C2B45]/10">
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
              <h2 className="font-display text-2xl text-[#1C2B45] mb-5">Kontak</h2>
              <p className="font-body text-sm text-[#3A362E] leading-relaxed">
                Dinas Komunikasi, Informatika, Statistik dan Persandian<br />
                Kabupaten Sumbawa
              </p>
              <p className="font-body text-sm text-[#3A362E] mt-3 leading-relaxed">
                Pertanyaan seputar pengajuan dapat disampaikan melalui admin
                yang tertera setelah formulir dikirim.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1C2B45]/15 font-body">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs text-[#6B6355] flex flex-col sm:flex-row justify-between gap-2">
          <span>Diskominfotik Kabupaten Sumbawa</span>
          <span>Layanan reservasi & bantuan instansi</span>
        </div>
      </footer>
    </div>
  );
}
