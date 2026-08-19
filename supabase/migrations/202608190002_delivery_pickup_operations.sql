-- Phase 8: method-aware fulfilment operations. Payment truth and stock remain
-- owned exclusively by the Phase 6 payment fulfilment RPC.
alter type public.order_status add value if not exists 'out_for_delivery' after 'confirmed';

-- Avoid using the newly added enum label directly in this transactional
-- migration. PostgreSQL makes new enum labels usable after the transaction
-- commits; text comparison keeps the replacement function safe to create here.
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
    (v_order.status::text = 'paid' and p_next_status::text in ('confirmed', 'cancelled'))
    or (v_order.fulfillment_method = 'pickup'
      and v_order.status::text = 'confirmed'
      and p_next_status::text in ('completed', 'cancelled'))
    or (v_order.fulfillment_method = 'delivery'
      and v_order.status::text = 'confirmed'
      and p_next_status::text in ('out_for_delivery', 'cancelled'))
    or (v_order.fulfillment_method = 'delivery'
      and v_order.status::text = 'out_for_delivery'
      and p_next_status::text in ('completed', 'cancelled'))
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
