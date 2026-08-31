import { create } from 'zustand';
import type { CartItem, PaymentMethod, Transaction } from '@/types';
import { formatReceiptNumber } from '@/utils/format';

const CATEGORY_LABEL: Record<string, string> = {
  sayur: 'Sayur',
  buah: 'Buah',
  sembako: 'Sembako',
  frozen: 'Frozen Food',
};

interface RecordArgs {
  receiptNumber: number;
  items: CartItem[];
  method: PaymentMethod;
  cashier: string;
  discount?: number;
}

interface TransactionState {
  /** Transaksi yang tercatat dari kasir, terbaru di depan. */
  transactions: Transaction[];
  record: (args: RecordArgs) => Transaction;
  clear: () => void;
}

/** Waktu sekarang dalam format HH:MM. */
function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Kategori dominan keranjang; "Campur" bila lebih dari satu kategori. */
function dominantCategory(items: CartItem[]): string {
  const cats = new Set(items.map((i) => i.category));
  if (cats.size === 1) return CATEGORY_LABEL[items[0].category] ?? items[0].category;
  return 'Campur';
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],

  record: ({ receiptNumber, items, method, cashier, discount = 0 }) => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tx: Transaction = {
      id: formatReceiptNumber(receiptNumber),
      time: nowHHMM(),
      cashier,
      category: dominantCategory(items),
      items: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal,
      discount,
      total: subtotal - discount,
      method,
      status: 'Selesai',
    };
    set((state) => ({ transactions: [tx, ...state.transactions] }));
    return tx;
  },

  clear: () => set({ transactions: [] }),
}));
