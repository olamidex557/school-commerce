"use server";

import { cartSchema } from "@/lib/cart";
import { reconcileCart } from "@/lib/checkout/reconcile";
import type { CheckoutActionState, CheckoutReview } from "@/lib/checkout/state";
import { checkoutSchema } from "@/lib/validation/checkout";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  createCheckoutPayment,
  markPaymentInitialized,
} from "@/lib/payments/orders";
import {
  initializePaystackTransaction,
  PaystackInitializationError,
} from "@/lib/payments/paystack";
import { PaymentDatabaseError } from "@/lib/payments/diagnostics";
import type { PaymentStartState } from "@/lib/checkout/state";

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

const checkoutKeySchema = z.string().uuid();

function logPaymentInitializationFailure(
  error: unknown,
  context: {
    step: "create_payment_attempt" | "paystack_initialize" | "mark_initialized";
    durationMs: number;
    reference?: string;
    amountMinor?: number;
  },
) {
  const provider =
    error instanceof PaystackInitializationError ? error.diagnostic : undefined;
  const database =
    error instanceof PaymentDatabaseError ? error.diagnostic : undefined;
  console.error("Payment initialization failed", {
    step: context.step,
    totalDurationMs: context.durationMs,
    reference: context.reference,
    amountMinor: context.amountMinor,
    provider,
    database,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
}

export async function initializeCheckoutPayment(
  _previous: PaymentStartState,
  formData: FormData,
): Promise<PaymentStartState> {
  const cart = parseCart(formData.get("cart"));
  const checkoutKey = checkoutKeySchema.safeParse(formData.get("checkoutKey"));
  const details = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    fulfillmentMethod: formData.get("fulfillmentMethod"),
    location: formData.get("location"),
    note: formData.get("note") || undefined,
  });
  if (
    !cart?.success ||
    !cart.data.items.length ||
    !checkoutKey.success ||
    !details.success
  )
    return {
      message:
        "Your checkout details need refreshing. Please review them again.",
    };
  const startedAt = performance.now();
  let step:
    | "create_payment_attempt"
    | "paystack_initialize"
    | "mark_initialized" = "create_payment_attempt";
  let attempt: Awaited<ReturnType<typeof createCheckoutPayment>> | undefined;
  try {
    attempt = await createCheckoutPayment({
      checkoutKey: checkoutKey.data,
      details: details.data,
      items: cart.data.items,
    });
    step = "paystack_initialize";
    const initialization = await initializePaystackTransaction({
      email: details.data.email,
      amountMinor: attempt.amount_minor,
      currency: attempt.currency,
      reference: attempt.paystack_reference,
    });
    step = "mark_initialized";
    await markPaymentInitialized(initialization.reference);
    const cookieStore = await cookies();
    cookieStore.set("campus_payment_reference", initialization.reference, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return { authorizationUrl: initialization.authorizationUrl };
  } catch (error) {
    logPaymentInitializationFailure(error, {
      step,
      durationMs: Math.round(performance.now() - startedAt),
      reference: attempt?.paystack_reference,
      amountMinor: attempt?.amount_minor,
    });
    return {
      message:
        "We could not start a secure payment. No payment was taken; please try again.",
    };
  }
}
