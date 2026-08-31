-- ============================================================================
-- Sayuran POS — Seed data produk contoh.
-- Jalankan SETELAH schema.sql. Mengisi tabel `products` dengan 34 produk yang
-- sama seperti data contoh aplikasi (src/data/products.ts) agar Kasir yang
-- sudah terhubung Supabase menampilkan katalog yang identik.
-- ============================================================================

insert into products (name, category_id, unit, sell_price, cost_price, stock, min_stock, emoji, bg) values
  -- Sayur
  ('Bayam Segar',      'sayur',   'ikat',  3000,  2000, 24, 10, '🥬', '#E8F5E9'),
  ('Kangkung',         'sayur',   'ikat',  2500,  1800, 30, 10, '🌿', '#E8F5E9'),
  ('Sawi Hijau',       'sayur',   'ikat',  3000,  2000, 18, 10, '🥦', '#E8F5E9'),
  ('Brokoli',          'sayur',   'pcs',   8000,  6000, 12,  6, '🥦', '#D7F0DA'),
  ('Wortel',           'sayur',   '500g',  5000,  3500, 22,  8, '🥕', '#FFF3E0'),
  ('Tomat Cherry',     'sayur',   '250g',  8000,  6000,  2,  5, '🍅', '#FFEBEE'),
  ('Terong Ungu',      'sayur',   'pcs',   4000,  2800, 14,  6, '🍆', '#F3E5F5'),
  ('Timun',            'sayur',   'pcs',   3000,  2000, 26,  8, '🥒', '#E8F5E9'),
  ('Kol Putih',        'sayur',   'pcs',   5000,  3500, 16,  6, '🥬', '#E8F5E9'),
  ('Jagung Manis',     'sayur',   'pcs',   4000,  2800,  5, 10, '🌽', '#FFF8E1'),
  ('Labu Siam',        'sayur',   'pcs',   4000,  2800, 13,  6, '🎃', '#FFF3E0'),
  ('Buncis',           'sayur',   '250g',  7000,  5000,  9,  6, '🫘', '#E8F5E9'),
  -- Buah
  ('Apel Fuji',        'buah',    'pcs',   8000,  6000, 40, 12, '🍎', '#FFEBEE'),
  ('Jeruk Siam',       'buah',    'pcs',   5000,  3500, 35, 12, '🍊', '#FFF3E0'),
  ('Pisang Cavendish', 'buah',    'pcs',   3000,  2000, 50, 15, '🍌', '#FFF8E1'),
  ('Mangga Harum',     'buah',    'pcs',   7000,  5000, 20,  8, '🥭', '#FFF3E0'),
  ('Semangka',         'buah',    '500g',  5000,  3500, 15,  6, '🍉', '#FFEBEE'),
  ('Anggur Hijau',     'buah',    '500g', 15000, 11000,  8,  6, '🍇', '#F3E5F5'),
  ('Strawberry',       'buah',    '250g', 12000,  9000,  7,  8, '🍓', '#FFEBEE'),
  ('Pepaya',           'buah',    '500g',  6000,  4000, 18,  6, '🍈', '#FFF3E0'),
  -- Sembako
  ('Beras Premium',    'sembako', '5kg',  65000, 58000, 25,  8, '🌾', '#FFF8E1'),
  ('Gula Pasir',       'sembako', '1kg',  14000, 12000, 40, 12, '🍬', '#FFF8E1'),
  ('Minyak Goreng',    'sembako', '1 liter', 18000, 15500, 33, 10, '🫙', '#FFF3E0'),
  ('Tepung Terigu',    'sembako', '1kg',  12000, 10000, 28, 10, '🌾', '#FFF8E1'),
  ('Telur Ayam',       'sembako', '1kg',  28000, 25000, 15,  8, '🥚', '#FFF8E1'),
  ('Kecap Manis',      'sembako', 'botol',12000,  9500, 22,  8, '🧴', '#FBE9E7'),
  ('Garam Dapur',      'sembako', '250g',  3000,  2000, 44, 12, '🧂', '#E3F2FD'),
  ('Mie Instan',       'sembako', 'bungkus',3500, 2800,120, 30, '🍜', '#FFF8E1'),
  -- Frozen
  ('Nugget Ayam',      'frozen',  '400g', 22000, 18000,  3,  5, '🍗', '#FFF3E0'),
  ('Sosis Sapi',       'frozen',  '500g', 18000, 15000, 10,  5, '🌭', '#FFEBEE'),
  ('Bakso Sapi',       'frozen',  '500g', 25000, 21000,  8,  5, '🍢', '#FFEBEE'),
  ('Ikan Dori Beku',   'frozen',  '500g', 30000, 25000,  6,  4, '🐟', '#E3F2FD'),
  ('Udang Beku',       'frozen',  '500g', 45000, 38000,  1,  3, '🦐', '#FFEBEE'),
  ('Dimsum Beku',      'frozen',  'pack', 20000, 16000,  9,  4, '🥟', '#FFF8E1')
on conflict do nothing;
