import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { products as mockProducts } from '@/data/products';
import { stockRows as mockStockRows, type StockRow, type StockStatus } from '@/data/mockStock';
import { employees as mockEmployees } from '@/data/mockEmployees';
import type { CartItem, CategoryKey, Employee, PaymentMethod, Product, Transaction, UserRole } from '@/types';

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
  transactions: ['transactions'] as const,
  employees: ['employees'] as const,
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
      // Stok & riwayat mungkin berubah setelah penjualan; segarkan.
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
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

export interface StockAdjustInput {
  id: number;
  uuid?: string;
  /** Perubahan stok: positif = tambah, negatif = kurangi. */
  delta: number;
  currentStock: number;
}

/**
 * Sesuaikan stok produk sebanyak `delta` (boleh negatif). Stok tidak pernah
 * turun di bawah 0. Cache diperbarui optimistik (langsung terlihat di mode demo
 * maupun terhubung); bila terhubung Supabase juga mencatat `stock_entries`
 * (masuk/keluar) + memperbarui `products.stock`.
 */
export function useStockAdjust() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, delta, currentStock }: StockAdjustInput) => {
      if (!isSupabaseConfigured || !uuid) return;
      const nextStock = Math.max(0, currentStock + delta);
      const applied = nextStock - currentStock; // delta efektif setelah dibatasi ≥ 0
      if (applied !== 0) {
        const { error: entryError } = await supabase.from('stock_entries').insert({
          product_id: uuid,
          movement: applied > 0 ? 'masuk' : 'keluar',
          qty: Math.abs(applied),
          reason: 'Penyesuaian manual',
        });
        if (entryError) throw entryError;
      }
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: nextStock })
        .eq('id', uuid);
      if (updateError) throw updateError;
    },
    onMutate: async ({ id, delta }: StockAdjustInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stock });
      const previous = queryClient.getQueryData<StockRow[]>(queryKeys.stock);
      queryClient.setQueryData<StockRow[]>(queryKeys.stock, (old: StockRow[] | undefined) =>
        (old ?? []).map((r: StockRow) => {
          if (r.id !== id) return r;
          const nextStock = Math.max(0, r.stock + delta);
          return { ...r, stock: nextStock, status: stockStatusOf(nextStock, r.minStock) };
        }),
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

/** Baris tabel `transactions` (dengan nama kasir & jumlah item ter-embed). */
interface TransactionRow {
  receipt_no: string;
  created_at: string;
  subtotal: number;
  discount: number;
  total: number;
  method: PaymentMethod;
  status: 'selesai' | 'batal';
  profiles: { name: string } | null;
  transaction_items: { count: number }[];
}

function mapRowToTransaction(row: TransactionRow): Transaction {
  const d = new Date(row.created_at);
  return {
    id: row.receipt_no,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    cashier: row.profiles?.name ?? '—',
    category: '—', // kategori tidak disimpan di header transaksi
    items: row.transaction_items?.[0]?.count ?? 0,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total: Number(row.total),
    method: row.method,
    status: row.status === 'batal' ? 'Batal' : 'Selesai',
  };
}

/**
 * Riwayat transaksi dari Supabase (terbaru dulu). Bila belum terhubung,
 * mengembalikan array kosong — layar menggabungkannya dengan riwayat lokal
 * (Zustand) + data contoh, sehingga demo tetap tampil.
 */
export function useTransactions(limit = 50) {
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: async (): Promise<Transaction[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select(
          'receipt_no, created_at, subtotal, discount, total, method, status, profiles(name), transaction_items(count)',
        )
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as unknown as TransactionRow[]).map(mapRowToTransaction);
    },
    initialData: isSupabaseConfigured ? undefined : [],
  });
}

/** Baris tabel `profiles` di Supabase. */
interface ProfileRow {
  id: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  phone: string | null;
  active: boolean;
  joined_at: string;
}

function mapRowToEmployee(row: ProfileRow): Employee {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    avatar: row.avatar ?? '👤',
    phone: row.phone ?? '-',
    joinedAt: row.joined_at,
    active: row.active,
  };
}

/** Daftar karyawan (tabel `profiles`). Supabase → mock fallback. */
export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: async (): Promise<Employee[]> => {
      if (!isSupabaseConfigured) return mockEmployees;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, avatar, phone, active, joined_at')
        .order('joined_at');
      if (error) throw error;
      return (data as ProfileRow[]).map(mapRowToEmployee);
    },
    initialData: isSupabaseConfigured ? undefined : mockEmployees,
  });
}

// ── CRUD PRODUK (Master Produk, PRD §08) ────────────────────────────────────

export interface AddProductInput {
  name: string;
  category: CategoryKey;
  unit: string;
  sellPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  emoji?: string;
}

const DEFAULT_PRODUCT_BG = '#EBF6F0';

/**
 * Tambah produk baru. Bila terhubung Supabase: INSERT ke `products` lalu
 * segarkan daftar. Di mode demo: sisipkan ke cache React Query (produk & stok)
 * sehingga langsung tampil tanpa backend.
 */
