-- Phase 7: audited operational handling for already-created orders.
-- Payment truth, order snapshots, and stock remain owned by Phase 6 payment RPCs.
create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  from_status public.order_status not null,
  to_status public.order_status not null,
  changed_by uuid not null references auth.users(id) on delete restrict,
  changed_at timestamptz not null default now(),
  constraint order_status_events_change check (from_status <> to_status)
);

create index order_status_events_order_changed_idx
  on public.order_status_events(order_id, changed_at desc);

alter table public.order_status_events enable row level security;

-- Direct authenticated writes would let an admin alter payment truth or immutable
-- order snapshots. Reads remain available through existing admin authorization.
drop policy if exists "admins manage customers" on public.customers;
drop policy if exists "admins manage orders" on public.orders;
drop policy if exists "admins manage order items" on public.order_items;
drop policy if exists "admins manage payment attempts" on public.payment_attempts;

create policy "admins view customers" on public.customers
  for select to authenticated using (public.is_admin());
create policy "admins view orders" on public.orders
  for select to authenticated using (public.is_admin());
create policy "admins view order items" on public.order_items
  for select to authenticated using (public.is_admin());
create policy "admins view payment attempts" on public.payment_attempts
  for select to authenticated using (public.is_admin());
create policy "admins view order status events" on public.order_status_events
  for select to authenticated using (public.is_admin());

revoke insert, update, delete on public.customers from anon, authenticated;
revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;
revoke insert, update, delete on public.payment_attempts from anon, authenticated;
revoke insert, update, delete on public.order_status_events from anon, authenticated;

-- The sole administrator mutation path. It deliberately cannot set `paid`,
-- pending-payment states, payment fields, amounts, item snapshots, or stock.
create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_next_status public.order_status,
  p_expected_updated_at timestamptz
) returns table(status public.order_status, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_actor uuid := auth.uid();
begin
  if v_actor is null or not public.is_admin() then
    raise exception 'admin_order_unauthorized' using errcode = '42501';
  end if;

  select * into v_order
  from public.orders
  where public.orders.id = p_order_id
  for update;
  if not found then
    raise exception 'admin_order_not_found' using errcode = 'P0001';
  end if;
  if p_expected_updated_at is null
     or v_order.updated_at is distinct from p_expected_updated_at then
    raise exception 'admin_order_stale' using errcode = 'P0001';
  end if;
  if not (
    (v_order.status = 'paid' and p_next_status in ('confirmed', 'cancelled'))
    or (v_order.status = 'confirmed' and p_next_status in ('completed', 'cancelled'))
  ) then
    raise exception 'admin_order_invalid_transition' using errcode = 'P0001';
  end if;

  update public.orders
  set status = p_next_status, updated_at = now()
  where public.orders.id = v_order.id
  returning public.orders.status, public.orders.updated_at into status, updated_at;

  insert into public.order_status_events(order_id, from_status, to_status, changed_by)
  values (v_order.id, v_order.status, status, v_actor);

  return next;
end;
$$;

revoke all on function public.admin_update_order_status(uuid, public.order_status, timestamptz)
  from public, anon, authenticated;
grant execute on function public.admin_update_order_status(uuid, public.order_status, timestamptz)
  to authenticated;
