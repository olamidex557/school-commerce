# Campus Accessories

Campus-oriented storefront for phone accessories. This repository currently delivers the Phase 1 foundation: a Next.js UI shell, documentation, Supabase migration/auth scaffolding, and testing/tooling.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Supabase, Paystack, Zod, Lucide, ESLint, Prettier, and Vitest.

## Prerequisites and install

Node.js 22+ and npm are required.

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment

Fill in `.env.local` from `.env.example`. `NEXT_PUBLIC_*` values are browser-safe configuration. Keep `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` server-side only.

## Supabase and admin setup

Create a Supabase project, add the URL and anon key, then apply `supabase/migrations/202608100001_initial_schema.sql` with the Supabase CLI or SQL editor. Create an Auth user and insert its user UUID into `public.admin_users` using an authorized administrative database connection. RLS then controls database access.

## Paystack

Add `PAYSTACK_SECRET_KEY` only when Phase 5 implements transaction initialization and verification. Do not add secrets to git.

## Development and checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

See `docs/PROJECT.md`, `docs/ROADMAP.md`, and the phase files before starting work. Deployment requires production environment variables, an applied migration, a configured Supabase Auth redirect URL, and Paystack production credentials when payments are enabled.

# school-commerce
