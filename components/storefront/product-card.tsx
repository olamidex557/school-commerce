import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "./product-image";
import { StockBadge } from "./stock-badge";
import {
  productAvailability,
  productPriceMinor,
  type CatalogueProduct,
} from "@/lib/catalogue/types";
import { storefrontConfig } from "@/lib/storefront/config";

function formatPrice(priceMinor: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: storefrontConfig.currency,
  }).format(priceMinor / 100);
}

export function ProductCard({
  product,
  priority = false,
}: Readonly<{ product: CatalogueProduct; priority?: boolean }>) {
  const availability = productAvailability(product);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <ProductImage
        src={product.images[0]?.url ?? null}
        alt={product.images[0]?.alt ?? product.name}
        priority={priority}
      />
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <p className="text-kicker">{product.category.name}</p>
        <h3 className="mt-1.5 text-base leading-tight font-black sm:text-lg">
          <Link className="focus-ring" href={`/shop/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className="font-display mt-3 text-xl font-bold sm:text-2xl">
          {formatPrice(productPriceMinor(product))}
        </p>
        <div className="mt-2">
          <StockBadge availability={availability} />
        </div>
        <Link
          className="focus-ring mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)]"
          href={`/shop/${product.slug}`}
        >
          View product <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
