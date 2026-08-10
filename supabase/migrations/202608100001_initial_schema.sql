create extension if not exists "pgcrypto";

create type public.order_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type public.payment_status as enum ('unpaid', 'initialized', 'paid', 'failed', 'refunded');
create type public.fulfillment_method as enum ('delivery', 'pickup');

create table public.categories (
  id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
  description text, is_archived boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
create table public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id), name text not null,
  slug text not null unique, description text not null default '', is_featured boolean not null default false, is_archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  name text not null default 'Default', sku text not null unique, price_minor integer not null check (price_minor >= 0), stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null, alt_text text, position smallint not null default 0 check (position >= 0), created_at timestamptz not null default now(), unique (product_id, position)
);
create table public.customers (
  id uuid primary key default gen_random_uuid(), full_name text not null, phone text not null, campus_location text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (phone)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique, customer_id uuid not null references public.customers(id),
  status public.order_status not null default 'pending', payment_status public.payment_status not null default 'unpaid', fulfillment_method public.fulfillment_method not null,
  delivery_fee_minor integer not null default 0 check (delivery_fee_minor >= 0), subtotal_minor integer not null check (subtotal_minor >= 0), total_minor integer not null check (total_minor >= 0),
  location_snapshot text not null, customer_name_snapshot text not null, customer_phone_snapshot text not null, note text, payment_reference text unique,
  payment_verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint orders_total_matches check (total_minor = subtotal_minor + delivery_fee_minor)
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null, variant_name text not null, sku text not null, unit_price_minor integer not null check (unit_price_minor >= 0), quantity integer not null check (quantity > 0),
  line_total_minor integer not null check (line_total_minor >= 0), created_at timestamptz not null default now(),
  constraint order_items_total_matches check (line_total_minor = unit_price_minor * quantity)
);
create table public.settings (
  id boolean primary key default true check (id), business_name text not null default 'Campus Accessories', whatsapp_number text, campus_delivery_fee_minor integer not null default 0 check (campus_delivery_fee_minor >= 0), pickup_information text not null default '', low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0), currency_code char(3) not null default 'NGN', updated_at timestamptz not null default now()
);
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());

create index products_category_active_idx on public.products(category_id) where not is_archived;
create index variants_product_active_idx on public.product_variants(product_id) where is_active;
create index orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index order_items_order_idx on public.order_items(order_id);

alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.product_variants enable row level security; alter table public.product_images enable row level security; alter table public.customers enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.settings enable row level security; alter table public.admin_users enable row level security;

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;
create policy "public reads active categories" on public.categories for select using (not is_archived);
create policy "public reads active products" on public.products for select using (not is_archived);
create policy "public reads active variants" on public.product_variants for select using (is_active and exists (select 1 from public.products p where p.id = product_id and not p.is_archived));
create policy "public reads product images" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and not p.is_archived));
create policy "public reads settings" on public.settings for select using (true);
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage customers" on public.customers for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins view admin list" on public.admin_users for select using (public.is_admin());

insert into public.settings (id) values (true);
insert into public.categories (name, slug) values ('Cables', 'cables'), ('Earpieces', 'earpieces');
