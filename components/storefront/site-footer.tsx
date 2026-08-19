import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { storefrontConfig } from "@/lib/storefront/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--ink)] py-8 text-white">
      <Container className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl font-bold">
            © {new Date().getFullYear()} {storefrontConfig.brandName}
          </p>
          <p className="mt-1 text-white/55">Campus tech, made simple.</p>
        </div>
        <a
          className="focus-ring inline-flex w-fit items-center gap-2 rounded-[var(--radius-sm)] border border-white/20 px-3.5 py-2 font-semibold hover:bg-white/10"
          href={storefrontConfig.contactHref}
        >
          <MessageCircle size={16} />
          Contact us
        </a>
      </Container>
    </footer>
  );
}
