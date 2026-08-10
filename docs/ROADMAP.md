# Roadmap

## Phase 1 — Foundation and tooling — completed

Objective: establish documentation, application tooling, secure integration boundaries, initial schema, and UI shell. Dependencies: none. Completion: project builds, lints, typechecks, tests, and has source-of-truth docs.

## Phase 2 — Supabase database and authentication — planned

Objective: provision Supabase, apply/validate schema, seed development data, and add hardened admin login/guards. Dependency: Phase 1. Completion: RLS and admin access verified against a real project.

## Phase 3 — Customer storefront — planned

Objective: database-backed home, shop, category/search, and product pages. Dependency: Phase 2.

## Phase 4 — Cart and checkout — planned

Objective: persistent guest cart and server-calculated guest checkout. Dependency: Phase 3.

## Phase 5 — Paystack payments — planned

Objective: secure initialization, callback/webhook verification, and confirmation. Dependency: Phase 4.

## Phase 6 — Admin dashboard — planned

Objective: protected operational administration. Dependencies: Phases 2–5.

## Phase 7 — Testing, security and production hardening — planned

Objective: end-to-end coverage, abuse controls, accessibility, and deployment readiness. Dependencies: Phases 1–6.