export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddProductInput): Promise<{ id: number; uuid?: string }> => {
      const surrogateId = Date.now();
      if (!isSupabaseConfigured) return { id: surrogateId };
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: input.name,
          category_id: input.category,
          unit: input.unit,
          sell_price: input.sellPrice,
          cost_price: input.costPrice,
          stock: input.stock,
          min_stock: input.minStock,
          emoji: input.emoji ?? '📦',
          bg: DEFAULT_PRODUCT_BG,
          active: true,
        })
        .select('id')
        .single();
      if (error) throw error;
      return { id: surrogateId, uuid: (data as { id: string }).id };
    },
    onSuccess: ({ id, uuid }, input) => {
      if (isSupabaseConfigured) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products });
        queryClient.invalidateQueries({ queryKey: queryKeys.stock });
        return;
      }
      // Mode demo: sisipkan ke kedua cache secara langsung.
      const product: Product = {
        id,
        uuid,
        name: input.name,
        price: input.sellPrice,
        unit: input.unit,
        category: input.category,
        emoji: input.emoji ?? '📦',
        bg: DEFAULT_PRODUCT_BG,
        stock: input.stock,
        minStock: input.minStock,
      };
      const stockRow: StockRow = {
        ...product,
        stock: input.stock,
        minStock: input.minStock,
        costPrice: input.costPrice,
        status: stockStatusOf(input.stock, input.minStock),
      };
      queryClient.setQueryData<Product[]>(queryKeys.products, (old: Product[] | undefined) => [
        ...(old ?? []),
        product,
      ]);
      queryClient.setQueryData<StockRow[]>(queryKeys.stock, (old: StockRow[] | undefined) => [
        ...(old ?? []),
        stockRow,
      ]);
    },
  });
}

export interface DeleteProductInput {
  id: number;
  uuid?: string;
}

/**
 * Hapus produk. Untuk menjaga riwayat transaksi (PRD §08), produk yang
 * terhubung Supabase di-arsipkan (`active=false`), bukan dihapus permanen —
 * efeknya hilang dari daftar & kasir. Di mode demo: dihapus dari cache.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid }: DeleteProductInput) => {
      if (!isSupabaseConfigured || !uuid) return;
      const { error } = await supabase.from('products').update({ active: false }).eq('id', uuid);
      if (error) throw error;
    },
    onMutate: async ({ id }: DeleteProductInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stock });
      const prevStock = queryClient.getQueryData<StockRow[]>(queryKeys.stock);
      const prevProducts = queryClient.getQueryData<Product[]>(queryKeys.products);
      queryClient.setQueryData<StockRow[]>(queryKeys.stock, (old: StockRow[] | undefined) =>
        (old ?? []).filter((r: StockRow) => r.id !== id),
      );
      queryClient.setQueryData<Product[]>(queryKeys.products, (old: Product[] | undefined) =>
        (old ?? []).filter((p: Product) => p.id !== id),
      );
      return { prevStock, prevProducts };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevStock) queryClient.setQueryData(queryKeys.stock, context.prevStock);
      if (context?.prevProducts) queryClient.setQueryData(queryKeys.products, context.prevProducts);
    },
    onSettled: () => {
      if (isSupabaseConfigured) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products });
        queryClient.invalidateQueries({ queryKey: queryKeys.stock });
      }
    },
  });
}

export interface UpdateProductInput {
  id: number;
  uuid?: string;
  name: string;
  category: CategoryKey;
  unit: string;
  sellPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  emoji?: string;
}

/**
 * Ubah detail produk. Bila terhubung Supabase: `UPDATE products`. Di mode demo:
 * perbarui cache produk & stok (status stok dihitung ulang).
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, ...i }: UpdateProductInput) => {
      if (!isSupabaseConfigured || !uuid) return;
      const { error } = await supabase
        .from('products')
        .update({
          name: i.name,
          category_id: i.category,
          unit: i.unit,
          sell_price: i.sellPrice,
          cost_price: i.costPrice,
          stock: i.stock,
          min_stock: i.minStock,
          emoji: i.emoji ?? '📦',
        })
        .eq('id', uuid);
      if (error) throw error;
    },
    onSuccess: (_data, input) => {
      if (isSupabaseConfigured) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products });
        queryClient.invalidateQueries({ queryKey: queryKeys.stock });
        return;
      }
      queryClient.setQueryData<Product[]>(queryKeys.products, (old: Product[] | undefined) =>
        (old ?? []).map((p: Product) =>
          p.id === input.id
            ? {
                ...p,
                name: input.name,
                price: input.sellPrice,
                unit: input.unit,
                category: input.category,
                emoji: input.emoji ?? p.emoji,
                stock: input.stock,
                minStock: input.minStock,
              }
            : p,
        ),
      );
      queryClient.setQueryData<StockRow[]>(queryKeys.stock, (old: StockRow[] | undefined) =>
        (old ?? []).map((r: StockRow) =>
          r.id === input.id
            ? {
                ...r,
                name: input.name,
                price: input.sellPrice,
                unit: input.unit,
                category: input.category,
                emoji: input.emoji ?? r.emoji,
                costPrice: input.costPrice,
                stock: input.stock,
                minStock: input.minStock,
                status: stockStatusOf(input.stock, input.minStock),
              }
            : r,
        ),
      );
    },
  });
}
