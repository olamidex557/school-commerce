-- Phase 6: authenticated payment attempts and atomic verified fulfilment.
-- Rebuild the two original enums rather than ADD VALUE so the new values can
-- safely be used by this same transactional migration on every PostgreSQL host.
create type public.order_status_v2 as enum ('pending', 'confirmed', 'completed', 'cancelled', 'pending_payment', 'paid');
alter table public.orders alter column status drop default;
alter table public.orders alter column status type public.order_status_v2 using status::text::public.order_status_v2;
drop type public.order_status;
alter type public.order_status_v2 rename to order_status;

create type public.payment_status_v2 as enum ('unpaid', 'initialized', 'paid', 'failed', 'refunded', 'pending', 'success', 'abandoned', 'reversed');
alter table public.orders alter column payment_status drop default;
alter table public.orders alter column payment_status type public.payment_status_v2 using payment_status::text::public.payment_status_v2;
drop type public.payment_status;
alter type public.payment_status_v2 rename to payment_status;

alter table public.customers add column if not exists email text;
alter table public.customers drop constraint if exists customers_phone_key;
create unique index if not exists customers_email_unique_idx on public.customers (lower(email)) where email is not null;

alter table public.orders add column if not exists currency char(3) not null default 'NGN';
alter table public.orders add column if not exists customer_email_snapshot text;
alter table public.orders add column if not exists checkout_idempotency_key uuid;
alter table public.orders alter column status set default 'pending_payment';
alter table public.orders alter column payment_status set default 'pending';
create unique index if not exists orders_checkout_idempotency_key_idx on public.orders (checkout_idempotency_key) where checkout_idempotency_key is not null;

create type public.payment_attempt_status as enum ('pending', 'initialized', 'success', 'failed', 'abandoned', 'reversed');
create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  paystack_reference text not null unique check (paystack_reference ~ '^[A-Za-z0-9.=\\-]+$'),
  paystack_transaction_id numeric(20,0),
  amount_minor integer not null check (amount_minor >= 0),
  currency char(3) not null default 'NGN',
  status public.payment_attempt_status not null default 'pending',
  initialized_at timestamptz,
  paid_at timestamptz,
  provider_channel text,
  provider_response_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (paystack_transaction_id)
);
create index payment_attempts_order_created_idx on public.payment_attempts (order_id, created_at desc);
alter table public.payment_attempts enable row level security;
create policy "admins manage payment attempts" on public.payment_attempts for all using (public.is_admin()) with check (public.is_admin());

-- This function is invoked only by the server service-role client. It recalculates
-- the checkout from catalogue rows and makes one immutable pending order per key.
create or replace function public.create_checkout_payment(
  p_checkout_key uuid, p_reference text, p_full_name text, p_email text,
  p_phone text, p_fulfillment public.fulfillment_method, p_location text,
  p_note text, p_items jsonb
) returns table(payment_attempt_id uuid, order_id uuid, reference text, amount_minor integer, currency char(3))
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_customer_id uuid;
  v_subtotal integer := 0;
  v_fee integer := 0;
  v_item record;
  v_variant public.product_variants%rowtype;
  v_product public.products%rowtype;
  v_attempt public.payment_attempts%rowtype;
begin
  if p_reference !~ '^[A-Za-z0-9.=\\-]+$' then raise exception 'invalid payment reference'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'invalid cart'; end if;
  select * into v_order from orders where checkout_idempotency_key = p_checkout_key for update;
  if found then
    select * into v_attempt from payment_attempts where order_id = v_order.id and status in ('pending','initialized') order by created_at desc limit 1 for update;
    if found then return query select v_attempt.id, v_order.id, v_attempt.paystack_reference, v_attempt.amount_minor, v_attempt.currency; return; end if;
    if v_order.status <> 'pending_payment' then raise exception 'checkout is no longer payable'; end if;
    -- Retry creates a fresh reference but reuses the immutable order snapshot.
    insert into payment_attempts(order_id, paystack_reference, amount_minor, currency)
      values (v_order.id, p_reference, v_order.total_minor, v_order.currency) returning * into v_attempt;
    return query select v_attempt.id, v_order.id, v_attempt.paystack_reference, v_attempt.amount_minor, v_attempt.currency; return;
  end if;
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, variant_id uuid, quantity integer) loop
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 20 then raise exception 'invalid quantity'; end if;
    select * into v_variant from product_variants where id = v_item.variant_id and is_active for key share;
    if v_variant.id is null then raise exception 'unavailable product'; end if;
    select * into v_product from products where id = v_item.product_id and not is_archived;
    if not found or v_product.id is null or v_variant.product_id <> v_product.id then raise exception 'unavailable product'; end if;
    if v_variant.stock_quantity < v_item.quantity then raise exception 'insufficient stock'; end if;
    v_subtotal := v_subtotal + (v_variant.price_minor * v_item.quantity);
  end loop;
  -- Delivery pricing remains an explicit approved-zero server rule in Phase 6.
  if p_fulfillment = 'delivery' then v_fee := 0; end if;
  select id into v_customer_id from customers where lower(email) = lower(p_email) limit 1;
  if v_customer_id is null then
    insert into customers(full_name, phone, campus_location, email) values (p_full_name, p_phone, p_location, p_email) returning id into v_customer_id;
  else
    update customers set full_name = p_full_name, phone = p_phone, campus_location = p_location, updated_at = now() where id = v_customer_id;
  end if;
  insert into orders(order_number, customer_id, status, payment_status, fulfillment_method, delivery_fee_minor, subtotal_minor, total_minor, currency, location_snapshot, customer_name_snapshot, customer_phone_snapshot, customer_email_snapshot, note, checkout_idempotency_key)
    values ('CA-' || to_char(now() at time zone 'UTC', 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), v_customer_id, 'pending_payment', 'pending', p_fulfillment, v_fee, v_subtotal, v_subtotal + v_fee, 'NGN', p_location, p_full_name, p_phone, p_email, p_note, p_checkout_key) returning * into v_order;
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, variant_id uuid, quantity integer) loop
    select * into v_variant from product_variants where id = v_item.variant_id;
    select * into v_product from products where id = v_item.product_id;
    insert into order_items(order_id, product_id, variant_id, product_name, variant_name, sku, unit_price_minor, quantity, line_total_minor)
      values (v_order.id, v_product.id, v_variant.id, v_product.name, v_variant.name, v_variant.sku, v_variant.price_minor, v_item.quantity, v_variant.price_minor * v_item.quantity);
  end loop;
  insert into payment_attempts(order_id, paystack_reference, amount_minor, currency) values (v_order.id, p_reference, v_order.total_minor, v_order.currency) returning * into v_attempt;
  return query select v_attempt.id, v_order.id, v_attempt.paystack_reference, v_attempt.amount_minor, v_attempt.currency;
