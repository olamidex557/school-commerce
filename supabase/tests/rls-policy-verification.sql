-- Run after applying all migrations, as the database owner (for example in the
-- Supabase SQL Editor). It raises an error if the Phase 2 policy baseline is
-- missing. Functional anonymous/authenticated checks still require the manual
-- test procedure documented in docs/phases/PHASE-02-SUPABASE-AUTH.md.
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'public reads settings'
  ) then
    raise exception 'settings must not have a public read policy';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'admins manage orders'
  ) then
    raise exception 'admin-only orders policy is missing';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'public reads active products'
  ) then
    raise exception 'published product read policy is missing';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'admins manage product image objects'
  ) then
    raise exception 'admin-only product image storage policy is missing';
  end if;
end $$;
