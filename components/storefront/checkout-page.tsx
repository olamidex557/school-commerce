"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { reviewCheckout } from "@/app/checkout/actions";
import { serializeCart } from "@/lib/cart";
import { initialCheckoutActionState } from "@/lib/checkout/state";
import { useCart } from "./cart-provider";

function price(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value / 100);
}

export function CheckoutPage() {
  const { items, hydrated } = useCart();
  const [state, action, pending] = useActionState(
    reviewCheckout,
    initialCheckoutActionState,
  );
  if (!hydrated)
    return (
      <div className="surface-card p-10 text-center text-[var(--muted)]">
        Loading checkout…
      </div>
    );
  if (!items.length)
    return (
      <div className="surface-card p-10 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-[var(--muted)]">
          Add an item before starting checkout.
        </p>
        <Link className="button-primary focus-ring mt-6" href="/shop">
          Shop accessories
        </Link>
      </div>
    );
  if (state.review && !state.message)
    return (
      <section className="surface-card p-6 sm:p-8">
        <CheckCircle2 className="text-[var(--success)]" size={32} />
        <p className="text-kicker mt-5">Review</p>
        <h1 className="font-display mt-2 text-4xl font-bold">
          Ready for payment
        </h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Your items and totals were checked against the current catalogue.
          Payment is not available yet, and no order has been created.
        </p>
        <div className="mt-7 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {state.review.lines.map((line) => (
            <div
              className="flex justify-between gap-4 py-4"
              key={line.variantId}
            >
              <span>
                <strong className="block">{line.productName}</strong>
                <span className="text-sm text-[var(--muted)]">
                  {line.variantName} × {line.quantity}
                </span>
              </span>
              <strong>{price(line.lineTotalMinor)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{price(state.review.subtotalMinor)}</strong>
          </div>
          <div className="flex justify-between">
            <span>
              {state.review.details?.fulfillmentMethod === "delivery"
                ? "Delivery"
                : "Pickup"}
            </span>
            <strong>{price(state.review.deliveryFeeMinor)}</strong>
          </div>
          <div className="flex justify-between border-t border-[var(--line)] pt-3 text-lg">
            <strong>Total</strong>
            <strong>{price(state.review.totalMinor)}</strong>
          </div>
        </div>
        <Link className="button-secondary focus-ring mt-7" href="/cart">
          Back to cart
        </Link>
      </section>
    );
  const errors = state.fieldErrors ?? {};
  return (
    <form
      action={action}
      className="grid gap-8 lg:grid-cols-[1fr_20rem]"
      noValidate
    >
      <input name="cart" type="hidden" value={serializeCart(items)} />
      <section className="surface-card p-6 sm:p-8">
        <p className="text-kicker">Guest checkout</p>
        <h1 className="font-display mt-2 text-4xl font-bold">Your details</h1>
        <p className="mt-3 text-[var(--muted)]">
          We’ll verify the cart before the payment step. No order is created
          now.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="form-label sm:col-span-2">
            Full name
            <input
              className="form-input"
              name="fullName"
              autoComplete="name"
              required
              disabled={pending}
            />
            {errors.fullName ? (
              <span className="form-error">{errors.fullName[0]}</span>
            ) : null}
          </label>
          <label className="form-label">
            Email
            <input
              className="form-input"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
            />
            {errors.email ? (
              <span className="form-error">{errors.email[0]}</span>
            ) : null}
          </label>
          <label className="form-label">
            Nigerian phone number
            <input
              className="form-input"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0803 123 4567"
              required
              disabled={pending}
            />
            {errors.phone ? (
              <span className="form-error">{errors.phone[0]}</span>
            ) : null}
          </label>
        </div>
        <fieldset className="mt-7">
          <legend className="form-label">
            How would you like to receive your order?
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-4">
              <input
                defaultChecked
                name="fulfillmentMethod"
                type="radio"
                value="pickup"
                disabled={pending}
              />{" "}
              <strong className="ml-2">Pickup</strong>
              <span className="mt-2 block text-sm text-[var(--muted)]">
                Collect from the agreed pickup point.
              </span>
            </label>
            <label className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-4">
              <input
                name="fulfillmentMethod"
                type="radio"
                value="delivery"
                disabled={pending}
              />{" "}
              <strong className="ml-2">Delivery</strong>
              <span className="mt-2 block text-sm text-[var(--muted)]">
                Deliver to your campus location.
              </span>
            </label>
          </div>
        </fieldset>
        <label className="form-label mt-5">
          Campus location{" "}
          <span className="font-normal text-[var(--muted)]">
            (required for delivery)
          </span>
          <input
            className="form-input"
            name="location"
            maxLength={200}
            disabled={pending}
          />
          {errors.location ? (
            <span className="form-error">{errors.location[0]}</span>
          ) : null}
        </label>
        <label className="form-label mt-5">
          Order note{" "}
          <span className="font-normal text-[var(--muted)]">(optional)</span>
          <textarea
            className="form-textarea min-h-24"
            name="note"
            maxLength={500}
            disabled={pending}
          />
        </label>
        {state.message ? (
          <p className="alert-error mt-5 px-4 py-3 text-sm" role="alert">
            {state.message}
          </p>
        ) : null}
        {state.review?.issues.map((issue) => (
          <p
            className="alert-error mt-3 px-4 py-3 text-sm"
            key={`${issue.productId}-${issue.variantId}`}
            role="alert"
          >
            {issue.message} Return to the cart to remove or adjust it.
          </p>
        ))}
        <button
          className="button-primary focus-ring mt-7"
          type="submit"
          disabled={pending}
        >
          {pending ? "Checking current prices…" : "Review checkout"}
        </button>
      </section>
      <aside className="surface-card h-fit p-5">
        <h2 className="text-lg font-black">Before payment</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          We will reload current prices and availability before showing your
          final review.
        </p>
        <Link className="button-quiet focus-ring mt-5" href="/cart">
          Back to cart
        </Link>
      </aside>
    </form>
  );
}
