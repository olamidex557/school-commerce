# Architecture

Next.js 16 App Router uses server components by default; interactive cart and form controls are client components. Route handlers and server actions are reserved for validated, sensitive mutations.

`lib/supabase/server.ts` creates cookie-aware server clients; `lib/supabase/client.ts` is browser-safe; both obtain only public configuration through `lib/supabase/env.ts`. The service-role key is intentionally unused and never imported into browser code. `proxy.ts` refreshes Supabase sessions and calls the RLS-backed `is_admin()` RPC for `/admin/*` before allowing a request through.

`/admin/login` is the only login route. Its server action validates credentials with Zod, applies the login limiter, authenticates through the server Supabase client, verifies `is_admin()`, and redirects server-side only after authorization succeeds. The `'use server'` module exports only the async action; `useActionState`'s type and initial state live in `lib/auth/admin-login-state.ts`. The server Supabase cookie adapter establishes and clears the session. `app/admin/(protected)/layout.tsx` independently repeats the server-side `requireAdmin()` check, so authorization does not depend on proxy behavior or hidden navigation. The login client component is limited to form state and password visibility; it never receives or persists a session token.

The Supabase browser client uses the official `@supabase/ssr` cookie adapter with shared `Path=/`, `SameSite=Lax`, and production-only `Secure` options. The application does not use localStorage, sessionStorage, IndexedDB, custom persistence, or manually serialized tokens for authentication. Cookie state is managed only by Supabase SSR clients.

The `/admin/*` proxy detects Supabase's explicit invalid-refresh-token response from `getUser()`. It clears only the current project's Supabase auth cookie/chunks, treats the request as unauthenticated, and returns the login page or a fixed login redirect. It does not clear valid sessions or retry a known-invalid refresh token on later requests.

Product/order data will be read through scoped server-side data-access modules. Checkout will create orders via a transactional database RPC or server route that recalculates prices and reserves stock. Paystack initialization and verification are server-only modules/handlers.

Environment values prefixed `NEXT_PUBLIC_` are browser-safe. Supabase URL and anon key are public configuration; Supabase service role and Paystack secret are server-only. Folder conventions: routes in `app`, reusable UI in `components`, server/domain logic in `lib`, shared schemas in `lib/validation`, migrations in `supabase/migrations`, and documentation in `docs`.

Data flow: browser UI → validated server action/route handler → Supabase with user/session context → RLS-protected Postgres. Payment callbacks → server verification → idempotent order/payment update.

## Storefront catalogue

Customer catalogue pages are React server components. `lib/catalogue/catalogue.ts` is server-only and uses the standard server Supabase client with the anon key and public RLS policies; it never imports the service-role key. It maps only public product/category/active-variant/image fields into presentation types. `/`, `/shop`, and `/shop/[slug]` fetch data server-side. `/shop` keeps search, category, and sort state in validated URL search parameters.

Cache Components are not enabled in this project. Catalogue requests remain request-time server reads so future admin changes are not permanently stale. Once Phase 6 mutations exist, tagged/on-demand revalidation can be introduced deliberately. Supabase Storage image paths are converted to public URLs only when `SUPABASE_PRODUCT_IMAGES_BUCKET` is configured; Next Image accepts Supabase Storage URLs through `next.config.ts` remote patterns.
