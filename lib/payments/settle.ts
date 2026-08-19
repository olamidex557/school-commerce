import "server-only";

import { fulfilVerifiedPayment, markPaymentProviderStatus } from "./orders";
import { verifyPaystackTransaction } from "./paystack";

export async function verifyAndSettlePaystackPayment(reference: string) {
  const transaction = await verifyPaystackTransaction(reference);
  if (transaction.status === "success") return fulfilVerifiedPayment(reference, transaction);
  if (transaction.status === "failed" || transaction.status === "abandoned" || transaction.status === "reversed")
    await markPaymentProviderStatus(reference, transaction.status);
  return { kind: transaction.status === "failed" || transaction.status === "abandoned" || transaction.status === "reversed" ? transaction.status : "pending" };
}
