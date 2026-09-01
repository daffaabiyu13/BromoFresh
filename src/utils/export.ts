import { Alert, Platform } from 'react-native';

/**
 * Utilitas ekspor untuk versi Web (Vercel).
 * - CSV: unduh berkas langsung dari browser.
 * - PDF: buka jendela cetak berisi HTML rapi → pengguna "Simpan sebagai PDF".
 * Di perangkat native, fitur ini belum tersedia dan memberi info yang jelas.
 */

const isWeb = Platform.OS === 'web';

function notifyWebOnly() {
  Alert.alert('Tersedia di Web', 'Ekspor CSV/PDF tersedia saat aplikasi dibuka di browser.');
}

/** Cap tanggal untuk nama berkas, mis. "2026-09-01". */
export function fileStamp(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Escape satu sel CSV (bungkus dengan tanda kutip bila mengandung , " atau newline). */
function csvCell(value: string | number | null | undefined): string {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Bangun teks CSV dari header + baris data. */
export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}

/** Unduh CSV di browser (diberi BOM UTF-8 agar Excel membaca aksen & Rp dengan benar). */
export function downloadCsv(filename: string, csv: string) {
  if (!isWeb) return notifyWebOnly();
  const g = globalThis as any;
  const blob = new g.Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = g.URL.createObjectURL(blob);
  const a = g.document.createElement('a');
  a.href = url;
  a.download = filename;
  g.document.body.appendChild(a);
  a.click();
  g.document.body.removeChild(a);
  g.URL.revokeObjectURL(url);
}

/** Escape teks untuk disisipkan aman ke HTML. */
export function escapeHtml(s: string | number): string {
  return String(s ?? '').replace(
    /[&<>"']/g,
    (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]),
  );
}

/** Bangun <table> HTML dari header + baris (semua sel di-escape). */
export function htmlTable(headers: string[], rows: (string | number)[][]): string {
  const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}

const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Inter, sans-serif; color: #1A1A1A; margin: 32px; }
  h1 { font-size: 20px; margin: 0 0 2px; color: #1A4731; }
  .range { color: #7A8B84; font-size: 13px; margin: 0 0 20px; }
  h2 { font-size: 14px; margin: 22px 0 8px; color: #256044; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 6px; }
  th, td { border: 1px solid #E5DFD0; padding: 6px 9px; text-align: left; }
  th { background: #EBF6F0; color: #1A4731; font-weight: 700; }
  tbody tr:nth-child(even) { background: #FAF8F1; }
  .kpis { display: flex; flex-wrap: wrap; gap: 10px; margin: 6px 0 4px; }
  .kpi { border: 1px solid #E5DFD0; border-radius: 10px; padding: 10px 14px; min-width: 150px; }
  .kpi .lbl { font-size: 11px; color: #7A8B84; text-transform: uppercase; letter-spacing: .4px; }
  .kpi .val { font-size: 18px; font-weight: 800; margin-top: 2px; }
  .foot { margin-top: 26px; color: #7A8B84; font-size: 11px; }
  @media print { body { margin: 12mm; } }
`;

/**
 * Buka jendela berisi HTML lalu memicu dialog cetak (pengguna bisa Simpan PDF).
 * `bodyHtml` sudah harus berupa HTML yang aman (pakai htmlTable/escapeHtml).
 */
export function printDocument(title: string, bodyHtml: string) {
  if (!isWeb) return notifyWebOnly();
  const g = globalThis as any;
  const win = g.window.open('', '_blank');
  if (!win) {
    Alert.alert('Popup diblokir', 'Izinkan popup di browser untuk mencetak atau menyimpan PDF.');
    return;
  }
  win.document.write(
    `<!doctype html><html lang="id"><head><meta charset="utf-8">` +
      `<title>${escapeHtml(title)}</title><style>${PRINT_CSS}</style></head>` +
      `<body>${bodyHtml}</body></html>`,
  );
  win.document.close();
  win.focus();
  // Beri jeda agar layout selesai sebelum dialog cetak muncul.
  setTimeout(() => win.print(), 350);
}

/** Label metode bayar yang rapi untuk ekspor. */
export const METHOD_LABEL: Record<string, string> = {
  tunai: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
};
