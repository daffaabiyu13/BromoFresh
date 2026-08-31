/** Tipe domain bersama untuk Sayuran POS. */

export type CategoryKey = 'sayur' | 'buah' | 'sembako' | 'frozen';

export type PaymentMethod = 'tunai' | 'qris' | 'transfer';

export type UserRole = 'owner' | 'manajer' | 'kasir' | 'karyawan';

export interface Product {
  id: number;
  /** Primary key (uuid) dari Supabase; tidak ada pada data contoh (mock). */
  uuid?: string;
  name: string;
  price: number;
  /** Satuan jual, mis. "ikat", "kg", "pcs". */
  unit: string;
  category: CategoryKey;
  emoji: string;
  /** Warna latar thumbnail produk. */
  bg: string;
  /** Stok tersisa (opsional untuk mockup). */
  stock?: number;
  /** Stok minimum untuk alert. */
  minStock?: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Transaction {
  id: string;
  time: string;
  cashier: string;
  category: string;
  items: number;
  subtotal: number;
  discount: number;
  total: number;
  method: PaymentMethod;
  status: 'Selesai' | 'Batal';
}

export interface StockAlert {
  emoji: string;
  name: string;
  remaining: string;
  min: string;
  level: 'critical' | 'warning';
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}
