import { useNavigate } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BadgeCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function RoomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <line x1="10" y1="3" x2="10" y2="21" />
      <line x1="8" y1="7" x2="8" y2="7" />
      <line x1="8" y1="11" x2="8" y2="11" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function LifeBuoyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 2v4M15 2v4M9 22v-4h6v4" />
      <line x1="8" y1="11" x2="8" y2="11" />
      <line x1="12" y1="11" x2="12" y2="11" />
      <line x1="16" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="8" y2="15" />
      <line x1="12" y1="15" x2="12" y2="15" />
      <line x1="16" y1="15" x2="16" y2="15" />
    </svg>
  );
}

function LandmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

const services = [
  {
    icon: RoomIcon,
    title: "Ruang rapat & aula",
    desc: "Pinjam ruang rapat, aula, atau sarana pertemuan untuk kegiatan instansi Anda.",
  },
  {
    icon: WrenchIcon,
    title: "Alat & perangkat",
    desc: "Pinjam peralatan pendukung seperti laptop, proyektor, hingga perangkat audio.",
  },
  {
    icon: LifeBuoyIcon,
    title: "Bantuan teknis",
    desc: "Butuh pendampingan teknologi informasi untuk kegiatan? Ajukan bantuan teknis resmi.",
  },
];

const audience = [
  "Instansi & OPD di lingkup Pemkab Sumbawa",
  "Ditangani langsung admin Diskominfotik",
  "Semua pengajuan tercatat dan bisa dipantau",
];

const faqs = [
  {
    q: "Apakah perlu membuat akun untuk mengajukan?",
    a: "Tidak. Cukup isi formulir dan simpan nomor tiket yang dikirim ke email untuk memantau status permohonan.",
  },
  {
    q: "Berapa lama proses konfirmasi?",
    a: "Tidak perlu antre ke kantor. Admin meninjau permohonan sesuai ketersediaan jadwal dan kebutuhan layanan, lalu statusnya diperbarui di sistem.",
  },
  {
    q: "Bagaimana cara melihat status permohonan?",
    a: "Klik menu “Cek status”, lalu masukkan nomor tiket yang Anda terima lewat email. Status juga dikirim otomatis ke email setiap ada perubahan.",
  },
  {
    q: "Apakah ada biaya untuk layanan ini?",
    a: "Gratis untuk instansi pemerintah di lingkungan Kabupaten Sumbawa.",
  },
  {
    q: "Apa saja yang bisa diajukan?",
    a: "Peminjaman ruang rapat, peminjaman alat dan perangkat, serta bantuan teknis sesuai layanan yang tersedia di Diskominfotik.",
  },
];

const steps = [
  {
    icon: FileIcon,
    title: "Isi formulir",
    desc: "Cantumkan nama instansi, jenis layanan, dan waktu kegiatan. Tidak perlu membuat akun.",
  },
  {
    icon: CalendarIcon,
    title: "Sistem cek jadwal",
    desc: "Permintaan otomatis dicocokkan dengan jadwal yang tersedia untuk menghindari bentrok.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Konfirmasi admin",
    desc: "Admin Diskominfotik meninjau dan mengonfirmasi. Status bisa dipantau lewat nomor tiket.",
  },
];

