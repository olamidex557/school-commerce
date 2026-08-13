# Development

Requires Node.js 22+ and npm. Copy `.env.example` to `.env.local`, then add Supabase and Paystack credentials. Commands: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run start`.

Admin sign-in rate limiting is configured server-side with `ADMIN_LOGIN_RATE_LIMIT_MAX_ATTEMPTS` and `ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS`; the documented defaults are development-safe process-local values. Do not put database passwords, service-role keys, or other private values in `NEXT_PUBLIC_*` variables.

For a stale Supabase admin session during development, visit `/admin/login`; the proxy now clears only Supabase cookies after an explicit invalid-refresh-token response. Do not manually delete, serialize, or move tokens into browser storage to work around session errors.

Apply Supabase migrations in lexical order using the Supabase CLI (`supabase link --project-ref <ref>`, then `supabase db push`) or the SQL editor. The CLI identity must have project database-management permission (Developer, Admin, or Owner access); a service-role API key cannot replace it. Keep migrations immutable after shared use. After migration, run `supabase migration list` and execute `supabase/tests/rls-policy-verification.sql` in the SQL Editor. TypeScript is strict; use `@/` imports; React components are PascalCase and utility/domain modules use kebab-case. Run lint, typecheck, tests, and build before completing a phase.

For the current linked project, CLI migration commands time out while initializing the temporary login role through the pooler. Pooler DNS/TCP is reachable, so do not treat this as a migration error. The CLI supports `supabase link --skip-pooler` for direct database connections, but the direct `db.<ref>.supabase.co:5432` hostname must resolve and the network must support the required IPv6 route before using that mode.
