# Campus Accessories

## Purpose

Campus-focused e-commerce storefront for phone accessories, beginning with charging cables and earpieces.

## Users and model

Students buy as guests for campus delivery or pickup. Authenticated staff administer catalogue, settings, and orders. Revenue comes from product sales and configurable delivery fees.

## V1

- Home, shop, product, cart, checkout, Paystack payment, confirmation.
- Products, variants, categories, images, inventory, orders, customers, settings, and protected admin areas.
- Initial categories: Cables and Earpieces; categories are extensible.

## Out of scope

Customer accounts, order tracking, logistics management, shipping outside campus, discounting, and reviews.

## Rules

Guest checkout only; prices and totals are recalculated on the server; fulfillment is pickup or campus delivery; payment secrets never reach the browser.

## Technology

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase (Postgres, Auth, Storage), Paystack, Zod, Lucide, ESLint, Prettier, and Vitest.

## Status

Phase 6 is complete: server-authoritative checkout initialization, Paystack redirect/callback/result handoff, signed webhook + API verification, atomic stock deduction, payment attempts, and duplicate-webhook replay verification have been exercised with Paystack test data. CI/CD is intentionally deferred until a future production-readiness phase; no automated deployment or validation workflow is active. See `docs/future/CI-CD.md`.
