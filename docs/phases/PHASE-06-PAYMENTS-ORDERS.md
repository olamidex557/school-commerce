# Phase 6 — Paystack payments and atomic fulfillment

## Design boundary

Phase 6 will initialize Paystack transactions from the server, verify provider results, and fulfill a successful payment exactly once. Browser callbacks are recovery/status signals only; Paystack webhooks and server-side verification are the authority.

## Required database design

An additive migration must introduce a `payment_attempts` record keyed by a unique non-guessable Paystack reference and an atomic database fulfillment function. The function must lock/revalidate variant stock, create immutable customer/order/item snapshots, deduct stock conditionally, and mark the linked payment/order paid in one transaction. It must be inaccessible to anonymous clients.

## State machines

- Order: `pending_payment` → `paid`. No fulfillment workflow is introduced in this phase.
- Payment: `pending` → `success | failed | abandoned | reversed`. A successful payment is terminal for fulfillment; a retry creates a new attempt only for a non-successful unpaid order.

## Security and verification

Paystack initialization and verification use a server-only secret. Webhook bodies are signature-validated with HMAC-SHA512 and a timing-safe comparison before parsing. Verify results must match the internal reference, integer-kobo amount, NGN currency, and `data.status === "success"`. Database uniqueness and the atomic function—not memory or browser state—provide idempotency.

## Current prerequisite

Implementation/testing requires configured server-only Paystack **test** credentials and a secure server-side database mutation path. No live credentials, real charges, or public order/payment writes are permitted.
