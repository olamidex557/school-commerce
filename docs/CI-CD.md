# CI/CD and production hardening

## Scope and safety boundary

Phase 7 adds validation and deployment gates around the existing Next.js 16, Supabase, and Paystack implementation. It does not initialize payments, call Paystack from CI, write orders, fulfil payments, alter stock, or execute Supabase migrations automatically.

`CI` runs for pull requests to `main` and all branch pushes. It uses Node 22, `npm ci`, linting, strict TypeScript checks, all Vitest tests, a production Next build, immutable-migration safety checks, repository secret scanning, server-secret boundary checks, and a production-dependency audit at high severity. Build-only placeholder public Supabase values are supplied by the workflow; no real service-role or Paystack credential is available to CI.

## GitHub workflows

- `.github/workflows/ci.yml` is the required `CI / validate` check. It has read-only repository permissions and never runs `supabase db push`.
- `.github/workflows/preview-smoke.yml` runs after a successful non-production deployment status. It checks public `/`, `/shop`, and `/checkout` endpoints only.
- `.github/workflows/production-smoke.yml` is deliberately manual and protected by the `production` GitHub Environment. It accepts an already-deployed HTTPS URL, checks public pages, confirms the callback safely redirects when no reference is supplied, and confirms an invalidly signed webhook is rejected with 401. It never submits a valid payment or webhook payload.
- Dependabot proposes weekly npm and GitHub Actions updates; its pull requests must pass the same required checks and normal review.

## Required configuration

Configure Vercel environment variables by environment, never in Git or browser code:

| Variable                                                                        | Preview                                                                 | Production                                                 | Notes                                                                               |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                                      | required                                                                | required                                                   | Public project URL; use an isolated preview/test project where possible.            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                                                 | required                                                                | required                                                   | Browser-safe anon key only.                                                         |
| `SUPABASE_PRODUCT_IMAGES_BUCKET`                                                | optional                                                                | required when image delivery is enabled                    | Defaults to `product-images`.                                                       |
| `PRODUCT_IMAGE_MAX_BYTES`                                                       | optional                                                                | required when uploads are enabled                          | Must remain at or below the Storage policy limit.                                   |
| `ADMIN_LOGIN_RATE_LIMIT_MAX_ATTEMPTS` / `ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS` | optional                                                                | required                                                   | Platform/distributed rate limiting is still required for multi-instance production. |
| `SUPABASE_SERVICE_ROLE_KEY`                                                     | omit unless a restricted test payment environment is intentionally used | required for private payment RPC access                    | Server-only; never use a `NEXT_PUBLIC_` name.                                       |
| `PAYSTACK_SECRET_KEY`                                                           | omit, or use a dedicated Paystack test key only                         | required only after production Paystack readiness approval | Server-only; production must use the live key.                                      |
| `PAYSTACK_CALLBACK_URL`                                                         | optional for non-payment previews                                       | required                                                   | Fully qualified HTTPS public callback URL for that environment.                     |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`                                               | optional                                                                | optional                                                   | Not used by the redirect integration.                                               |

GitHub Actions needs no application secret for the repository CI workflow. If deployment is managed by the Vercel GitHub integration, do not add Vercel credentials to Actions. If the team later chooses CLI-driven deployments, store `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as environment-scoped GitHub secrets and restrict them to the deployment workflow only. Do not add `SUPABASE_ACCESS_TOKEN`, database passwords, service-role keys, or Paystack keys to CI. Supabase migration access belongs to an approved operator/production environment, not pull-request automation.

## Branch and deployment gates

Protect `main` in GitHub with required pull-request review, no force pushes, no branch deletion, and required passing checks: `CI / validate` and the Vercel preview deployment check. Require the branch to be up to date before merge and restrict direct pushes to designated maintainers.

Vercel should create previews from pull requests and deploy production only from protected `main`. Enable Vercel deployment protection for previews containing any non-public integration configuration. Configure the GitHub `production` Environment with required reviewer approval before running the manual production smoke workflow.

Deployment sequence:

1. Open a pull request; all CI and preview smoke checks must pass.
2. Review migration impact and payment/security changes separately.
3. Apply approved, backward-compatible migrations manually before or during the approved production window.
4. Merge to protected `main`; allow Vercel to deploy the already-validated commit.
5. Run the protected production smoke workflow against the deployed HTTPS URL.
6. Perform a separately approved Paystack test/live readiness check; a smoke check is not payment confirmation.

## Migration procedure and rollback

Migrations are immutable and reviewed SQL. `check:migrations` checks filename/version integrity and blocks common destructive statements, but it is not a substitute for database review. CI never links to or mutates Supabase.

Before a production migration, an approved operator must review the SQL and Supabase backup/PITR posture, run `supabase migration list --linked`, apply only the reviewed migration with `supabase db push`, then run `supabase migration list --linked` again and the existing RLS verification where applicable. Use expand/contract migrations: deploy compatible schema additions first, deploy code, and postpone destructive cleanup to a separately reviewed release. Never rewrite an already-applied migration.

If a deployment fails, stop promotion, keep the prior Vercel deployment available, and promote that known-good deployment. Do not roll back a database by force or run destructive SQL automatically. For a bad additive migration, prepare and review a forward corrective migration; use Supabase backup/PITR only under an approved incident procedure.

## Failure policy

Any failed CI, preview smoke, migration-safety, secret-boundary, or dependency-audit gate blocks merge or production promotion. Treat an exposed secret as an incident: revoke/rotate it at the provider, remove it from history according to the incident plan, and rerun checks. Treat a payment/webhook failure as a release blocker; do not bypass its verification or stock/idempotency controls to restore availability. Document the failure, corrective pull request, and successful rerun before retrying deployment.
