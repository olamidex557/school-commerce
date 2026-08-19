import { NextResponse } from "next/server";
import { paymentResultRedirectUrl } from "@/lib/payments/callback-redirect";
import { isPaymentReference } from "@/lib/payments/paystack";
import { verifyAndSettlePaystackPayment } from "@/lib/payments/settle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const redirectUrl = paymentResultRedirectUrl(
    process.env.PAYSTACK_CALLBACK_URL,
  );
  if (!redirectUrl)
    return new NextResponse("Payment callback unavailable", { status: 500 });
  const reference = new URL(request.url).searchParams.get("reference");
  if (isPaymentReference(reference)) {
    try {
      await verifyAndSettlePaystackPayment(reference);
    } catch {
      /* The result page remains pending and webhook retries can recover. */
    }
  }
  // The callback URL is not proof of payment and query values are never rendered.
  const response = NextResponse.redirect(redirectUrl);
  if (isPaymentReference(reference)) {
    response.cookies.set("campus_payment_reference", reference, {
      httpOnly: true,
      sameSite: "lax",
      secure: redirectUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
}
