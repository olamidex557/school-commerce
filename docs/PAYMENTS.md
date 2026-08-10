# Payments

Paystack is planned for Phase 5. The browser will request server-side initialization after a server-created order exists; the server uses `PAYSTACK_SECRET_KEY`, creates a unique payment reference, and stores it with `initialized` status. Callback and webhook paths will verify with Paystack server-side before marking an order paid. Reference uniqueness and conditional updates provide duplicate-processing protection.

Failed/cancelled transactions leave the order unpaid/failed according to the verified result. `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` may be used only if an inline payment UI is later selected; the secret key is never exposed. No real keys belong in this document.
