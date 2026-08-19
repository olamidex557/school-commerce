import { z } from "zod";

const initializeResponseSchema = z.object({
  status: z.literal(true),
  message: z.string(),
  data: z.object({
    authorization_url: z.string().url(),
    access_code: z.string().min(1),
    reference: z.string().min(1),
  }),
});

export type PaystackInitialization = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export function parsePaystackInitializationResponse(
  body: unknown,
  expectedReference?: string,
): PaystackInitialization | null {
  const parsed = initializeResponseSchema.safeParse(body);
  if (!parsed.success) return null;
  const initialization = {
    authorizationUrl: parsed.data.data.authorization_url,
    accessCode: parsed.data.data.access_code,
    reference: parsed.data.data.reference,
  };
  if (expectedReference && initialization.reference !== expectedReference)
    return null;
  return initialization;
}
