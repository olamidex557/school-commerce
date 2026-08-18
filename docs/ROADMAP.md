# Roadmap

## Phase 1 — Foundation and tooling — completed

Objective: establish documentation, application tooling, secure integration boundaries, initial schema, and UI shell. Dependencies: none. Completion: project builds, lints, typechecks, tests, and has source-of-truth docs.

## Phase 2 — Supabase database and authentication — in-progress

Objective: provision Supabase, apply/validate schema, and add hardened admin login/guards. Dependency: Phase 1. Application code and migrations are complete; the project operator has pushed the migrations and REST exposes the schema. Local authentication audit/testing is complete. Completion remains in progress pending remote tests using anonymous, non-admin, and admin identities, plus RLS row-access verification. Development seeding is deferred to Phase 3 when catalogue work begins.

## Phase 3 — Customer storefront — in-progress

Objective: database-backed home, shop, category/search, and product pages. Dependency: Phase 2. Implementation, focused tests, public read/mutation-boundary checks, and live public catalogue reads are complete. The live catalogue has two categories but no products, so populated image/product-detail/filter/sort states cannot yet be exercised. Completion remains in progress pending authenticated UI lifecycle verification and a production build in an environment that permits Turbopack helper-process port binding.

## Phase 4 — Admin catalogue management — in-progress

Objective: let authorised administrators manage the real categories, products, variants, stock, feature/archive state, and images served by the Phase 3 storefront. Dependencies: Phases 2–3. The protected routes, validated server actions, Storage migration, focused local tests, remote migration/policy check, and anonymous mutation-denial check are complete. Completion awaits remote authenticated admin/non-admin mutation and browser verification with business-approved temporary inventory.

## Phase 5 — Cart and checkout — in-progress

Objective: persistent guest cart and server-calculated pre-payment checkout review. Dependency: Phase 4. Local implementation and focused tests are complete; real-inventory browser and normal-environment production-build verification remain pending.

## Phase 6 — Paystack payments — planned

Objective: secure initialization, callback/webhook verification, and confirmation. Dependency: Phase 5.

## Phase 7 — Orders, dashboard, and production hardening — planned

Objective: order operations, dashboard, end-to-end coverage, accessibility, and deployment hardening. Dependencies: Phases 1–6.
