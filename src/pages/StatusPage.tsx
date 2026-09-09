import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type StatusData = {
  id: string;
  instansi: string;
  nama: string;
  layanan: string;
  tanggal: string;
  status: RequestStatus;
  rejectReason: string | null;
  createdAt: string;
};

const statusMeta: Record<RequestStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Menunggu konfirmasi admin",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  APPROVED: {
    label: "Disetujui",
    className: "bg-success/15 text-success border-success/30",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function StatusPage() {
  const [searchParams] = useSearchParams();
  useReveal();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check(t: string) {
    if (!t.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/requests/${encodeURIComponent(t.trim())}`);
      if (!res.ok) throw new Error(res.status === 404 ? "not_found" : "error");
      setData((await res.json()) as StatusData);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error && err.message === "not_found"
          ? "Token tidak ditemukan. Periksa kembali token pada bukti pengajuan Anda."
          : "Gagal memeriksa status. Periksa koneksi internet lalu coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (data?.status !== "PENDING") return;
    const timer = setInterval(() => {
      void check(token);
    }, 20000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, data?.status]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void check(token);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <h1 data-reveal className="font-display font-light text-2xl tracking-tight text-foreground sm:text-4xl">Cek Status Permohonan</h1>
        <p data-reveal className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Masukkan token yang Anda terima setelah mengirim formulir untuk melihat status
          permohonan. Status diperbarui otomatis setiap 20 detik selama masih menunggu.
        </p>

        <form onSubmit={onSubmit} data-reveal className="mt-8 flex flex-col sm:flex-row gap-3">
          <label className="sr-only" htmlFor="status-token">Token permohonan</label>
          <input
            id="status-token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Contoh: SMB-XXXX-XXXX"
            autoComplete="off"
            className="min-w-0 flex-1 rounded border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-[3px] focus:ring-ring/30 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!token.trim() || loading}
            className="px-6 py-2.5 rounded bg-primary text-primary-foreground text-sm font-semibold transition-colors duration-200 hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memeriksa…" : "Cek Status"}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-6 rounded border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-8 rounded border border-border bg-card p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status permohonan</p>
                <span className={`mt-1.5 inline-flex items-center rounded px-3 py-1 text-sm font-semibold border ${statusMeta[data.status].className}`}>
                  {statusMeta[data.status].label}
                </span>
              </div>
              {data.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => check(token)}
                  disabled={loading}
                  className="text-sm font-medium text-primary hover:text-primary-dim transition-colors disabled:opacity-50"
                >
                  Muat ulang sekarang
                </button>
              )}
            </div>

            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Nama pemohon</dt>
                <dd className="mt-0.5 font-medium text-foreground">{data.nama}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Instansi</dt>
                <dd className="mt-0.5 font-medium text-foreground">{data.instansi}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Layanan</dt>
                <dd className="mt-0.5 font-medium text-foreground">{data.layanan}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Tanggal kegiatan</dt>
                <dd className="mt-0.5 font-medium text-foreground">{formatDate(data.tanggal)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Diajukan pada</dt>
                <dd className="mt-0.5 font-medium text-foreground">{formatDate(data.createdAt)}</dd>
              </div>
            </dl>

            {data.status === "REJECTED" && data.rejectReason && (
              <div role="alert" className="rounded border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                <p className="font-semibold text-destructive">Alasan penolakan</p>
                <p className="mt-1 text-destructive/90 leading-relaxed">{data.rejectReason}</p>
              </div>
            )}

            {data.status === "APPROVED" && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Permohonan disetujui. Koordinasi jadwal dan kelengkapan dokumen akan dihubungi
                melalui kontak yang Anda berikan kepada admin.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}