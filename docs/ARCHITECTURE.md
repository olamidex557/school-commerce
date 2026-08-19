# Architecture

Next.js 16 App Router uses server components by default; interactive cart and form controls are client components. Route handlers and server actions are reserved for validated, sensitive mutations.

`lib/supabase/server.ts` creates cookie-aware server clients; `lib/supabase/client.ts` is browser-safe; both obtain only public configuration through `lib/supabase/env.ts`. `lib/supabase/service.ts` is server-only and is limited to Phase 6’s private payment RPC/data access; its service-role key is never imported into browser code. `proxy.ts` refreshes Supabase sessions and calls the RLS-backed `is_admin()` RPC for `/admin/*` before allowing a request through.

`/admin/login` is the only login route. Its server action validates credentials with Zod, applies the login limiter, authenticates through the server Supabase client, verifies `is_admin()`, and redirects server-side only after authorization succeeds. The `'use server'` module exports only the async action; `useActionState`'s type and initial state live in `lib/auth/admin-login-state.ts`. The server Supabase cookie adapter establishes and clears the session. `app/admin/(protected)/layout.tsx` independently repeats the server-side `requireAdmin()` check, so authorization does not depend on proxy behavior or hidden navigation. The login client component is limited to form state and password visibility; it never receives or persists a session token.

The Supabase browser client uses the official `@supabase/ssr` cookie adapter with shared `Path=/`, `SameSite=Lax`, and production-only `Secure` options. The application does not use localStorage, sessionStorage, IndexedDB, custom persistence, or manually serialized tokens for authentication. Cookie state is managed only by Supabase SSR clients.

The `/admin/*` proxy detects Supabase's explicit invalid-refresh-token response from `getUser()`. It clears only the current project's Supabase auth cookie/chunks, treats the request as unauthenticated, and returns the login page or a fixed login redirect. It does not clear valid sessions or retry a known-invalid refresh token on later requests.

Product/order data is read through scoped server-side data-access modules. Checkout creates orders via a transactional database RPC that recalculates prices; Paystack initialization and verification are server-only modules/handlers. The protected order dashboard reads RLS-backed narrowed DTOs through `lib/admin/orders.ts`; its sole mutation calls the audited `admin_update_order_status` RPC after `requireAdmin()`.

Environment values prefixed `NEXT_PUBLIC_` are browser-safe. Supabase URL and anon key are public configuration; Supabase service role and Paystack secret are server-only. Folder conventions: routes in `app`, reusable UI in `components`, server/domain logic in `lib`, shared schemas in `lib/validation`, migrations in `supabase/migrations`, and documentation in `docs`.

Data flow: browser UI → validated server action/route handler → Supabase with user/session context → RLS-protected Postgres. Payment callbacks → server verification → idempotent order/payment update.

## Future production readiness

No CI/CD workflow is active. Any future delivery pipeline must preserve the current server-only Paystack/service-role boundaries and must not automate Supabase migrations or commerce writes. The deferred design requirements are in `docs/future/CI-CD.md`.

## Payments and fulfilment

The checkout Server Action accepts only cart identifiers, a UUID idempotency key, and validated guest details. The private payment RPC reloads variants/products and derives all money, then creates a `pending_payment` immutable order snapshot and one unique payment attempt. It is not a stock reservation. Paystack initialization, verification, webhook HMAC validation, and callback recovery run only in server modules. The browser receives an authorization URL and retains an HttpOnly opaque reference cookie for its result view.

`charge.success` is verified against Paystack’s transaction API before the fulfilment RPC runs. That RPC locks the attempt and order, conditionally decrements each variant only if enough stock remains, writes the transaction result, and changes `pending_payment → paid` as one database transaction. Database uniqueness plus locks make repeated click, duplicate webhook, callback/webhook, and concurrent verification converge without duplicate paid orders or stock deductions.

## Admin order operations

