import { describe, expect, it } from "vitest";
import { categoryInputSchema, productInputSchema } from "./admin-catalogue";

const validProduct = {
  name: "USB-C cable",
  slug: "usb-c-cable",
  description: "A reliable cable.",
  categoryId: "11111111-1111-4111-8111-111111111111",
  featured: true,
  archived: false,
  variants: [{ name: "1 metre", sku: "USBC-1M", priceMinor: 150000, stockQuantity: 8 }],
};

describe("admin catalogue validation", () => {
  it("accepts a product using integer minor-unit prices", () => {
    expect(productInputSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects invalid slugs, floating prices, and negative stock", () => {
    expect(productInputSchema.safeParse({ ...validProduct, slug: "not safe" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...validProduct, variants: [{ ...validProduct.variants[0], priceMinor: 12.5 }] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...validProduct, variants: [{ ...validProduct.variants[0], stockQuantity: -1 }] }).success).toBe(false);
  });

  it("requires a valid category and at least one variant", () => {
    expect(productInputSchema.safeParse({ ...validProduct, categoryId: "client-value" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...validProduct, variants: [] }).success).toBe(false);
  });

  it("uses the same safe slug rules for categories", () => {
    expect(categoryInputSchema.safeParse({ name: "Cases", slug: "phone-cases" }).success).toBe(true);
    expect(categoryInputSchema.safeParse({ name: "Cases", slug: "../orders" }).success).toBe(false);
  });
});
