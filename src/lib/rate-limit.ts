// In-memory fixed-window rate limiter. Single-process — fine for Next dev and a
// single instance; behind multiple instances it would need shared state (Redis
// or similar). Used to cap login attempts (brute-force defense, API-11).

interface Window {
  count: number;
  /** Epoch ms at which this window resets. */
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets — for a `Retry-After` header. 0 when allowed. */
  retryAfterSec: number;
  /** Remaining hits in the current window (0 when blocked). */
  remaining: number;
}

/**
 * Count one hit against `key`. Up to `limit` hits are allowed per `windowMs`;
 * the (limit+1)-th within the same window is rejected until it resets. `now` is
 * injectable so the window logic is deterministically testable.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const w = windows.get(key);
  if (!w || now >= w.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0, remaining: limit - 1 };
  }
  w.count++;
  if (w.count > limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((w.resetAt - now) / 1000)),
      remaining: 0,
    };
  }
  return { allowed: true, retryAfterSec: 0, remaining: limit - w.count };
}

/** Drop a key's window — e.g. to reset the counter after a successful login. */
export function clearRateLimit(key: string): void {
  windows.delete(key);
}

/** Test helper — wipe all windows so cases don't bleed into each other. */
export function _resetAllRateLimits(): void {
  windows.clear();
}
