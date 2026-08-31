/** Format angka menjadi Rupiah, mis. 3000 → "Rp 3.000". */
export function formatRupiah(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

/** Format ringkas untuk KPI, mis. 2850000 → "Rp 2,85 jt". */
export function formatShort(n: number): string {
  if (n >= 1_000_000) {
    return 'Rp ' + (n / 1_000_000).toFixed(2).replace('.', ',') + ' jt';
  }
  if (n >= 1_000) {
    return 'Rp ' + Math.round(n / 1_000) + ' rb';
  }
  return formatRupiah(n);
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Tanggal panjang berbahasa Indonesia, mis. "Senin, 31 Agustus". */
export function formatTanggalId(date: Date = new Date(), withYear = false): string {
  const base = `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return withYear ? `${base} ${date.getFullYear()}` : base;
}

/** Nomor struk berpola #00001. */
export function formatReceiptNumber(n: number): string {
  return '#' + String(n).padStart(5, '0');
}
