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
import { Reveal } from "@/components/ui/motion";
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
      <section className="relative overflow-hidden bg-[var(--ink)] py-20 text-white sm:py-30">
        <div className="absolute -top-24 right-[-8rem] h-72 w-72 rounded-full bg-[var(--brand)] blur-3xl opacity-35" />
        <div className="absolute bottom-[-10rem] left-[20%] h-72 w-72 rounded-full bg-[var(--highlight)] blur-3xl opacity-15" />
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <Reveal className="relative">
            <p className="mb-5 text-kicker text-[var(--highlight)]">
              Made for campus life
            </p>
            <h1 className="font-display max-w-3xl text-5xl font-bold leading-[.94] sm:text-7xl">
              Tech that keeps up with your campus day.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/72">
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
          </Reveal>
          <Reveal className="relative" stagger>
          <div className="rounded-[var(--radius-xl)] border border-white/15 bg-white/8 p-7 text-white shadow-[var(--shadow-lg)] backdrop-blur sm:p-10">
            <PackageCheck size={38} strokeWidth={2.5} />
            <p className="font-display mt-8 text-4xl font-bold tracking-tight">
              Campus-ready convenience.
            </p>
            <p className="mt-3 leading-7">
              Choose delivery to your location or collect when it suits your
              schedule.
            </p>
          </div></Reveal>
        </Container>
      </section>
      <section id="categories" className="section-space">
        <Container>
          <p className="text-kicker">
            Start here
          </p>
          <h2 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
            The everyday essentials
          </h2>
          <Reveal className="mt-9 grid gap-4 md:grid-cols-2" stagger>
            {categories.length ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                >
                  {category.slug === "cables" ? (
                    <Cable size={30} />
                  ) : (
                    <Headphones size={30} />
                  )}
                  <h3 className="font-display mt-10 text-3xl font-bold">{category.name}</h3>
                  <p className="mt-2 text-[var(--muted)]">
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
          </Reveal>
        </Container>
      </section>
      <section className="section-space bg-[var(--canvas-deep)]">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-kicker">
                Featured picks
              </p>
              <h2 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
                Essentials students rely on
              </h2>
            </div>
            <Link
              className="focus-ring button-secondary"
              href="/shop"
            >
              View all products
            </Link>
          </div>
          <Reveal className="mt-9" stagger>
            {dataError ? (
              <CatalogueErrorState />
            ) : featuredProducts.length ? (
              <ProductGrid products={featuredProducts} />
            ) : (
              <CatalogueEmptyState />
            )}
          </Reveal>
        </Container>
      </section>
      <section className="section-space bg-[var(--ink)] text-white">
        <Container className="grid gap-8 md:grid-cols-3">
          {conveniencePoints.map(({ icon: Icon, title, text }) => (
            <div key={title} className="border-l border-white/20 pl-5">
              <Icon className="text-[var(--highlight)]" size={25} />
              <h3 className="mt-4 text-lg font-black">{title}</h3>
              <p className="mt-2 text-white/60">{text}</p>
            </div>
          ))}
        </Container>
      </section>
      <SiteFooter />
    </main>
  );
}
