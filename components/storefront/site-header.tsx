import Link from "next/link";
import { Container } from "@/components/ui/container";
import { storefrontConfig } from "@/lib/storefront/config";

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-[#f7f8f2]">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-black tracking-tight">
          {storefrontConfig.brandName}
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-5 text-sm font-semibold"
        >
          <Link
            className="rounded-sm focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
            href="/"
          >
            Home
          </Link>
          <Link
            className="rounded-sm focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
            href="/shop"
          >
            Shop
          </Link>
        </nav>
      </Container>
    </header>
  );
}
