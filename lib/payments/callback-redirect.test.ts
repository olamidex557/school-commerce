import { describe, expect, it } from "vitest";
import { paymentResultRedirectUrl } from "./callback-redirect";

describe("payment callback result redirects", () => {
  it("uses the configured public callback origin, not its callback path", () => {
    expect(
      paymentResultRedirectUrl(
        "https://public-tunnel.example/api/payments/paystack/callback?ignored=true",
      )?.toString(),
    ).toBe("https://public-tunnel.example/payment/result");
  });

  it("rejects missing, malformed, and non-web callback configuration", () => {
    expect(paymentResultRedirectUrl(undefined)).toBeNull();
    expect(paymentResultRedirectUrl("not a URL")).toBeNull();
    expect(paymentResultRedirectUrl("ftp://example.test/callback")).toBeNull();
  });
});
