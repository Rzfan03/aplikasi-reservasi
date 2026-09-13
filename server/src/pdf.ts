// Minimal PDF builder (A4, Helvetica) — tanpa dependency eksternal.
function esc(s: string): string {
  let out = ''
  for (const ch of s) {
    out += ch.codePointAt(0)! > 0xff ? '?' : ch
  }
  return out.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 56
const LINE_W = PAGE_W - MARGIN * 2

function textWidth(text: string, fs: number, bold: boolean): number {
  let w = 0
  for (const ch of text) w += ch === ' ' ? 0.28 * fs : (bold ? 0.56 : 0.5) * fs
  return w
}

function wrap(text: string, fs: number, bold: boolean): string[] {
  const max = Math.floor(LINE_W / ((bold ? 0.56 : 0.5) * fs))
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if (cur.length + 1 + w.length <= max) cur += ` ${w}`
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

function buildLetterText(input: {
  id: string
  nama: string
  nip: string
  jabatan: string
  instansi: string
  layanan: string
  deskripsi?: string | null
  mulai: string
  selesai?: string | null
  status: 'APPROVED' | 'REJECTED'
  rejectReason?: string | null
  adminEmail?: string | null
}): { text: string; bold?: boolean; center?: boolean; size?: number }[] {
  const center = { center: true }
  const r: { text: string; bold?: boolean; center?: boolean; size?: number }[] = []
  r.push({ text: 'PEMERINTAH KABUPATEN SUMBAWA', ...center })
  r.push({ text: 'DINAS KOMUNIKASI DAN INFORMATIKA', ...center })
  r.push({ text: '', ...center })
  r.push({ text: 'SURAT KETERANGAN HASIL PEMERIKSAAN', bold: true, size: 13, ...center })
  r.push({ text: `No. ${input.id} / ${new Date().getFullYear()}`, ...center })
  r.push({ text: '', ...center })
  r.push({ text: '', ...center })
  r.push({ text: 'Berdasarkan permohonan yang diajukan secara daring melalui Sistem Reservasi Layanan Diskominfotik Kabupaten Sumbawa, bersama ini menerangkan bahwa:', })
  r.push({ text: '' })
  r.push({ text: `Nama\t\t\t: ${input.nama}` })
  r.push({ text: `NIP\t\t\t\t: ${input.nip}` })
  r.push({ text: `Jabatan\t\t: ${input.jabatan}` })
  r.push({ text: `Instansi\t\t: ${input.instansi}` })
  r.push({ text: `Layanan\t\t: ${input.layanan}` })
  r.push({ text: `Tanggal kegiatan\t: ${input.selesai ? `${input.mulai} s.d. ${input.selesai}` : input.mulai}` })
  r.push({ text: `Status\t\t\t: ${input.status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'}`, bold: true })
  if (input.status === 'REJECTED' && input.rejectReason) {
    r.push({ text: `Alasan penolakan\t: ${input.rejectReason}` })
  }
  if (input.deskripsi) {
    r.push({ text: `Keterangan\t\t: ${input.deskripsi}` })
  }
  r.push({ text: '' })
  r.push({ text: '' })
  const closing =
    input.status === 'APPROVED'
      ? 'Dengan ini pemohon dipersilakan menghubungi admin untuk koordinasi jadwal dan kelengkapan dokumen lebih lanjut.'
      : 'Dengan ini permohonan dinyatakan tidak dapat diproses lebih lanjut.'
  r.push({ text: closing })
  r.push({ text: '' })
  r.push({ text: '' })
  r.push({ text: '' })
  r.push({ text: 'Tanda tangan,', })
  r.push({ text: '' })
  r.push({ text: '' })
  r.push({ text: input.adminEmail || 'Admin Diskominfotik Kabupaten Sumbawa', bold: true })
  return r
}

export function generateSurat(input: Parameters<typeof buildLetterText>[0]): Buffer {
  const ls = buildLetterText(input)

  let stream = ''
  let y = PAGE_H - MARGIN
  for (const l of ls) {
    const fs = l.size || 11
    const bold = l.bold === true
    let x = MARGIN
    if (l.center) x = MARGIN + Math.round((LINE_W - textWidth(l.text, fs, bold)) / 2)
    for (const [i, line] of wrap(l.text, fs, bold).entries()) {
      const cx = i === 0 ? x : MARGIN
      stream += `BT /F${bold ? 2 : 1} ${fs} Tf ${cx.toFixed(2)} ${y.toFixed(2)} Td (${esc(line)}) Tj ET\n`
      y -= fs + 4
    }
    if (l.text === '') y -= fs + 2
    y -= 4
  }

  const content = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    content,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ]

  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  for (const [i, obj] of objects.entries()) {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`
  }
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n`
  out += '0000000000 65535 f \n'
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}