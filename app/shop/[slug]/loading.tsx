import { SiteHeader } from "@/components/storefront/site-header";
import { Container } from "@/components/ui/container";

export default function ProductLoading() {
  return (
    <>
      <SiteHeader />
      <Container
        className="py-12"
        aria-busy="true"
        aria-label="Loading product"
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-[#e7ebe0]" />
          <div className="space-y-5">
            <div className="h-5 w-24 animate-pulse rounded bg-[#e7ebe0]" />
            <div className="h-14 w-4/5 animate-pulse rounded bg-[#e7ebe0]" />
            <div className="h-24 animate-pulse rounded bg-[#e7ebe0]" />
          </div>
        </div>
      </Container>
    </>
  );
}
