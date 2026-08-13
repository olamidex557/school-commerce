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
        <section className="bg-[#17211d] py-14 text-white">
          <Container>
            <p className="text-sm font-bold tracking-[0.16em] text-[#c7ff3d] uppercase">
              Campus-ready accessories
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Shop the essentials
            </h1>
            <p className="mt-4 max-w-xl text-white/75">
              Reliable cables and earpieces, selected for everyday campus life.
            </p>
          </Container>
        </section>
        <Container className="py-10 sm:py-14">
          <CatalogueFilters categories={result.categories} query={query} />
          <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-[#5b665f] uppercase">
                {category?.name ?? "All products"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {result.products.length}{" "}
                {result.products.length === 1 ? "product" : "products"}
              </h2>
            </div>
            {query.search ? (
              <p className="text-sm text-[#5b665f]">
                Results for “{query.search}”
              </p>
            ) : null}
          </div>
          <div className="mt-7">
            {result.products.length ? (
              <ProductGrid products={result.products} />
            ) : (
              <CatalogueEmptyState filtered={hasFilters} />
            )}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
