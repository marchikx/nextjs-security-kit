export type RateLimitResult =
  | { allowed: true; remaining: number; retryAfterMs: number }
  | { allowed: false; remaining: 0; retryAfterMs: number };

export type MemoryRateLimiterOptions = {
  windowMs: number;
  max: number;
};

type Bucket = number[];

/**
 * In-memory sliding-window rate limiter keyed by arbitrary string (e.g. IP or user id).
 */
export class MemoryRateLimiter {
  private readonly windowMs: number;
  private readonly max: number;
  private readonly buckets = new Map<string, Bucket>();

  constructor(options: MemoryRateLimiterOptions) {
    if (options.windowMs <= 0 || options.max <= 0) {
      throw new Error("windowMs and max must be positive");
    }
    this.windowMs = options.windowMs;
    this.max = options.max;
  }

  private prune(key: string, now: number): Bucket {
    const existing = this.buckets.get(key) ?? [];
    const cutoff = now - this.windowMs;
    const pruned = existing.filter((t) => t > cutoff);
    this.buckets.set(key, pruned);
    return pruned;
  }

  consume(key: string, now: number = Date.now()): RateLimitResult {
    const window = this.prune(key, now);
    if (window.length >= this.max) {
      const oldest = window[0] ?? now;
      const retryAfterMs = Math.max(0, oldest + this.windowMs - now);
      return { allowed: false, remaining: 0, retryAfterMs };
    }
    window.push(now);
    this.buckets.set(key, window);
    const remaining = Math.max(0, this.max - window.length);
    return { allowed: true, remaining, retryAfterMs: 0 };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}
