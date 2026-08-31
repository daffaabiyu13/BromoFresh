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
