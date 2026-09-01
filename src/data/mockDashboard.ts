import type { StockAlert, Transaction } from '@/types';

/** Data contoh untuk layar Dashboard & Laporan (menggantikan fetch Supabase). */

export interface Kpi {
  key: string;
  label: string;
  value: string;
  icon: string;
  change?: string;
  changeDir?: 'up' | 'down' | 'neutral';
  compare?: string;
  featured?: boolean;
  danger?: boolean;
}

export const dashboardKpis: Kpi[] = [
  { key: 'omset', label: 'Total Omset', value: 'Rp 2,85 jt', icon: '💰', change: '▲ 8,2%', changeDir: 'up', compare: 'vs kemarin', featured: true },
  { key: 'trx', label: 'Transaksi', value: '47', icon: '🧾', change: '▲ 5', changeDir: 'up', compare: 'vs kemarin' },
  { key: 'avg', label: 'Rata-rata', value: 'Rp 60,6 rb', icon: '📊', change: '▼ 2,1%', changeDir: 'down', compare: 'vs kemarin' },
  { key: 'laba', label: 'Laba Kotor', value: 'Rp 712 rb', icon: '📈', change: '▲ 25%', changeDir: 'up', compare: 'margin' },
  { key: 'stok', label: 'Stok Kritis', value: '4', icon: '⚠️', change: '2 kritis', changeDir: 'neutral', compare: '2 hampir habis', danger: true },
];

export interface CategoryContribution {
  key: 'sayur' | 'buah' | 'sembako' | 'frozen';
  label: string;
  pct: number;
  color: string;
}

export const categoryContribution: CategoryContribution[] = [
  { key: 'sayur', label: 'Sayur', pct: 42, color: '#1A4731' },
  { key: 'buah', label: 'Buah', pct: 28, color: '#3D8B66' },
  { key: 'sembako', label: 'Sembako', pct: 20, color: '#E8A020' },
  { key: 'frozen', label: 'Frozen Food', pct: 10, color: '#3A7BD5' },
];

export interface RankedProduct {
  rank: number;
  emoji: string;
  name: string;
  qty: string;
  value: string;
}

export const topProducts: RankedProduct[] = [
  { rank: 1, emoji: '🌾', name: 'Beras Premium 5kg', qty: '12 pack terjual', value: 'Rp 780.000' },
  { rank: 2, emoji: '🥚', name: 'Telur Ayam', qty: '28 kg terjual', value: 'Rp 784.000' },
  { rank: 3, emoji: '🥬', name: 'Bayam Segar', qty: '45 ikat terjual', value: 'Rp 135.000' },
  { rank: 4, emoji: '🍎', name: 'Apel Fuji', qty: '32 pcs terjual', value: 'Rp 256.000' },
  { rank: 5, emoji: '🫙', name: 'Minyak Goreng 1L', qty: '18 botol terjual', value: 'Rp 324.000' },
];

export const stockAlerts: StockAlert[] = [
  { emoji: '🦐', name: 'Udang Beku', remaining: 'Tersisa 1 pack', min: 'Min: 3 pack', level: 'critical' },
  { emoji: '🍅', name: 'Tomat Cherry', remaining: 'Tersisa 2 pack', min: 'Min: 5 pack', level: 'critical' },
  { emoji: '🍗', name: 'Nugget Ayam', remaining: 'Tersisa 3 pack', min: 'Min: 5 pack', level: 'warning' },
  { emoji: '🌽', name: 'Jagung Manis', remaining: 'Tersisa 5 pcs', min: 'Min: 10 pcs', level: 'warning' },
];

export const recentTransactions: Transaction[] = [
  { id: '#00047', time: '10:23', cashier: 'Siti R.', category: 'Sayur', items: 3, subtotal: 13500, discount: 0, total: 13500, method: 'tunai', status: 'Selesai' },
  { id: '#00046', time: '10:18', cashier: 'Siti R.', category: 'Sembako', items: 2, subtotal: 93000, discount: 0, total: 93000, method: 'qris', status: 'Selesai' },
  { id: '#00045', time: '10:12', cashier: 'Siti R.', category: 'Buah', items: 5, subtotal: 43000, discount: 0, total: 43000, method: 'tunai', status: 'Selesai' },
  { id: '#00044', time: '10:05', cashier: 'Roni', category: 'Frozen Food', items: 2, subtotal: 40000, discount: 0, total: 40000, method: 'transfer', status: 'Selesai' },
  { id: '#00043', time: '09:58', cashier: 'Siti R.', category: 'Sayur', items: 4, subtotal: 17000, discount: 0, total: 17000, method: 'tunai', status: 'Selesai' },
];

/** Omset per kategori 7 hari terakhir (nilai dalam ribuan rupiah). */
export interface SalesSeries {
  labels: string[];
  sayur: number[];
  buah: number[];
  sembako: number[];
  frozen: number[];
}

export const weeklySales: SalesSeries = {
  labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  sayur: [820, 950, 740, 1050, 1180, 1350, 1200],
  buah: [520, 590, 480, 650, 740, 850, 798],
  sembako: [350, 400, 350, 450, 520, 620, 570],
  frozen: [160, 160, 150, 200, 240, 280, 282],
};

