import { palette } from '@/constants/theme';

/** Data contoh Modul Audit (PRD §10): activity log, opname stok, rekonsiliasi kas. */

export type AuditActionType =
  | 'login'
  | 'logout'
  | 'void'
  | 'refund'
  | 'price_change'
  | 'stock_adjust'
  | 'setting_change';

export interface ActivityLog {
  id: string;
  time: string;
  date: string;
  user: string;
  type: AuditActionType;
  detail: string;
}

/** Meta tampilan per jenis aksi (label + warna badge). */
export const ACTION_META: Record<AuditActionType, { label: string; bg: string; fg: string }> = {
  login: { label: 'Login', bg: palette.g50, fg: palette.g700 },
  logout: { label: 'Logout', bg: palette.border2, fg: palette.muted },
  void: { label: 'Void', bg: palette.coralLight, fg: palette.coral },
  refund: { label: 'Refund', bg: palette.coralLight, fg: palette.coral },
  price_change: { label: 'Ubah Harga', bg: palette.amberLight, fg: palette.amber },
  stock_adjust: { label: 'Koreksi Stok', bg: palette.amberLight, fg: palette.amber },
  setting_change: { label: 'Pengaturan', bg: palette.skyLight, fg: palette.sky },
};

export const activityLogs: ActivityLog[] = [
  { id: 'a1', time: '10:24', date: '30 Agt', user: 'Siti R.', type: 'login', detail: 'Login dari Tablet Kasir 1 (192.168.1.12)' },
  { id: 'a2', time: '10:41', date: '30 Agt', user: 'Budi S.', type: 'void', detail: 'Void #00042 (Rp 87.000) — disetujui oleh Budi S. (Owner)' },
  { id: 'a3', time: '11:03', date: '30 Agt', user: 'Budi S.', type: 'price_change', detail: 'Apel Fuji: Rp 8.000 → Rp 8.500 /pcs' },
  { id: 'a4', time: '11:18', date: '30 Agt', user: 'Roni', type: 'stock_adjust', detail: 'Tomat Cherry −3 pack (alasan: rusak/busuk)' },
  { id: 'a5', time: '12:30', date: '30 Agt', user: 'Roni', type: 'refund', detail: 'Refund #00039 (Rp 25.000) — barang cacat' },
  { id: 'a6', time: '13:05', date: '30 Agt', user: 'Budi S.', type: 'setting_change', detail: 'PPN dinonaktifkan (0%)' },
  { id: 'a7', time: '17:02', date: '30 Agt', user: 'Siti R.', type: 'logout', detail: 'Logout dari Tablet Kasir 1' },
];

export interface OpnameRow {
  name: string;
  emoji: string;
  systemStock: number;
  physicalStock: number;
  unit: string;
  costPrice: number;
}

/** Sesi opname contoh — selisih = fisik − sistem. */
export const opnameSession: OpnameRow[] = [
  { name: 'Bayam Segar', emoji: '🥬', systemStock: 24, physicalStock: 24, unit: 'ikat', costPrice: 2000 },
  { name: 'Tomat Cherry', emoji: '🍅', systemStock: 5, physicalStock: 2, unit: 'pack', costPrice: 6000 },
  { name: 'Apel Fuji', emoji: '🍎', systemStock: 40, physicalStock: 39, unit: 'pcs', costPrice: 6000 },
  { name: 'Udang Beku', emoji: '🦐', systemStock: 3, physicalStock: 1, unit: 'pack', costPrice: 38000 },
  { name: 'Telur Ayam', emoji: '🥚', systemStock: 15, physicalStock: 15, unit: 'kg', costPrice: 25000 },
];

export interface CashReconRow {
  method: string;
  expected: number;
  counted: number;
}

/** Rekonsiliasi kas per metode (tunai punya selisih fisik). */
export const cashRecon: CashReconRow[] = [
  { method: 'Tunai', expected: 1_450_000, counted: 1_435_000 },
  { method: 'QRIS', expected: 980_000, counted: 980_000 },
  { method: 'Transfer', expected: 420_000, counted: 420_000 },
];
