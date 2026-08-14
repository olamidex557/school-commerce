-- Product media is stored in one public bucket. Public object delivery is
-- required for customer catalogue images; object mutations remain admin-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "admins manage product image objects"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = 'products'
  and public.is_admin()
)
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = 'products'
  and public.is_admin()
);
