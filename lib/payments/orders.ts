import "server-only";

import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import type { CartItem } from "@/lib/cart";
import type { CheckoutDetails } from "@/lib/validation/checkout";
import type { PaystackTransaction } from "./paystack";
import { databaseFailureDiagnostic, PaymentDatabaseError } from "./diagnostics";
import {
  normalizeCheckoutPaymentAttempt,
  type CheckoutPaymentRpcRow,
  type PaymentStatus,
} from "./payment-attempt";

type AttemptRow = {
  id: string;
  order_id: string;
  paystack_reference: string;
  amount_minor: number;
  currency: "NGN";
  status: PaymentStatus;
};
export type { PaymentStatus } from "./payment-attempt";

export function createPaymentReference() {
  return `ca.${randomBytes(24).toString("hex")}`;
}

export async function createCheckoutPayment(input: {
  checkoutKey: string;
  details: CheckoutDetails;
  items: CartItem[];
}) {
  const supabase = createServiceClient();
  const reference = createPaymentReference();
  const { data, error } = await supabase
    .rpc("create_checkout_payment", {
      p_checkout_key: input.checkoutKey,
      p_reference: reference,
      p_full_name: input.details.fullName,
      p_email: input.details.email.toLowerCase(),
      p_phone: input.details.phone,
      p_fulfillment: input.details.fulfillmentMethod,
      p_location: input.details.location,
      p_note: input.details.note ?? null,
      p_items: input.items.map(({ productId, variantId, quantity }) => ({
        product_id: productId,
        variant_id: variantId,
        quantity,
      })),
    })
    .single<CheckoutPaymentRpcRow>();
  if (error || !data)
    throw new PaymentDatabaseError(
      databaseFailureDiagnostic("create_checkout_payment", error),
    );
  return normalizeCheckoutPaymentAttempt(data);
}

export async function markPaymentInitialized(reference: string) {
  const { error } = await createServiceClient()
    .from("payment_attempts")
    .update({
      status: "initialized",
      initialized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("paystack_reference", reference)
    .in("status", ["pending", "initialized"]);
  if (error)
    throw new PaymentDatabaseError(
      databaseFailureDiagnostic("mark_payment_initialized", error),
    );
}

export async function markPaymentProviderStatus(
  reference: string,
  status: Exclude<PaymentStatus, "success" | "initialized">,
) {
  const { error } = await createServiceClient()
    .from("payment_attempts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("paystack_reference", reference)
    .in("status", ["pending", "initialized"]);
  if (error) throw new Error("Could not update payment attempt.");
}

export async function getPaymentAttempt(reference: string) {
  const { data, error } = await createServiceClient()
    .from("payment_attempts")
    .select(
      "id,order_id,paystack_reference,amount_minor,currency,status,orders(order_number,total_minor,fulfillment_method,status,customer_email_snapshot)",
    )
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (error) throw new Error("Could not read payment attempt.");
  return data as
    | (AttemptRow & {
        orders: {
          order_number: string;
          total_minor: number;
          fulfillment_method: "pickup" | "delivery";
          status: string;
          customer_email_snapshot: string | null;
        } | null;
      })
    | null;
}

export async function createPaymentRetry(orderId: string) {
  const { data, error } = await createServiceClient()
    .rpc("create_paystack_payment_retry", {
      p_order_id: orderId,
      p_reference: createPaymentReference(),
    })
    .single<{
      payment_attempt_id: string;
      reference: string;
      amount_minor: number;
      currency: "NGN";
    }>();
  if (error || !data) throw new Error("Could not retry payment.");
  return data;
}

export async function fulfilVerifiedPayment(
  reference: string,
  transaction: PaystackTransaction,
) {
  const attempt = await getPaymentAttempt(reference);
  if (!attempt) return { kind: "unknown" as const };
  if (attempt.status === "success")
    return {
      kind: "success" as const,
      orderNumber: attempt.orders?.order_number ?? null,
      amountMinor: attempt.amount_minor,
      fulfillment: attempt.orders?.fulfillment_method ?? null,
    };
  if (
    transaction.status !== "success" ||
    transaction.reference !== reference ||
    transaction.amount !== attempt.amount_minor ||
    transaction.currency !== attempt.currency
  )
    return { kind: "invalid" as const };
  const transactionId = BigInt(transaction.id).toString();
  const paidAt =
    transaction.paid_at ?? transaction.paidAt ?? new Date().toISOString();
  const { data, error } = await createServiceClient()
    .rpc("fulfil_verified_paystack_payment", {
      p_reference: reference,
      p_transaction_id: transactionId,
      p_paid_at: paidAt,
      p_channel: transaction.channel ?? null,
      p_gateway_response: transaction.gateway_response ?? null,
    })
    .single<{
      order_number: string;
      amount_minor: number;
      fulfillment: "pickup" | "delivery";
    }>();
  if (error || !data) throw new Error("Could not fulfil verified payment.");
  return {
    kind: "success" as const,
    orderNumber: data.order_number,
    amountMinor: data.amount_minor,
    fulfillment: data.fulfillment,
  };
}

export async function paymentResult(reference: string) {
  return getPaymentAttempt(reference);
}
