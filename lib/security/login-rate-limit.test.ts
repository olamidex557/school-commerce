import { describe, expect, it } from "vitest";
import { createLoginRateLimiter } from "./login-rate-limit";

describe("admin login rate limiter", () => {
  it("limits repeated attempts across IP, email, and their combination", () => {
    const limiter = createLoginRateLimiter({
      maxAttempts: 2,
      windowMs: 60_000,
    });
    const keys = ["ip:203.0.113.4", "email:hash", "combined:203.0.113.4:hash"];
    expect(limiter.consume(keys, 1_000)).toEqual({ allowed: true });
    expect(limiter.consume(keys, 1_001)).toEqual({ allowed: true });
    expect(limiter.consume(keys, 1_002)).toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });

  it("allows attempts again after the configured window", () => {
    const limiter = createLoginRateLimiter({
      maxAttempts: 1,
      windowMs: 10_000,
    });
    expect(limiter.consume(["ip:203.0.113.4"], 1_000)).toEqual({
      allowed: true,
    });
    expect(limiter.consume(["ip:203.0.113.4"], 11_001)).toEqual({
      allowed: true,
    });
  });
});
