# Development

Requires Node.js 22+ and npm. Copy `.env.example` to `.env.local`, then add Supabase and Paystack credentials. Commands: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run start`.

Admin sign-in rate limiting is configured server-side with `ADMIN_LOGIN_RATE_LIMIT_MAX_ATTEMPTS` and `ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS`; the documented defaults are development-safe process-local values. Do not put database passwords, service-role keys, or other private values in `NEXT_PUBLIC_*` variables.

For a stale Supabase admin session during development, visit `/admin/login`; the proxy now clears only Supabase cookies after an explicit invalid-refresh-token response. Do not manually delete, serialize, or move tokens into browser storage to work around session errors.

Apply Supabase migrations in lexical order using the Supabase CLI (`supabase link --project-ref <ref>`, then `supabase db push`) or the SQL editor. The CLI identity must have project database-management permission (Developer, Admin, or Owner access); a service-role API key cannot replace it. Keep migrations immutable after shared use. After migration, run `supabase migration list` and execute `supabase/tests/rls-policy-verification.sql` in the SQL Editor. TypeScript is strict; use `@/` imports; React components are PascalCase and utility/domain modules use kebab-case. Run lint, typecheck, tests, and build before completing a phase.

Phase 4 adds `SUPABASE_PRODUCT_IMAGES_BUCKET` (default `product-images`) and `PRODUCT_IMAGE_MAX_BYTES` (default 5 MiB). Apply `202608140001_product_image_storage.sql` before using uploads; it creates that bucket and enforces the same 5 MiB/JPEG/PNG/WebP limits in Storage. Admin image uploads use Next.js Server Actions, whose configured 6 MB body limit intentionally exceeds the Storage/application file limit slightly. Do not increase one limit without reviewing the other two.

GSAP is the only motion dependency. Keep animation code in small client components, animate transform/opacity rather than layout properties, use `gsap.context()` cleanup, and honour `prefers-reduced-motion`. Do not add another animation framework.

Browser-safe storefront branding/contact configuration belongs in `lib/storefront/public-config.ts`; do not import server-only configuration modules into an interactive client component.

For the current linked project, CLI migration commands time out while initializing the temporary login role through the pooler. Pooler DNS/TCP is reachable, so do not treat this as a migration error. The CLI supports `supabase link --skip-pooler` for direct database connections, but the direct `db.<ref>.supabase.co:5432` hostname must resolve and the network must support the required IPv6 route before using that mode.
