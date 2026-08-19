import { describe, expect, it } from "vitest";
import {
  categoryInputSchema,
  formErrors,
  parseProductForm,
  productInputSchema,
} from "./admin-catalogue";

const validProduct = {
  name: "USB-C cable",
  slug: "usb-c-cable",
  description: "A reliable cable.",
  categoryId: "11111111-1111-4111-8111-111111111111",
  featured: true,
  archived: false,
  variants: [
    { name: "1 metre", sku: "USBC-1M", priceMinor: 150000, stockQuantity: 8 },
  ],
};

describe("admin catalogue validation", () => {
  it("accepts a product using integer minor-unit prices", () => {
    expect(productInputSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects invalid slugs, floating prices, and negative stock", () => {
    expect(
      productInputSchema.safeParse({ ...validProduct, slug: "not safe" })
        .success,
    ).toBe(false);
    expect(
      productInputSchema.safeParse({
        ...validProduct,
        variants: [{ ...validProduct.variants[0], priceMinor: 12.5 }],
      }).success,
    ).toBe(false);
    expect(
      productInputSchema.safeParse({
        ...validProduct,
        variants: [{ ...validProduct.variants[0], stockQuantity: -1 }],
      }).success,
    ).toBe(false);
  });

  it("accepts simple products without variants", () => {
    expect(
      productInputSchema.safeParse({ ...validProduct, variants: [] }).success,
    ).toBe(true);
  });

  it("accepts an empty variants field from the simple-product form", () => {
    const formData = new FormData();
    formData.set("name", validProduct.name);
    formData.set("slug", validProduct.slug);
    formData.set("description", validProduct.description);
    formData.set("categoryId", validProduct.categoryId);
    formData.set("featured", "on");
    formData.set("variants", "[]");

    const result = parseProductForm(formData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.variants).toEqual([]);
      expect(result.data.featured).toBe(true);
      expect(result.data.archived).toBe(false);
    }
  });

  it("requires complete data for each explicitly added variant", () => {
    const result = productInputSchema.safeParse({
      ...validProduct,
      variants: [{ name: "", sku: "", priceMinor: 12.5, stockQuantity: -1 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = formErrors(result.error);
      expect(errors["variants.0.name"]?.[0]).toBe("Variant name is required.");
      expect(errors["variants.0.sku"]?.[0]).toBe("SKU is required.");
      expect(errors["variants.0.priceMinor"]?.[0]).toBe(
        "Price must be a whole number of kobo.",
      );
      expect(errors["variants.0.stockQuantity"]?.[0]).toBe(
        "Stock cannot be negative.",
      );
    }
  });

  it("requires a valid category", () => {
    expect(
      productInputSchema.safeParse({
        ...validProduct,
        categoryId: "client-value",
      }).success,
    ).toBe(false);
  });

  it("uses the same safe slug rules for categories", () => {
    expect(
      categoryInputSchema.safeParse({ name: "Cases", slug: "phone-cases" })
        .success,
    ).toBe(true);
    expect(
      categoryInputSchema.safeParse({ name: "Cases", slug: "../orders" })
        .success,
    ).toBe(false);
  });
});
