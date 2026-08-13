import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { storefrontConfig } from "@/lib/storefront/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 py-10">
      <Container className="flex flex-col gap-3 text-sm text-[#5b665f] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {storefrontConfig.brandName}
        </p>
        <a
          className="inline-flex w-fit items-center gap-2 rounded-sm font-semibold focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
          href={storefrontConfig.contactHref}
        >
          <MessageCircle size={16} />
          Contact us
        </a>
      </Container>
    </footer>
  );
}
