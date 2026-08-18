import type { Metadata } from "next";
import { CheckoutPage } from "@/components/storefront/checkout-page";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export default function CheckoutRoute() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-8 sm:py-12">
          <CheckoutPage />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
