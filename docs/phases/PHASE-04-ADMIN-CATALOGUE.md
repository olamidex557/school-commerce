# Phase 4 — Admin catalogue management

## Objective and scope

Build the protected administration workflow for categories, products, variants, stock, feature/archive state, and product images. This phase supplies the real catalogue consumed by the Phase 3 storefront. Cart, checkout, payments, orders, customer accounts, delivery, and loyalty remain out of scope.

## Starting architecture

- Administration requires a valid Supabase session and a matching `public.admin_users` record.
- Database access must use the authenticated SSR Supabase client and existing RLS policies; service-role access is not a normal application path.
- Product visibility is governed by the public RLS catalogue policies. No production inventory will be invented for this phase.

## Status

**In progress.** Local implementation and focused verification are complete; remote authenticated mutation/browser verification remains outstanding.

## Implementation

- Added protected routes: `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, and `/admin/categories`.
- Added product discovery with search, category/status filters, primary-image fallback, active-variant price, summed stock, low/out-of-stock state, featured/archive state, updated date, edit, and archive/restore actions.
- Added product create/edit forms for schema-backed name, stable explicit slug, description, category, featured/archive flags, and one or more variants. Variants hold price in integer kobo/minor units and stock; omitted existing variants become inactive rather than being deleted.
- Product/category/archive/image mutations explicitly maintain parent `updated_at` values because the existing schema has no automatic timestamp trigger.
- Added category create, inline edit, product count, restore, and guarded archive operations. Categories with active products cannot be archived.
- Added product image upload/removal and a lightweight storefront preview link. Upload appends an image position; first image is primary. Reordering is not implemented.

## Database and Storage changes

`202608140001_product_image_storage.sql` is an additive migration, applied remotely on 2026-08-14. It creates the public `product-images` Storage bucket with a 5 MiB JPEG/PNG/WebP allowlist and an `admins manage product image objects` policy. No application table or business column changed, and no product/category/image inventory was inserted.

## Authentication, authorization, and validation

All page data access is through `lib/admin/catalogue.ts`, which calls `requireAdmin()`. Every mutation independently calls `requireAdmin()` and then uses the authenticated SSR Supabase client under RLS. A valid session alone does not grant catalogue access; `public.admin_users` is still required.

`lib/validation/admin-catalogue.ts` uses Zod for names, slugs, descriptions, UUIDs, booleans, SKU, non-negative integer minor-unit prices, stock, and variants. Product/category/variant relationships are re-read server-side. The browser cannot supply a Storage path: the image action validates MIME, byte signature, size, product access, and creates `products/<product UUID>/<random UUID>.<extension>` itself. Errors are safe general/field messages, without SQL or Storage internals.

## Caching and revalidation

Catalogue reads remain request-time. Mutations call `revalidatePath` for home, shop, product paths, and affected admin pages so server/client route cache state does not outlive a mutation.

## Files changed

- `app/admin/(protected)/catalogue-actions.ts`, product/category routes, protected layout/home, and product loading UI.
- `components/admin/admin-product-form.tsx`, category create/edit forms, and image manager.
- `lib/admin/catalogue.ts`, `lib/admin/catalogue-state.ts`, `lib/admin/product-images.ts`, and `lib/validation/admin-catalogue.ts`.
- `supabase/migrations/202608140001_product_image_storage.sql`, `supabase/tests/rls-policy-verification.sql`, `.env.example`, and `next.config.ts`.
- Documentation listed in the changelog.

## Tests and verification

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed: 11 files, 26 tests. New tests cover product/category validation and action-source authorization/no-service-role/server-generated-upload-path boundaries; existing auth/storefront tests still pass.
- `supabase migration list` confirms all three migrations, including `202608140001`, are remote. `supabase db push` applied the Storage migration successfully.
- On 2026-08-14, `supabase db query --linked --file supabase/tests/rls-policy-verification.sql` completed without an exception. Anonymous remote reads of categories/products returned HTTP 200, while anonymous category/product mutation probes returned HTTP 401. Empty protected tables returned no public rows in the live project.
- Local HTTP probes confirm `/admin/login` renders and anonymous `/admin`, `/admin/products`, and `/admin/categories` requests use fixed `/admin/login` redirects.
- `npm run build` remains blocked before application compilation by the managed environment: Turbopack cannot create a helper process that binds a local port (`Operation not permitted`).

## Remaining verification and next phase

Browser automation was unavailable, so the existing administrator could not be signed in or exercised without requesting/handling a password. Consequently category CRUD, product/variant mutations, image upload/delivery, session refresh/sign-out, featured/stock/archive storefront lifecycle, and non-admin identity scenarios remain unverified. No temporary category/product/image was created, so cleanup was not needed and live state remains two categories and zero products. Phase 3 remains in progress because no product populated state has been tested. Do not begin Phase 5 until the outstanding Phase 4 authenticated/browser/build checks are resolved; the next planned scope is guest cart and checkout.

## Planned verification

Run lint, typecheck, Vitest, and production build. When authorised remote admin access and Storage configuration are available, verify mutations and public catalogue visibility with deliberately entered business/test data, without inserting fictional production inventory.
