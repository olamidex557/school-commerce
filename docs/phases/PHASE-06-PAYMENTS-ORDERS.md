# Phase 6 — Paystack payments, orders, and idempotency

## Objective

Accept guest payments through Paystack without trusting browser totals or callback visits. The server initializes transactions, while a signed webhook and server-side transaction verification are the only paths that can fulfil an order.

## Design

- A checkout idempotency UUID is generated once by the checkout UI. The database maps it to one pending order and one still-valid payment attempt, so repeated submission does not create extra attempts.
- The initialization RPC re-reads active product variants, prices, and stock, derives all integer-kobo totals, creates immutable order-item snapshots, and creates a unique Paystack reference. It has no client-supplied monetary inputs.
- Orders begin at `pending_payment`; stock is not reserved or deducted at this point. A failed or abandoned attempt can be retried by creating another attempt attached to the same unpaid order (future UI work can expose that recovery affordance).
- `charge.success` webhooks are authenticated over the exact raw body using HMAC-SHA512 and a timing-safe comparison. The callback route is convenience/recovery only: it verifies against Paystack and never trusts query parameters.
- Before fulfilment, the server verifies `data.status`, reference, amount, and currency with Paystack. The SQL fulfilment function locks the payment/order rows, conditionally decrements each variant only when sufficient stock remains, then marks the payment and order successful in one transaction. A duplicate webhook, callback + webhook race, or repeat verification returns the existing order without deducting stock again.

## State machines

Payment attempts use `pending → initialized → success`, or `pending/initialized → failed|abandoned|reversed`. Terminal `success` never moves back to a pending state. Provider transitional statuses remain `pending` until a later authoritative verification.

Orders use `pending_payment → paid` in this phase. Fulfilment states are intentionally deferred. An order is created as the immutable checkout snapshot before handoff, but it is not paid or fulfilable until the atomic fulfilment transaction succeeds.

## Operational configuration

Use Paystack test keys first. Configure `PAYSTACK_SECRET_KEY` only in the server environment, `PAYSTACK_CALLBACK_URL` as the fully qualified public `/api/payments/paystack/callback` URL, and the Paystack dashboard webhook URL as `https://<host>/api/payments/paystack/webhook`. The webhook must use the same test integration key. No public key is needed for the redirect integration. The callback builds its fixed `/payment/result` redirect from that configured public origin rather than the proxied request host, so tunnel/proxy upstream hosts such as `localhost` cannot produce an unreachable customer redirect. After receiving a syntactically valid reference, it also sets the existing HttpOnly, `Path=/`, `SameSite=Lax` payment-reference cookie on the redirect response; the result page uses that opaque value for its server-side lookup and never treats the callback query as success.

The migration must be applied before enabling payment. Local unit tests cover reference/signature/status parsing and the migration supplies database-level uniqueness and transactional stock protection. Live Paystack/webhook and concurrent-database verification require configured test credentials and a deployed Supabase project; they are not claimed by this repository alone.

## Initialization response integrity

The Paystack integration owns the provider response shape. It accepts initialization only when `status` is `true` and `data.authorization_url`, `data.access_code`, and `data.reference` are structurally valid, then exposes normalized `authorizationUrl`, `accessCode`, and `reference` values. When the application supplies a reference, the returned reference must match exactly before the attempt is marked initialized. Authorization URLs are returned only for the browser redirect and are not recorded in diagnostics.

Migration `202608180002_fix_payment_rpc_output_collisions.sql` also qualifies table `order_id` columns inside the checkout, retry, and fulfilment RPCs. This corrects PL/pgSQL ambiguity from their `RETURNS TABLE` output variables without changing the payment architecture or RLS.
