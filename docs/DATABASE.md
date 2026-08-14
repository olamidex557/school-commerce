# Database

Migrations are `202608100001_initial_schema.sql` (initial schema), `202608100002_restrict_settings_access.sql` (Phase 2 security correction), and `202608140001_product_image_storage.sql` (Phase 4 product media). All three are listed as applied on the linked remote database as of 2026-08-14. Functional admin/non-admin RLS tests still need dedicated remote test identities.

Tables: `categories`, `products`, `product_variants`, `product_images`, `customers`, `orders`, `order_items`, `settings`, and `admin_users`. All primary IDs are UUIDs; monetary values are integer kobo/minor units; timestamps are `timestamptz`.

Products belong to categories and may have variants/images. Orders belong to a customer and contain immutable order-item price/name snapshots. Orders use `pending | confirmed | completed | cancelled`; payment uses `unpaid | initialized | paid | failed | refunded`. Stock is on variants (or an implicit default variant), decremented only by future transactional checkout logic after verified payment/reservation policy is finalized.

The schema defines foreign keys, check constraints, and indexes for catalogue, order, and payment-reference queries. RLS exposes only active catalogue rows anonymously. `settings`, customers, orders, order items, and `admin_users` have no anonymous policies. Admins are authorization-checked by `public.is_admin()` (a security-definer lookup of `admin_users` for `auth.uid()`); its execution is granted only to `authenticated` and `service_role`. Anonymous users cannot read orders, customers, payment data, or internal settings. Checkout/payment RPCs are intentionally deferred to Phase 4/5.

The second migration removes the original `public reads settings` policy. It was a genuine security correction: one settings row also contains the internal low-stock threshold. Public-facing configuration will be exposed later through a deliberately scoped query/view, not a table-wide policy.

Phase 3 uses only existing catalogue columns: categories (`id`, `name`, `slug`, `description`), products (`id`, `name`, `slug`, `description`, `is_featured`, `created_at`), active product variants (`id`, `name`, `price_minor`, `stock_quantity`), and product images (`storage_path`, `alt_text`, `position`). Lowest active-variant price is shown in naira from minor units. Availability is in stock when at least one public active variant has positive stock; otherwise it is out of stock. The low-stock threshold remains internal and is not exposed to storefront reads.

On 2026-08-13, public anonymous verification returned two category rows and zero product rows. This is live database state, not a storefront seed; no inventory was inserted for Phase 3.

Phase 4 adds no catalogue table or column. It creates the public `storage.buckets` bucket `product-images`, with a 5 MiB limit and only JPEG, PNG, and WebP MIME types. Its `storage.objects` policy grants object management only to authenticated `is_admin()` users and only under the `products/` path. Public delivery is intentional because catalogue image URLs are public; mutation remains RLS-protected. The application also creates a corresponding `product_images` row only after a successful upload and removes the object when its row is removed.
