import { ProductCard } from "./product-card";
import { type CatalogueProduct } from "@/lib/catalogue/types";

export function ProductGrid({
  products,
}: Readonly<{ products: CatalogueProduct[] }>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </div>
  );
}
