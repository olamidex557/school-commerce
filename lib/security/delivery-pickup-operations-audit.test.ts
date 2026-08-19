import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608190002_delivery_pickup_operations.sql",
  ),
  "utf8",
);

describe("delivery and pickup operation boundary", () => {
  it("adds only the operational delivery state and validates it by method", () => {
    expect(migration).toContain("add value if not exists 'out_for_delivery'");
    expect(migration).toContain("v_order.fulfillment_method = 'pickup'");
    expect(migration).toContain("v_order.fulfillment_method = 'delivery'");
    expect(migration).toContain("admin_order_invalid_transition");
  });

  it("keeps authorization, stale locking, and audit history in the transition RPC", () => {
    expect(migration).toContain("not public.is_admin()");
    expect(migration).toContain("for update;");
    expect(migration).toContain(
      "updated_at is distinct from p_expected_updated_at",
    );
    expect(migration).toContain("insert into public.order_status_events");
  });

  it("does not introduce payment, stock, or checkout mutation paths", () => {
    expect(migration).not.toContain("payment_status");
    expect(migration).not.toContain("payment_reference");
    expect(migration).not.toContain("paystack_transaction_id");
    expect(migration).not.toContain("amount_minor");
    expect(migration).not.toContain("payment_verified_at");
    expect(migration).not.toContain("stock_quantity");
    expect(migration).not.toContain("create_checkout_payment");
    expect(migration).not.toContain("fulfil_verified_paystack_payment");
  });
});
