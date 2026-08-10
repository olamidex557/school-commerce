# Security

Supabase Auth is the identity provider. Admin eligibility is stored in `admin_users`, enforced both in database RLS and future server-side admin guards. Anonymous visitors may view active catalogue data only.

All mutating endpoints must use Zod validation, perform authorization server-side, and derive prices/totals from the database. Paystack secret keys remain server-only; payment success is accepted only after server verification and idempotent reference handling. Never expose orders/customers by public ID alone.

`.env.local` is ignored; `.env.example` contains names only. Future sensitive routes require rate limiting and defensive logging. Avoid collecting data beyond order contact and fulfillment requirements.
