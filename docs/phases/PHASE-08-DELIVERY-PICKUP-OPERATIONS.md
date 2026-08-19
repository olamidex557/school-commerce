# Phase 8 — Delivery and pickup operations

## Status

**In progress: implemented locally and migrated remotely; controlled authenticated transition verification pending.** CI/CD remains deferred and is not part of this phase.

## 1. Goal

Give administrators a precise, auditable operational workflow for paid campus pickup and delivery orders while preserving Phase 6 as the sole authority for payment and stock fulfilment.

## 2. Business workflow

A customer selects pickup or campus delivery at checkout. The checkout snapshot records the method, delivery location when supplied, and an optional note. Paystack verification alone creates the paid operational handoff and deducts stock. Administrators then confirm handling. Confirmed pickup orders are ready for customer collection; confirmed delivery orders are prepared for dispatch, then explicitly move out for delivery before completion.

## 3. Current architecture

`orders.fulfillment_method` is the existing `pickup | delivery` enum. `location_snapshot`, contact snapshots, and note are immutable checkout data. `settings.pickup_information` already exists for internal pickup instructions but has no current settings UI. `delivery_fee_minor` is server-derived and currently zero; no pricing change belongs to this phase.

Phase 6 creates and fulfils paid orders through service-role payment RPCs. Phase 7 restricts authenticated administrators to RLS-backed reads and the `admin_update_order_status` security-definer RPC, which locks an order, compares `updated_at`, and inserts an `order_status_events` audit row.

## 4. Current order lifecycle

The deployed order enum is `pending`, `pending_payment`, `paid`, `confirmed`, `completed`, and `cancelled`.

- `pending_payment → paid` is Phase 6 payment fulfilment only.
- Phase 7 permits `paid → confirmed|cancelled` and `confirmed → completed|cancelled`.
- `completed` and `cancelled` are terminal.

This is sufficient for pickup: `confirmed` means ready for collection and `completed` means collected. It is not sufficient for delivery because it cannot distinguish an order being prepared from one handed to a courier.

## 5. Pickup workflow

`paid → confirmed → completed`

- `confirmed` is displayed as **Ready for pickup** for pickup orders.
- `completed` records collection.
- A second collection attempt is impossible because `completed` has no outgoing transition.
- `cancelled` is operational cancellation only: it is not a refund and does not restore stock.
- Pickup instructions remain the existing internal `settings.pickup_information`; this phase does not create customer-facing instruction publishing or settings editing.

## 6. Delivery workflow

`paid → confirmed → out_for_delivery → completed`

- `confirmed` is displayed as **Preparing delivery** for delivery orders.
- `out_for_delivery` records the operational handoff to campus delivery.
- `completed` means delivered.
- `cancelled` may be selected from `paid`, `confirmed`, or `out_for_delivery`; it records a failed/cancelled operation only and has no automatic financial or stock effect.
- The existing immutable campus location and optional note are the delivery instructions. Delivery pricing remains zero until a separately approved server-side fee rule exists.

## 7. Proposed operational states and transition diagram

Only one new enum value is necessary: `out_for_delivery`. No `ready` or `collected` value is needed because the existing `confirmed` and `completed` values have clear method-specific meanings.

```text
Paystack verification (Phase 6 only)
pending_payment → paid

Pickup
paid → confirmed (ready for pickup) → completed (collected)
  └→ cancelled                       └→ cancelled

Delivery
paid → confirmed (preparing delivery) → out_for_delivery → completed (delivered)
  └→ cancelled                          └→ cancelled       └→ cancelled
```

`completed` and `cancelled` have no outgoing transitions. `paid` remains a payment-owned state: administrators may only leave it through the existing operational transition RPC.

## 8. Admin capabilities

Administrators may read protected order/customer/item/payment snapshots and select only the transition offered for that order's current status and immutable fulfilment method. The detail page must distinguish payment state from fulfilment state, label pickup/delivery status in business terms, show the existing pickup instructions when available, and retain the transition timeline.

## 9. Customer capabilities

This phase does not add customer accounts, public order lookup, tracking URLs, or customer status pages. The existing payment-result page remains a payment confirmation surface only. It must not expose operational status through a guessable reference or disclose another customer's order.

## 10. Payment and stock immutability

No delivery/pickup action may set payment status, Paystack reference, transaction ID, amount, currency, verification timestamp, payment-attempt metadata, or order snapshots. It may not invoke Paystack, fulfil a payment, deduct/restock inventory, or bypass checkout/payment idempotency. `cancelled` is never a refund or automatic stock restoration.

## 11. RLS and security model

The Server Action continues to call `requireAdmin()` and Zod-validates UUID, target status, and expected timestamp. The database transition function must independently check `is_admin()`, lock the order, validate method-specific transitions, compare `updated_at`, update only `orders.status`/`updated_at`, and insert one `order_status_events` row atomically. It remains the only administrator mutation path. There is no client Supabase mutation, service-role import, or payment secret in this feature.

## 12. Concurrency and auditability

The existing compare-and-set timestamp plus row lock remains mandatory. Replayed/stale requests fail before a status change or duplicate audit event. Every successful transition writes the existing order ID, from/to statuses, actor UUID, and timestamp to `order_status_events`; no separate fulfilment event table is required.

## 13. Customer-data requirements

The list remains limited to the customer name and operational summary. Detail retains only the existing protected fulfilment contact/location/note snapshots. Pickup instructions are internal admin context. Customer data must not enter URLs, local storage, logs, public APIs, or error messages.

