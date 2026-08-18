# Changelog

## 2026-08-15 — Phase 5 (guest cart and checkout review)

- Added a versioned local guest cart that persists only product/variant UUIDs and quantities, plus cart navigation/count, stock-aware variant selection, quantity controls, `/cart`, and `/checkout`.
- Added server-side checkout reconciliation through public-RLS catalogue reads, Zod guest-detail validation, integer-kobo totals, and pickup/delivery review. Delivery fee is server-determined at zero pending an approved fee rule.
- No customer/order/order-item writes, inventory reservation, stock mutation, Paystack integration, payment initialization, or payment verification was added. Remote public verification confirms the real project still has zero products, so populated browser flow verification remains pending. Lint, typecheck, 30 tests, and production build pass; browser automation was unavailable.

## 2026-08-14 — UI/UX redesign

- Added a central Cream/Ivory/Espresso/Caramel design-token system, reusable surface/form/button primitives, and refreshed storefront/admin visual presentation without changing data, auth, or business logic.
- Added GSAP 3.15.0 page/scroll reveal primitives with context cleanup and reduced-motion support. No cart, checkout, Paystack, or order functionality was added.
- Corrected the interactive header to use browser-safe storefront configuration rather than importing a server-only module. Verification: lint, typecheck, 26 tests, and production build pass; browser visual tooling remains unavailable.

## 2026-08-14 — Phase 3/4 end-to-end verification attempt

- Confirmed remote migration history and ran the linked RLS-policy verification SQL successfully. Anonymous categories/products reads work; anonymous category/product mutation probes return HTTP 401. Public orders, customers, admin users, and settings returned no rows in the empty live project.
- Confirmed local `/admin/login` rendering and fixed anonymous redirects from `/admin`, `/admin/products`, and `/admin/categories`; confirmed local storefront empty/not-found states against the unchanged remote catalogue (two categories, zero products).
- Browser tooling was unavailable, so no password/session was handled and no temporary category, product, image, or non-admin identity was created. Authenticated lifecycle verification and cleanup therefore remain pending. Lint, typecheck, and 26 tests pass; the Turbopack build remains blocked by the managed environment's port-binding restriction.

## 2026-08-14 — Phase 4 (admin catalogue management)

- Added protected category/product/variant/stock/feature/archive administration, image upload/removal, product filters, storefront preview links, and server-side validated/revalidated mutations.
- Added and pushed `202608140001_product_image_storage.sql`: public `product-images` delivery with a 5 MiB JPEG/PNG/WebP limit and authenticated-admin-only object mutations.
- Verification: lint, typecheck, and 26 Vitest tests pass; migration list confirms all three migrations remotely. No inventory or test identity was inserted. Production build is still blocked by the managed runtime’s prohibited Turbopack helper-process port binding.

## 2026-08-13 — Phase 3 (live catalogue verification)

- Verified live anonymous Supabase reads: two public categories, zero public products, and no order rows exposed.
- Verified local home/shop query/invalid-product states against the live empty catalogue. Added focused supported-sort coverage.
- No seed or production inventory was inserted. Production build remains blocked by the managed environment's Turbopack helper-process port restriction.

## 2026-08-13 — Phase 2 (admin login recovery fix)

- Moved `useActionState` initial login state out of the `'use server'` action module; that module now exports only the async login action, satisfying Next.js 16 server-action rules.
- Added targeted invalid-refresh-token recovery in the admin proxy: clears only the matching Supabase SSR auth cookie/chunks and handles the request as unauthenticated.
- Added focused tests for the action export boundary and refresh-token error/cookie matching. Lint, typecheck, and 18 tests pass; the login route renders locally without the server-action export error.

## 2026-08-13 — Phase 3 (storefront implementation)

- Added database-backed home categories/featured products, responsive `/shop` catalogue, and `/shop/[slug]` detail routes using server-side public-RLS Supabase reads.
- Added reusable catalogue filters, card/grid, image fallback, availability badge, empty/error/loading states, and configurable contact link.
- Added validated URL search/category/sort behavior and safe product slug handling; no cart, checkout, payments, orders, accounts, or admin management was added.
- Verification: lint, typecheck, and 15 tests pass. Remote catalogue read could not run in this restricted environment. `next build` was blocked by managed-environment port-binding restrictions after starting Turbopack, not by a reported code/type error.

## 2026-08-11 — Phase 2 (admin sign-in audit)

- Rebuilt the login flow around a validated server action with server-only authorization and server-side redirect after `is_admin()` succeeds.
- Added shared Supabase SSR cookie options, generic non-admin handling, password visibility control, and bounded cleanup for the process-local sign-in limiter.
- Audited source for manual auth persistence and server-secret exposure; none was found. Verified local anonymous `/admin` redirect and login-page render. Remote REST confirms the applied schema, but real account/RLS tests remain pending.
- Verification: `npm run lint`, `npm run typecheck`, `npm test` (10 tests), and `npm run build` pass.

## 2026-08-10 — Phase 2 (PostgreSQL connection diagnosis)

- Confirmed Supabase CLI 2.109.1 is linked to the configured project and attempts the EU West pooler at port 5432.
- Confirmed REST reachability, system pooler DNS resolution, and TCP reachability to pooler ports 5432 and 6543.
- A single read-only `supabase db push --dry-run --debug` stalled during temporary login-role initialization and was stopped after 25 seconds before migration planning. The direct database hostname did not resolve on this machine, so pooler bypass is currently unavailable.
- Classified the blocker as PostgreSQL connection/login-handshake availability, not migration/schema failure. It remains inconclusive whether the source is a local network path, pooler-specific issue, or Supabase-side availability.

## 2026-08-10 — Phase 2 (application implementation)

- Added admin email/password login, sign-out, server-side protected admin layout, and proxy authorization using the database-backed `is_admin()` RPC.
- Added Phase 2 migration to remove anonymous settings access and restrict direct `is_admin()` execution to authenticated/service-role requests.
- Added focused admin access tests and an SQL RLS-policy verification script.
- Remote verification was not possible: no `.env.local`, no linked project, accessible CLI projects were inactive, and local Supabase could not start because Docker was unavailable.
- Verification: `npm run lint`, `npm run typecheck`, `npm test` (5 tests), and `npm run build` pass.

## 2026-08-10 — Phase 2 (remote validation attempt)

- Confirmed the configured Supabase URL accepts both anonymous and service-role REST requests, but `categories` returns HTTP 404 because the schema is not deployed.
- Attempted to link the project inferred from the configured URL. Supabase CLI rejected it because the authenticated CLI account lacks access to that project’s management endpoint; no migration was applied.
- Preserved all credentials and values: only variable names and HTTP statuses were inspected.

## 2026-08-10 — Phase 1

- Created documentation-first project foundation and initial project roadmap.
- Added Next.js/TypeScript/Tailwind application shell, initial responsive home page, linting, formatting, test foundation, SEO route metadata, and environment template.
- Added initial Supabase schema migration, RLS policies, client helpers, and admin proxy foundation.
- Verification: `npm run lint`, `npm run typecheck`, `npm test` (1 test), and `npm run build` all pass.
