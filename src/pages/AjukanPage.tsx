import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import formBg from "../assets/form-bg.jpg";
import { useReveal } from "../hooks/useReveal";
import { LuCheck as CheckIcon, LuCloudUpload as UploadIcon } from "react-icons/lu";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Item = { id: string; nama: string };
type FormState = {
  instansi: string;
  nama: string;
  nip: string;
  jabatan: string;
  email: string;
  layanan: string;
  tanggal: string;
  deskripsi: string;
};
type Result = { id: string; statusToken: string };

const emptyForm: FormState = {
  instansi: "",
  nama: "",
  nip: "",
  jabatan: "",
  email: "",
  layanan: "",
  tanggal: "",
  deskripsi: "",
};

const stepLabels = [
  { title: "Data pemohon", desc: "Identitas pengaju" },
  { title: "Layanan", desc: "Jenis & jadwal" },
  { title: "Dokumen", desc: "Lampiran & kirim" },
];

const inputClass =
  "w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-[3px] focus:ring-ring/30 outline-none transition-colors mt-1.5";

const inputErrorClass =
  "w-full rounded border border-destructive bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-[3px] focus:ring-destructive/30 outline-none transition-colors mt-1.5";

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}

export default function AjukanPage() {
  const navigate = useNavigate();
  useReveal();
  const [instansiList, setInstansiList] = useState<Item[]>([]);
  const [layananList, setLayananList] = useState<Item[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [step, setStep] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    Promise.all([
      fetch(`${API}/api/public/instansi`).then((r) => r.json()),
      fetch(`${API}/api/public/layanan`).then((r) => r.json()),
    ])
      .then(([instansi, layanan]) => {
        if (cancelled) return;
        setInstansiList(Array.isArray(instansi) ? instansi : []);
        setLayananList(Array.isArray(layanan) ? layanan : []);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function patch(p: Partial<FormState>) {
    setForm((f) => ({ ...f, ...p }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(p)) delete next[key];
      return next;
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrors((err) => ({ ...err, pdf: "" }));
    if (file.type !== "application/pdf") {
      setErrors((err) => ({ ...err, pdf: "File harus berformat PDF" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((err) => ({ ...err, pdf: "Ukuran file maksimal 5MB" }));
      return;
    }
    setPdfFile(file);
  }

  async function handleCopyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard tak tersedia */
    }
  }

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!form.nama.trim()) next.nama = "Nama lengkap wajib diisi";
      if (!form.nip.trim()) next.nip = "NIP wajib diisi";
      if (!form.jabatan.trim()) next.jabatan = "Jabatan wajib diisi";
      if (!form.email.trim()) {
        next.email = "Email wajib diisi";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        next.email = "Format email tidak valid";
      }
    } else if (step === 1) {
      if (!form.instansi) next.instansi = "Pilih instansi";
      if (!form.layanan) next.layanan = "Pilih jenis layanan";
      if (!form.tanggal) next.tanggal = "Tanggal kegiatan wajib diisi";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      document.getElementById(`field-${first}`)?.focus();
      return false;
    }
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfFile) {
      setErrors({ pdf: "File PDF wajib diunggah" });
      document.getElementById("field-pdf")?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("instansi", form.instansi);
      fd.append("nama", form.nama);
      fd.append("nip", form.nip);
      fd.append("jabatan", form.jabatan);
      fd.append("email", form.email.trim());
      fd.append("layanan", form.layanan);
      fd.append("tanggal", form.tanggal);
      fd.append("deskripsi", form.deskripsi);
      fd.append("pdf", pdfFile);

      const res = await fetch(`${API}/api/requests`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal mengirim permohonan");
      setResult(json);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Gagal mengirim permohonan" });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setResult(null);
    setCopied(false);
    setForm(emptyForm);
    setPdfFile(null);
    setErrors({});
    setStep(0);
  }

  const summaryErrors = Object.entries(errors).filter(([k]) => k !== "submit");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background text-foreground">
      {/* Kiri — brand + latar + indikator langkah */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-1/2 relative items-center justify-center p-12 overflow-hidden" data-reveal>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${formBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/75 to-slate-900/70" />

        <div className="relative z-10 w-full max-w-sm text-white">
          <ol className="space-y-5">
            {stepLabels.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.title} className="flex items-center gap-4">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      done ? "bg-success text-white" : active ? "bg-white text-slate-900" : "bg-white/15 text-white/70"
                    }`}
                    aria-hidden="true"
                  >
                    {done ? <CheckIcon className="size-4" /> : i + 1}
                  </span>
                  <div className="leading-tight">
                    <p className={`text-sm font-semibold ${active ? "text-white" : done ? "text-white/90" : "text-white/50"}`}>{s.title}</p>
                    <p className={`text-xs ${active ? "text-white/70" : "text-white/40"}`}>{s.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <ul className="mt-12 space-y-2.5 text-sm text-white/75">
            <li className="flex items-center gap-2.5">
              <CheckIcon className="size-4 text-white shrink-0" />
              Proses cepat tanpa antre
            </li>
            <li className="flex items-center gap-2.5">
              <CheckIcon className="size-4 text-white shrink-0" />
              Status bisa dipantau langsung
            </li>
            <li className="flex items-center gap-2.5">
              <CheckIcon className="size-4 text-white shrink-0" />
              Gratis untuk instansi pemerintah
            </li>
          </ul>
        </div>
      </div>

      {/* Kanan — wizard form */}
      <div className="w-full lg:w-[58%] xl:w-1/2 flex items-start justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto" data-reveal>
        <div className="w-full max-w-lg">
          {/* Header mobile */}
          <div className="lg:hidden mb-6">
            <h1 className="font-display font-light text-2xl tracking-tight text-foreground">Ajukan Layanan</h1>
            <p className="text-sm text-muted-foreground mt-1">Isi formulir untuk mengajukan permohonan.</p>
          </div>

          {result ? (
            /* Sukses */
            <div role="status" className="space-y-5 mt-2">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success/15">
                  <CheckIcon className="size-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Permohonan Terkirim</p>
                  <p className="text-xs text-muted-foreground">Data Anda sudah diterima sistem</p>
                </div>
              </div>

              <div className="rounded border border-border bg-card p-5 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Simpan token di bawah untuk mengecek status permohonan:
                </p>
                <div className="flex items-center gap-2 rounded bg-muted px-3 py-2.5">
                  <code className="min-w-0 flex-1 text-sm font-mono font-semibold text-foreground break-all">
                    {result.statusToken}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyToken(result.statusToken)}
                    className="shrink-0 rounded bg-card border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/status?token=" + encodeURIComponent(result.statusToken))}
                  className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground font-medium hover:bg-primary-dim transition-colors"
                >
                  Cek Status Permohonan
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2 text-sm rounded border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Kembali ke Beranda
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm rounded border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Ajukan Lagi
                </button>
              </div>
            </div>
          ) : (
            /* Form wizard */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Heading */}
              <div>
                <h2 className="font-display font-medium text-xl tracking-tight text-foreground">Formulir Permohonan</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {stepLabels[step].title} — isi data pada langkah {step + 1} dari 3.
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label={`Langkah ${step + 1} dari 3`}>
                <div className="flex-1 flex gap-1.5">
                  {stepLabels.map((s, i) => (
                    <span
                      key={s.title}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {step + 1} / 3
                </span>
              </div>

              {/* Ringkasan error */}
              {Object.keys(errors).length > 0 && (
                <div role="alert" tabIndex={-1} className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <p className="font-semibold mb-1">Periksa kembali formulir Anda</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {summaryErrors.map(([field, msg]) => (
                      <li key={field}>
                        <a href={`#field-${field}`} className="underline underline-offset-4">{msg}</a>
                      </li>
                    ))}
                    {errors.submit && <li>{errors.submit}</li>}
                  </ul>
                </div>
              )}

              {/* Langkah 1 — Data pemohon */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="field-nama">Nama Lengkap *</label>
                      <input
                        id="field-nama"
                        type="text"
                        value={form.nama}
                        onChange={(e) => patch({ nama: e.target.value })}
                        placeholder="Nama lengkap"
                        className={errors.nama ? inputErrorClass : inputClass}
                        aria-invalid={!!errors.nama}
                        required
                      />
                      {errors.nama && <p className="text-xs text-destructive mt-1">{errors.nama}</p>}
                    </div>
                    <div>
                      <label htmlFor="field-nip">NIP *</label>
                      <input
                        id="field-nip"
                        type="text"
                        inputMode="numeric"
                        value={form.nip}
                        onChange={(e) => patch({ nip: e.target.value.replace(/[^0-9]/g, "") })}
                        placeholder="Nomor Induk Pegawai"
                        className={errors.nip ? inputErrorClass : inputClass}
                        aria-invalid={!!errors.nip}
                        required
                      />
                      {errors.nip && <p className="text-xs text-destructive mt-1">{errors.nip}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="field-jabatan">Jabatan *</label>
                    <input
                      id="field-jabatan"
                      type="text"
                      value={form.jabatan}
                      onChange={(e) => patch({ jabatan: e.target.value })}
                      placeholder="Jabatan di instansi"
                      className={errors.jabatan ? inputErrorClass : inputClass}
                      aria-invalid={!!errors.jabatan}
                      required
                    />
                    {errors.jabatan && <p className="text-xs text-destructive mt-1">{errors.jabatan}</p>}
                  </div>
                  <div>
                    <label htmlFor="field-email">Email *</label>
                    <input
                      id="field-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => patch({ email: e.target.value })}
                      placeholder="alamat@instansi.go.id"
                      className={errors.email ? inputErrorClass : inputClass}
                      aria-invalid={!!errors.email}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Status permohonan akan dikirim ke email ini.</p>
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>
              )}

              {/* Langkah 2 — Layanan */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="field-instansi">Instansi *</label>
                      <select
                        id="field-instansi"
                        value={form.instansi}
                        onChange={(e) => patch({ instansi: e.target.value })}
                        className={errors.instansi ? inputErrorClass : inputClass}
                        aria-invalid={!!errors.instansi}
                        disabled={loading}
                        required
                      >
                        <option value="">{loading ? "Memuat..." : loadError ? "Gagal dimuat" : "Pilih instansi"}</option>
                        {instansiList.map((i) => (
                          <option key={i.id} value={i.nama}>{i.nama}</option>
                        ))}
                      </select>
                      {errors.instansi && <p className="text-xs text-destructive mt-1">{errors.instansi}</p>}
                    </div>
                    <div>
                      <label htmlFor="field-layanan">Jenis Layanan *</label>
                      <select
                        id="field-layanan"
                        value={form.layanan}
                        onChange={(e) => patch({ layanan: e.target.value })}
                        className={errors.layanan ? inputErrorClass : inputClass}
                        aria-invalid={!!errors.layanan}
                        disabled={loading}
                        required
                      >
                        <option value="">{loading ? "Memuat..." : loadError ? "Gagal dimuat" : "Pilih layanan"}</option>
                        {layananList.map((l) => (
                          <option key={l.id} value={l.nama}>{l.nama}</option>
                        ))}
                      </select>
                      {errors.layanan && <p className="text-xs text-destructive mt-1">{errors.layanan}</p>}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="field-tanggal">Tanggal Kegiatan *</label>
                      <input
                        id="field-tanggal"
                        type="date"
                        value={form.tanggal}
                        onChange={(e) => patch({ tanggal: e.target.value })}
                        className={errors.tanggal ? inputErrorClass : inputClass}
                        aria-invalid={!!errors.tanggal}
                        required
                      />
                      {errors.tanggal && <p className="text-xs text-destructive mt-1">{errors.tanggal}</p>}
                    </div>
                    <div>
                      <label htmlFor="field-deskripsi">Deskripsi / Keterangan</label>
                      <textarea
                        id="field-deskripsi"
                        value={form.deskripsi}
                        onChange={(e) => patch({ deskripsi: e.target.value })}
                        rows={2}
                        placeholder="Jelaskan kebutuhan Anda (opsional)"
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>

                  {/* Gagal load dropdown */}
                  {loadError && (
                    <div className="rounded border border-warning/30 bg-warning/10 p-3 text-sm text-warning flex items-center justify-between gap-3">
                      <span>Gagal memuat daftar instansi/layanan.</span>
                      <button
                        type="button"
                        onClick={() => setAttempt((n) => n + 1)}
                        className="shrink-0 rounded border border-warning/40 px-3 py-1 text-xs font-semibold hover:bg-warning/10 transition-colors"
                      >
                        Coba lagi
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Langkah 3 — Dokumen */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="field-pdf">Surat Permohonan (PDF) *</label>
                    <div className="mt-1.5 relative">
                      <input
                        id="field-pdf"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        aria-describedby={errors.pdf ? "field-pdf-error" : undefined}
                        required
                      />
                      <div className={`flex items-center gap-3 rounded border border-dashed bg-muted/50 px-4 py-3 transition-colors hover:border-primary hover:bg-primary/5 ${errors.pdf ? "border-destructive" : "border-border"}`}>
                        <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                          <UploadIcon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          {pdfFile ? (
                            <>
                              <p className="text-sm font-medium text-foreground truncate">{pdfFile.name}</p>
                              <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024).toFixed(0)} KB · siap dikirim</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-foreground">Klik untuk unggah PDF</p>
                              <p className="text-xs text-muted-foreground">Maks. 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {errors.pdf && <p id="field-pdf-error" className="text-xs text-destructive mt-1">{errors.pdf}</p>}
                  </div>

                  {/* Ringkasan */}
                  <div className="rounded border border-border bg-card p-4 space-y-1.5 text-sm">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wide text-muted-foreground mb-2">Ringkasan permohonan</p>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Pemohon</span>
                      <span className="font-medium text-foreground text-right">{form.nama || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Instansi</span>
                      <span className="font-medium text-foreground text-right">{form.instansi || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Layanan</span>
                      <span className="font-medium text-foreground text-right">{form.layanan || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Tanggal</span>
                      <span className="font-medium text-foreground text-right">{form.tanggal || "-"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigasi langkah */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={step === 0 ? () => navigate("/") : handleBack}
                  className="px-4 py-2 text-sm rounded border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  {step === 0 ? "Kembali ke Beranda" : "Kembali"}
                </button>

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-primary text-primary-foreground text-sm rounded font-semibold transition-colors hover:bg-primary-dim"
                  >
                    Lanjut
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm rounded font-semibold transition-colors hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Spinner />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Permohonan"
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}