# 🥬 Sayuran POS

Aplikasi **Point of Sale** untuk toko sayuran, dibangun dengan **React Native (Expo)** — berjalan di Android, iOS, dan Web dari satu codebase.

Repositori ini adalah hasil konversi mockup UI (Kasir, Dashboard, Laporan Penjualan) menjadi komponen React Native, dengan struktur project yang mengikuti [PRD Sayuran POS](#) dan tech stack yang direkomendasikan.

## ✨ Yang sudah tersedia

| Modul | Status | Layar |
| --- | --- | --- |
| **Kasir** | ✅ Fungsional | Grid produk per kategori, pencarian, keranjang (Zustand), metode bayar, struk, toast sukses. Transaksi tersimpan ke riwayat saat "Bayar Sekarang" |
| **Dashboard** | ✅ Fungsional | KPI cards, grafik penjualan (stacked bar), donut kategori, produk terlaris, alert stok, transaksi terbaru (menampilkan transaksi kasir terbaru) |
| **Laporan Penjualan** | ✅ Fungsional | Filter periode, KPI, tren penjualan, breakdown kategori, tabel transaksi + pencarian & paginasi |
| **Manajemen Stok** | ✅ Fungsional | Ringkasan stok, filter kategori & stok kritis, pencarian, tabel produk + status stok, tombol restock (Zustand) |
| **Laba Rugi** | ✅ Fungsional | Filter periode, KPI, laporan L/R (pendapatan → HPP → laba kotor → biaya operasional → laba bersih), tren laba, margin per kategori, input biaya operasional (Zustand). Khusus Owner |
| **Auth** | ✅ Login (mode demo / Supabase) | Guard rute otomatis |
| Audit, Karyawan, Pengaturan | ⏳ Roadmap | Tampil di sidebar sebagai "Segera" |

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
│       └── labarugi.tsx        # Modul Laba Rugi
├── src/
│   ├── components/             # Komponen UI bersama
│   │   ├── charts/             # StackedBarChart, DonutChart
│   │   ├── AppShell.tsx        # Top bar + sidebar
│   │   ├── Sidebar.tsx  Card.tsx  Brand.tsx  UserPill.tsx  NotifButton.tsx
│   ├── constants/theme.ts      # Design tokens (dari mockup)
│   ├── data/                   # Seed & mock data (produk, dashboard, laporan)
│   ├── lib/supabase.ts         # Client Supabase
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
2. Jalankan isi `supabase/schema.sql` di **SQL Editor**.
3. Salin **Project URL** dan **anon public key** dari Project Settings → API ke `.env`.
4. Restart Expo. Login kini memakai Supabase Auth; layar dapat diarahkan untuk fetch data nyata (mengganti data mock di `src/data/`).

## 🎨 Desain

Semua warna, radius, dan tipografi diambil dari mockup dan disatukan di
`src/constants/theme.ts` agar konsisten dengan desain asli (tema hijau "Toko
Sayuran"). Layar responsif: sidebar muncul pada lebar ≥ 900px (web/tablet),
dan panel kasir menumpuk vertikal pada layar sempit.

---

_Dihasilkan dari PRD & mockup Sayuran POS · Fase 1 (MVP) scaffolding._
