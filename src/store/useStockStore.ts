import { create } from 'zustand';
import { stockRows, type StockRow, type StockStatus } from '@/data/mockStock';

function statusOf(stock: number, min: number): StockStatus {
  if (stock <= min) return 'kritis';
  if (stock <= min * 1.5) return 'menipis';
  return 'aman';
}

interface StockState {
  rows: StockRow[];
  /** Tambah stok (penerimaan barang / restock). */
  restock: (id: number, qty: number) => void;
  /** Set stok absolut (koreksi / opname). */
  adjust: (id: number, newStock: number) => void;
}

export const useStockStore = create<StockState>((set) => ({
  rows: stockRows,

  restock: (id, qty) =>
    set((state) => ({
      rows: state.rows.map((r) =>
        r.id === id
          ? { ...r, stock: r.stock + qty, status: statusOf(r.stock + qty, r.minStock) }
          : r,
      ),
    })),

  adjust: (id, newStock) =>
    set((state) => ({
      rows: state.rows.map((r) =>
        r.id === id ? { ...r, stock: newStock, status: statusOf(newStock, r.minStock) } : r,
      ),
    })),
}));
