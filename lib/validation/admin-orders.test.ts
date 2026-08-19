import { describe, expect, it } from "vitest";
import {
  adminOrderTransitions,
  canAdminTransition,
} from "@/lib/admin/order-transitions";
import {
  parseAdminOrderQuery,
  parseAdminOrderStatusForm,
} from "./admin-orders";

const orderId = "11111111-1111-4111-8111-111111111111";
const updatedAt = "2026-08-19T10:00:00.000Z";

describe("admin order validation and transitions", () => {
  it("accepts bounded order list filters and pagination", () => {
    expect(
      parseAdminOrderQuery({
        search: "CA-20260819 customer@example.com",
        payment: "success",
        status: "confirmed",
        from: "2026-08-01",
        to: "2026-08-19",
        sort: "oldest",
        page: "2",
      }),
    ).toMatchObject({ payment: "success", status: "confirmed", page: 2 });
  });

  it("falls back to safe list defaults for malformed filters", () => {
    expect(
      parseAdminOrderQuery({
        payment: "paid-by-admin",
        status: "processing",
        page: "-4",
      }),
    ).toEqual({ sort: "newest", page: 1 });
  });

  it("requires a UUID, allowed target, and exact timestamp for a status update", () => {
    const valid = new FormData();
    valid.set("id", orderId);
    valid.set("nextStatus", "confirmed");
    valid.set("expectedUpdatedAt", updatedAt);
    expect(parseAdminOrderStatusForm(valid).success).toBe(true);

    const malformedId = new FormData();
    malformedId.set("id", "not-an-order");
    malformedId.set("nextStatus", "confirmed");
    malformedId.set("expectedUpdatedAt", updatedAt);
    expect(parseAdminOrderStatusForm(malformedId).success).toBe(false);

    const paymentTarget = new FormData();
    paymentTarget.set("id", orderId);
    paymentTarget.set("nextStatus", "paid");
    paymentTarget.set("expectedUpdatedAt", updatedAt);
    expect(parseAdminOrderStatusForm(paymentTarget).success).toBe(false);
  });

  it("allows only method-specific pickup and delivery transitions", () => {
    expect(adminOrderTransitions("paid", "pickup")).toEqual([
      "confirmed",
      "cancelled",
    ]);
    expect(adminOrderTransitions("confirmed", "pickup")).toEqual([
      "completed",
      "cancelled",
    ]);
    expect(adminOrderTransitions("confirmed", "delivery")).toEqual([
      "out_for_delivery",
      "cancelled",
    ]);
    expect(adminOrderTransitions("out_for_delivery", "delivery")).toEqual([
      "completed",
      "cancelled",
    ]);
    expect(canAdminTransition("paid", "confirmed", "pickup")).toBe(true);
    expect(canAdminTransition("confirmed", "completed", "pickup")).toBe(true);
    expect(canAdminTransition("confirmed", "out_for_delivery", "pickup")).toBe(
      false,
    );
    expect(canAdminTransition("confirmed", "completed", "delivery")).toBe(
      false,
    );
    expect(
      canAdminTransition("out_for_delivery", "completed", "delivery"),
    ).toBe(true);
    expect(canAdminTransition("cancelled", "confirmed", "delivery")).toBe(
      false,
    );
    expect(canAdminTransition("completed", "cancelled", "pickup")).toBe(false);
  });
});
