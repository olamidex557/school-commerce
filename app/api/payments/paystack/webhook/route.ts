import { NextResponse } from "next/server";
import { isPaymentReference, paystackWebhookSignatureIsValid } from "@/lib/payments/paystack";
import { verifyAndSettlePaystackPayment } from "@/lib/payments/settle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!paystackWebhookSignatureIsValid(rawBody, request.headers.get("x-paystack-signature")))
    return new NextResponse("Invalid signature", { status: 401 });
  let event: { event?: string; data?: { reference?: string } };
  try { event = JSON.parse(rawBody); } catch { return new NextResponse("Invalid payload", { status: 400 }); }
  if (event.event !== "charge.success") return NextResponse.json({ received: true });
  const reference = event.data?.reference;
  if (!isPaymentReference(reference)) return NextResponse.json({ received: true });
  try {
    // Webhook data is a hint only; verification below is the fulfilment authority.
    await verifyAndSettlePaystackPayment(reference);
    return NextResponse.json({ received: true });
  } catch {
    // A non-2xx response deliberately asks Paystack to retry transient failures.
    return new NextResponse("Unable to process", { status: 500 });
  }
}
