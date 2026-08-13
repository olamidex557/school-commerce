import { SiteHeader } from "@/components/storefront/site-header";
import { Container } from "@/components/ui/container";

export default function ShopLoading() {
  return (
    <>
      <SiteHeader />
      <Container
        className="py-14"
        aria-busy="true"
        aria-label="Loading catalogue"
      >
        <div className="h-10 w-64 animate-pulse rounded bg-[#e7ebe0]" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              className="aspect-[.75] animate-pulse rounded-3xl bg-[#e7ebe0]"
              key={index}
            />
          ))}
        </div>
      </Container>
    </>
  );
}
