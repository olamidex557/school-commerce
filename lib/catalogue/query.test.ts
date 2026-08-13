import { describe, expect, it } from "vitest";
import { buildShopHref, catalogueSlugSchema, parseShopQuery } from "./query";

describe("shop query parsing", () => {
  it("accepts valid shareable catalogue filters", () => {
    expect(
      parseShopQuery({
        category: "cables",
        search: "USB C",
        sort: "price-asc",
      }),
    ).toEqual({ category: "cables", search: "USB C", sort: "price-asc" });
  });

  it("discards invalid filters and applies the default sort", () => {
    expect(
      parseShopQuery({
        category: "cables;drop",
        search: "<script>",
        sort: "unknown",
      }),
    ).toEqual({ category: undefined, search: undefined, sort: "featured" });
  });

  it("builds a compact canonical shop URL", () => {
    expect(
      buildShopHref({ category: "earpieces", search: "wired", sort: "name" }),
    ).toBe("/shop?category=earpieces&search=wired&sort=name");
    expect(buildShopHref({ sort: "featured" })).toBe("/shop");
  });

  it("only accepts catalogue-safe product slugs", () => {
    expect(catalogueSlugSchema.safeParse("usb-c-cable").success).toBe(true);
    expect(catalogueSlugSchema.safeParse("../admin").success).toBe(false);
  });
});
