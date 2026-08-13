# Changelog

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
