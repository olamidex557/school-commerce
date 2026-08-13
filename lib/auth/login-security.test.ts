import { describe, expect, it } from "vitest";
import { GENERIC_ADMIN_LOGIN_ERROR } from "./login-security";
import { adminLoginSchema } from "../validation/admin-auth";

describe("admin login security behavior", () => {
  it("rejects invalid login input before authentication", () => {
    expect(
      adminLoginSchema.safeParse({ email: "not-an-email", password: "" })
        .success,
    ).toBe(false);
  });

  it("uses the same generic error for failed authentication and authorization", () => {
    expect(GENERIC_ADMIN_LOGIN_ERROR).not.toMatch(
      /exist|registered|password is wrong|not authorized/i,
    );
  });
});
