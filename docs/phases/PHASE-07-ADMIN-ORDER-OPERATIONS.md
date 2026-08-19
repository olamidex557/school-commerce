# Phase 7 — Admin order operations

## Status

**In progress: implemented locally and migrated remotely; controlled authenticated transition verification pending.** CI/CD remains a deferred future feature and is not part of this phase.

## 1. Goal

Give authorised administrators a secure, practical view of real orders and a controlled way to advance their operational handling after verified payment. The dashboard must improve fulfilment work without becoming a payment, refund, stock, or order-editing back door.

## 2. Scope

- Protected `/admin/orders` list and `/admin/orders/[id]` detail routes.
- Read-only customer/order/payment snapshots and order-item history for administrators.
- Search by order number, payment reference, and the order's immutable customer snapshots; status/date filters; newest/oldest sort; bounded pagination.
- Server-authorised, audited operational-status transitions.
- Empty, loading, expected-error, and stale-update UI states within the existing cream/ivory/espresso admin system.

## 3. Non-goals

- No customer account, refund, delivery-routing, notification, order editing, inventory-adjustment, or payment-retry UI.
- No Paystack initialization, verification, webhook, callback, checkout, cart, or idempotency redesign.
- No CI/CD, deployment, branch-protection, Dependabot, or production migration automation.

## 4. Existing order and payment architecture

Phase 6 creates an immutable order/item snapshot and `payment_attempts` record through the private `create_checkout_payment` RPC. Paystack initialization receives only the server-derived amount/reference. A signed webhook or callback recovery independently verifies the provider transaction and calls `fulfil_verified_paystack_payment`; that locked transaction conditionally deducts stock and updates the attempt/order exactly once.

`payment_attempts` is the provider-attempt ledger. Its reference, transaction ID, amount, currency, status, timestamps, and provider metadata are payment truth. `orders` preserves customer, fulfilment, item-price, total, and payment snapshots. This phase consumes those records; it does not create or amend them.

## 5. Order lifecycle

The existing `public.order_status` enum is reused. No operational enum values are introduced:

| Status            | Meaning                                                                              | Who may set it              |
| ----------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| `pending_payment` | Immutable checkout snapshot awaiting verified payment.                               | Payment RPC only            |
| `paid`            | Verified payment succeeded; stock was atomically deducted.                           | Payment fulfilment RPC only |
| `confirmed`       | Administrator has accepted the paid order for processing/ready work.                 | Authorised admin transition |
| `completed`       | Pickup/delivery handoff is complete.                                                 | Authorised admin transition |
| `cancelled`       | Operational handling was cancelled. This is not a refund and does not restore stock. | Authorised admin transition |

Allowed admin transitions are `paid → confirmed|cancelled` and `confirmed → completed|cancelled`. `completed` and `cancelled` are terminal. `pending_payment`, legacy `pending`, and `paid` are never admin-created targets. A future refund flow requires a separately designed provider-verification and stock policy.

## 6. Admin permissions

Only a valid Supabase session with a matching `admin_users` record may read order operations data or invoke a transition. Every route and Server Action calls `requireAdmin()`; the transition database function also checks `is_admin()` so a direct request cannot rely on UI protection.

## 7. Order-list requirements

The list shows order number, creation time, customer name snapshot, fulfilment method, total/currency, payment state, operational state, and an order-detail link. It supports validated search, payment-status and operational-status filters, optional inclusive date range, newest/oldest sort, and 25-row pagination. Search/filter values are URL state, not persisted browser data.

## 8. Order-detail requirements

The detail page shows the immutable order number/date, fulfilment/location/note, the minimum customer contact information needed for fulfilment, item names/SKUs/quantities/unit-price snapshots/line totals, subtotal/delivery/total, operational status, payment status, verification time, and administrator-safe payment reference/attempt metadata. It also shows the operational transition history supplied by this phase's audit table. It does not render a payment secret, authorization URL, or provider response body.

## 9. Search, filter, and sort requirements

All list query values are parsed server-side with Zod. Search is length-bounded and escaped before use in PostgREST filters. UUID route values are rejected before data access. Date range, page, status enums, and sort direction are allow-listed. An invalid request falls back to safe defaults rather than widening the query.

## 10. Operational-order status model

The dashboard manages only the existing `orders.status` operational projection after payment fulfilment. It never infers payment success from status and never alters `orders.payment_status`. `paid` is the verified-payment handoff state; `confirmed` is the active processing/ready state; `completed` is the final handoff state; `cancelled` records operational cancellation without compensating payment or stock effects.

## 11. Payment-status model

Payment status is read-only. The detail page presents the current order payment snapshot and attempt ledger statuses (`pending`, `initialized`, `success`, `failed`, `abandoned`, `reversed`) without deriving a new state. Only existing Paystack verification/fulfilment code may create a success state or update provider metadata.

## 12. What administrators may modify

An administrator may select one of the server-validated operational transitions for a paid/confirmed order. The database records the before/after status, administrator ID, and timestamp. No free-form order editing is in this phase.

## 13. What administrators must never modify

Administrators must not mark a payment paid, fulfil a payment, change a Paystack reference/transaction ID/amount/currency/verification time, edit immutable order/customer/item snapshots, create/delete payment attempts, change payment status, trigger refunds, or increment/decrement stock through the order UI.

## 14. RLS and security model