// ============================================================================
// Data Dashboard per periode (Hari / Minggu / Bulan / Tahun).
// Dipakai oleh tombol filter di top bar Dashboard agar KPI, grafik, kontribusi
// kategori, dan produk terlaris ikut berubah sesuai periode yang dipilih.
// ============================================================================

export type DashPeriod = 'Hari' | 'Minggu' | 'Bulan' | 'Tahun';

export interface DashboardPeriodData {
  kpis: Kpi[];
  contribution: CategoryContribution[];
  topProducts: RankedProduct[];
  sales: SalesSeries;
  salesSubtitle: string;
  contribSubtitle: string;
  topSubtitle: string;
  /** Label di tengah donut, mis. "Total Hari Ini". */
  donutLabel: string;
}

const CC = { sayur: '#1A4731', buah: '#3D8B66', sembako: '#E8A020', frozen: '#3A7BD5' };

const contrib = (sayur: number, buah: number, sembako: number, frozen: number): CategoryContribution[] => [
  { key: 'sayur', label: 'Sayur', pct: sayur, color: CC.sayur },
  { key: 'buah', label: 'Buah', pct: buah, color: CC.buah },
  { key: 'sembako', label: 'Sembako', pct: sembako, color: CC.sembako },
  { key: 'frozen', label: 'Frozen Food', pct: frozen, color: CC.frozen },
];

const rank = (rows: [string, string, string, string][]): RankedProduct[] =>
  rows.map((r, i) => ({ rank: i + 1, emoji: r[0], name: r[1], qty: r[2], value: r[3] }));

