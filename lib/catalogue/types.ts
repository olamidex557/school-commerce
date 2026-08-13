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

export function productPriceMinor(product: CatalogueProduct) {
  return Math.min(...product.variants.map((variant) => variant.priceMinor));
}

export function productAvailability(product: CatalogueProduct): Availability {
  return product.variants.some((variant) => variant.stockQuantity > 0)
    ? "in-stock"
    : "out-of-stock";
}
