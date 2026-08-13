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
    <article className="group flex h-full flex-col rounded-3xl border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <ProductImage
        src={product.images[0]?.url ?? null}
        alt={product.images[0]?.alt ?? product.name}
        priority={priority}
      />
      <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
        <p className="text-xs font-bold tracking-[0.14em] text-[#5b665f] uppercase">
          {product.category.name}
        </p>
        <h3 className="mt-2 text-lg leading-tight font-black">
          <Link
            className="rounded-sm focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
            href={`/shop/${product.slug}`}
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-lg font-black">
          {formatPrice(productPriceMinor(product))}
        </p>
        <div className="mt-3">
          <StockBadge availability={availability} />
        </div>
        <Link
          className="mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
          href={`/shop/${product.slug}`}
        >
          View product <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
