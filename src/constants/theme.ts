/**
 * Design tokens untuk Sayuran POS.
 * Diambil langsung dari mockup UI (Kasir, Dashboard, Laporan) agar tampilan
 * React Native konsisten dengan desain aslinya.
 */

export const palette = {
  cream: '#F4EFE1',
  white: '#FFFFFF',
  g900: '#1A4731',
  g700: '#256044',
  g500: '#3D8B66',
  g100: '#D4EBE0',
  g50: '#EBF6F0',
  coral: '#E85C4A',
  coralLight: '#FDEAE8',
  amber: '#E8A020',
  amberLight: '#FEF3DC',
  sky: '#3A7BD5',
  skyLight: '#E8F0FB',
  text: '#1A1A1A',
  muted: '#7A8B84',
  border: '#E5DFD0',
  border2: '#ECE8DC',
  // background di luar app shell (mockup memakai hijau keabuan)
  backdrop: '#8C9F8A',
} as const;

/** Warna per kategori produk — dipakai di grafik & badge. */
export const categoryColors = {
  sayur: palette.g900,
  buah: palette.g500,
  sembako: palette.amber,
  frozen: palette.sky,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 22,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const fonts = {
  head: 'PlusJakartaSans, System',
  body: 'Inter, System',
} as const;

export type Palette = typeof palette;
