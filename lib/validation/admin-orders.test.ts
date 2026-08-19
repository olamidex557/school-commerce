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

  it("allows only the existing paid/confirmed operational transitions", () => {
    expect(adminOrderTransitions("paid")).toEqual(["confirmed", "cancelled"]);
    expect(adminOrderTransitions("confirmed")).toEqual([
      "completed",
      "cancelled",
    ]);
    expect(canAdminTransition("paid", "confirmed")).toBe(true);
    expect(canAdminTransition("paid", "completed")).toBe(false);
    expect(canAdminTransition("pending_payment", "confirmed")).toBe(false);
    expect(canAdminTransition("completed", "cancelled")).toBe(false);
  });
});
