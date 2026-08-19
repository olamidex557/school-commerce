import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  databaseFailureDiagnostic,
  redactProviderMessage,
} from "./diagnostics";
import {
  isPaymentReference,
  webhookSignatureIsValid,
} from "./paystack-security";
import { parsePaystackInitializationResponse } from "./paystack-response";
import { normalizeCheckoutPaymentAttempt } from "./payment-attempt";

describe("Paystack trust-boundary helpers", () => {
  it("accepts only safe, non-trivial Paystack references", () => {
    expect(
      isPaymentReference("ca.0123456789abcdef0123456789abcdef0123456789abcdef"),
    ).toBe(true);
    expect(isPaymentReference("order 123")).toBe(false);
    expect(isPaymentReference("short")).toBe(false);
  });

  it("requires an exact HMAC-SHA512 webhook signature", () => {
    const body = '{"event":"charge.success"}';
    const signature = createHmac("sha512", "test-secret")
      .update(body)
      .digest("hex");
    expect(webhookSignatureIsValid(body, signature, "test-secret")).toBe(true);
    expect(webhookSignatureIsValid(`${body} `, signature, "test-secret")).toBe(
      false,
    );
    expect(webhookSignatureIsValid(body, null, "test-secret")).toBe(false);
  });

  it("redacts customer email from provider diagnostics", () => {
    expect(redactProviderMessage("Invalid email ada@example.com")).toBe(
      "Invalid email [redacted-email]",
    );
  });

  it("keeps database diagnostics structured and redacted", () => {
    expect(
      databaseFailureDiagnostic("create_checkout_payment", {
        code: "23505",
        message: "email ada@example.com already exists",
      }),
    ).toMatchObject({
      operation: "create_checkout_payment",
      code: "23505",
      message: "email [redacted-email] already exists",
    });
  });

  it("normalizes Paystack's documented initialization response shape", () => {
    expect(
      parsePaystackInitializationResponse({
        status: true,
        message: "Authorization URL created",
        data: {
          authorization_url: "https://checkout.paystack.com/test",
          access_code: "test-access-code",
          reference: "test-reference",
        },
      }),
    ).toEqual({
      authorizationUrl: "https://checkout.paystack.com/test",
      accessCode: "test-access-code",
      reference: "test-reference",
    });
  });

  it("rejects a provider reference that differs from the internal reference", () => {
    expect(
      parsePaystackInitializationResponse(
        {
          status: true,
          message: "Authorization URL created",
          data: {
            authorization_url: "https://checkout.paystack.com/test",
            access_code: "test-access-code",
            reference: "provider-reference",
          },
        },
        "internal-reference",
      ),
    ).toBeNull();
  });

  it("maps the checkout RPC reference to the internal Paystack reference", () => {
    expect(
      normalizeCheckoutPaymentAttempt({
        payment_attempt_id: "attempt-id",
        order_id: "order-id",
        reference: "ca.internal-reference",
        amount_minor: 20000,
        currency: "NGN",
      }),
    ).toMatchObject({
      id: "attempt-id",
      paystack_reference: "ca.internal-reference",
      amount_minor: 20000,
    });
  });

  it.each([
    { status: true, message: "Authorization URL created" },
    {
      status: true,
      message: "Authorization URL created",
      data: {
        authorization_url: "https://checkout.paystack.com/test",
        access_code: "test",
      },
    },
    {
      status: true,
      message: "Authorization URL created",
      data: {
        authorization_url: "https://checkout.paystack.com/test",
        reference: "test",
      },
    },
    {
      status: true,
      message: "Authorization URL created",
      data: { access_code: "test", reference: "test" },
    },
    {
      status: false,
      message: "Rejected",
      data: {
        authorization_url: "https://checkout.paystack.com/test",
        access_code: "test",
        reference: "test",
      },
    },
    {
      status: true,
      message: "Authorization URL created",
      data: { authorization_url: 42, access_code: "test", reference: "test" },
    },
  ])("rejects malformed initialization response %#", (body) => {
    expect(parsePaystackInitializationResponse(body)).toBeNull();
  });
});
