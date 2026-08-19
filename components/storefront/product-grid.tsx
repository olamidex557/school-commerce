import { ProductCard } from "./product-card";
import { type CatalogueProduct } from "@/lib/catalogue/types";

export function ProductGrid({
  products,
}: Readonly<{ products: CatalogueProduct[] }>) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </div>
  );
}
