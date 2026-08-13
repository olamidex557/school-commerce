# Roadmap

## Phase 1 — Foundation and tooling — completed

Objective: establish documentation, application tooling, secure integration boundaries, initial schema, and UI shell. Dependencies: none. Completion: project builds, lints, typechecks, tests, and has source-of-truth docs.

## Phase 2 — Supabase database and authentication — in-progress

Objective: provision Supabase, apply/validate schema, and add hardened admin login/guards. Dependency: Phase 1. Application code and migrations are complete; the project operator has pushed the migrations and REST exposes the schema. Local authentication audit/testing is complete. Completion remains in progress pending remote tests using anonymous, non-admin, and admin identities, plus RLS row-access verification. Development seeding is deferred to Phase 3 when catalogue work begins.

## Phase 3 — Customer storefront — in-progress

Objective: database-backed home, shop, category/search, and product pages. Dependency: Phase 2. Implementation and focused local tests are complete. Remote public catalogue reads and a production build must be rerun from an environment that permits outgoing Supabase access and Turbopack helper-process port binding before completion.

## Phase 4 — Cart and checkout — planned

Objective: persistent guest cart and server-calculated guest checkout. Dependency: Phase 3.

## Phase 5 — Paystack payments — planned

Objective: secure initialization, callback/webhook verification, and confirmation. Dependency: Phase 4.

## Phase 6 — Admin dashboard — planned

Objective: protected operational administration. Dependencies: Phases 2–5.

## Phase 7 — Testing, security and production hardening — planned

Objective: end-to-end coverage, abuse controls, accessibility, and deployment readiness. Dependencies: Phases 1–6.
