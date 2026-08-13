# Phase 2 — Supabase backend and admin authentication

## Objective and scope

Establish Supabase client boundaries, secure administrator authentication/authorization, and validate the initial database policy design. Storefront, catalogue, checkout, payments, and operational admin features remain out of scope.

## Implementation

- Added a required-public-environment helper shared by browser, server, and proxy Supabase clients.
- Added `/admin/login` with validated email/password login, loading/error states, and a Supabase sign-out button.
- Added an `/admin` protected route group. It calls `requireAdmin()` in a server layout, while the Next.js proxy refreshes the session and checks the same database-backed authorization before permitting protected paths.
- Rebuilt sign-in as a Zod-validated server action: server-side IP/email rate limiting, Supabase password authentication, `is_admin()` verification, generic failures, and server-side redirect on success.
- Added shared Supabase SSR cookie options (`Path=/`, `SameSite=Lax`, and `Secure` in production), password visibility UI, and a server-action sign-out.
- Moved `useActionState` state to a normal auth-state module so the `'use server'` action module exports only an async function. Added targeted invalid-refresh-token recovery in the admin proxy.
- Added focused tests for anonymous, non-admin, admin, post-sign-out, validation, generic errors, rate limiting, and absence of manual browser persistence.

## Database changes

`202608100002_restrict_settings_access.sql` is additive and must follow the Phase 1 migration. It removes `public reads settings` because `settings` includes the private low-stock threshold, and restricts direct `is_admin()` execution to authenticated/service-role requests. It does not redesign tables or alter business data.

## Authentication and authorization

Supabase Auth email/password creates sessions through `@supabase/ssr`'s cookie adapter. The application neither reads nor writes tokens to localStorage, sessionStorage, IndexedDB, custom storage, or application-managed cookies. A user is an admin only when their `auth.uid()` appears in `public.admin_users`. Proxy, server layout, server action, and RLS all rely on this fact; client state never grants access. Non-admin authentication is followed by server-side Supabase sign-out and the same generic failure response as invalid credentials. Create admin users in Supabase Auth and add their UUID to `admin_users` through a privileged administrative connection.

If the admin proxy's `getUser()` receives Supabase's explicit invalid/missing refresh-token response, it clears only the configured project's `sb-<project-ref>-auth-token` cookie/chunks. `/admin/login` then renders normally; other `/admin/*` routes use a fixed login redirect. It does not clear a valid session or react to generic network errors with cookie deletion.

## Security decisions

Only active catalogue rows are publicly readable. Anonymous and normal authenticated users cannot read internal settings, customers, orders, order items, payment fields, or admin-user records. Fixed internal redirects prevent open redirects. Server-only credentials remain absent from browser code. Login attempts are rate-limited in server process memory using independent IP, SHA-256 email, and combined keys, configured by `ADMIN_LOGIN_RATE_LIMIT_MAX_ATTEMPTS` and `ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS`. This is explicitly not distributed protection and must be replaced or supplemented for multi-instance deployment.

## Files changed

- `app/admin/login/page.tsx`, `app/admin/(protected)/layout.tsx`, `app/admin/(protected)/page.tsx`
- `app/admin/login/actions.ts`, `app/admin/(protected)/actions.ts`
- `components/admin/admin-login-form.tsx`, `components/admin/admin-sign-out-button.tsx`
- `lib/auth/*`, `lib/security/*`, `lib/supabase/*`, `lib/validation/admin-auth.ts`
- `supabase/migrations/202608100002_restrict_settings_access.sql`, `supabase/tests/rls-policy-verification.sql`, `.env.example`
- Phase documentation listed in this repository's changelog.

## Tests and verification

Local verification passed on 2026-08-13: `npm run lint`, `npm run typecheck`, and `npm test` (9 files/18 tests). A local HTTP probe confirmed `/admin/login` renders its form and the server action module has only the async action export. Source audit found no manual browser persistence calls or service-role key use in client-side code. `npm run build` remains blocked by the documented managed-environment Turbopack port-binding restriction, not an application error.

The project operator reports that Supabase migrations have since been successfully pushed. During the 2026-08-11 audit, anonymous and service-role requests to migrated `categories` and anonymous requests to `orders` received HTTP 200, confirming the remote PostgREST schema is present. These endpoint checks do not prove row-level access behavior because no test rows or authenticated identities were supplied. No real remote login, non-admin rejection, admin login, sign-out, or row-level RLS scenario was claimed as tested.

## Remaining manual configuration

1. Run `supabase migration list` and `supabase/tests/rls-policy-verification.sql` against the remote project to record the actual applied migration/policy state.
2. Create controlled anonymous, non-admin Auth, and admin Auth test identities. Add only the designated administrator UUID to `public.admin_users`.
3. Verify remote anonymous `/admin` redirect, non-admin generic login failure, admin login, sign-out, and post-sign-out `/admin` denial.
4. Before multi-instance deployment, configure a managed/distributed rate limiter or platform control; the implemented limiter is process-local only.

## Completion status and next phase

Implementation is complete locally; Phase 2 remains **in-progress** until the remote RLS/auth checks and multi-instance rate-limit decision above complete. Then begin Phase 3 — database-backed customer storefront.
