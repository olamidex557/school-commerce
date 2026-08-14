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

`npm run lint` and `npm run typecheck` pass. `npm test` passes 9 files / 19 tests, including search/filter/sort query parsing, supported sort behavior, slug validation, availability, and existing business/auth tests. On 2026-08-13, live anonymous Supabase reads returned two categories, zero products, and no order rows. Local runtime verification confirms `/`, `/shop`, query URLs, and an invalid product route render their expected empty/not-found UI from that real empty catalogue. Interactive browser tooling was unavailable.

On 2026-08-14, end-to-end verification reconfirmed that the remote public API returns two category rows and zero product rows. Local HTTP probes confirm `/`, `/shop`, category/search URLs use real empty states and `/shop/invalid-product-slug` renders the not-found UI. Public categories/products reads return HTTP 200; anonymous category/product write attempts return HTTP 401. The authenticated browser surface was unavailable, so no temporary product could be created through the admin UI to test populated cards, filters, sort results, detail metadata, image delivery, stock, featured state, or archive removal.

`npm run build` began successfully but Turbopack failed because this managed environment forbids a required helper process from binding a port (`Operation not permitted`); no code/type compilation error was reported. It must be rerun in a normal development/CI environment.

## Files changed

- `app/page.tsx`, `app/shop/**`
- `components/storefront/**`
- `lib/catalogue/**`, `lib/storefront/config.ts`
- `next.config.ts`, `.env.example`
- Project documentation listed in the changelog.

## Remaining work and next phase

Phase 3 stays **in progress** until a normal build environment completes `npm run build`, and real inventory exists to verify product cards, filtering/sorting against results, product metadata/images, and responsive layouts. Phase 4 now supplies the protected catalogue-management workflow needed for that real inventory, but no product was inserted during verification because browser-based authenticated UI access was unavailable. After both phases’ verification is complete, the next planned scope is Phase 5 — persistent guest cart and server-calculated checkout.
