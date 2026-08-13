# Database

Migrations are `202608100001_initial_schema.sql` (initial schema) and `202608100002_restrict_settings_access.sql` (Phase 2 security correction). The project operator reports they have been pushed to the linked remote database; the 2026-08-11 REST checks confirm its tables are exposed through PostgREST. Migration history and row-level policies still need their dedicated remote verification script/test identities.

Tables: `categories`, `products`, `product_variants`, `product_images`, `customers`, `orders`, `order_items`, `settings`, and `admin_users`. All primary IDs are UUIDs; monetary values are integer kobo/minor units; timestamps are `timestamptz`.

Products belong to categories and may have variants/images. Orders belong to a customer and contain immutable order-item price/name snapshots. Orders use `pending | confirmed | completed | cancelled`; payment uses `unpaid | initialized | paid | failed | refunded`. Stock is on variants (or an implicit default variant), decremented only by future transactional checkout logic after verified payment/reservation policy is finalized.

The schema defines foreign keys, check constraints, and indexes for catalogue, order, and payment-reference queries. RLS exposes only active catalogue rows anonymously. `settings`, customers, orders, order items, and `admin_users` have no anonymous policies. Admins are authorization-checked by `public.is_admin()` (a security-definer lookup of `admin_users` for `auth.uid()`); its execution is granted only to `authenticated` and `service_role`. Anonymous users cannot read orders, customers, payment data, or internal settings. Checkout/payment RPCs are intentionally deferred to Phase 4/5.

The second migration removes the original `public reads settings` policy. It was a genuine security correction: one settings row also contains the internal low-stock threshold. Public-facing configuration will be exposed later through a deliberately scoped query/view, not a table-wide policy.

Phase 3 uses only existing catalogue columns: categories (`id`, `name`, `slug`, `description`), products (`id`, `name`, `slug`, `description`, `is_featured`, `created_at`), active product variants (`id`, `name`, `price_minor`, `stock_quantity`), and product images (`storage_path`, `alt_text`, `position`). Lowest active-variant price is shown in naira from minor units. Availability is in stock when at least one public active variant has positive stock; otherwise it is out of stock. The low-stock threshold remains internal and is not exposed to storefront reads.
