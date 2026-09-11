/**
 * In-Memory Sliding Window Rate Limiter for Authentication & Security Hardening
 * Limits client requests (e.g. 5 attempts / 60 seconds) to thwart brute-force password attacks.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const loginRateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const windowMs = 60 * 1000;
    for (const [key, record] of loginRateLimitStore.entries()) {
      const recent = record.timestamps.filter((t) => now - t < windowMs);
      if (recent.length === 0) {
        loginRateLimitStore.delete(key);
      } else {
        record.timestamps = recent;
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkLoginRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = loginRateLimitStore.get(identifier) || { timestamps: [] };

  // Keep only timestamps within window
  const activeTimestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (activeTimestamps.length >= limit) {
    const earliestInWindow = activeTimestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((windowMs - (now - earliestInWindow)) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  // Record this attempt
  activeTimestamps.push(now);
  loginRateLimitStore.set(identifier, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: limit - activeTimestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

export function resetLoginRateLimit(identifier: string) {
  loginRateLimitStore.delete(identifier);
}
