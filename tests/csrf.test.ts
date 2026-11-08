import { describe, expect, it } from "vitest";
import { createToken, verifyToken } from "../src/csrf.js";

describe("csrf", () => {
  const secret = "test-secret";
  const sessionId = "sess-abc";

  it("creates a verifiable token", () => {
    const token = createToken(secret, sessionId);
    expect(token).toMatch(/^[0-9a-f]+\.[0-9a-f]+$/i);
    expect(verifyToken(secret, sessionId, token)).toBe(true);
  });

  it("rejects wrong session or secret", () => {
    const token = createToken(secret, sessionId);
    expect(verifyToken(secret, "other-session", token)).toBe(false);
    expect(verifyToken("wrong-secret", sessionId, token)).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(verifyToken(secret, sessionId, "")).toBe(false);
    expect(verifyToken(secret, sessionId, "notoken")).toBe(false);
    expect(verifyToken(secret, sessionId, "abc.nothex")).toBe(false);
  });

  it("throws when creating without secret or session", () => {
    expect(() => createToken("", sessionId)).toThrow();
    expect(() => createToken(secret, "")).toThrow();
  });
});
