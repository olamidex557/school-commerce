# Phase 7 — CI/CD and production hardening

## Objective

Protect the existing Next.js 16, Supabase, and Paystack system with repeatable repository validation, deployment gates, safe smoke checks, documented production configuration, and a manual migration/rollback procedure. Commerce behavior is out of scope.

## Implementation

- Added a read-only GitHub Actions CI workflow for pull requests and `main` pushes.
- Added `npm run ci`, which runs lint, typecheck, all tests, production build, migration safety, secret exposure, server-secret boundary, and high-severity production dependency checks.
- Added a Vercel-compatible preview deployment-status smoke workflow for `/`, `/shop`, and `/checkout`.
- Added a manual, protected production smoke workflow. It checks public pages plus safe negative callback/webhook behavior without submitting a valid transaction or mutating commerce data.
- Added migration, secret, and server-only boundary scripts. They inspect repository contents only; none links to Supabase or runs migration SQL.
- Added Dependabot configuration for npm and GitHub Actions updates.
- Documented required Vercel/GitHub/Supabase configuration, branch protection, promotion, rollback, migration, and CI-failure policies in `docs/CI-CD.md`.

## Payment critical path

The CI test suite includes the existing Paystack response/reference, callback cookie handoff, HMAC signature, callback/webhook idempotency, and payment-result tests. Deployment smoke checks intentionally do not submit a valid payment or signed success webhook. The previously verified real test transaction and replay demonstrate the database fulfilment/idempotency behavior; CI protects the code-level contracts without using credentials.

## Status

**In progress.** The workflow definitions and local checks are implemented, but Phase 7 is not complete until they run successfully in the repository’s GitHub Actions environment, Vercel emits a preview deployment status consumed by the smoke workflow, branch/environment protections are configured, and an approved production smoke run is recorded. No production deployment, Supabase mutation, or CI/CD promotion is performed by this phase implementation alone.
