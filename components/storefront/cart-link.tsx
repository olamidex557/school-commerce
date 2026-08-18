"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartLink({
  onNavigate,
}: Readonly<{ onNavigate?: () => void }>) {
  const { itemCount, hydrated } = useCart();
  return (
    <Link
      aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
      className="button-quiet focus-ring relative"
      href="/cart"
      onClick={onNavigate}
    >
      <ShoppingBag size={18} />
      <span>Cart</span>
      {hydrated && itemCount ? (
        <span
          aria-hidden="true"
          className="grid min-w-5 place-items-center rounded-full bg-[var(--brand)] px-1 text-xs text-white"
        >
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
