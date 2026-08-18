"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getCartReview } from "@/app/checkout/actions";
import { MAX_CART_QUANTITY, serializeCart } from "@/lib/cart";
import type { CheckoutReview } from "@/lib/checkout/state";
import { useCart } from "./cart-provider";
import { ProductImage } from "./product-image";

function price(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value / 100);
}

export function CartPage() {
  const { items, hydrated, setQuantity, removeItem } = useCart();
  const [review, setReview] = useState<CheckoutReview | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (hydrated)
      startTransition(async () => {
        try {
          setReview(await getCartReview(serializeCart(items)));
        } catch {
          setReview({
            lines: [],
            issues: items.map((item) => ({
              ...item,
              message: "We could not refresh this item. Please try again.",
            })),
            subtotalMinor: 0,
            deliveryFeeMinor: 0,
            totalMinor: 0,
          });
        }
      });
  }, [hydrated, items]);
  if (!hydrated || (pending && !review))
    return (
      <div className="surface-card p-10 text-center text-[var(--muted)]">
        Refreshing your cart…
      </div>
    );
  if (!items.length)
    return (
      <div className="surface-card p-10 text-center">
        <ShoppingBag className="mx-auto text-[var(--muted)]" size={36} />
        <h1 className="font-display mt-5 text-3xl font-bold">
          Your cart is empty
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Explore the accessories ready for campus life.
        </p>
        <Link className="button-primary focus-ring mt-6" href="/shop">
          Continue shopping
        </Link>
      </div>
    );
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      {" "}
      <section className="surface-card overflow-hidden">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <h1 className="font-display text-3xl font-bold">Your cart</h1>
        </div>
        {review?.issues.map((issue) => (
          <div
            className="alert-error mx-5 mt-4 px-4 py-3 text-sm"
            key={`${issue.productId}-${issue.variantId}`}
            role="alert"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{issue.message}</span>
              <button
                className="button-danger focus-ring min-h-9 px-2 text-sm"
                type="button"
                onClick={() => removeItem(issue.productId, issue.variantId)}
              >
                <Trash2 size={15} /> Remove
              </button>
            </div>
          </div>
        ))}
        {review?.lines.map((line) => (
          <article
            className="flex gap-4 border-b border-[var(--line)] p-5 last:border-0"
            key={`${line.productId}-${line.variantId}`}
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-strong)]">
              <ProductImage alt="" src={line.imageUrl} />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                className="font-bold hover:text-[var(--brand)]"
                href={`/shop/${line.productSlug}`}
              >
                {line.productName}
              </Link>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {line.variantName} · {price(line.unitPriceMinor)}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--line)]">
                  <button
                    aria-label={`Decrease ${line.productName} quantity`}
                    className="button-quiet focus-ring min-h-9 px-2"
                    type="button"
                    onClick={() =>
                      setQuantity(
                        line.productId,
                        line.variantId,
                        line.quantity - 1,
                      )
                    }
                  >
                    <Minus size={15} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold">
                    {line.quantity}
                  </span>
                  <button
                    aria-label={`Increase ${line.productName} quantity`}
                    className="button-quiet focus-ring min-h-9 px-2"
                    type="button"
                    disabled={
                      line.quantity >=
                      Math.min(line.stockQuantity, MAX_CART_QUANTITY)
                    }
                    onClick={() =>
                      setQuantity(
                        line.productId,
                        line.variantId,
                        line.quantity + 1,
                      )
                    }
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="button-danger focus-ring min-h-9 px-2 text-sm"
                  type="button"
                  onClick={() => removeItem(line.productId, line.variantId)}
                >
                  <Trash2 size={15} /> Remove
                </button>
                <strong>{price(line.lineTotalMinor)}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>
      <aside className="surface-card h-fit p-5">
        <h2 className="text-lg font-black">Summary</h2>
        <div className="mt-5 flex justify-between gap-3">
          <span className="text-[var(--muted)]">Subtotal</span>
          <strong>{price(review?.subtotalMinor ?? 0)}</strong>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Delivery is selected during checkout. Any applicable fee is set by the
          server.
        </p>
        <Link
          className="button-primary focus-ring mt-6 w-full"
          href="/checkout"
        >
          Proceed to checkout
        </Link>
        <Link className="button-quiet focus-ring mt-3 w-full" href="/shop">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
