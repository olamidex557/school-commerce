import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const referenceSchema = z.string().regex(/^[A-Za-z0-9.=\-]{16,120}$/);

export function isPaymentReference(value: unknown): value is string {
  return referenceSchema.safeParse(value).success;
}

export function webhookSignatureIsValid(rawBody: string, signature: string | null, secret: string) {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}
