import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { isPaymentReference } from "@/lib/payments/paystack";
import { paymentResult } from "@/lib/payments/orders";
import { refreshPaymentResult, retryPayment } from "./actions";

function price(value: number) { return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value / 100); }

export default async function PaymentResultPage() {
  const reference = (await cookies()).get("campus_payment_reference")?.value;
  const payment = isPaymentReference(reference) ? await paymentResult(reference) : null;
  if (!payment) return <section className="surface-card mx-auto max-w-xl p-8 text-center"><h1 className="font-display text-4xl font-bold">Payment status unavailable</h1><p className="mt-3 text-[var(--muted)]">Return to checkout to begin a secure payment.</p><Link href="/checkout" className="button-primary focus-ring mt-7">Return to checkout</Link></section>;
  const order = payment.orders;
  if (payment.status === "success") return <section className="surface-card mx-auto max-w-xl p-8 text-center"><CheckCircle2 className="mx-auto text-[var(--success)]" size={40}/><p className="text-kicker mt-5">Payment confirmed</p><h1 className="font-display mt-2 text-4xl font-bold">Thank you for your order</h1><p className="mt-4 text-[var(--muted)]">Order <strong>{order?.order_number}</strong> is paid. Total: <strong>{price(payment.amount_minor)}</strong>.</p><p className="mt-3 text-[var(--muted)]">We’ll prepare it for {order?.fulfillment_method === "delivery" ? "campus delivery" : "pickup"}.</p><Link href="/shop" className="button-primary focus-ring mt-7">Continue shopping</Link></section>;
  const terminal = payment.status === "failed" || payment.status === "abandoned" || payment.status === "reversed";
  return <section className="surface-card mx-auto max-w-xl p-8 text-center">{terminal ? <XCircle className="mx-auto text-[var(--danger)]" size={40}/> : <Clock3 className="mx-auto text-[var(--accent)]" size={40}/>}<p className="text-kicker mt-5">{terminal ? "Payment not completed" : "Verification pending"}</p><h1 className="font-display mt-2 text-4xl font-bold">{terminal ? "Your order is still unpaid" : "We’re confirming your payment"}</h1><p className="mt-4 text-[var(--muted)]">{terminal ? "No paid order has been confirmed. You can safely retry this same order." : "Do not pay again yet. Refresh this status in a moment; webhook confirmation may still be arriving."}</p>{terminal ? <form action={retryPayment}><button className="button-primary focus-ring mt-7" type="submit">Retry secure payment</button></form> : <form action={refreshPaymentResult}><button className="button-primary focus-ring mt-7" type="submit">Refresh payment status</button></form>}</section>;
}
