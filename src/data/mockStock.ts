import { products } from '@/data/products';
import type { CategoryKey, Product } from '@/types';

/**
 * Data stok contoh untuk Modul Manajemen Stok.
 * Menggabungkan master produk (src/data/products.ts) dengan jumlah stok, stok
 * minimum, dan HPP. Pada implementasi nyata data ini berasal dari tabel
 * `products` di Supabase (kolom stock, min_stock, cost_price).
 */

export type StockStatus = 'kritis' | 'menipis' | 'aman';

export interface StockRow extends Product {
  stock: number;
  minStock: number;
  costPrice: number;
  status: StockStatus;
}

/** Stok & stok minimum per id produk (selaras dengan alert di Dashboard). */
const STOCK_TABLE: Record<number, { stock: number; min: number; cost: number }> = {
  1: { stock: 24, min: 10, cost: 2000 }, // Bayam
  2: { stock: 30, min: 10, cost: 1800 }, // Kangkung
  3: { stock: 18, min: 10, cost: 2000 }, // Sawi
  4: { stock: 12, min: 6, cost: 6000 }, // Brokoli
  5: { stock: 22, min: 8, cost: 3500 }, // Wortel
  6: { stock: 2, min: 5, cost: 6000 }, // Tomat Cherry — kritis
  7: { stock: 14, min: 6, cost: 2800 }, // Terong
  8: { stock: 26, min: 8, cost: 2000 }, // Timun
  9: { stock: 16, min: 6, cost: 3500 }, // Kol
  10: { stock: 5, min: 10, cost: 2800 }, // Jagung — kritis
  11: { stock: 13, min: 6, cost: 2800 }, // Labu
  12: { stock: 9, min: 6, cost: 5000 }, // Buncis
  13: { stock: 40, min: 12, cost: 6000 }, // Apel
  14: { stock: 35, min: 12, cost: 3500 }, // Jeruk
  15: { stock: 50, min: 15, cost: 2000 }, // Pisang
  16: { stock: 20, min: 8, cost: 5000 }, // Mangga
  17: { stock: 15, min: 6, cost: 3500 }, // Semangka
  18: { stock: 8, min: 6, cost: 11000 }, // Anggur
  19: { stock: 7, min: 8, cost: 9000 }, // Strawberry — menipis
  20: { stock: 18, min: 6, cost: 4000 }, // Pepaya
  21: { stock: 25, min: 8, cost: 58000 }, // Beras
  22: { stock: 40, min: 12, cost: 12000 }, // Gula
  23: { stock: 33, min: 10, cost: 15500 }, // Minyak
  24: { stock: 28, min: 10, cost: 10000 }, // Tepung
  25: { stock: 15, min: 8, cost: 25000 }, // Telur
  26: { stock: 22, min: 8, cost: 9500 }, // Kecap
  27: { stock: 44, min: 12, cost: 2000 }, // Garam
  28: { stock: 120, min: 30, cost: 2800 }, // Mie
  29: { stock: 3, min: 5, cost: 18000 }, // Nugget — menipis
  30: { stock: 10, min: 5, cost: 15000 }, // Sosis
  31: { stock: 8, min: 5, cost: 21000 }, // Bakso
  32: { stock: 6, min: 4, cost: 25000 }, // Ikan Dori
  33: { stock: 1, min: 3, cost: 38000 }, // Udang — kritis
  34: { stock: 9, min: 4, cost: 16000 }, // Dimsum
};

function statusOf(stock: number, min: number): StockStatus {
  if (stock <= min) return 'kritis';
  if (stock <= min * 1.5) return 'menipis';
  return 'aman';
}

export const stockRows: StockRow[] = products.map((p) => {
  const s = STOCK_TABLE[p.id] ?? { stock: 10, min: 5, cost: Math.round(p.price * 0.75) };
  return { ...p, stock: s.stock, minStock: s.min, costPrice: s.cost, status: statusOf(s.stock, s.min) };
});

export function stockByCategory(category: CategoryKey | 'all'): StockRow[] {
  return category === 'all' ? stockRows : stockRows.filter((r) => r.category === category);
}

export function criticalCount(): number {
  return stockRows.filter((r) => r.status === 'kritis').length;
}

export function lowCount(): number {
  return stockRows.filter((r) => r.status === 'menipis').length;
}
