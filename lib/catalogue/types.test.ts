import { describe, expect, it } from "vitest";
import {
  productAvailability,
  productPriceMinor,
  sortCatalogueProducts,
  type CatalogueProduct,
} from "./types";

const product: CatalogueProduct = {
  id: "product",
  name: "Cable",
  slug: "cable",
  description: "",
  createdAt: "2026-01-01",
  featured: false,
  category: { name: "Cables", slug: "cables" },
  images: [],
  variants: [
    { id: "a", name: "Short", priceMinor: 1500, stockQuantity: 2 },
    { id: "b", name: "Long", priceMinor: 2000, stockQuantity: 0 },
  ],
};

describe("catalogue product presentation", () => {
  it("uses the lowest variant price and authoritative stock", () => {
    expect(productPriceMinor(product)).toBe(1500);
    expect(productAvailability(product)).toBe("in-stock");
    expect(
      productAvailability({
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          stockQuantity: 0,
        })),
      }),
    ).toBe("out-of-stock");
  });

  it("sorts the public catalogue by the selected supported field", () => {
    const products = [
      product,
      {
        ...product,
        id: "featured",
        name: "Earpiece",
        featured: true,
        createdAt: "2026-02-01",
        variants: [
          { id: "c", name: "Default", priceMinor: 1000, stockQuantity: 1 },
        ],
      },
    ];
    expect(sortCatalogueProducts(products, "featured")[0]?.id).toBe("featured");
    expect(sortCatalogueProducts(products, "price-asc")[0]?.id).toBe(
      "featured",
    );
    expect(sortCatalogueProducts(products, "name")[0]?.name).toBe("Cable");
  });
});
