import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { products as mockProducts } from '@/data/products';
import { stockRows as mockStockRows, type StockRow, type StockStatus } from '@/data/mockStock';
import type { CartItem, CategoryKey, PaymentMethod, Product } from '@/types';

/**
 * Lapisan akses data (React Query + Supabase).
 *
 * Setiap hook memakai Supabase bila kredensial sudah diisi (`isSupabaseConfigured`),
 * dan otomatis jatuh ke data contoh (mock) bila belum — sehingga aplikasi tetap
 * bisa dijalankan/didemokan tanpa backend, tanpa mengubah kode layar.
 */

/** Bentuk baris tabel `products` di Supabase. */
interface ProductRow {
  id: string;
  name: string;
  category_id: CategoryKey;
  unit: string;
  sell_price: number;
  emoji: string | null;
  bg: string | null;
  stock: number | null;
  min_stock: number | null;
}

function mapRowToProduct(row: ProductRow, index: number): Product {
  return {
    // id numerik surrogate untuk keperluan keranjang di sesi ini;
    // uuid menyimpan primary key asli untuk penulisan ke database.
    id: index + 1,
    uuid: row.id,
    name: row.name,
    price: Number(row.sell_price),
    unit: row.unit,
    category: row.category_id,
    emoji: row.emoji ?? '🛒',
    bg: row.bg ?? '#EBF6F0',
    stock: row.stock ?? undefined,
    minStock: row.min_stock ?? undefined,
  };
}

export const queryKeys = {
  products: ['products'] as const,
  stock: ['stock-products'] as const,
};

/** Hitung status stok dari jumlah & minimum. */
function stockStatusOf(stock: number, min: number): StockStatus {
  if (stock <= min) return 'kritis';
  if (stock <= min * 1.5) return 'menipis';
  return 'aman';
}

/** Jumlah produk aktif per kategori — untuk kartu kategori Kasir. */
export function deriveCategoryCounts(list: Product[]): Record<CategoryKey, number> {
  const counts = { sayur: 0, buah: 0, sembako: 0, frozen: 0 } as Record<CategoryKey, number>;
  for (const p of list) counts[p.category] += 1;
  return counts;
}

/** Daftar produk aktif. Supabase → mock fallback. */
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async (): Promise<Product[]> => {
      if (!isSupabaseConfigured) return mockProducts;
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, unit, sell_price, emoji, bg, stock, min_stock')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return (data as ProductRow[]).map(mapRowToProduct);
    },
    // Di mode demo, sajikan mock seketika tanpa status loading.
    initialData: isSupabaseConfigured ? undefined : mockProducts,
  });
}

export interface RecordTransactionInput {
  receiptNo: string;
  items: CartItem[];
  method: PaymentMethod;
  cashierId?: string;
  discount?: number;
}

/**
 * Simpan transaksi ke Supabase (header `transactions` + detail `transaction_items`).
 * Di mode demo (tanpa Supabase) menjadi no-op — riwayat sudah ditangani store lokal.
 */
export function useRecordTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiptNo, items, method, cashierId, discount = 0 }: RecordTransactionInput) => {
      if (!isSupabaseConfigured) return null;

      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
          receipt_no: receiptNo,
          cashier_id: cashierId ?? null,
          subtotal,
          discount,
          total: subtotal - discount,
          method,
          status: 'selesai',
        })
        .select('id')
        .single();
      if (txError) throw txError;

      const rows = items.map((i) => ({
        transaction_id: (tx as { id: string }).id,
        product_id: i.uuid ?? null,
        product_name: i.name,
        unit: i.unit,
        qty: i.qty,
        price: i.price,
        subtotal: i.price * i.qty,
      }));
      const { error: itemsError } = await supabase.from('transaction_items').insert(rows);
      if (itemsError) throw itemsError;

      return (tx as { id: string }).id;
    },
    onSuccess: () => {
      // Stok mungkin berubah setelah penjualan; segarkan daftar produk & stok.
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock });
    },
  });
}

/** Baris tabel `products` untuk Modul Stok (menyertakan HPP). */
interface StockProductRow extends ProductRow {
  cost_price: number;
}

function mapRowToStock(row: StockProductRow, index: number): StockRow {
  const stock = row.stock ?? 0;
  const minStock = row.min_stock ?? 0;
  return {
    id: index + 1,
    uuid: row.id,
    name: row.name,
    price: Number(row.sell_price),
    unit: row.unit,
    category: row.category_id,
    emoji: row.emoji ?? '📦',
    bg: row.bg ?? '#EBF6F0',
    stock,
    minStock,
    costPrice: Number(row.cost_price),
    status: stockStatusOf(stock, minStock),
  };
}

/** Daftar stok produk. Supabase → mock fallback. */
export function useStockProducts() {
  return useQuery({
    queryKey: queryKeys.stock,
    queryFn: async (): Promise<StockRow[]> => {
      if (!isSupabaseConfigured) return mockStockRows;
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, unit, sell_price, cost_price, emoji, bg, stock, min_stock')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return (data as StockProductRow[]).map(mapRowToStock);
    },
    initialData: isSupabaseConfigured ? undefined : mockStockRows,
  });
}

export interface RestockInput {
  id: number;
  uuid?: string;
  qty: number;
  currentStock: number;
}

/**
 * Restock produk. Memperbarui cache secara optimistik (langsung terlihat di UI
 * di mode demo maupun terhubung), dan bila terhubung Supabase: mencatat
 * `stock_entries` + memperbarui `products.stock`.
 */
export function useRestock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, qty, currentStock }: RestockInput) => {
      if (!isSupabaseConfigured || !uuid) return;
      const { error: entryError } = await supabase.from('stock_entries').insert({
        product_id: uuid,
        movement: 'masuk',
        qty,
        reason: 'Restock',
      });
      if (entryError) throw entryError;
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: currentStock + qty })
        .eq('id', uuid);
      if (updateError) throw updateError;
    },
    onMutate: async ({ id, qty }: RestockInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stock });
      const previous = queryClient.getQueryData<StockRow[]>(queryKeys.stock);
      queryClient.setQueryData<StockRow[]>(queryKeys.stock, (old: StockRow[] | undefined) =>
        (old ?? []).map((r: StockRow) =>
          r.id === id
            ? { ...r, stock: r.stock + qty, status: stockStatusOf(r.stock + qty, r.minStock) }
            : r,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.stock, context.previous);
    },
    onSettled: () => {
      if (isSupabaseConfigured) queryClient.invalidateQueries({ queryKey: queryKeys.stock });
    },
  });
}
