# Database

Phase 1 contains the initial authoritative Supabase migration at `supabase/migrations/202608100001_initial_schema.sql`.

Tables: `categories`, `products`, `product_variants`, `product_images`, `customers`, `orders`, `order_items`, `settings`, and `admin_users`. All primary IDs are UUIDs; monetary values are integer kobo/minor units; timestamps are `timestamptz`.

Products belong to categories and may have variants/images. Orders belong to a customer and contain immutable order-item price/name snapshots. Orders use `pending | confirmed | completed | cancelled`; payment uses `unpaid | initialized | paid | failed | refunded`. Stock is on variants (or an implicit default variant), decremented only by future transactional checkout logic after verified payment/reservation policy is finalized.

The migration defines foreign keys, check constraints, and indexes for catalogue, order, and payment-reference queries. RLS exposes only active catalogue rows anonymously. Admins are authorization-checked via `admin_users` plus `auth.uid()`; anonymous users cannot read order or customer data. Checkout/payment RPCs are intentionally deferred to Phase 4/5.
