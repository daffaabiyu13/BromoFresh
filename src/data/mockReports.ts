import type { PaymentMethod, Transaction } from '@/types';
import type { SalesSeries } from '@/data/mockDashboard';

/** Data laporan per periode — diambil dari mockup Laporan Penjualan. */

export type ReportPeriod = 'harian' | 'mingguan' | 'bulanan' | 'tahunan';

export interface PeriodReport extends SalesSeries {
  kpiTotal: string;
  kpiTrx: number;
  kpiAvg: string;
  kpiItems: number;
  badgeTotal: string;
  badgeTrx: string;
  badgeAvg: string;
  badgeItems: string;
  sub: string;
  catLabel: string;
  range: string;
}

export const periodData: Record<ReportPeriod, PeriodReport> = {
  harian: {
    labels: ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'],
    sayur: [120, 185, 210, 340, 280, 420, 380, 510, 290, 360, 280, 190],
    buah: [80, 110, 150, 200, 170, 260, 230, 310, 180, 220, 160, 110],
    sembako: [60, 90, 110, 150, 130, 200, 180, 240, 140, 170, 130, 90],
    frozen: [30, 45, 55, 75, 65, 100, 90, 120, 70, 85, 65, 45],
    kpiTotal: 'Rp 2,85 jt', kpiTrx: 47, kpiAvg: 'Rp 60,6 rb', kpiItems: 238,
    badgeTotal: '▲ 12,4%', badgeTrx: '▲ 5', badgeAvg: '▼ 3,1%', badgeItems: '▲ 18',
    sub: 'Per jam · Sabtu 30 Agt', catLabel: 'Hari ini', range: 'Sabtu, 30 Agustus 2026',
  },
  mingguan: {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    sayur: [1200, 1050, 1380, 980, 1620, 2100, 870],
    buah: [750, 680, 890, 620, 1050, 1380, 560],
    sembako: [580, 510, 670, 480, 810, 1060, 430],
    frozen: [290, 255, 335, 240, 405, 530, 215],
    kpiTotal: 'Rp 19,7 jt', kpiTrx: 312, kpiAvg: 'Rp 63,1 rb', kpiItems: 1560,
    badgeTotal: '▲ 8,2%', badgeTrx: '▲ 24', badgeAvg: '▼ 1,8%', badgeItems: '▲ 96',
    sub: 'Per hari · 24–30 Agt', catLabel: 'Minggu ini', range: '24 – 30 Agustus 2026',
  },
  bulanan: {
    labels: ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4'],
    sayur: [8400, 9100, 7800, 8200],
    buah: [5200, 5700, 4900, 5100],
    sembako: [3900, 4300, 3600, 3800],
    frozen: [1950, 2150, 1800, 1900],
    kpiTotal: 'Rp 75,8 jt', kpiTrx: 1187, kpiAvg: 'Rp 63,9 rb', kpiItems: 6340,
    badgeTotal: '▲ 15,3%', badgeTrx: '▲ 112', badgeAvg: '▲ 2,1%', badgeItems: '▲ 480',
    sub: 'Per minggu · Agustus 2026', catLabel: 'Bulan ini', range: '1 – 31 Agustus 2026',
  },
  tahunan: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt'],
    sayur: [62000, 54000, 71000, 68000, 75000, 82000, 78000, 84000],
    buah: [38000, 33000, 44000, 42000, 46000, 51000, 48000, 52000],
    sembako: [29000, 25000, 33000, 32000, 35000, 39000, 37000, 40000],
    frozen: [14500, 12500, 16500, 16000, 17500, 19500, 18500, 20000],
    kpiTotal: 'Rp 617 jt', kpiTrx: 9640, kpiAvg: 'Rp 64,0 rb', kpiItems: 51200,
    badgeTotal: '▲ 22,1%', badgeTrx: '▲ 870', badgeAvg: '▲ 3,4%', badgeItems: '▲ 4200',
    sub: 'Per bulan · Jan–Agt 2026', catLabel: 'Tahun 2026', range: 'Januari – Agustus 2026',
  },
};

const cashiers = ['Siti R.', 'Budi S.', 'Rina T.', 'Agus P.', 'Dewi M.'];
const cats = ['Sayur', 'Buah', 'Sembako', 'Frozen Food'];
const methods: PaymentMethod[] = ['tunai', 'qris', 'transfer'];

/**
 * Membuat 47 transaksi contoh secara deterministik (memakai indeks, bukan
 * Math.random) agar daftar stabil antar render — cocok untuk demo/tabel.
 */
export function generateTransactions(count = 47): Transaction[] {
  return Array.from({ length: count }, (_, i) => {
    const h = Math.min(6 + Math.floor(i * 0.23), 17);
    const m = (i * 7) % 60;
    const items = 2 + (i % 6);
    const subtotal = items * (15000 + (i * 3163) % 50000);
    const discount = i % 5 === 0 ? Math.floor((subtotal * 0.05) / 1000) * 1000 : 0;
    const method = methods[i % 3];
    const batal = i % 17 === 0 && i !== 0;
    return {
      id: `TRX-${String(i + 1).padStart(3, '0')}`,
      time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      cashier: cashiers[i % cashiers.length],
      category: cats[i % cats.length],
      items,
      subtotal,
      discount,
      total: subtotal - discount,
      method,
      status: batal ? 'Batal' : 'Selesai',
    };
  });
}
