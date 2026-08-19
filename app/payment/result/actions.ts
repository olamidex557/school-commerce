"use server";

import { cookies } from "next/headers";
import { isPaymentReference } from "@/lib/payments/paystack";
import { verifyAndSettlePaystackPayment } from "@/lib/payments/settle";
import {
  createPaymentRetry,
  getPaymentAttempt,
  markPaymentInitialized,
} from "@/lib/payments/orders";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { redirect } from "next/navigation";

export async function refreshPaymentResult() {
  const reference = (await cookies()).get("campus_payment_reference")?.value;
  if (!isPaymentReference(reference)) return;
  try {
    await verifyAndSettlePaystackPayment(reference);
  } catch {
    /* Keep the non-authoritative pending state visible. */
  }
}

export async function retryPayment() {
  const cookieStore = await cookies();
  const reference = cookieStore.get("campus_payment_reference")?.value;
  if (!isPaymentReference(reference)) redirect("/checkout");
  const existing = await getPaymentAttempt(reference);
  if (!existing?.orders || !["failed", "abandoned"].includes(existing.status))
    redirect("/payment/result");
  let authorizationUrl: string;
  try {
    const retry = await createPaymentRetry(existing.order_id);
    const initialization = await initializePaystackTransaction({
      email: existing.orders.customer_email_snapshot ?? "",
      amountMinor: retry.amount_minor,
      currency: retry.currency,
      reference: retry.reference,
    });
    await markPaymentInitialized(initialization.reference);
    cookieStore.set("campus_payment_reference", initialization.reference, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    authorizationUrl = initialization.authorizationUrl;
  } catch {
    redirect("/payment/result");
  }
  redirect(authorizationUrl);
}
