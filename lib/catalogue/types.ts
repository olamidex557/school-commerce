export type CatalogueCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type CatalogueVariant = {
  id: string;
  name: string;
  priceMinor: number;
  stockQuantity: number;
};

export type CatalogueImage = {
  alt: string;
  path: string;
  position: number;
  url: string | null;
};

export type CatalogueProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  featured: boolean;
  category: Pick<CatalogueCategory, "name" | "slug">;
  variants: CatalogueVariant[];
  images: CatalogueImage[];
};

export type Availability = "in-stock" | "out-of-stock";
export type CatalogueSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name";

export function productPriceMinor(product: CatalogueProduct) {
  return Math.min(...product.variants.map((variant) => variant.priceMinor));
}

export function productAvailability(product: CatalogueProduct): Availability {
  return product.variants.some((variant) => variant.stockQuantity > 0)
    ? "in-stock"
    : "out-of-stock";
}

export function sortCatalogueProducts(
  products: CatalogueProduct[],
  sort: CatalogueSort,
) {
  return [...products].sort((left, right) => {
    if (sort === "name") return left.name.localeCompare(right.name);
    if (sort === "newest") return right.createdAt.localeCompare(left.createdAt);
    if (sort === "price-asc")
      return productPriceMinor(left) - productPriceMinor(right);
    if (sort === "price-desc")
      return productPriceMinor(right) - productPriceMinor(left);
    return (
      Number(right.featured) - Number(left.featured) ||
      right.createdAt.localeCompare(left.createdAt)
    );
  });
}
