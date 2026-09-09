import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import formBg from "../assets/form-bg.jpg";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UploadIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}

export default function AjukanPage() {
  const navigate = useNavigate();
  const [instansiList, setInstansiList] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [form, setForm] = useState({
    instansi: "",
    nama: "",
    nip: "",
    jabatan: "",
    layanan: "",
    tanggal: "",
    deskripsi: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/instansi`).then((r) => r.json()),
      fetch(`${API}/api/layanan`).then((r) => r.json()),
    ])
      .then(([instansi, layanan]) => {
        setInstansiList(Array.isArray(instansi) ? instansi : []);
        setLayananList(Array.isArray(layanan) ? layanan : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function patch(p) {
    setForm((f) => ({ ...f, ...p }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("File harus berformat PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    setError("");
    setPdfFile(file);
  }

  async function handleCopyToken(token) {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!pdfFile) {
      setError("File PDF wajib diunggah");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("instansi", form.instansi);
      fd.append("nama", form.nama);
      fd.append("nip", form.nip);
      fd.append("jabatan", form.jabatan);
      fd.append("layanan", form.layanan);
      fd.append("tanggal", form.tanggal);
      fd.append("deskripsi", form.deskripsi);
      fd.append("pdf", pdfFile);

      const res = await fetch(`${API}/api/requests`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal mengirim permohonan");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim permohonan");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/30 outline-none transition-colors";

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* Left panel — full background image */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${formBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50" />

        <div className="relative z-10 max-w-sm text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Diskominfotik</h1>
          <p className="text-sm text-white/70 mb-8">Kabupaten Sumbawa</p>

          <div className="space-y-3 text-sm text-white/80">
            <div className="flex items-center gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CheckIcon className="size-3 text-white" />
              </div>
              <span>Proses cepat tanpa antre</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CheckIcon className="size-3 text-white" />
              </div>
              <span>Status bisa dipantau langsung</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CheckIcon className="size-3 text-white" />
              </div>
              <span>Gratis untuk instansi pemerintah</span>
            </div>
          </div>
        </div>

        {/* Single decorative accent */}
        <div className="absolute -bottom-24 -right-24 size-64 rounded-full bg-white/5" />
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile header */}
          <div className="lg:hidden mb-6">
            <h1 className="text-xl font-bold text-foreground">Ajukan Layanan</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Isi formulir untuk mengajukan permohonan.
            </p>
          </div>

          {result ? (
            /* Success */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/15">
                  <svg className="size-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Permohonan Terkirim</p>
                  <p className="text-xs text-muted-foreground">Data Anda sudah diterima sistem</p>
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Simpan token di bawah untuk mengecek status permohonan:
                </p>
                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2.5">
                  <code className="min-w-0 flex-1 text-sm font-mono font-semibold text-foreground break-all">
                    {result.statusToken}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyToken(result.statusToken)}
                    className="shrink-0 rounded-md bg-card border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2 text-sm rounded-md border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Kembali ke Beranda
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setCopied(false);
                    setForm({ instansi: "", nama: "", nip: "", jabatan: "", layanan: "", tanggal: "", deskripsi: "" });
                    setPdfFile(null);
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary-dim transition-colors"
                >
                  Ajukan Lagi
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Desktop heading */}
              <div className="hidden lg:block mb-2">
                <h2 className="text-lg font-bold text-foreground">Formulir Permohonan</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Lengkapi data berikut. Field bertanda * wajib diisi.
                </p>
              </div>

              {/* Nama & NIP */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => patch({ nama: e.target.value })}
                    placeholder="Nama sesuai KTP"
                    className={inputClass + " mt-1.5"}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">NIP *</label>
                  <input
                    type="text"
                    value={form.nip}
                    onChange={(e) => patch({ nip: e.target.value })}
                    placeholder="Nomor Induk Pegawai"
                    className={inputClass + " mt-1.5"}
                    required
                  />
                </div>
              </div>

              {/* Jabatan & Instansi */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Jabatan *</label>
                  <input
                    type="text"
                    value={form.jabatan}
                    onChange={(e) => patch({ jabatan: e.target.value })}
                    placeholder="Jabatan di instansi"
                    className={inputClass + " mt-1.5"}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Instansi *</label>
                  <select
                    value={form.instansi}
                    onChange={(e) => patch({ instansi: e.target.value })}
                    className={inputClass + " mt-1.5"}
                    required
                    disabled={loading}
                  >
                    <option value="">{loading ? "Memuat..." : "Pilih instansi"}</option>
                    {instansiList.map((i) => (
                      <option key={i.id} value={i.nama}>{i.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Layanan & Tanggal */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Jenis Layanan *</label>
                  <select
                    value={form.layanan}
                    onChange={(e) => patch({ layanan: e.target.value })}
                    className={inputClass + " mt-1.5"}
                    required
                    disabled={loading}
                  >
                    <option value="">{loading ? "Memuat..." : "Pilih layanan"}</option>
                    {layananList.map((l) => (
                      <option key={l.id} value={l.nama}>{l.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Tanggal Kegiatan *</label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => patch({ tanggal: e.target.value })}
                    className={inputClass + " mt-1.5"}
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-sm font-medium text-foreground">Deskripsi / Keterangan</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => patch({ deskripsi: e.target.value })}
                  rows={3}
                  placeholder="Jelaskan kebutuhan Anda (opsional)"
                  className={inputClass + " mt-1.5 resize-none"}
                />
              </div>

              {/* Upload PDF */}
              <div>
                <label className="text-sm font-medium text-foreground">Surat Permohonan (PDF) *</label>
                <div className="mt-1.5 relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/50 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <UploadIcon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {pdfFile ? (
                        <>
                          <p className="text-sm font-medium text-foreground truncate">{pdfFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024).toFixed(0)} KB</p>
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
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-md bg-destructive/10 border-l-4 border-destructive p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm rounded-md font-medium transition-colors hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
