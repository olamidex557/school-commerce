"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { MAX_CART_QUANTITY } from "@/lib/cart";
import { useCart } from "./cart-provider";

type Variant = {
  id: string;
  name: string;
  priceMinor: number;
  stockQuantity: number;
};

export function AddToCart({
  productId,
  variants,
}: Readonly<{ productId: string; variants: Variant[] }>) {
  const available = variants.filter((variant) => variant.stockQuantity > 0);
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const selected = available.find((variant) => variant.id === variantId);
  const maximum = Math.min(selected?.stockQuantity ?? 1, MAX_CART_QUANTITY);
  const updateQuantity = (value: number) =>
    setQuantity(Math.min(maximum, Math.max(1, value)));
  if (!available.length)
    return (
      <p className="alert-error mt-8 px-4 py-3 text-sm" role="status">
        This product is currently unavailable.
      </p>
    );
  return (
    <section
      className="mt-8 border-t border-[var(--line)] pt-7"
      aria-label="Add to cart"
    >
      <label className="form-label" htmlFor="variant">
        Choose an option
      </label>
      <select
        className="form-select"
        id="variant"
        value={variantId}
        onChange={(event) => {
          setVariantId(event.target.value);
          setQuantity(1);
        }}
      >
        {variants.map((variant) => (
          <option
            disabled={variant.stockQuantity < 1}
            key={variant.id}
            value={variant.id}
          >
            {variant.name} — ₦
            {(variant.priceMinor / 100).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
            {variant.stockQuantity < 1 ? " (unavailable)" : ""}
          </option>
        ))}
      </select>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)]">
          <button
            aria-label="Decrease quantity"
            className="button-quiet focus-ring min-h-10 px-3"
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus size={16} />
          </button>
          <output
            aria-live="polite"
            className="min-w-9 text-center text-sm font-bold"
          >
            {quantity}
          </output>
          <button
            aria-label="Increase quantity"
            className="button-quiet focus-ring min-h-10 px-3"
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={quantity >= maximum}
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          className="button-primary focus-ring"
          type="button"
          onClick={() => {
            if (!selected) return;
            addItem({ productId, variantId: selected.id, quantity });
            setAdded(true);
          }}
        >
          <ShoppingBag size={17} /> Add to cart
        </button>
      </div>
      {added ? (
        <p
          className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--success)]"
          role="status"
        >
          <Check size={16} /> Added to your cart.
        </p>
      ) : null}
    </section>
  );
}
