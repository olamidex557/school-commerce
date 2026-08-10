import { describe, expect, it } from "vitest";
import { calculateCartSubtotal, calculateCartTotal } from "./cart";

describe("cart totals", () => {
  it("uses minor units and only adds delivery when applicable", () => {
    const lines = [
      { quantity: 2, unitPrice: 1500 },
      { quantity: 1, unitPrice: 2500 },
    ];
    expect(calculateCartSubtotal(lines)).toBe(5500);
    expect(calculateCartTotal(lines, 500, "delivery")).toBe(6000);
    expect(calculateCartTotal(lines, 500, "pickup")).toBe(5500);
  });
});
