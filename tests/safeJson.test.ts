import { describe, expect, it } from "vitest";
import { safeJsonParse } from "../src/safeJson.js";

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    const result = safeJsonParse<{ a: number }>('{"a":1}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.a).toBe(1);
    }
  });

  it("rejects empty input", () => {
    expect(safeJsonParse("").ok).toBe(false);
  });

  it("rejects oversize payloads", () => {
    const big = JSON.stringify({ x: "y".repeat(100) });
    const result = safeJsonParse(big, { maxBytes: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("too_large");
    }
  });

  it("rejects invalid JSON", () => {
    const result = safeJsonParse("{not json");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_json");
    }
  });
});
