# Phase 1 — Foundation and tooling

## Objective

Create a documented, buildable Next.js foundation with initial database and security boundaries.

## Implemented

- Documentation source of truth in `docs/`.
- Next.js App Router with strict TypeScript, Tailwind CSS, ESLint, Prettier, Vitest, path alias, metadata, robots, and sitemap.
- Responsive static home-page shell and reusable button/container components.
- Supabase browser/server client helpers, session-refresh/admin proxy, and initial SQL migration with RLS.

## Files and dependencies

See repository files and `package.json`; runtime dependencies are Next, React, Supabase, Zod, Lucide, and `clsx`. Development dependencies provide Tailwind, ESLint, Prettier, TypeScript, and Vitest.

## Database

Adds initial schema only; it has not been applied to a remote Supabase instance from this repository.

## Verification

`npm run lint`, `npm run typecheck`, `npm test` (one cart-total test), and `npm run build` pass on 2026-08-10.

## Remaining / next

Provision Supabase and execute Phase 2: validate migration/RLS on a real project and implement admin authentication.