## 14. UI requirements

Use the established cream/ivory/espresso admin hierarchy and Lucide icons already used by the order detail. Avoid table animation; GSAP is not needed. Payment and fulfilment are visually separate, with method-specific labels and explicit read-only payment language. Loading, empty, expected action-error, and stale-reload states remain in the existing Phase 7 patterns.

## 15. Notifications

Notifications are not implemented. Future notification events may include confirmation, pickup readiness, delivery dispatch, delivery completion, cancellation, and failed-delivery handling. Any notification implementation requires separately designed consent, delivery channels, retry/audit policy, and customer-safe order lookup.

## 16. Database changes and migration plan

A migration is required because `out_for_delivery` is absent from `public.order_status`, and the current RPC cannot validate delivery-specific transitions. The immutable migration will:

1. Add `out_for_delivery` to the existing enum without changing payment enums or data.
2. Replace only `admin_update_order_status` with a method-aware function that retains its signature, authorization, row lock, stale guard, narrow status update, and audit insert.
3. Permit `confirmed → completed|cancelled` for pickup, `confirmed → out_for_delivery|cancelled` for delivery, and `out_for_delivery → completed|cancelled` for delivery.

It will not change payment, checkout, stock, customer, item, RLS policy, grants, or delivery-fee logic. It must be reviewed before any remote application; remote application is not part of the initial implementation step.

## 17. Rollback strategy

This is an additive enum/state-machine change. Do not remove a used enum value or roll back operational history. If a defect is found, use a reviewed forward corrective migration that preserves payment/stock boundaries and auditability. No automatic production migration or deployment is allowed.

## 18. Testing strategy

Focused tests cover pickup and delivery transition maps, method-specific invalid transitions, terminal cancelled/completed restrictions, malformed IDs/statuses, stale-action handling, source/migration audit boundaries, payment/stock immutability, and audit creation. Existing payment/idempotency tests remain unchanged. Runtime transition/concurrency/RLS tests require an explicitly approved controlled identity and disposable controlled paid order; existing customer orders are never test fixtures.

## 19. Edge cases

- Unpaid/pending orders cannot enter fulfilment.
- A delivery order cannot complete before dispatch.
- A pickup order cannot enter `out_for_delivery`.
- A completed/cancelled order cannot be reopened.
- A stale browser submission cannot create a second event.
- Blank pickup `location_snapshot` remains valid because it is deliberately optional at checkout.
- Missing `pickup_information` is displayed as unavailable to admins, not silently invented.

## 20. Future extensions

Pickup-instruction settings UI, delivery assignment, delivery failure reasons, proof of delivery/collection, customer notifications, secure guest tracking, refunds, stock-return policy, and reporting remain separate phases.

## 21. Verification checklist

- [x] Migration was reviewed as the sole next unapplied migration and applied to the linked project.
- [x] Admin UI shows method-specific fulfilment labels, existing pickup information, and only permitted action targets.
- [x] The deployed RPC retains admin authorization, stale locking, and status-event audit rows.
- [x] Deployed-function inspection confirms payment/stock fields are outside the RPC; checkout and Paystack paths are unchanged.
- [x] Focused tests and lint/typecheck/build/diff checks pass.
- [x] Remote schema/policy and anonymous-denial verification is recorded.
- [ ] Controlled admin/non-admin pickup/delivery transitions and stale/concurrent behavior are verified without using customer orders.

### Verification record — 2026-08-19

- `202608190002_delivery_pickup_operations.sql` was the sole pending migration and was applied with `supabase db push`. The linked migration list now reports migrations `202608100001` through `202608190002` as applied.
- Remote catalog inspection confirmed the `out_for_delivery` order-status label and the deployed `admin_update_order_status` RPC. Its method-aware pickup/delivery guards, `FOR UPDATE` lock, stale guard, audit insert, continuing admin read policy, and revoked direct authenticated order update privilege are present.
- The deployed transition RPC does not reference payment status, Paystack references, or stock. The project RLS-policy assertion SQL passed. An anonymous public-key order read returned no rows and an anonymous delivery-status RPC call returned HTTP 401.
- No order, customer, payment, inventory, or existing status-event row was created or changed. No controlled non-admin session or disposable controlled paid order is available, so live admin/non-admin, valid/invalid/stale, and concurrent transition execution remains pending.

### Runtime-environment assessment — 2026-08-19

- Supabase CLI project discovery found one linked Campus Accessories project (`school commerce`) and no separate configured test project. The two other accessible Supabase projects are unlinked and unrelated to this application, so they were not inspected or used.
- The linked project has two Auth users and two `admin_users` rows, so no controlled non-admin identity is available. Its current non-mutating inventory is five orders, six payment attempts, and zero status events; these are existing customer commerce records and were not inspected individually, modified, or used as fixtures.
- Creating only a temporary non-admin identity could test one denial path, but it would not safely enable the required paid pickup/delivery lifecycle, stale, concurrent, audit, payment-immutability, or stock-immutability checks. Those require a disposable controlled paid order, which must not be created in the linked customer-data project.
- Required next step: provision an isolated Supabase test project with these migrations, a disposable controlled administrator and non-admin identity, and controlled catalogue/order fixtures. Run the full authenticated transition matrix there and remove all fixtures afterward. Phase 8 remains in progress until that occurs.
