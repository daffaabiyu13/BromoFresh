# 🥬 Sayuran POS

[![CI](https://github.com/daffaabiyu13/BromoFresh/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/daffaabiyu13/BromoFresh/actions/workflows/ci.yml)

Aplikasi **Point of Sale** untuk toko sayuran, dibangun dengan **React Native (Expo)** — berjalan di Android, iOS, dan Web dari satu codebase.

Repositori ini adalah hasil konversi mockup UI (Kasir, Dashboard, Laporan Penjualan) menjadi komponen React Native, dengan struktur project yang mengikuti [PRD Sayuran POS](#) dan tech stack yang direkomendasikan.

## ✨ Yang sudah tersedia

| Modul | Status | Layar |
| --- | --- | --- |
| **Kasir** | ✅ Fungsional | Grid produk per kategori, pencarian, keranjang (Zustand), metode bayar, struk, toast sukses. Transaksi tersimpan ke riwayat saat "Bayar Sekarang" |
| **Dashboard** | ✅ Fungsional | KPI cards, grafik penjualan (stacked bar), donut kategori, produk terlaris, alert stok, transaksi terbaru (menampilkan transaksi kasir terbaru) |
| **Laporan Penjualan** | ✅ Fungsional | Filter periode, KPI, tren penjualan, breakdown kategori, tabel transaksi + pencarian & paginasi |
| **Manajemen Stok** | ✅ Fungsional | Ringkasan stok, filter kategori & stok kritis, pencarian, tabel produk + status stok, tombol − / + tambah/kurang stok, serta tambah, edit, dan hapus produk custom (satuan & HPP) — Supabase / mock |
| **Laba Rugi** | ✅ Fungsional | Filter periode, KPI, laporan L/R (pendapatan → HPP → laba kotor → biaya operasional → laba bersih), tren laba, margin per kategori, input biaya operasional (Zustand). Khusus Owner |
| **Audit** | ✅ Fungsional | Tab Log Aktivitas, Opname Stok (selisih & nilai kerugian), Rekonsiliasi Kas. Khusus Owner & Manajer |
| **Karyawan** | ✅ Fungsional | Daftar karyawan (role, kontak, status) dari tabel `profiles`, tab performa kasir. Khusus Owner & Manajer |
| **Pengaturan** | ✅ Fungsional | Info toko, pajak (PPN), metode pembayaran, printer struk, notifikasi, tema (Zustand). Khusus Owner |
| **Auth** | ✅ Login (mode demo / Supabase) | Guard rute otomatis |

> Selama kredensial Supabase belum diisi, aplikasi berjalan memakai **data contoh (mock)** sehingga bisa langsung didemokan tanpa backend.

## 🧱 Tech Stack

- **Expo (React Native)** — cross-platform iOS / Android / Web
- **Expo Router** — file-based routing (folder `app/`)
- **Zustand** — state lokal (keranjang kasir, sesi auth)
- **Supabase** — PostgreSQL, Auth, RLS (skema di `supabase/schema.sql`)
- **@tanstack/react-query** — cache data server (disiapkan di root layout)
- **react-native-svg** — grafik donut

## 📁 Struktur Folder

```
BromoFresh/
├── app/                        # Rute Expo Router
│   ├── _layout.tsx             # Root: provider + guard auth
│   ├── index.tsx               # Redirect ke dashboard
│   ├── (auth)/
│   │   └── login.tsx           # Halaman login
│   └── (app)/
│       ├── _layout.tsx         # Stack modul utama
│       ├── dashboard.tsx       # Modul Dashboard
│       ├── kasir.tsx           # Modul Kasir
│       ├── laporan.tsx         # Modul Laporan Penjualan
│       ├── stok.tsx            # Modul Manajemen Stok
│       ├── labarugi.tsx        # Modul Laba Rugi
│       ├── audit.tsx           # Modul Audit
│       ├── karyawan.tsx        # Modul Karyawan
│       └── pengaturan.tsx      # Modul Pengaturan
├── src/
│   ├── components/             # Komponen UI bersama
│   │   ├── charts/             # StackedBarChart, DonutChart
│   │   ├── AppShell.tsx        # Top bar + sidebar
│   │   ├── Sidebar.tsx  Card.tsx  Brand.tsx  UserPill.tsx  NotifButton.tsx
│   ├── constants/theme.ts      # Design tokens (dari mockup)
│   ├── data/                   # Seed & mock data (produk, dashboard, laporan)
│   ├── lib/supabase.ts         # Client Supabase
│   ├── lib/queries.ts          # React Query hooks (Supabase ↔ mock fallback)
│   ├── store/                  # Zustand stores (cart, auth, transaksi)
│   ├── types/index.ts          # Tipe domain
│   └── utils/format.ts         # Format Rupiah, tanggal, no. struk
├── supabase/schema.sql         # Skema database + RLS
├── app.json  babel.config.js  tsconfig.json  package.json
└── .env.example
```

## 🚀 Menjalankan Project

```bash
# 1. Install dependency
npm install

# 2. (Opsional) hubungkan Supabase
cp .env.example .env
#   lalu isi EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Jalankan
npm run web       # buka di browser
npm run android   # Android (emulator / Expo Go)
npm run ios       # iOS (butuh macOS)
```

Cek tipe TypeScript:

```bash
npm run typecheck
```

## 🔌 Menghubungkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Jalankan `supabase/schema.sql` di **SQL Editor** (tabel + RLS + trigger auto-profil).
3. Jalankan `supabase/seed.sql` untuk mengisi 34 produk contoh ke tabel `products`.
4. Salin **Project URL** dan **anon public key** dari Project Settings → API ke `.env`.
5. Restart Expo. Login kini memakai Supabase Auth, dan **Kasir membaca produk
   dari database serta menyimpan transaksi** (`transactions` + `transaction_items`).

### Menambah pengguna & role

Setiap user baru otomatis mendapat baris `profiles` (via trigger di `schema.sql`),
dan aplikasi membaca role dari `profiles` sebagai **satu sumber kebenaran**
(fallback ke `user_metadata` bila profil belum ada).

1. **Authentication → Users → Add user** (email + password, centang *Auto Confirm*).
2. Set role di **SQL Editor** (cukup satu tempat):
   ```sql
   update profiles set role = 'owner', name = 'Budi Santoso'
   where id = (select id from auth.users where email = 'owner@toko.com');
   ```
   Role valid: `owner`, `manajer`, `kasir`, `karyawan`.
3. **Logout lalu login lagi** di aplikasi agar role terbaru terpakai.

### Lapisan data (`src/lib/queries.ts`)

Data server diakses lewat React Query. Setiap hook otomatis memakai Supabase
bila `.env` sudah diisi, dan **jatuh ke data contoh (mock)** bila belum — jadi
aplikasi tetap jalan tanpa backend, tanpa mengubah kode layar.

| Hook | Sumber saat terhubung | Fallback |
| --- | --- | --- |
| `useProducts()` | `SELECT` dari `products` | `src/data/products.ts` |
| `useStockProducts()` | `SELECT` dari `products` (+ HPP, stok) | `src/data/mockStock.ts` |
| `useTransactions()` | `SELECT` `transactions` (+ nama kasir & jumlah item) | array kosong (pakai riwayat lokal) |
| `useEmployees()` | `SELECT` dari `profiles` | `src/data/mockEmployees.ts` |
| `useRecordTransaction()` | `INSERT` ke `transactions` + `transaction_items` | no-op (riwayat lokal Zustand) |
| `useStockAdjust()` | `INSERT` `stock_entries` (masuk/keluar) + `UPDATE products.stock` | update cache optimistik saja |
| `useAddProduct()` | `INSERT` produk baru (satuan & HPP custom) | sisip ke cache |
| `useUpdateProduct()` | `UPDATE products` (edit detail produk) | perbarui cache |
| `useDeleteProduct()` | `UPDATE active=false` (arsip, jaga riwayat) | hapus dari cache |

Layar yang sudah memakai lapisan ini: **Kasir** (produk + simpan transaksi +
jumlah produk per kategori dinamis), **Stok** (daftar stok + tambah/kurang − / +), serta
**Dashboard** & **Laporan** (riwayat transaksi).

> Layar Laba Rugi dan Audit masih memakai data contoh dan akan dimigrasikan
> pada PR berikutnya.

## ▲ Deploy ke Vercel (Web)

Web build (`expo export --platform web` → `dist/`) di-host sebagai situs statis.
File `vercel.json` sudah mengatur build command, output, dan rewrite SPA.

1. [vercel.com](https://vercel.com) → **Add New… → Project** → pilih repo ini.
2. Framework Preset **Other** (build & output diambil dari `vercel.json`).
3. **Environment Variables** (Production & Preview) — wajib diisi sebelum deploy:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. **Production Branch**: set ke `develop` (atau rilis dulu ke `main`).
5. **Deploy**. Push berikutnya ke branch produksi auto-deploy.
6. Setelah live: tambahkan domain Vercel ke Supabase → Authentication → **URL
   Configuration** (Site URL / Redirect URLs) agar login web mulus.

> Prefix `EXPO_PUBLIC_` di-*inline* saat build — ubah env var berarti perlu **Redeploy**.

## 🎨 Desain

Semua warna, radius, dan tipografi diambil dari mockup dan disatukan di
`src/constants/theme.ts` agar konsisten dengan desain asli (tema hijau "Toko
Sayuran"). Layar responsif: sidebar muncul pada lebar ≥ 900px (web/tablet),
dan panel kasir menumpuk vertikal pada layar sempit.

---

_Dihasilkan dari PRD & mockup Sayuran POS · Fase 1 (MVP) scaffolding._