export const dashboardByPeriod: Record<DashPeriod, DashboardPeriodData> = {
  Hari: {
    kpis: [
      { key: 'omset', label: 'Total Omset', value: 'Rp 485 rb', icon: '💰', change: '▲ 6,4%', changeDir: 'up', compare: 'vs kemarin', featured: true },
      { key: 'trx', label: 'Transaksi', value: '12', icon: '🧾', change: '▲ 3', changeDir: 'up', compare: 'vs kemarin' },
      { key: 'avg', label: 'Rata-rata', value: 'Rp 40,4 rb', icon: '📊', change: '▼ 1,2%', changeDir: 'down', compare: 'vs kemarin' },
      { key: 'laba', label: 'Laba Kotor', value: 'Rp 121 rb', icon: '📈', change: '▲ 25%', changeDir: 'up', compare: 'margin' },
      { key: 'stok', label: 'Stok Kritis', value: '4', icon: '⚠️', change: '2 kritis', changeDir: 'neutral', compare: '2 hampir habis', danger: true },
    ],
    contribution: contrib(45, 24, 22, 9),
    topProducts: rank([
      ['🌾', 'Beras Premium 5kg', '3 pack terjual', 'Rp 195.000'],
      ['🥚', 'Telur Ayam', '6 kg terjual', 'Rp 168.000'],
      ['🥬', 'Bayam Segar', '12 ikat terjual', 'Rp 36.000'],
      ['🍎', 'Apel Fuji', '9 pcs terjual', 'Rp 72.000'],
      ['🫙', 'Minyak Goreng 1L', '5 botol terjual', 'Rp 90.000'],
    ]),
    sales: {
      labels: ['08.00', '10.00', '12.00', '14.00', '16.00', '18.00', '20.00'],
      sayur: [40, 85, 120, 95, 150, 180, 110],
      buah: [20, 45, 70, 60, 90, 110, 70],
      sembako: [30, 50, 65, 55, 80, 95, 60],
      frozen: [10, 15, 25, 20, 30, 35, 20],
    },
    salesSubtitle: 'Omset per kategori hari ini (per jam)',
    contribSubtitle: 'Kontribusi omset hari ini',
    topSubtitle: 'Top 5 hari ini berdasarkan omset',
    donutLabel: 'Total Hari Ini',
  },
  Minggu: {
    kpis: [
      { key: 'omset', label: 'Total Omset', value: 'Rp 18,6 jt', icon: '💰', change: '▲ 8,2%', changeDir: 'up', compare: 'vs minggu lalu', featured: true },
      { key: 'trx', label: 'Transaksi', value: '312', icon: '🧾', change: '▲ 24', changeDir: 'up', compare: 'vs minggu lalu' },
      { key: 'avg', label: 'Rata-rata', value: 'Rp 59,6 rb', icon: '📊', change: '▼ 2,1%', changeDir: 'down', compare: 'vs minggu lalu' },
      { key: 'laba', label: 'Laba Kotor', value: 'Rp 4,6 jt', icon: '📈', change: '▲ 25%', changeDir: 'up', compare: 'margin' },
      { key: 'stok', label: 'Stok Kritis', value: '4', icon: '⚠️', change: '2 kritis', changeDir: 'neutral', compare: '2 hampir habis', danger: true },
    ],
    contribution: contrib(42, 28, 20, 10),
    topProducts: rank([
      ['🌾', 'Beras Premium 5kg', '12 pack terjual', 'Rp 780.000'],
      ['🥚', 'Telur Ayam', '28 kg terjual', 'Rp 784.000'],
      ['🥬', 'Bayam Segar', '45 ikat terjual', 'Rp 135.000'],
      ['🍎', 'Apel Fuji', '32 pcs terjual', 'Rp 256.000'],
      ['🫙', 'Minyak Goreng 1L', '18 botol terjual', 'Rp 324.000'],
    ]),
    sales: weeklySales,
    salesSubtitle: 'Omset per kategori 7 hari terakhir',
    contribSubtitle: 'Kontribusi omset minggu ini',
    topSubtitle: 'Top 5 minggu ini berdasarkan omset',
    donutLabel: 'Total Minggu Ini',
  },
  Bulan: {
    kpis: [
      { key: 'omset', label: 'Total Omset', value: 'Rp 78,4 jt', icon: '💰', change: '▲ 11,5%', changeDir: 'up', compare: 'vs bulan lalu', featured: true },
      { key: 'trx', label: 'Transaksi', value: '1.284', icon: '🧾', change: '▲ 132', changeDir: 'up', compare: 'vs bulan lalu' },
      { key: 'avg', label: 'Rata-rata', value: 'Rp 61,1 rb', icon: '📊', change: '▲ 1,8%', changeDir: 'up', compare: 'vs bulan lalu' },
      { key: 'laba', label: 'Laba Kotor', value: 'Rp 19,2 jt', icon: '📈', change: '▲ 24%', changeDir: 'up', compare: 'margin' },
      { key: 'stok', label: 'Stok Kritis', value: '4', icon: '⚠️', change: '2 kritis', changeDir: 'neutral', compare: '2 hampir habis', danger: true },
    ],
    contribution: contrib(40, 27, 21, 12),
    topProducts: rank([
      ['🌾', 'Beras Premium 5kg', '52 pack terjual', 'Rp 3.380.000'],
      ['🥚', 'Telur Ayam', '118 kg terjual', 'Rp 3.304.000'],
      ['🍎', 'Apel Fuji', '140 pcs terjual', 'Rp 1.120.000'],
      ['🫙', 'Minyak Goreng 1L', '76 botol terjual', 'Rp 1.368.000'],
      ['🥬', 'Bayam Segar', '190 ikat terjual', 'Rp 570.000'],
    ]),
    sales: {
      labels: ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4'],
      sayur: [7200, 6800, 7600, 8100],
      buah: [4200, 3900, 4500, 4800],
      sembako: [3100, 2900, 3300, 3500],
      frozen: [1300, 1200, 1450, 1500],
    },
    salesSubtitle: 'Omset per kategori per minggu (bulan ini)',
    contribSubtitle: 'Kontribusi omset bulan ini',
    topSubtitle: 'Top 5 bulan ini berdasarkan omset',
    donutLabel: 'Total Bulan Ini',
  },
  Tahun: {
    kpis: [
      { key: 'omset', label: 'Total Omset', value: 'Rp 892 jt', icon: '💰', change: '▲ 18,3%', changeDir: 'up', compare: 'vs tahun lalu', featured: true },
      { key: 'trx', label: 'Transaksi', value: '14.760', icon: '🧾', change: '▲ 2.130', changeDir: 'up', compare: 'vs tahun lalu' },
      { key: 'avg', label: 'Rata-rata', value: 'Rp 60,4 rb', icon: '📊', change: '▲ 0,9%', changeDir: 'up', compare: 'vs tahun lalu' },
      { key: 'laba', label: 'Laba Kotor', value: 'Rp 221 jt', icon: '📈', change: '▲ 25%', changeDir: 'up', compare: 'margin' },
      { key: 'stok', label: 'Stok Kritis', value: '4', icon: '⚠️', change: '2 kritis', changeDir: 'neutral', compare: '2 hampir habis', danger: true },
    ],
    contribution: contrib(41, 28, 20, 11),
    topProducts: rank([
      ['🥚', 'Telur Ayam', '1.420 kg terjual', 'Rp 39.760.000'],
      ['🌾', 'Beras Premium 5kg', '612 pack terjual', 'Rp 39.780.000'],
      ['🫙', 'Minyak Goreng 1L', '910 botol terjual', 'Rp 16.380.000'],
      ['🍎', 'Apel Fuji', '1.680 pcs terjual', 'Rp 13.440.000'],
      ['🥬', 'Bayam Segar', '2.280 ikat terjual', 'Rp 6.840.000'],
    ]),
    sales: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt'],
      sayur: [28000, 26500, 30200, 29800, 31500, 33000, 34200, 35100],
      buah: [16800, 15900, 18200, 17500, 19100, 20300, 21000, 21800],
      sembako: [12400, 11800, 13100, 12900, 13700, 14200, 14800, 15200],
      frozen: [5200, 4900, 5600, 5400, 5900, 6200, 6500, 6700],
    },
    salesSubtitle: 'Omset per kategori per bulan (tahun ini)',
    contribSubtitle: 'Kontribusi omset tahun ini',
    topSubtitle: 'Top 5 tahun ini berdasarkan omset',
    donutLabel: 'Total Tahun Ini',
  },
};
