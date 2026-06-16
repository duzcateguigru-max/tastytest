/**
 * Run this script ONCE to create all required tables in Supabase.
 * Usage: node create-tables.mjs
 *
 * Make sure your .env.local has:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_PUBLISHABLE_KEY=...
 *
 * NOTE: This uses the publishable (anon) key to run DDL via the REST API.
 * If you get a permission error, run the SQL manually in the Supabase dashboard:
 *   https://supabase.com/dashboard/project/fjjgztmbzrfdrqnwqggo/sql/new
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Read .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k)
)

const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local')
  process.exit(1)
}

console.log('🔗 Connecting to:', url)

// We'll use fetch directly to run raw SQL via the Supabase REST "rpc" endpoint
// This requires the anon key to have execute rights, which may not work for DDL.
// The recommended approach is to paste the SQL in the Dashboard SQL editor.

const sql = `
-- ─── categories ───────────────────────────────────────
create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  img text,
  created_at timestamptz default now()
);
alter table categories enable row level security;
drop policy if exists "allow_all_categories" on categories;
create policy "allow_all_categories" on categories
  for all using (true) with check (true);

-- ─── menu_items ───────────────────────────────────────
create table if not exists menu_items (
  id bigint generated always as identity primary key,
  menu_name text not null,
  menu_description text,
  menu_price numeric(10,2) not null default 0,
  menu_photo text,
  menu_category_id bigint references categories(id) on delete set null,
  menu_status boolean not null default true,
  created_at timestamptz default now()
);
alter table menu_items enable row level security;
drop policy if exists "allow_all_menu_items" on menu_items;
create policy "allow_all_menu_items" on menu_items
  for all using (true) with check (true);

-- ─── orders ───────────────────────────────────────────
create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_name text,
  customer_email text,
  customer_phone text,
  status text not null default 'pending',
  total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz default now()
);
alter table orders enable row level security;
drop policy if exists "allow_all_orders" on orders;
create policy "allow_all_orders" on orders
  for all using (true) with check (true);

-- ─── order_items ──────────────────────────────────────
create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint references orders(id) on delete cascade,
  menu_item_id bigint references menu_items(id) on delete set null,
  menu_name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0
);
alter table order_items enable row level security;
drop policy if exists "allow_all_order_items" on order_items;
create policy "allow_all_order_items" on order_items
  for all using (true) with check (true);

-- ─── customers ────────────────────────────────────────
create table if not exists customers (
  id bigint generated always as identity primary key,
  first_name text,
  last_name text,
  email text unique,
  phone text,
  address text,
  created_at timestamptz default now()
);
alter table customers enable row level security;
drop policy if exists "allow_all_customers" on customers;
create policy "allow_all_customers" on customers
  for all using (true) with check (true);

-- ─── reservations ─────────────────────────────────────
create table if not exists reservations (
  id bigint generated always as identity primary key,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  party_size int not null default 2,
  reservation_date timestamptz not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now()
);
alter table reservations enable row level security;
drop policy if exists "allow_all_reservations" on reservations;
create policy "allow_all_reservations" on reservations
  for all using (true) with check (true);

-- ─── coupons ──────────────────────────────────────────
create table if not exists coupons (
  id bigint generated always as identity primary key,
  code text unique not null,
  description text,
  discount_type text not null default 'percentage',
  discount_value numeric(10,2) not null default 0,
  min_order_amount numeric(10,2) default 0,
  max_uses int,
  used_count int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);
alter table coupons enable row level security;
drop policy if exists "allow_all_coupons" on coupons;
create policy "allow_all_coupons" on coupons
  for all using (true) with check (true);

-- ─── reviews ──────────────────────────────────────────
create table if not exists reviews (
  id bigint generated always as identity primary key,
  customer_name text,
  customer_email text,
  menu_item_id bigint references menu_items(id) on delete set null,
  rating int not null default 5 check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz default now()
);
alter table reviews enable row level security;
drop policy if exists "allow_all_reviews" on reviews;
create policy "allow_all_reviews" on reviews
  for all using (true) with check (true);

-- ─── locations ────────────────────────────────────────
create table if not exists locations (
  id bigint generated always as identity primary key,
  name text not null,
  address text,
  city text,
  phone text,
  is_open boolean not null default true,
  created_at timestamptz default now()
);
alter table locations enable row level security;
drop policy if exists "allow_all_locations" on locations;
create policy "allow_all_locations" on locations
  for all using (true) with check (true);
`

// Try to run via the REST API SQL endpoint
const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
  },
  body: JSON.stringify({ sql }),
})

if (res.ok) {
  console.log('✅  Tables created successfully!')
} else {
  const body = await res.text()
  console.log('\n⚠️  Could not run SQL via REST API (this is normal — DDL needs superuser).')
  console.log('   Please copy and paste the SQL below into the Supabase Dashboard SQL editor:')
  console.log('   👉  https://supabase.com/dashboard/project/fjjgztmbzrfdrqnwqggo/sql/new\n')
  console.log('─'.repeat(60))
  console.log(sql)
  console.log('─'.repeat(60))
}
