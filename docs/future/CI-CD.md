# Future CI/CD and production readiness

**STATUS: DEFERRED**

CI/CD will be introduced later when the project is approaching production deployment. No GitHub Actions workflows, preview smoke tests, protected production smoke tests, branch-protection rules, Dependabot configuration, or automated deployment gates are active in this repository today.

When this work is resumed, the design should preserve the existing Next.js, Supabase, and Paystack boundaries. Automated validation should run `npm ci`, lint, typecheck, tests, production build, migration safety checks, secret exposure checks, server-only boundary checks, and an appropriate dependency audit. It must not receive Paystack or Supabase service-role secrets, execute `supabase db push`, create orders, initialize payments, fulfil payments, or alter stock.

Future preview checks should be read-only public-route probes. A protected production smoke check may verify public pages, callback behavior with no payment reference, and invalid webhook-signature rejection; it must not submit a valid payment or webhook event. Production migrations must remain an explicitly reviewed operator action using immutable, forward-compatible migrations and a forward-fix/backup recovery policy. The future implementation should document branch protection, environment approval, secrets ownership, rollback, payment-incident handling, and secret rotation before it is enabled.

No production deployment was performed, no production migration was performed, and no commerce behavior was changed while this design was deferred. The application remains fully functional without CI/CD.
