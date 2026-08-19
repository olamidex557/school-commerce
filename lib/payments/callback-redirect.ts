import { z } from "zod";

const callbackUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => {
      if (!URL.canParse(value)) return false;
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    },
    { message: "Callback URL must use HTTP or HTTPS." },
  );

/**
 * Builds a fixed result-page destination from the configured callback URL.
 * The request Host is not used because a public tunnel may proxy to localhost.
 */
export function paymentResultRedirectUrl(callbackUrl: unknown) {
  const parsed = callbackUrlSchema.safeParse(callbackUrl);
  if (!parsed.success) return null;
  return new URL("/payment/result", parsed.data);
}
