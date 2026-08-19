import type { Metadata } from "next";
import {
  CatalogueErrorState,
  CatalogueEmptyState,
} from "@/components/storefront/catalogue-state";
import { CatalogueFilters } from "@/components/storefront/catalogue-filters";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { Container } from "@/components/ui/container";
import {
  CatalogueDataError,
  getCategories,
  getProducts,
} from "@/lib/catalogue/catalogue";
import { parseShopQuery } from "@/lib/catalogue/query";
import { Reveal } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Shop phone accessories",
  description: "Browse campus-ready cables and earpieces.",
};

export default async function ShopPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const query = parseShopQuery(await searchParams);
  const result = await Promise.all([getCategories(), getProducts(query)])
    .then(([categories, products]) => ({ categories, products }))
    .catch((error: unknown) => {
      if (error instanceof CatalogueDataError) return null;
      throw error;
    });

  if (!result)
    return (
      <>
        <SiteHeader />
        <Container className="py-16">
          <CatalogueErrorState />
        </Container>
        <SiteFooter />
      </>
    );

  const category = query.category
    ? result.categories.find((item) => item.slug === query.category)
    : undefined;
  const hasFilters = Boolean(
    query.search || query.category || query.sort !== "featured",
  );
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-[var(--ink)] py-10 text-white sm:py-12">
          <div className="absolute right-[-4rem] bottom-[-5rem] h-56 w-56 rounded-full bg-[var(--brand)] opacity-35 blur-3xl" />
          <Container>
            <p className="text-kicker text-[var(--highlight)]">
              Campus-ready accessories
            </p>
            <h1 className="font-display mt-2 text-4xl font-bold sm:text-5xl">
              Shop the essentials
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Reliable cables and earpieces, selected for everyday campus life.
            </p>
          </Container>
        </section>
        <Container className="py-6 sm:py-8">
          <Reveal>
            <CatalogueFilters categories={result.categories} query={query} />
          </Reveal>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-kicker">{category?.name ?? "All products"}</p>
              <h2 className="font-display mt-1 text-3xl font-bold">
                {result.products.length}{" "}
                {result.products.length === 1 ? "product" : "products"}
              </h2>
            </div>
            {query.search ? (
              <p className="text-sm text-[var(--muted)]">
                Results for “{query.search}”
              </p>
            ) : null}
          </div>
          <Reveal className="mt-5" stagger>
            {result.products.length ? (
              <ProductGrid products={result.products} />
            ) : (
              <CatalogueEmptyState filtered={hasFilters} />
            )}
          </Reveal>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
