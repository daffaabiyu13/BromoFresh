import { create } from 'zustand';

export interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number;
}

/** Biaya operasional contoh (bulanan) untuk kalkulasi laba bersih. */
const SEED: Expense[] = [
  { id: 'e1', label: 'Gaji Karyawan', category: 'Gaji', amount: 8_500_000 },
  { id: 'e2', label: 'Sewa Toko', category: 'Sewa', amount: 3_000_000 },
  { id: 'e3', label: 'Listrik & Air', category: 'Utilitas', amount: 1_200_000 },
  { id: 'e4', label: 'Internet', category: 'Utilitas', amount: 400_000 },
  { id: 'e5', label: 'Transport & Lain-lain', category: 'Lain-lain', amount: 900_000 },
];

interface ExpenseState {
  expenses: Expense[];
  addExpense: (label: string, amount: number, category?: string) => void;
  removeExpense: (id: string) => void;
  total: () => number;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: SEED,

  addExpense: (label, amount, category = 'Lain-lain') =>
    set((state) => ({
      expenses: [
        ...state.expenses,
        { id: `e${Date.now()}`, label: label.trim() || 'Biaya', category, amount },
      ],
    })),

  removeExpense: (id) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

  total: () => get().expenses.reduce((sum, e) => sum + e.amount, 0),
}));