const trustPoints = [
  { label: "Proses cepat tanpa antre" },
  { label: "Status bisa dipantau langsung" },
  { label: "Gratis untuk instansi pemerintah" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  useReveal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:outline-2 focus:outline-offset-2">
        Langsung ke konten utama
      </a>

      <main id="main-content">
{/* Hero */}
          <section className="relative overflow-hidden max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 sm:pt-16 sm:pb-28 md:pt-24 md:pb-36 text-center">
            {/* dekorasi latar (flat, tanpa gradient) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
              <span className="absolute -top-24 -left-24 size-72 rounded-full bg-primary/5" />
              <span className="absolute top-1/3 -right-28 size-64 rounded-full border border-primary/10" />
              <span className="absolute top-10 right-[14%] size-3 rotate-12 rounded-[2px] bg-primary/20" />
              <span className="absolute bottom-24 left-[9%] size-2 rounded-full bg-primary/25" />
              <span className="absolute bottom-20 right-[8%] size-4 rounded-full border border-primary/15" />
              <span className="absolute inset-x-0 bottom-0 block h-20 sm:h-28 overflow-hidden">
                <svg className="wave wave-1 absolute left-0 bottom-0 h-16 w-[200%] text-primary/25 sm:h-20" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="currentColor">
                  <path d="M0,120 C150,60 150,180 300,120 C450,60 450,180 600,120 C750,60 750,180 900,120 C1050,60 1050,180 1200,120 L1200,200 L0,200 Z" />
                </svg>
                <svg className="wave wave-2 absolute left-0 bottom-0 h-20 w-[200%] text-primary/15 sm:h-24" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="currentColor">
                  <path d="M0,120 C150,60 150,180 300,120 C450,60 450,180 600,120 C750,60 750,180 900,120 C1050,60 1050,180 1200,120 L1200,200 L0,200 Z" />
                </svg>
                <svg className="wave wave-3 absolute left-0 bottom-0 h-24 w-[200%] text-primary/10 sm:h-28" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="currentColor">
                  <path d="M0,120 C150,60 150,180 300,120 C450,60 450,180 600,120 C750,60 750,180 900,120 C1050,60 1050,180 1200,120 L1200,200 L0,200 Z" />
                </svg>
              </span>
            </div>

            <div className="relative">
              <h1 data-reveal className="font-display font-light text-[2.25rem] leading-[1.1] tracking-tight text-foreground max-w-3xl mx-auto sm:text-5xl md:text-[4.25rem]">
                Ajukan layanan Kominfo tanpa antre ke kantor.
              </h1>
              <p data-reveal className="text-muted-foreground mt-5 max-w-xl mx-auto leading-relaxed text-base sm:text-lg">
                Instansi di Kabupaten Sumbawa dapat mengajukan peminjaman ruang rapat, alat,
                dan bantuan teknis langsung dari sini. Cukup isi formulir — tidak perlu membuat akun.
              </p>

              <div data-reveal className="flex flex-wrap justify-center gap-3 mt-8">
                <button
                  onClick={() => navigate("/ajukan")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm rounded font-semibold transition-colors duration-200 hover:bg-primary-dim"
                >
                  Ajukan sekarang
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <a
                  href="#cara"
                  className="px-6 py-3 border border-border bg-card text-foreground text-sm rounded font-medium transition-colors duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  Lihat cara mengajukan
                </a>
              </div>

              <a
                data-reveal
                href="/status"
                onClick={(e) => { e.preventDefault(); navigate("/status"); }}
                className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-primary hover:text-primary-dim transition-colors duration-200"
              >
                Sudah mengajukan? Cek status permohonan
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              <ul data-reveal className="mt-12 flex flex-wrap justify-center gap-3">
                {trustPoints.map((p) => (
                  <li key={p.label} className="flex items-center gap-2 rounded border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground">
                    <CheckIcon className="size-4 text-success shrink-0" />
                    <span>{p.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        {/* Marquee ikon instansi */}
        <section aria-label="Layanan untuk instansi di lingkungan Pemkab Sumbawa" data-reveal className="border-y border-border bg-muted py-5 overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-10" role="presentation" aria-hidden="true">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="flex items-center gap-10 text-primary/25">
                    {i % 3 === 0 && <BuildingIcon className="size-6" />}
                    {i % 3 === 1 && <LandmarkIcon className="size-6" />}
                    {i % 3 === 2 && <MapPinIcon className="size-6" />}
                    <span className="size-1.5 shrink-0 rounded-full bg-primary/20" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Layanan yang bisa diajukan */}
        <section id="layanan" className="border-t border-border relative overflow-hidden">
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-28 size-72 rounded-full border border-primary/10" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div data-reveal className="max-w-2xl">
              <span className="mb-4 block h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
              <h2 className="font-display font-light text-2xl tracking-tight text-foreground sm:text-4xl">Apa saja yang bisa diajukan?</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Website ini adalah layanan pengajuan resmi Diskominfotik Kabupaten Sumbawa — instansi
                cukup mengisi formulir, tanpa perlu datang ke kantor.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              {services.map((s) => (
                <div key={s.title} data-reveal className="rounded border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-5">
                    <s.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-normal text-foreground mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cara mengajukan */}
        <section id="cara" className="bg-background relative overflow-hidden">
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full border border-primary/10" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div data-reveal className="max-w-2xl">
              <span className="mb-4 block h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
              <h2 className="font-display font-light text-2xl tracking-tight text-foreground sm:text-4xl">Cara mengajukan</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Prosesnya singkat dan transparan — dari pengisian formulir hingga konfirmasi admin.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              {steps.map((s, i) => (
                <div key={s.title} data-reveal className="group rounded border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
                      <s.icon className="size-5" />
                    </span>
                    <span className="flex size-8 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:border-primary/40 group-hover:text-primary" aria-hidden="true">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-normal text-foreground mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Untuk siapa */}
        <section className="bg-accent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl" data-reveal>
              <span className="mb-4 block h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
              <h2 className="font-display font-light text-2xl tracking-tight text-white sm:text-3xl">Untuk instansi di Kabupaten Sumbawa</h2>
              <p className="text-sm text-white/70 mt-3 leading-relaxed">
                Layanan ini ditujukan bagi instansi dan OPD di lingkungan Pemkab Sumbawa.
                Pegawai cukup mengisi formulir — tidak perlu akun, dan statusnya bisa dipantau kapan saja.
              </p>
              <div className="mt-6">
                <a
                  href="#ajukan"
                  onClick={(e) => { e.preventDefault(); navigate("/ajukan"); }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded font-semibold transition-colors duration-200 hover:bg-primary-dim"
                >
                  Mulai ajukan sekarang
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            </div>

            <ul data-reveal className="w-full lg:w-auto space-y-3.5">
              {audience.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm text-white/85">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <CheckIcon className="size-3 text-white" />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="text-center" data-reveal>
              <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
              <h2 className="font-display font-light text-2xl tracking-tight text-foreground sm:text-4xl">Pertanyaan yang sering diajukan</h2>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details key={f.q} data-reveal className="group overflow-hidden rounded-lg border border-border bg-card px-6 py-5 transition duration-200 hover:-translate-y-0.5 open:border-primary/40">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-[15px] font-medium text-foreground list-none [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-200 group-open:border-primary group-open:text-primary">
                      <ChevronDownIcon className="size-4 transition-transform duration-300 group-open:rotate-180" />
                    </span>
                  </summary>
                  <div className="faq-answer">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="kontak" className="bg-accent">
        <span aria-hidden="true" className="block h-0.5 bg-primary" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
          <div data-reveal>
            <h3 className="font-display font-medium text-base text-white mb-4">Jam layanan</h3>
            <dl className="text-white/70 space-y-2.5">
              <div className="flex justify-between gap-4">
                <dt>Senin - Kamis</dt>
                <dd className="font-medium text-white/90">08.00 - 16.00 WITA</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Jumat</dt>
                <dd className="font-medium text-white/90">08.00 - 11.30 WITA</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Sabtu - Minggu</dt>
                <dd className="font-medium text-white/90">Tutup</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-display font-medium text-base text-white mb-4">Kontak</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Dinas Komunikasi, Informatika, Statistik dan Persandian, Uma Sima, Sumbawa</span>
              </li>
              <li>
                <a href="tel:+6237121582" className="flex items-start gap-2.5 text-white/70 transition-colors duration-200 hover:text-white">
                  <PhoneIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  (0371) 21582
                </a>
              </li>
              <li>
                <a href="mailto:diskominfotik@sumbawakab.go.id" className="flex items-start gap-2.5 text-white/70 transition-colors duration-200 hover:text-white">
                  <MailIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  diskominfotik@sumbawakab.go.id
                </a>
              </li>
            </ul>
            <p className="text-white/50 text-xs mt-4 leading-relaxed">
              Pertanyaan seputar pengajuan dapat disampaikan melalui admin yang
              tertera setelah formulir dikirim.
            </p>
          </div>

          <div data-reveal>
            <h3 className="font-display font-medium text-base text-white mb-4">Lokasi</h3>
            <p className="text-white/70 leading-relaxed flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                GC69+7RW, Uma Sima, Sumbawa,<br />
                Kabupaten Sumbawa, NTB 84313
              </span>
            </p>
            <iframe
              title="Peta lokasi Diskominfotik Kabupaten Sumbawa"
              src="https://maps.google.com/maps?q=GC69%2B7RW%20Uma%20Sima%20Sumbawa&output=embed"
              className="mt-5 h-40 w-full rounded border border-white/10"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href="https://maps.google.com/?q=GC69%2B7RW%20Uma%20Sima%20Sumbawa"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold transition-colors duration-200 hover:bg-primary-dim"
            >
              Lihat di peta
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-xs sm:text-sm text-white/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="font-medium text-white">Diskominfotik Kabupaten Sumbawa</span>
            <span>© {new Date().getFullYear()} · Layanan reservasi &amp; bantuan instansi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}