The existing broad admin mutation policies are too permissive for payment/order records. A focused migration will replace them with admin read policies for `orders`, `order_items`, `customers`, and `payment_attempts`, revoke direct authenticated DML for those tables, and expose one `security definer` `admin_update_order_status` RPC to authenticated callers. The RPC independently checks `is_admin()`, locks the order, validates the transition and expected update timestamp, writes the status/history atomically, and is the sole administrator mutation path. Service-role payment RPCs remain unchanged and retain their existing narrow grants.

## 15. Server-action/API boundaries

Server Components load narrowed admin DTOs through a server-only `lib/admin/orders.ts` module using the authenticated SSR client and RLS. A single `'use server'` action validates untrusted `FormData`, calls `requireAdmin()`, and invokes the restricted RPC. There is no client-side Supabase order mutation, service-role import, payment-secret import, or public order endpoint.

## 16. Auditability requirements

`order_status_events` records the order, from/to operational status, authenticated administrator UUID, and timestamp for every successful admin transition. It is admin-readable and direct writes are denied. Payment/provider events are not copied or edited; the existing payment-attempt timestamps remain their source of truth.

## 17. Customer-data handling

Use immutable order snapshots for fulfilment display rather than editing `customers`. Limit list exposure to the customer's name; keep email/phone/location/note on the protected detail page. Never put customer data in URLs, browser storage, diagnostics, public pages, or error messages.

## 18. Idempotency considerations

The phase does not invoke checkout/payment idempotency paths. Each transition is a status change with a required expected `updated_at`; repeating the same old submission fails safely as stale rather than inserting a duplicate history event. Existing verified-payment duplicate handling and stock deductions are not changed.

## 19. Concurrency considerations

The transition RPC locks the order row and compares the submitted update timestamp before changing state. If another admin or the payment fulfilment path changed the row, it returns a stale-state failure and the UI asks the administrator to reload. This prevents competing status changes and duplicate audit events.

## 20. UI and UX requirements

Use the established cream/ivory/espresso tokens, surface cards, form controls, compact admin buttons, clear status labels, responsive table-to-card layouts, visible focus states, and reduced visual noise. GSAP is not needed for operational tables. Payment status is visually distinct from operational status and is explicitly read-only.

## 21. Empty, loading, and error states

The list has an explicit no-orders/filtered-empty state, a route loading skeleton, and a generic protected load error boundary. The detail uses `notFound()` only for a valid UUID that is not visible under admin RLS. Expected mutation failures return a safe inline message; a stale-update message includes a reload action.

## 22. Testing strategy

Focused tests cover query/form validation, transition rules, malformed UUID/status rejection, action-source server authorization/no-service-role boundary, immutable payment/reference/amount/stock boundaries, and migration assertions for the RPC/RLS model. Existing payment/webhook/idempotency tests remain unchanged. Remote verification, if connection access permits, is read-only unless a temporary controlled test record is explicitly created and removed.

## 23. Migration requirements

A migration is required because the schema has no status-event audit record or compare-and-set transition mechanism, and current admin `FOR ALL` policies permit direct mutation of payment/order tables. It will not add payment fields, alter payment fulfilment, or introduce a new status enum. It will add only the operational audit table, read-only admin policies/direct-DML revocations, transition function/grants, and supporting indexes.

## 24. Rollback considerations

This is additive/security-tightening. If the UI needs correction, roll forward with a reviewed migration; do not weaken payment verification or re-enable broad payment mutation. The history table remains an audit record. No automated migration or production deployment is part of this phase.

## 25. Verification checklist

- [x] Anonymous callers cannot read order rows or invoke the transition RPC.
- [ ] A controlled non-admin caller is rejected and a controlled admin can read list/detail data under RLS.
- [ ] A controlled paid/confirmed order proves valid, invalid, and stale operational transition behavior without touching production commerce data.
- [x] The remote RPC interface/function body and revoked direct writes leave payment/reference/amount/verification/stock fields outside administrator control.
- [ ] A controlled concurrent/stale transition proves no duplicate history event is created.
- [x] Lint, typecheck, tests, production build, and diff check pass.
- [x] The linked migration is applied and remote catalog/policy verification is recorded without creating permanent test orders.

### Verification record — 2026-08-19

- Local lint, strict typecheck, 59 focused Vitest tests, production build, and `git diff --check` pass.
- `supabase db push` applied only `202608190001_admin_order_operations.sql`; the subsequent linked migration list reports `202608100001`, `202608100002`, `202608140001`, `202608180001`, `202608180002`, and `202608190001` as applied.
- The project RLS-policy assertion SQL passed. Remote catalog inspection confirmed `order_status_events`, its audit index/check constraint/RLS, the security-definer `admin_update_order_status` RPC, its `FOR UPDATE` lock, stale/transition/admin guards, audit insert, admin-only read policies, and revoked direct authenticated writes. The deployed RPC accepts only order ID, target operational status, and expected timestamp; its body does not reference payment status/reference/transaction/amount/verification fields or stock.
- An anonymous public-key read returned no order rows, and an anonymous call to the transition RPC returned HTTP 401. No remote order, customer, payment, stock, or existing RLS record was created or changed.
- The linked project currently has no available non-admin controlled identity or session credential, and the existing orders are not disposable test records. Therefore live admin/non-admin list/detail access, valid/invalid/stale transition behavior, and concurrent-history behavior remain pending an explicitly approved controlled identity and disposable controlled paid order.

## 26. Future extensions

Separately design refunds, delivery assignment/tracking, customer notifications, staff roles, immutable payment-event display, reporting, exports, and a customer-facing order-tracking model. CI/CD remains deferred in `docs/future/CI-CD.md`.