Phase 7/8 use the existing order-status enum plus `out_for_delivery`: verified `paid` orders may move to `confirmed` or `cancelled`; pickup `confirmed` orders may move to `completed` or `cancelled`; delivery `confirmed` orders may move to `out_for_delivery` or `cancelled`; and delivery `out_for_delivery` orders may move to `completed` or `cancelled`. The operation is a locked compare-and-set transition using `orders.updated_at`, and it writes `order_status_events` with the administrator UUID. Payment attempt/order payment fields, order/item/customer snapshots, and stock are read-only to the dashboard. The migration replaces broad authenticated-admin DML policies for order/payment records with admin read policies and a narrowly granted, self-authorising `security definer` transition RPC. Phase 6 service-role payment paths remain unchanged.

## Storefront catalogue

Customer catalogue pages are React server components. `lib/catalogue/catalogue.ts` is server-only and uses the standard server Supabase client with the anon key and public RLS policies; it never imports the service-role key. It maps only public product/category/active-variant/image fields into presentation types. `/`, `/shop`, and `/shop/[slug]` fetch data server-side. `/shop` keeps search, category, and sort state in validated URL search parameters.

Cache Components are not enabled in this project. Catalogue requests remain request-time server reads so future admin changes are not permanently stale. Once Phase 6 mutations exist, tagged/on-demand revalidation can be introduced deliberately. Supabase Storage image paths are converted to public URLs only when `SUPABASE_PRODUCT_IMAGES_BUCKET` is configured; Next Image accepts Supabase Storage URLs through `next.config.ts` remote patterns.

The current remote public API returns categories but no product rows. The code intentionally renders its empty catalogue states rather than creating seed or mock inventory in the production project.

## Admin catalogue management

`/admin/products`, `/admin/products/new`, `/admin/products/[id]`, and `/admin/categories` are inside the protected admin layout. Their server components use `lib/admin/catalogue.ts`, a server-only data-access layer that calls `requireAdmin()` and returns narrowed admin DTOs. Mutations live in `app/admin/(protected)/catalogue-actions.ts`. Each action authenticates/authorizes again, validates untrusted `FormData` with Zod, uses the SSR user-session Supabase client under RLS, and returns only safe field/general errors.

There is no application service-role client. Products and variants are edited with server-validated integer minor-unit prices and stock quantities. Product images are uploaded through a server action after MIME, signature, size, and product ownership checks. The action creates `products/<product UUID>/<random UUID>.<extension>` itself; it does not accept a client storage path. The public `product-images` bucket is created by migration and its object mutations require `is_admin()`.

Catalogue reads are request-time, so they are already fresh. Admin actions additionally call `revalidatePath` for home, shop, all product pages, and affected admin pages to clear any route/client cache state after mutations. The Next.js 16 server-action size limit is 6 MB, while server validation and Storage cap image files at 5 MiB.

The initial schema does not have automatic `updated_at` triggers. Phase 4 product/category/archive/image mutations explicitly set the relevant parent `updated_at` timestamp so the administrative product list has meaningful update dates.

## UI motion boundary

GSAP is isolated to small client components in `components/ui/motion.tsx` and `components/ui/page-transition.tsx`. Server-rendered pages retain data fetching, SEO, and database boundaries; client motion receives rendered children only. ScrollTrigger instances are scoped through `gsap.context()` and reverted on unmount. Reduced-motion users receive immediately visible, static content.

Interactive storefront navigation reads only `lib/storefront/public-config.ts`, which contains browser-safe brand/contact values. The server-only `lib/storefront/config.ts` remains out of the client module graph.

## Guest cart and checkout review

`CartProvider` is a client-only convenience layer around versioned local storage. Its persisted schema contains only product UUID, variant UUID, and bounded integer quantity; it never stores catalogue records, money, stock, delivery fees, customer details, or authentication data. `/cart` reconciles those identifiers through `app/checkout/actions.ts` and the server-only `lib/checkout/reconcile.ts` module. That module uses the normal SSR Supabase client under public RLS to reload active products, active variants, and public images, verify product/variant ownership and stock, and calculate integer-kobo line/subtotal values.

`/checkout` sends the serialized identifier-only cart and guest details to a Server Action. Zod validates both, then the action repeats reconciliation and derives the delivery fee server-side (currently zero because no approved fee rule exists). It returns a transient review state only. Phase 5 does not insert customers/orders/order items, reserve/decrement stock, send payment data, or contact Paystack.
