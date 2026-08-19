# Payments

Phase 6 uses Paystack’s server-side redirect initialization flow. The browser receives only Paystack’s authorization URL; `PAYSTACK_SECRET_KEY` remains server-only. `PAYSTACK_CALLBACK_URL` points at `/api/payments/paystack/callback`, and the Paystack dashboard webhook points at `/api/payments/paystack/webhook`.

Neither a browser redirect nor webhook payload alone fulfils an order. The webhook checks the raw-body `x-paystack-signature` HMAC-SHA512, then the application verifies the transaction with Paystack and requires matching successful status, reference, amount, and currency. Database uniqueness and an atomic fulfilment RPC prevent duplicate orders and stock decrements. Configure test keys and URLs first; no live-mode verification is claimed.

CI/CD is deferred. When introduced for production readiness, it must never receive Paystack credentials or initialize, verify, or fulfil a transaction; approved Paystack readiness verification remains an explicit operational step. See `docs/future/CI-CD.md`.
