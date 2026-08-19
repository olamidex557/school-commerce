"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { useCart } from "./cart-provider";

export function CartLink({
  onNavigate,
  className,
}: Readonly<{ onNavigate?: () => void; className?: string }>) {
  const { itemCount, hydrated } = useCart();
  return (
    <Link
      aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
      className={clsx("button-quiet focus-ring relative", className)}
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
