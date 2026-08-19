import "server-only";

import { z } from "zod";
import { redactProviderMessage } from "./diagnostics";
import {
  parsePaystackInitializationResponse,
  type PaystackInitialization,
} from "./paystack-response";
import {
  isPaymentReference,
  webhookSignatureIsValid,
} from "./paystack-security";

const apiUrl = "https://api.paystack.co/transaction";

const transactionSchema = z.object({
  id: z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)]),
  status: z.string(),
  reference: z.string(),
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3),
  paid_at: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  channel: z.string().nullable().optional(),
  gateway_response: z.string().nullable().optional(),
});
const providerResponseSchema = z.object({
  status: z.boolean(),
  data: transactionSchema.optional(),
});

export class PaystackInitializationError extends Error {
  constructor(
    readonly diagnostic: {
      kind: "network" | "response";
      durationMs: number;
      httpStatus?: number;
      providerStatus?: boolean;
      providerMessage?: string;
      responseBodyReceived: boolean;
    },
  ) {
    super("Paystack initialization failed");
    this.name = "PaystackInitializationError";
  }
}

function secret() {
  const value = process.env.PAYSTACK_SECRET_KEY;
  if (!value) throw new Error("Missing required server payment configuration.");
  return value;
}

export function paystackWebhookSignatureIsValid(
  rawBody: string,
  signature: string | null,
) {
  return webhookSignatureIsValid(rawBody, signature, secret());
}

export { isPaymentReference } from "./paystack-security";

export type PaystackTransaction = z.infer<typeof transactionSchema>;

export async function initializePaystackTransaction(input: {
  email: string;
  amountMinor: number;
  currency: "NGN";
  reference: string;
}) {
  const callbackUrl = process.env.PAYSTACK_CALLBACK_URL;
  if (!callbackUrl || !/^https?:\/\//.test(callbackUrl))
    throw new Error("Missing required server payment configuration.");
  const startedAt = performance.now();
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: String(input.amountMinor),
        currency: input.currency,
        reference: input.reference,
        callback_url: callbackUrl,
      }),
      cache: "no-store",
    });
  } catch {
    throw new PaystackInitializationError({
      kind: "network",
      durationMs: Math.round(performance.now() - startedAt),
      responseBodyReceived: false,
    });
  }
  const body: unknown = await response.json().catch(() => null);
  const provider = z
    .object({ status: z.boolean().optional(), message: z.string().optional() })
    .safeParse(body);
  const parsed = parsePaystackInitializationResponse(body, input.reference);
  if (!response.ok || !parsed)
    throw new PaystackInitializationError({
      kind: "response",
      durationMs: Math.round(performance.now() - startedAt),
      httpStatus: response.status,
      providerStatus: provider.success ? provider.data.status : undefined,
      providerMessage: provider.success
        ? redactProviderMessage(provider.data.message)
        : undefined,
      responseBodyReceived: body !== null,
    });
  return parsed satisfies PaystackInitialization;
}

export async function verifyPaystackTransaction(reference: string) {
  if (!isPaymentReference(reference))
    throw new Error("Invalid payment reference.");
  const response = await fetch(
    `${apiUrl}/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret()}` },
      cache: "no-store",
    },
  );
  const parsed = providerResponseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (
    !response.ok ||
    !parsed.success ||
    !parsed.data.status ||
    !parsed.data.data
  )
    throw new Error("Paystack verification failed");
  return parsed.data.data;
}
