# Architecture

Next.js 16 App Router uses server components by default; interactive cart and form controls are client components. Route handlers and server actions are reserved for validated, sensitive mutations.

`lib/supabase/server.ts` creates cookie-aware server clients; `lib/supabase/client.ts` is browser-safe. The service-role key is intentionally not used in browser code. `proxy.ts` refreshes Supabase sessions and protects `/admin` using a signed session; database RLS remains the authorization boundary.

Product/order data will be read through scoped server-side data-access modules. Checkout will create orders via a transactional database RPC or server route that recalculates prices and reserves stock. Paystack initialization and verification are server-only modules/handlers.

Environment values prefixed `NEXT_PUBLIC_` are browser-safe. Supabase URL and anon key are public configuration; Supabase service role and Paystack secret are server-only. Folder conventions: routes in `app`, reusable UI in `components`, server/domain logic in `lib`, shared schemas in `lib/validation`, migrations in `supabase/migrations`, and documentation in `docs`.

Data flow: browser UI → validated server action/route handler → Supabase with user/session context → RLS-protected Postgres. Payment callbacks → server verification → idempotent order/payment update.
