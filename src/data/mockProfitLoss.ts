import type { ReportPeriod } from '@/data/mockReports';
import { categoryColors } from '@/constants/theme';

/**
 * Data contoh Modul Laba Rugi (PRD §09).
 * Pendapatan & HPP per periode; tren laba bersih bulanan; margin per kategori.
 * Nantinya diturunkan dari transaksi + HPP produk di Supabase.
 */

export interface CategoryMargin {
  label: string;
  color: string;
  revenue: number;
  cogs: number;
}

export interface ProfitLossPeriod {
  revenue: number; // pendapatan bersih (setelah diskon)
  cogs: number; // HPP barang terjual
  categoryMargin: CategoryMargin[];
  sub: string;
  range: string;
}

export const profitLossData: Record<ReportPeriod, ProfitLossPeriod> = {
  harian: {
    revenue: 2_850_000,
    cogs: 2_138_000,
    categoryMargin: [
      { label: 'Sayur', color: categoryColors.sayur, revenue: 1_197_000, cogs: 862_000 },
      { label: 'Buah', color: categoryColors.buah, revenue: 798_000, cogs: 590_000 },
      { label: 'Sembako', color: categoryColors.sembako, revenue: 570_000, cogs: 496_000 },
      { label: 'Frozen', color: categoryColors.frozen, revenue: 285_000, cogs: 190_000 },
    ],
    sub: 'Sabtu, 30 Agustus 2026',
    range: 'Sabtu, 30 Agustus 2026',
  },
  mingguan: {
    revenue: 19_700_000,
    cogs: 14_800_000,
    categoryMargin: [
      { label: 'Sayur', color: categoryColors.sayur, revenue: 8_270_000, cogs: 6_100_000 },
      { label: 'Buah', color: categoryColors.buah, revenue: 5_520_000, cogs: 4_150_000 },
      { label: 'Sembako', color: categoryColors.sembako, revenue: 3_940_000, cogs: 3_260_000 },
      { label: 'Frozen', color: categoryColors.frozen, revenue: 1_970_000, cogs: 1_290_000 },
    ],
    sub: '24 – 30 Agustus 2026',
    range: '24 – 30 Agustus 2026',
  },
  bulanan: {
    revenue: 75_800_000,
    cogs: 56_900_000,
    categoryMargin: [
      { label: 'Sayur', color: categoryColors.sayur, revenue: 31_800_000, cogs: 23_500_000 },
      { label: 'Buah', color: categoryColors.buah, revenue: 21_200_000, cogs: 16_000_000 },
      { label: 'Sembako', color: categoryColors.sembako, revenue: 15_200_000, cogs: 12_600_000 },
      { label: 'Frozen', color: categoryColors.frozen, revenue: 7_600_000, cogs: 4_800_000 },
    ],
    sub: '1 – 31 Agustus 2026',
    range: '1 – 31 Agustus 2026',
  },
  tahunan: {
    revenue: 617_000_000,
    cogs: 462_750_000,
    categoryMargin: [
      { label: 'Sayur', color: categoryColors.sayur, revenue: 259_000_000, cogs: 191_000_000 },
      { label: 'Buah', color: categoryColors.buah, revenue: 172_800_000, cogs: 130_000_000 },
      { label: 'Sembako', color: categoryColors.sembako, revenue: 123_400_000, cogs: 102_500_000 },
      { label: 'Frozen', color: categoryColors.frozen, revenue: 61_800_000, cogs: 39_250_000 },
    ],
    sub: 'Januari – Agustus 2026',
    range: 'Januari – Agustus 2026',
  },
};

/** Tren laba bersih per bulan (nilai dalam ribuan rupiah) untuk grafik. */
export const netProfitTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt'],
  values: [9800, 8200, 11500, 10800, 12400, 14200, 13100, 13800],
};
