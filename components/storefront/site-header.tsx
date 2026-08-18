"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { storefrontPublicConfig } from "@/lib/storefront/public-config";
import { CartLink } from "./cart-link";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--canvas)]/92 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between py-3">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2"
          onClick={close}
        >
          <span className="grid h-8 w-8 place-items-center rounded-[.7rem] bg-[var(--brand)] text-sm font-black text-white">
            CA
          </span>
          <span className="font-display text-xl font-bold">
            {storefrontPublicConfig.brandName}
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          <Link className="button-quiet focus-ring" href="/shop">
            Shop
          </Link>
          <Link className="button-quiet focus-ring" href="/#categories">
            Categories
          </Link>
          <CartLink />
          <a
            className="button-primary focus-ring"
            href={storefrontPublicConfig.contactHref}
          >
            Contact
          </a>
        </nav>
        <button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="button-secondary focus-ring md:hidden"
          type="button"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>
      {open ? (
        <div
          className="border-t border-[var(--line)] bg-[var(--surface)] md:hidden"
          id="mobile-menu"
        >
          <Container className="flex flex-col gap-1 py-4">
            <Link
              className="button-quiet focus-ring justify-start"
              href="/shop"
              onClick={close}
            >
              Shop accessories
            </Link>
            <Link
              className="button-quiet focus-ring justify-start"
              href="/#categories"
              onClick={close}
            >
              Browse categories
            </Link>
            <CartLink onNavigate={close} />
            <a
              className="button-primary focus-ring mt-2"
              href={storefrontPublicConfig.contactHref}
              onClick={close}
            >
              Contact us
            </a>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
