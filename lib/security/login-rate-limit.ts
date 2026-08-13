export type LoginRateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
};

export type LoginRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

type RateLimitBucket = { count: number; resetAt: number };

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getLoginRateLimitConfig(): LoginRateLimitConfig {
  return {
    maxAttempts: positiveInteger(
      process.env.ADMIN_LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
      5,
    ),
    windowMs:
      positiveInteger(process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS, 900) *
      1_000,
  };
}

export function createLoginRateLimiter(config: LoginRateLimitConfig) {
  const buckets = new Map<string, RateLimitBucket>();

  return {
    consume(keys: string[], now = Date.now()): LoginRateLimitResult {
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
      }

      const uniqueKeys = [...new Set(keys)];
      const activeBuckets = uniqueKeys.map((key) => {
        const existing = buckets.get(key);
        if (existing && existing.resetAt > now) return existing;
        const fresh = { count: 0, resetAt: now + config.windowMs };
        buckets.set(key, fresh);
        return fresh;
      });

      const blocked = activeBuckets.find(
        (bucket) => bucket.count >= config.maxAttempts,
      );
      if (blocked) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((blocked.resetAt - now) / 1_000),
          ),
        };
      }

      activeBuckets.forEach((bucket) => (bucket.count += 1));
      return { allowed: true };
    },
  };
}

const globalForRateLimit = globalThis as typeof globalThis & {
  campusAdminLoginRateLimiter?: ReturnType<typeof createLoginRateLimiter>;
};

export const adminLoginRateLimiter =
  globalForRateLimit.campusAdminLoginRateLimiter ??
  createLoginRateLimiter(getLoginRateLimitConfig());

globalForRateLimit.campusAdminLoginRateLimiter = adminLoginRateLimiter;
