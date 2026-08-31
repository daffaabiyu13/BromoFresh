-- ============================================================================
-- Sayuran POS — Skema Database Supabase (PostgreSQL)
-- Berdasarkan "Arsitektur Data" pada PRD §13.
-- Jalankan di Supabase SQL Editor untuk membuat struktur awal.
-- ============================================================================

-- Ekstensi untuk UUID
create extension if not exists "pgcrypto";

-- ── ENUMS ───────────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('owner', 'manajer', 'kasir', 'karyawan');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('tunai', 'qris', 'transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_status as enum ('selesai', 'batal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_movement as enum ('masuk', 'keluar', 'koreksi', 'opname');
exception when duplicate_object then null; end $$;

-- ── PROFILES (memperluas auth.users) ────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        user_role not null default 'kasir',
  avatar      text,
  phone       text,
  active      boolean not null default true,
  joined_at   date not null default current_date,
  created_at  timestamptz not null default now()
);

-- ── CATEGORIES ──────────────────────────────────────────────────────────────
create table if not exists categories (
  id     text primary key,          -- 'sayur' | 'buah' | 'sembako' | 'frozen'
  label  text not null,
  color  text
);

insert into categories (id, label, color) values
  ('sayur',   'Sayur',        '#1A4731'),
  ('buah',    'Buah',         '#3D8B66'),
  ('sembako', 'Sembako',      '#E8A020'),
  ('frozen',  'Frozen Food',  '#3A7BD5')
on conflict (id) do nothing;

-- ── PRODUCTS ────────────────────────────────────────────────────────────────
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  sku           text unique,
  category_id   text not null references categories(id),
  unit          text not null,                 -- kg, ikat, pcs, pack, liter
  sell_price    numeric(12,2) not null,
  cost_price    numeric(12,2) not null default 0,   -- HPP (privat)
  stock         numeric(12,2) not null default 0,
  min_stock     numeric(12,2) not null default 0,
  emoji         text,
  bg            text,
  expiry_date   date,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(active);

-- ── TRANSACTIONS (header) ───────────────────────────────────────────────────
create table if not exists transactions (
  id             uuid primary key default gen_random_uuid(),
  receipt_no     text unique not null,
  cashier_id     uuid references profiles(id),
  customer_name  text,
  queue_no       text,
  subtotal       numeric(12,2) not null default 0,
  discount       numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  method         payment_method not null default 'tunai',
  status         transaction_status not null default 'selesai',
  created_at     timestamptz not null default now()
);

create index if not exists idx_transactions_created on transactions(created_at);
create index if not exists idx_transactions_cashier on transactions(cashier_id);

-- ── TRANSACTION ITEMS (detail) ──────────────────────────────────────────────
create table if not exists transaction_items (
  id              uuid primary key default gen_random_uuid(),
  transaction_id  uuid not null references transactions(id) on delete cascade,
  product_id      uuid references products(id),
  product_name    text not null,         -- snapshot nama saat transaksi
  unit            text,
  qty             numeric(12,2) not null,
  price           numeric(12,2) not null,   -- harga snapshot saat jual
  subtotal        numeric(12,2) not null
);

create index if not exists idx_items_transaction on transaction_items(transaction_id);

-- ── STOCK ENTRIES (mutasi stok) ─────────────────────────────────────────────
create table if not exists stock_entries (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id),
  movement     stock_movement not null,
  qty          numeric(12,2) not null,   -- positif = masuk, negatif = keluar
  cost_price   numeric(12,2),            -- untuk moving average HPP
  reason       text,
  supplier     text,
  user_id      uuid references profiles(id),
  created_at   timestamptz not null default now()
);

create index if not exists idx_stock_product on stock_entries(product_id);

-- ── EXPENSES (biaya operasional untuk laba rugi) ────────────────────────────
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  category    text,
  amount      numeric(12,2) not null,
  spent_on    date not null default current_date,
  user_id     uuid references profiles(id),
  created_at  timestamptz not null default now()
);

-- ── AUDIT LOGS (immutable) ──────────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  action      text not null,        -- 'void', 'price_change', 'stock_adjust', ...
  entity      text,                 -- nama tabel/entitas
  entity_id   text,
  detail      jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_created on audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Aktifkan RLS dan buat policy dasar. Sesuaikan dengan matriks akses PRD §03.
-- ============================================================================
alter table profiles          enable row level security;
alter table products          enable row level security;
alter table transactions      enable row level security;
alter table transaction_items enable row level security;
alter table stock_entries     enable row level security;
alter table expenses          enable row level security;
alter table audit_logs        enable row level security;

-- Helper: role pengguna yang sedang login
create or replace function auth_role() returns user_role
language sql stable as $$
  select role from profiles where id = auth.uid();
$$;

-- Profil: pengguna melihat dirinya sendiri; owner/manajer melihat semua.
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select
  using (id = auth.uid() or auth_role() in ('owner', 'manajer'));

-- Produk: semua pengguna terautentikasi boleh membaca; owner/manajer menulis.
drop policy if exists products_read on products;
create policy products_read on products for select
  using (auth.role() = 'authenticated');

drop policy if exists products_write on products;
create policy products_write on products for all
  using (auth_role() in ('owner', 'manajer'))
  with check (auth_role() in ('owner', 'manajer'));

-- Transaksi: pengguna terautentikasi boleh membuat & membaca.
drop policy if exists tx_all on transactions;
create policy tx_all on transactions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists items_all on transaction_items;
create policy items_all on transaction_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Laba rugi & audit: hanya owner.
drop policy if exists expenses_owner on expenses;
create policy expenses_owner on expenses for all
  using (auth_role() = 'owner') with check (auth_role() = 'owner');

drop policy if exists audit_read on audit_logs;
create policy audit_read on audit_logs for select
  using (auth_role() in ('owner', 'manajer'));

-- Stok: owner/manajer menulis, semua membaca.
drop policy if exists stock_read on stock_entries;
create policy stock_read on stock_entries for select
  using (auth.role() = 'authenticated');

drop policy if exists stock_write on stock_entries;
create policy stock_write on stock_entries for insert
  with check (auth_role() in ('owner', 'manajer'));
