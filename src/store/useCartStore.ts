import { create } from 'zustand';
import type { CartItem, PaymentMethod, Product } from '@/types';

interface CartState {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerName: string;
  queueNumber: string;
  receiptNumber: number;
  txCount: number;

  // actions
  addItem: (product: Product) => void;
  changeQty: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCustomerName: (name: string) => void;
  setQueueNumber: (queue: string) => void;
  clear: () => void;
  placeOrder: () => void;

  // selectors
  subtotal: () => number;
  discount: () => number;
  total: () => number;
  qtyOf: (id: number) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  paymentMethod: 'tunai',
  customerName: '',
  queueNumber: 'A-01',
  receiptNumber: 1,
  txCount: 0,

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { ...product, qty: 1 }] };
    }),

  changeQty: (id, delta) =>
    set((state) => {
      const next = state.items
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
      return { items: next };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCustomerName: (name) => set({ customerName: name }),
  setQueueNumber: (queue) => set({ queueNumber: queue }),

  clear: () => set({ items: [], customerName: '' }),

  placeOrder: () =>
    set((state) => ({
      items: [],
      customerName: '',
      receiptNumber: state.receiptNumber + 1,
      txCount: state.txCount + 1,
    })),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
  discount: () => 0, // placeholder — logika diskon menyusul (lihat PRD §Kasir)
  total: () => get().subtotal() - get().discount(),
  qtyOf: (id) => get().items.find((i) => i.id === id)?.qty ?? 0,
}));
