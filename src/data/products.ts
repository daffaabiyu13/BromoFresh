import type { CategoryKey, Product } from '@/types';

/**
 * Data produk contoh — diambil dari mockup Kasir.
 * Pada implementasi nyata, data ini akan di-fetch dari tabel `products` di
 * Supabase (lihat src/lib/queries.ts). Untuk sekarang dipakai sebagai seed
 * agar layar bisa langsung dijalankan tanpa koneksi backend.
 */

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  status: 'available' | 'restock';
  count: number;
}

export const categories: CategoryMeta[] = [
  { key: 'sayur', label: 'Sayur', status: 'available', count: 12 },
  { key: 'buah', label: 'Buah', status: 'available', count: 8 },
  { key: 'sembako', label: 'Sembako', status: 'available', count: 8 },
  { key: 'frozen', label: 'Frozen', status: 'restock', count: 6 },
];

export const products: Product[] = [
  // Sayur
  { id: 1, name: 'Bayam Segar', price: 3000, unit: 'ikat', category: 'sayur', emoji: '🥬', bg: '#E8F5E9' },
  { id: 2, name: 'Kangkung', price: 2500, unit: 'ikat', category: 'sayur', emoji: '🌿', bg: '#E8F5E9' },
  { id: 3, name: 'Sawi Hijau', price: 3000, unit: 'ikat', category: 'sayur', emoji: '🥦', bg: '#E8F5E9' },
  { id: 4, name: 'Brokoli', price: 8000, unit: 'pcs', category: 'sayur', emoji: '🥦', bg: '#D7F0DA' },
  { id: 5, name: 'Wortel', price: 5000, unit: '500g', category: 'sayur', emoji: '🥕', bg: '#FFF3E0' },
  { id: 6, name: 'Tomat Cherry', price: 8000, unit: '250g', category: 'sayur', emoji: '🍅', bg: '#FFEBEE' },
  { id: 7, name: 'Terong Ungu', price: 4000, unit: 'pcs', category: 'sayur', emoji: '🍆', bg: '#F3E5F5' },
  { id: 8, name: 'Timun', price: 3000, unit: 'pcs', category: 'sayur', emoji: '🥒', bg: '#E8F5E9' },
  { id: 9, name: 'Kol Putih', price: 5000, unit: 'pcs', category: 'sayur', emoji: '🥬', bg: '#E8F5E9' },
  { id: 10, name: 'Jagung Manis', price: 4000, unit: 'pcs', category: 'sayur', emoji: '🌽', bg: '#FFF8E1' },
  { id: 11, name: 'Labu Siam', price: 4000, unit: 'pcs', category: 'sayur', emoji: '🎃', bg: '#FFF3E0' },
  { id: 12, name: 'Buncis', price: 7000, unit: '250g', category: 'sayur', emoji: '🫘', bg: '#E8F5E9' },
  // Buah
  { id: 13, name: 'Apel Fuji', price: 8000, unit: 'pcs', category: 'buah', emoji: '🍎', bg: '#FFEBEE' },
  { id: 14, name: 'Jeruk Siam', price: 5000, unit: 'pcs', category: 'buah', emoji: '🍊', bg: '#FFF3E0' },
  { id: 15, name: 'Pisang Cavendish', price: 3000, unit: 'pcs', category: 'buah', emoji: '🍌', bg: '#FFF8E1' },
  { id: 16, name: 'Mangga Harum', price: 7000, unit: 'pcs', category: 'buah', emoji: '🥭', bg: '#FFF3E0' },
  { id: 17, name: 'Semangka', price: 5000, unit: '500g', category: 'buah', emoji: '🍉', bg: '#FFEBEE' },
  { id: 18, name: 'Anggur Hijau', price: 15000, unit: '500g', category: 'buah', emoji: '🍇', bg: '#F3E5F5' },
  { id: 19, name: 'Strawberry', price: 12000, unit: '250g', category: 'buah', emoji: '🍓', bg: '#FFEBEE' },
  { id: 20, name: 'Pepaya', price: 6000, unit: '500g', category: 'buah', emoji: '🍈', bg: '#FFF3E0' },
  // Sembako
  { id: 21, name: 'Beras Premium', price: 65000, unit: '5kg', category: 'sembako', emoji: '🌾', bg: '#FFF8E1' },
  { id: 22, name: 'Gula Pasir', price: 14000, unit: '1kg', category: 'sembako', emoji: '🍬', bg: '#FFF8E1' },
  { id: 23, name: 'Minyak Goreng', price: 18000, unit: '1 liter', category: 'sembako', emoji: '🫙', bg: '#FFF3E0' },
  { id: 24, name: 'Tepung Terigu', price: 12000, unit: '1kg', category: 'sembako', emoji: '🌾', bg: '#FFF8E1' },
  { id: 25, name: 'Telur Ayam', price: 28000, unit: '1kg', category: 'sembako', emoji: '🥚', bg: '#FFF8E1' },
  { id: 26, name: 'Kecap Manis', price: 12000, unit: 'botol', category: 'sembako', emoji: '🧴', bg: '#FBE9E7' },
  { id: 27, name: 'Garam Dapur', price: 3000, unit: '250g', category: 'sembako', emoji: '🧂', bg: '#E3F2FD' },
  { id: 28, name: 'Mie Instan', price: 3500, unit: 'bungkus', category: 'sembako', emoji: '🍜', bg: '#FFF8E1' },
  // Frozen
  { id: 29, name: 'Nugget Ayam', price: 22000, unit: '400g', category: 'frozen', emoji: '🍗', bg: '#FFF3E0' },
  { id: 30, name: 'Sosis Sapi', price: 18000, unit: '500g', category: 'frozen', emoji: '🌭', bg: '#FFEBEE' },
  { id: 31, name: 'Bakso Sapi', price: 25000, unit: '500g', category: 'frozen', emoji: '🍢', bg: '#FFEBEE' },
  { id: 32, name: 'Ikan Dori Beku', price: 30000, unit: '500g', category: 'frozen', emoji: '🐟', bg: '#E3F2FD' },
  { id: 33, name: 'Udang Beku', price: 45000, unit: '500g', category: 'frozen', emoji: '🦐', bg: '#FFEBEE' },
  { id: 34, name: 'Dimsum Beku', price: 20000, unit: 'pack', category: 'frozen', emoji: '🥟', bg: '#FFF8E1' },
];

export function productsByCategory(category: CategoryKey): Product[] {
  return products.filter((p) => p.category === category);
}
