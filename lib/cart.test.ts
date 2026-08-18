import { describe, expect, it } from "vitest";
import {
  calculateCartSubtotal,
  calculateCartTotal,
  deserializeCart,
  normalizeCartItems,
  serializeCart,
} from "./cart";

const productId = "11111111-1111-4111-8111-111111111111";
const variantId = "22222222-2222-4222-8222-222222222222";

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

  it("normalizes persisted identifiers, merges duplicates, and rejects malformed storage", () => {
    const items = normalizeCartItems([
      { productId, variantId, quantity: 2 },
      { productId, variantId, quantity: 3 },
    ]);
    expect(items).toEqual([{ productId, variantId, quantity: 5 }]);
    expect(deserializeCart(serializeCart(items)).items).toEqual(items);
    expect(deserializeCart('{"version":999,"items":[]}').items).toEqual([]);
    expect(deserializeCart("not json").items).toEqual([]);
  });

  it("drops invalid identifiers and quantities instead of trusting browser storage", () => {
    expect(
      normalizeCartItems([{ productId: "not-a-uuid", variantId, quantity: 1 }]),
    ).toEqual([]);
    expect(
      normalizeCartItems([{ productId, variantId, quantity: 1.5 }]),
    ).toEqual([]);
  });
});
