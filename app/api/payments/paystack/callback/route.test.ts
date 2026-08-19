import { beforeEach, describe, expect, it, vi } from "vitest";

const { settle } = vi.hoisted(() => ({ settle: vi.fn() }));

vi.mock("@/lib/payments/paystack", () => ({
  isPaymentReference: (value: unknown) =>
    value === "ca.0123456789abcdef0123456789abcdef0123456789abcdef",
}));
vi.mock("@/lib/payments/settle", () => ({
  verifyAndSettlePaystackPayment: settle,
}));

import { GET } from "./route";

const reference = "ca.0123456789abcdef0123456789abcdef0123456789abcdef";

describe("Paystack callback", () => {
  beforeEach(() => {
    process.env.PAYSTACK_CALLBACK_URL =
      "https://public-tunnel.example/api/payments/paystack/callback";
    settle.mockReset().mockResolvedValue({ kind: "pending" });
  });

  it("returns an absolute public result URL after safe processing", async () => {
    const response = await GET(
      new Request(
        `http://localhost:3000/api/payments/paystack/callback?trxref=${reference}&reference=${reference}`,
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://public-tunnel.example/payment/result",
    );
    expect(response.headers.get("set-cookie")).toContain(
      `campus_payment_reference=${reference}`,
    );
    expect(response.headers.get("set-cookie")).toContain("Path=/");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
    expect(response.headers.get("set-cookie")).toContain("Secure");
    expect(settle).toHaveBeenCalledWith(reference);
  });

  it("does not let callback query parameters control the redirect target", async () => {
    const response = await GET(
      new Request(
        `http://localhost:3000/api/payments/paystack/callback?reference=${reference}&redirect=https://attacker.example`,
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://public-tunnel.example/payment/result",
    );
  });

  it("does not settle missing or invalid references", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/payments/paystack/callback?reference=not-a-reference",
      ),
    );

    expect(response.status).toBe(307);
    expect(settle).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("continues to route duplicate callbacks through the idempotent settlement path", async () => {
    const request = () =>
      new Request(
        `http://localhost:3000/api/payments/paystack/callback?reference=${reference}`,
      );

    await GET(request());
    await GET(request());

    expect(settle).toHaveBeenCalledTimes(2);
    expect(settle).toHaveBeenLastCalledWith(reference);
  });
});
