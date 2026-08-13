import Link from "next/link";
import {
  ArrowRight,
  Cable,
  Headphones,
  MapPin,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import {
  CatalogueEmptyState,
  CatalogueErrorState,
} from "@/components/storefront/catalogue-state";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { Container } from "@/components/ui/container";
import {
  CatalogueDataError,
  getCategories,
  getFeaturedProducts,
} from "@/lib/catalogue/catalogue";
import {
  type CatalogueCategory,
  type CatalogueProduct,
} from "@/lib/catalogue/types";

const conveniencePoints = [
  {
    icon: MapPin,
    title: "Campus delivery",
    text: "Delivered to your campus location.",
  },
  {
    icon: PackageCheck,
    title: "Easy pickup",
    text: "Collect at the agreed pickup point.",
  },
  {
    icon: MessageCircle,
    title: "Need help?",
    text: "Message us before you order.",
  },
];

export default async function HomePage() {
  let categories: CatalogueCategory[] = [];
  let featuredProducts: CatalogueProduct[] = [];
  let dataError = false;
  try {
    [categories, featuredProducts] = await Promise.all([
      getCategories(),
      getFeaturedProducts(),
    ]);
  } catch (error) {
    if (!(error instanceof CatalogueDataError)) throw error;
    dataError = true;
  }
  return (
    <main>
      <SiteHeader />
      <section className="bg-[#17211d] py-20 text-white sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="mb-5 text-sm font-bold tracking-[0.2em] text-[#c7ff3d] uppercase">
              Made for campus life
            </p>
            <h1 className="max-w-3xl text-5xl font-black tracking-[-0.06em] sm:text-7xl">
              Your essentials, right when you need them.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Reliable charging cables and earpieces, with straightforward
              pickup or delivery across campus.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/shop">
                Shop accessories <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary">
                How it works
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#c7ff3d] p-7 text-[#17211d] shadow-2xl sm:p-10">
            <PackageCheck size={38} strokeWidth={2.5} />
            <p className="mt-8 text-3xl font-black tracking-tight">
              Campus-ready convenience.
            </p>
            <p className="mt-3 leading-7">
              Choose delivery to your location or collect when it suits your
              schedule.
            </p>
          </div>
        </Container>
      </section>
      <section id="how-it-works" className="py-18 sm:py-24">
        <Container>
          <p className="text-sm font-bold tracking-[0.18em] text-[#5b665f] uppercase">
            Start here
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            The everyday essentials
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {categories.length ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group rounded-3xl border border-black/10 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {category.slug === "cables" ? (
                    <Cable size={30} />
                  ) : (
                    <Headphones size={30} />
                  )}
                  <h3 className="mt-10 text-2xl font-black">{category.name}</h3>
                  <p className="mt-2 text-[#5b665f]">
                    {category.description ||
                      "Explore campus-ready accessories."}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-bold">
                    Explore{" "}
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))
            ) : (
              <CatalogueEmptyState />
            )}
          </div>
        </Container>
      </section>
      <section className="py-18 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[0.18em] text-[#5b665f] uppercase">
                Featured picks
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Essentials students rely on
              </h2>
            </div>
            <Link
              className="rounded-sm text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
              href="/shop"
            >
              View all products
            </Link>
          </div>
          <div className="mt-9">
            {dataError ? (
              <CatalogueErrorState />
            ) : featuredProducts.length ? (
              <ProductGrid products={featuredProducts} />
            ) : (
              <CatalogueEmptyState />
            )}
          </div>
        </Container>
      </section>
      <section className="border-y border-black/10 bg-[#e7ebe0] py-16">
        <Container className="grid gap-8 md:grid-cols-3">
          {conveniencePoints.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon size={25} />
              <h3 className="mt-4 text-lg font-black">{title}</h3>
              <p className="mt-2 text-[#5b665f]">{text}</p>
            </div>
          ))}
        </Container>
      </section>
      <SiteFooter />
    </main>
  );
}
