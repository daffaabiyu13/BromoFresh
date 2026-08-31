import { create } from 'zustand';

export type PaperSize = '58' | '80';
export type ThemePref = 'terang' | 'gelap' | 'sistem';

export interface Settings {
  // Info Toko
  storeName: string;
  storeAddress: string;
  storePhone: string;
  // Pajak
  taxEnabled: boolean;
  taxPercent: number;
  // Metode Pembayaran
  payTunai: boolean;
  payQris: boolean;
  payTransfer: boolean;
  bankAccount: string;
  qrisName: string;
  // Printer Struk
  paperSize: PaperSize;
  bluetoothPrinter: boolean;
  // Notifikasi
  notifStokKritis: boolean;
  notifTargetHarian: boolean;
  // Tampilan
  theme: ThemePref;
}

const DEFAULTS: Settings = {
  storeName: 'Toko Sayuran',
  storeAddress: 'Jl. Pasar Baru No. 12, Malang',
  storePhone: '0812-3456-7890',
  taxEnabled: false,
  taxPercent: 11,
  payTunai: true,
  payQris: true,
  payTransfer: true,
  bankAccount: 'BCA 1234567890 a.n. Budi Santoso',
  qrisName: 'Toko Sayuran',
  paperSize: '80',
  bluetoothPrinter: false,
  notifStokKritis: true,
  notifTargetHarian: true,
  theme: 'sistem',
};

interface SettingsState extends Settings {
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULTS,
  update: (key, value) => set({ [key]: value } as Pick<Settings, typeof key>),
  reset: () => set({ ...DEFAULTS }),
}));
