export type PaymentStatus =
  | "pending"
  | "initialized"
  | "success"
  | "failed"
  | "abandoned"
  | "reversed";

export type CheckoutPaymentRpcRow = {
  payment_attempt_id: string;
  order_id: string;
  reference: string;
  amount_minor: number;
  currency: "NGN";
};

export function normalizeCheckoutPaymentAttempt(row: CheckoutPaymentRpcRow) {
  return {
    id: row.payment_attempt_id,
    order_id: row.order_id,
    paystack_reference: row.reference,
    amount_minor: row.amount_minor,
    currency: row.currency,
    status: "pending" as const,
  };
}
