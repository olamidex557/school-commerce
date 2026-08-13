# Phase 3 — Database-backed storefront

## Objective

Build the customer catalogue from Supabase public data: home featured products and categories, shop search/filter/sort, and product detail pages. Cart, checkout, payments, customer accounts, order features, and admin product management are explicitly excluded.

## Starting decisions

- Catalogue reads use the server Supabase client with the anonymous key and normal RLS; the service-role key is not used.
- The existing public policies determine visibility: non-archived products/categories, active variants, and images belonging to public products.
- URLs carry shop query state. Query values will be parsed and constrained in server-side data-access code.
- Next.js Cache Components are not enabled. Catalogue pages will use request-time server data to avoid a permanently stale catalogue; future admin mutations can introduce tagged revalidation.

## Routes and components

- `/`: real category links and featured-product grid.
- `/shop`: search, category filters, sort, loading, empty, and generic error states.
- `/shop/[slug]`: product metadata, gallery/fallback image, price, availability, active variants, product information, contact CTA, loading, and not-found states.
- Reusable storefront components: `SiteHeader`, `SiteFooter`, `CatalogueFilters`, `ProductGrid`, `ProductCard`, `ProductImage`, `StockBadge`, and catalogue state components.

## Data access and discovery

`lib/catalogue/catalogue.ts` is server-only. It uses `createClient()` from the existing server Supabase layer with public RLS—not a service-role client—and selects only catalogue fields. Search is a database-backed `ilike` filter over product name/description after a constrained Zod input parse. Category filtering is a relational slug filter. Sorting is applied to the mapped public results: featured/newest, price ascending/descending using the lowest active variant price, or name. Query state is validated in `lib/catalogue/query.ts` and represented in shareable `/shop` URLs.

## Images, inventory, SEO, and performance

Images use the configured Supabase public Storage bucket and `next/image`; missing buckets/images receive an accessible visual fallback. The app does not expose raw stock counts or the internal low-stock setting. It presents in stock when an active variant has positive stock, otherwise out of stock. Dynamic product metadata uses real product name, description, and first image. Product slugs are constrained and unknown products use Next.js not-found behavior. Server components avoid transferring catalogue data-fetching logic to the client. Cache Components are disabled; request-time reads avoid permanently stale catalogue data until Phase 6 can add deliberate revalidation.

## Security

No service-role key, customer/order data, settings, or raw database errors are exposed. Query parameters are validated; Supabase parameterized filters are used; descriptions render as escaped text without raw HTML. Public image URLs are generated only from configured Storage paths.

## Tests and verification

`npm run lint` and `npm run typecheck` pass. `npm test` passes 7 files / 15 tests, covering search/filter/sort query parsing, slug validation, availability, and existing business/auth tests. The restricted execution environment could not reach the remote Supabase API, so live catalogue reads, data-backed product detail, RLS row behavior, and image delivery were not verified here. Interactive browser tooling was unavailable.

`npm run build` began successfully but Turbopack failed because this managed environment forbids a required helper process from binding a port (`Operation not permitted`); no code/type compilation error was reported. It must be rerun in a normal development/CI environment.

## Files changed

- `app/page.tsx`, `app/shop/**`
- `components/storefront/**`
- `lib/catalogue/**`, `lib/storefront/config.ts`
- `next.config.ts`, `.env.example`
- Project documentation listed in the changelog.

## Remaining work and next phase

Phase 3 stays **in progress** until a network-enabled environment verifies real public categories/products, filtering/sorting, product metadata/images, invalid route, responsive layout, and a production build. No development seed or production inventory was inserted. After those checks, the recommended next phase is Phase 4 — persistent guest cart and server-calculated checkout.
