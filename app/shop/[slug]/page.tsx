import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogueErrorState } from "@/components/storefront/catalogue-state";
import { ProductImage } from "@/components/storefront/product-image";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { StockBadge } from "@/components/storefront/stock-badge";
import { Container } from "@/components/ui/container";
import {
  CatalogueDataError,
  getProductBySlug,
} from "@/lib/catalogue/catalogue";
import { catalogueSlugSchema } from "@/lib/catalogue/query";
import {
  productAvailability,
  productPriceMinor,
  type CatalogueProduct,
} from "@/lib/catalogue/types";
import { storefrontConfig } from "@/lib/storefront/config";

type ProductPageProps = { params: Promise<{ slug: string }> };
function formatPrice(priceMinor: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: storefrontConfig.currency,
  }).format(priceMinor / 100);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!catalogueSlugSchema.safeParse(slug).success) {
    return { title: "Product not found" };
  }
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Product not found" };
    return {
      title: product.name,
      description: product.description.slice(0, 155),
      openGraph: {
        title: product.name,
        description: product.description.slice(0, 155),
        images: product.images[0]?.url
          ? [{ url: product.images[0].url, alt: product.images[0].alt }]
          : [],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

function ProductContent({ product }: Readonly<{ product: CatalogueProduct }>) {
  const availability = productAvailability(product);
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-8 sm:py-12">
          <Link
            href="/shop"
            className="focus-ring inline-flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Back to shop
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <section
              aria-label={`${product.name} images`}
              className="grid gap-3 sm:grid-cols-2"
            >
              {product.images.length ? (
                product.images.map((image, index) => (
                  <ProductImage
                    key={image.path}
                    src={image.url}
                    alt={image.alt}
                    priority={index === 0}
                  />
                ))
              ) : (
                <ProductImage src={null} alt={product.name} priority />
              )}
            </section>
            <section>
              <p className="text-sm font-bold tracking-[0.14em] text-[#5b665f] uppercase">
                {product.category.name}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-5 text-2xl font-black">
                {formatPrice(productPriceMinor(product))}
              </p>
              <div className="mt-4">
                <StockBadge availability={availability} />
              </div>
              <div className="mt-8 border-t border-black/10 pt-7">
                <h2 className="text-lg font-black">Product information</h2>
                <p className="mt-3 leading-7 whitespace-pre-line text-[#5b665f]">
                  {product.description ||
                    "Product details will be available soon."}
                </p>
              </div>
              <div className="mt-8 border-t border-black/10 pt-7">
                <h2 className="text-lg font-black">Available options</h2>
                <ul className="mt-4 space-y-3">
                  {product.variants.map((variant) => (
                    <li
                      className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3"
                      key={variant.id}
                    >
                      <span className="font-bold">{variant.name}</span>
                      <span className="text-sm text-[#5b665f]">
                        {formatPrice(variant.priceMinor)} ·{" "}
                        {variant.stockQuantity > 0
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                className="button-primary focus-ring mt-9"
                href={storefrontConfig.contactHref}
              >
                <MessageCircle size={17} />
                Ask about this product
              </a>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (!catalogueSlugSchema.safeParse(slug).success) notFound();
  const product = await getProductBySlug(slug).catch((error: unknown) => {
    if (error instanceof CatalogueDataError) return undefined;
    throw error;
  });
  if (product === undefined)
    return (
      <>
        <SiteHeader />
        <Container className="py-16">
          <CatalogueErrorState />
        </Container>
        <SiteFooter />
      </>
    );
  if (!product) notFound();
  return <ProductContent product={product} />;
}
