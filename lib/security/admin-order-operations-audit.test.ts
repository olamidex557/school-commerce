import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const actionSource = readFileSync(
  resolve(process.cwd(), "app/admin/(protected)/order-actions.ts"),
  "utf8",
);
const dataSource = readFileSync(
  resolve(process.cwd(), "lib/admin/orders.ts"),
  "utf8",
);
const migrationSource = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202608190001_admin_order_operations.sql",
  ),
  "utf8",
);

describe("admin order operations boundary", () => {
  it("uses server-side admin authorization for order reads and mutation", () => {
    expect(actionSource).toContain("requireAdmin()");
    expect(dataSource).toContain("requireAdmin()");
    expect(actionSource).toContain('rpc("admin_update_order_status"');
  });

  it("does not expose a service role or create a payment/stock mutation path", () => {
    expect(actionSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(actionSource).not.toContain("createServiceClient");
    expect(actionSource).not.toContain("payment_status");
    expect(actionSource).not.toContain("payment_reference");
    expect(actionSource).not.toContain("stock_quantity");
    expect(actionSource).not.toContain("amount_minor");
  });

  it("enforces locked, audited compare-and-set transitions in the database", () => {
    expect(migrationSource).toContain(
      "create table public.order_status_events",
    );
    expect(migrationSource).toContain("for update;");
    expect(migrationSource).toContain(
      "updated_at is distinct from p_expected_updated_at",
    );
    expect(migrationSource).toContain("insert into public.order_status_events");
    expect(migrationSource).toContain("not public.is_admin()");
    expect(migrationSource).toContain(
      "revoke insert, update, delete on public.payment_attempts",
    );
    expect(migrationSource).toContain(
      "grant execute on function public.admin_update_order_status",
    );
  });
});
