import type { Metadata } from "next";
import { CartPage } from "@/components/storefront/cart-page";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};
export default function CartRoute() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-8 sm:py-12">
          <CartPage />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
