import { describe, expect, it } from "vitest";
import { redactPii } from "../src/piiRedactor.js";

describe("redactPii", () => {
  it("redacts emails", () => {
    const out = redactPii("Contact user@example.com today");
    expect(out).not.toContain("user@example.com");
    expect(out).toContain("[REDACTED]");
  });

  it("redacts phone-like sequences", () => {
    const out = redactPii("Call +1 555-123-4567 for help");
    expect(out).not.toContain("555-123-4567");
  });

  it("leaves non-PII text intact", () => {
    const text = "Order #12345 shipped";
    expect(redactPii(text)).toBe(text);
  });
});
