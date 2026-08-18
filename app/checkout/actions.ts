"use server";

import { cartSchema } from "@/lib/cart";
import { reconcileCart } from "@/lib/checkout/reconcile";
import type { CheckoutActionState, CheckoutReview } from "@/lib/checkout/state";
import { checkoutSchema } from "@/lib/validation/checkout";

function parseCart(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    return cartSchema.safeParse(JSON.parse(value));
  } catch {
    return null;
  }
}

function deliveryFeeMinor() {
  // A formal delivery-fee rule has not been approved yet. This server-only resolver is the future extension point.
  return 0;
}

function reviewWithTotals(
  summary: Awaited<ReturnType<typeof reconcileCart>>,
  fulfillmentMethod?: "delivery" | "pickup",
): CheckoutReview {
  const fee = fulfillmentMethod === "delivery" ? deliveryFeeMinor() : 0;
  return {
    ...summary,
    deliveryFeeMinor: fee,
    totalMinor: summary.subtotalMinor + fee,
  };
}

export async function getCartReview(
  serializedCart: string,
): Promise<CheckoutReview> {
  const parsed = parseCart(serializedCart);
  if (!parsed?.success)
    return {
      lines: [],
      issues: [],
      subtotalMinor: 0,
      deliveryFeeMinor: 0,
      totalMinor: 0,
    };
  return reviewWithTotals(await reconcileCart(parsed.data.items));
}

export async function reviewCheckout(
  _previous: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const cart = parseCart(formData.get("cart"));
  const details = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    fulfillmentMethod: formData.get("fulfillmentMethod"),
    location: formData.get("location"),
    note: formData.get("note") || undefined,
  });
  if (!cart?.success || !cart.data.items.length)
    return { message: "Your cart is empty or needs refreshing." };
  if (!details.success)
    return {
      fieldErrors: details.error.flatten().fieldErrors,
      message: "Please review the highlighted details.",
    };
  try {
    const review = reviewWithTotals(
      await reconcileCart(cart.data.items),
      details.data.fulfillmentMethod,
    );
    if (!review.lines.length || review.issues.length)
      return {
        review: { ...review, details: details.data },
        message:
          "Your cart changed. Review the availability notices before continuing.",
      };
    return { review: { ...review, details: details.data } };
  } catch {
    return {
      message: "We could not verify the current catalogue. Please try again.",
    };
  }
}
