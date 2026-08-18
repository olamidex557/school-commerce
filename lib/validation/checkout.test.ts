import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout";

const valid = {
  fullName: "Ada Okafor",
  email: "ada@example.com",
  phone: "0803 123 4567",
  fulfillmentMethod: "pickup",
  location: "",
  note: "",
};

describe("guest checkout validation", () => {
  it("accepts pickup and normalizes common Nigerian numbers", () => {
    const result = checkoutSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("08031234567");
  });

  it("requires a delivery location and rejects malformed customer details", () => {
    expect(
      checkoutSchema.safeParse({ ...valid, fulfillmentMethod: "delivery" })
        .success,
    ).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, fullName: "A" }).success).toBe(
      false,
    );
    expect(
      checkoutSchema.safeParse({ ...valid, email: "not-email" }).success,
    ).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(
      false,
    );
  });
});
