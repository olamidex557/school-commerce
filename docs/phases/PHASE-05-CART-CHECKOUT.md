# Phase 5 — Guest cart and checkout review

## Objective and boundary

Implement a guest cart, checkout details form, and server-authoritative pre-payment review. This phase deliberately does **not** create customers, orders, order items, inventory reservations, payments, Paystack requests, callbacks, or confirmations.

## Cart architecture

The browser persists only a versioned collection of `{ productId, variantId, quantity }` entries. It never stores product names, prices, stock, delivery fees, totals, or customer data. Invalid persisted values are discarded safely; duplicate product/variant pairs are merged and quantities are bounded for responsive UX.

The cart provider is a client-only convenience layer. Display data is reconciled against the current public catalogue. The cart and checkout routes send only cart identifiers and quantities to a server action.

## Authority and stock

The server validates each submitted identifier, reloads its active product and active variant through normal public RLS, verifies ownership and requested quantity, and calculates all line prices and totals from integer-kobo database values. It reports unavailable, changed-price, and insufficient-stock conditions without trusting client totals or delivery fees. It does not reserve or decrement stock.

## Checkout

Guest checkout collects only full name, Nigerian phone number, email, fulfillment method, delivery location when delivery is selected, and an optional short note. Zod validates all untrusted form fields server-side. Pickup does not require a location. The resulting review is transient client state and is explicitly labelled ready for payment; it does not write customer or order data.

Delivery fees are currently server-determined as `0` because no formal production fee rule is available. The browser cannot choose a fee. A future payment/order phase can replace the server fee resolver with a controlled settings-backed rule.

## Security

- No authentication data, customer details, prices, totals, stock, or delivery fees are persisted in local storage.
- Server reconciliation accepts only bounded product/variant IDs and quantities and rechecks active/ownership/stock state.
- Customer fields are length-limited, validated, and rendered as escaped React text only.
- No service-role client, Paystack secret, order/customer insertion, stock mutation, or unsafe redirect is introduced.

## Verification plan

Focused tests cover cart storage normalization and serialization, cart mutations, checkout field validation, authoritative line/total calculations, unavailable/archived/mismatched variants, and stock limits. Existing tests must remain green. Remote verification is read-only and uses existing catalogue data only; the current remote project has no real products, so populated UI verification requires business-approved inventory.

## Implementation and verification

- `npm run lint`, `npm run typecheck`, and `npm test` pass locally (12 test files / 30 tests).
- `npm run build` passes and compiles the `/cart` and `/checkout` App Router routes.
- A read-only remote public-catalogue probe returned HTTP 200 with zero products and zero variants. No inventory, customer, order, payment, or Stock row was inserted or modified.
- Browser automation is unavailable in this environment. Product selection, cart persistence after a browser refresh, mobile layout, and populated checkout review still require a browser session with business-approved real inventory.

## Known limitations

- Cart stock is checked at cart/review time but cannot reserve inventory; it must be checked again before any future payment/order operation.
- The cart does not retain historical displayed prices, by design. It always replaces presentation with the current server-authoritative price on reconciliation.
- Delivery is selectable, but delivery fee is presently zero until the business formalizes a fee rule. Pickup needs no location; delivery requires campus location text.
- The successful review ends at “Ready for payment”; there is intentionally no payment button, Paystack call, or order record.

## Next phase

Phase 6 may add payment initialization only after this review state is accepted. Paystack must receive a freshly server-revalidated amount, and order creation/reservation policy must be designed separately.
