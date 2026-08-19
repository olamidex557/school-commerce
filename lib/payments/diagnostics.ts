export function redactProviderMessage(value: unknown) {
  if (typeof value !== "string") return undefined;
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .slice(0, 240);
}

export class PaymentDatabaseError extends Error {
  constructor(
    readonly diagnostic: {
      operation: "create_checkout_payment" | "mark_payment_initialized";
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    },
  ) {
    super("Payment database operation failed");
    this.name = "PaymentDatabaseError";
  }
}

export function databaseFailureDiagnostic(
  operation: PaymentDatabaseError["diagnostic"]["operation"],
  error: unknown,
) {
  const record = error as Record<string, unknown> | null;
  return {
    operation,
    code: typeof record?.code === "string" ? record.code : undefined,
    message: redactProviderMessage(record?.message),
    details: redactProviderMessage(record?.details),
    hint: redactProviderMessage(record?.hint),
  };
}
