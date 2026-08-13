-- Security correction: settings include internal operational values (for example
-- low-stock threshold), so they must not be readable by anonymous visitors.
drop policy if exists "public reads settings" on public.settings;

-- `is_admin` is only needed by authenticated requests subject to RLS. Restrict
-- direct execution to that role; service_role retains its normal bypass role.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;
