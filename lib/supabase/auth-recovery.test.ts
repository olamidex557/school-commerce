import { describe, expect, it } from "vitest";
import {
  isInvalidRefreshTokenError,
  supabaseAuthCookieNames,
} from "./auth-recovery";

describe("Supabase invalid-session recovery", () => {
  it("recognizes only explicit invalid refresh token responses", () => {
    expect(
      isInvalidRefreshTokenError({
        message: "Invalid Refresh Token: Refresh Token Not Found",
      }),
    ).toBe(true);
    expect(
      isInvalidRefreshTokenError({ message: "Network request failed" }),
    ).toBe(false);
  });

  it("targets only the configured project's Supabase auth cookie chunks", () => {
    expect(
      supabaseAuthCookieNames(
        [
          "sb-projectref-auth-token",
          "sb-projectref-auth-token.0",
          "sb-other-auth-token",
          "theme",
        ],
        "https://projectref.supabase.co",
      ),
    ).toEqual(["sb-projectref-auth-token", "sb-projectref-auth-token.0"]);
  });
});