end;
$$;

-- Call only after the application has independently verified Paystack's status,
-- reference, amount, and currency. Row locks + conditional decrements prevent oversell.
create or replace function public.fulfil_verified_paystack_payment(
  p_reference text, p_transaction_id numeric(20,0), p_paid_at timestamptz,
  p_channel text, p_gateway_response text
) returns table(order_id uuid, order_number text, amount_minor integer, fulfillment public.fulfillment_method, payment_state public.payment_attempt_status)
language plpgsql security definer set search_path = public as $$
declare v_attempt public.payment_attempts%rowtype; v_order public.orders%rowtype; v_item record; v_updated uuid;
begin
  select * into v_attempt from payment_attempts where paystack_reference = p_reference for update;
  if not found then raise exception 'unknown payment reference'; end if;
  select * into v_order from orders where id = v_attempt.order_id for update;
  if v_attempt.status = 'success' and v_order.status = 'paid' then return query select v_order.id, v_order.order_number, v_order.total_minor, v_order.fulfillment_method, v_attempt.status; return; end if;
  if v_attempt.amount_minor <> v_order.total_minor or v_attempt.currency <> v_order.currency then raise exception 'payment amount mismatch'; end if;
  if v_attempt.status in ('failed','abandoned','reversed') then raise exception 'payment is not fulfilable'; end if;
  for v_item in select variant_id, quantity from order_items where order_id = v_order.id order by variant_id loop
    v_updated := null;
    update product_variants set stock_quantity = stock_quantity - v_item.quantity, updated_at = now()
      where id = v_item.variant_id and stock_quantity >= v_item.quantity returning id into v_updated;
    if v_updated is null then raise exception 'insufficient stock at fulfilment'; end if;
  end loop;
  update payment_attempts set status = 'success', paystack_transaction_id = p_transaction_id, paid_at = p_paid_at, provider_channel = left(coalesce(p_channel, ''), 40), provider_response_code = left(coalesce(p_gateway_response, ''), 120), updated_at = now() where id = v_attempt.id;
  update orders set status = 'paid', payment_status = 'success', payment_reference = p_reference, payment_verified_at = now(), updated_at = now() where id = v_order.id;
  return query select v_order.id, v_order.order_number, v_order.total_minor, v_order.fulfillment_method, 'success'::public.payment_attempt_status;
end;
$$;

create or replace function public.create_paystack_payment_retry(p_order_id uuid, p_reference text)
returns table(payment_attempt_id uuid, reference text, amount_minor integer, currency char(3))
language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype; v_attempt public.payment_attempts%rowtype;
begin
  if p_reference !~ '^[A-Za-z0-9.=\\-]+$' then raise exception 'invalid payment reference'; end if;
  select * into v_order from orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending_payment' then raise exception 'order is not payable'; end if;
  select * into v_attempt from payment_attempts where order_id = v_order.id and status in ('pending','initialized') order by created_at desc limit 1 for update;
  if found then return query select v_attempt.id, v_attempt.paystack_reference, v_attempt.amount_minor, v_attempt.currency; return; end if;
  insert into payment_attempts(order_id, paystack_reference, amount_minor, currency)
    values (v_order.id, p_reference, v_order.total_minor, v_order.currency) returning * into v_attempt;
  return query select v_attempt.id, v_attempt.paystack_reference, v_attempt.amount_minor, v_attempt.currency;
end;
$$;

revoke all on function public.create_checkout_payment(uuid, text, text, text, text, public.fulfillment_method, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.fulfil_verified_paystack_payment(text, numeric, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.create_paystack_payment_retry(uuid, text) from public, anon, authenticated;
grant execute on function public.create_checkout_payment(uuid, text, text, text, text, public.fulfillment_method, text, text, jsonb) to service_role;
grant execute on function public.fulfil_verified_paystack_payment(text, numeric, timestamptz, text, text) to service_role;
grant execute on function public.create_paystack_payment_retry(uuid, text) to service_role;
