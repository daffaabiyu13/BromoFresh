import type { Employee } from '@/types';

/** Data contoh Modul Karyawan (PRD §11). */

export const employees: Employee[] = [
  { id: 'u1', name: 'Budi Santoso', role: 'owner', avatar: '👨', phone: '0812-1111-2222', joinedAt: '2023-01-10', active: true },
  { id: 'u2', name: 'Roni Hidayat', role: 'manajer', avatar: '🧑', phone: '0813-3333-4444', joinedAt: '2023-03-22', active: true },
  { id: 'u3', name: 'Siti Rahayu', role: 'kasir', avatar: '👩', phone: '0857-5555-6666', joinedAt: '2023-06-01', active: true },
  { id: 'u4', name: 'Rina Trisnawati', role: 'kasir', avatar: '👩', phone: '0878-7777-8888', joinedAt: '2024-02-14', active: true },
  { id: 'u5', name: 'Agus Pranata', role: 'kasir', avatar: '🧑', phone: '0821-9999-0000', joinedAt: '2024-05-30', active: true },
  { id: 'u6', name: 'Dewi Maharani', role: 'karyawan', avatar: '👩', phone: '0838-1212-3434', joinedAt: '2024-08-05', active: false },
];

export interface CashierPerformance {
  name: string;
  avatar: string;
  transactions: number;
  revenue: number;
  avgTransaction: number;
  voids: number;
}

/** Performa kasir bulan ini (data contoh). */
export const cashierPerformance: CashierPerformance[] = [
  { name: 'Siti Rahayu', avatar: '👩', transactions: 412, revenue: 26_800_000, avgTransaction: 65_000, voids: 3 },
  { name: 'Rina Trisnawati', avatar: '👩', transactions: 388, revenue: 24_100_000, avgTransaction: 62_100, voids: 1 },
  { name: 'Agus Pranata', avatar: '🧑', transactions: 356, revenue: 21_500_000, avgTransaction: 60_400, voids: 5 },
];

export const roleLabel: Record<Employee['role'], string> = {
  owner: 'Owner',
  manajer: 'Manajer',
  kasir: 'Kasir',
  karyawan: 'Karyawan',
};
