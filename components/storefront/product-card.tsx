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
      <div className="flex flex-1 flex-col p-5">
        <p className="text-kicker">
          {product.category.name}
        </p>
        <h3 className="mt-2 text-xl leading-tight font-black">
          <Link
            className="focus-ring"
            href={`/shop/${product.slug}`}
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-4 font-display text-2xl font-bold">
          {formatPrice(productPriceMinor(product))}
        </p>
        <div className="mt-3">
          <StockBadge availability={availability} />
        </div>
        <Link
          className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]"
          href={`/shop/${product.slug}`}
        >
          View product <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
