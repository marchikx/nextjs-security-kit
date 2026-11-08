import { describe, expect, it } from "vitest";
import { MemoryRateLimiter } from "../src/rateLimitMemory.js";

describe("MemoryRateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new MemoryRateLimiter({ windowMs: 60_000, max: 3 });
    const t0 = 1_000_000;
    const r1 = limiter.consume("user-1", t0);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
  });

  it("blocks when the sliding window is full", () => {
    const limiter = new MemoryRateLimiter({ windowMs: 1_000, max: 2 });
    const t0 = 5_000;
    limiter.consume("ip", t0);
    limiter.consume("ip", t0 + 100);
    const blocked = limiter.consume("ip", t0 + 200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("permits again after the window slides", () => {
    const limiter = new MemoryRateLimiter({ windowMs: 1_000, max: 1 });
    const t0 = 10_000;
    limiter.consume("k", t0);
    const again = limiter.consume("k", t0 + 1_001);
    expect(again.allowed).toBe(true);
  });

  it("throws on invalid options", () => {
    expect(() => new MemoryRateLimiter({ windowMs: 0, max: 1 })).toThrow();
  });
});
