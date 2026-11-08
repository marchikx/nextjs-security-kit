import { describe, expect, it } from "vitest";
import { assertSameOrigin } from "../src/assertSameOrigin.js";

describe("assertSameOrigin", () => {
  const allow = ["https://app.example.com"];

  it("allows matching Origin", () => {
    expect(
      assertSameOrigin({ origin: "https://app.example.com" }, allow),
    ).toBe(true);
  });

  it("allows matching Referer when Origin is absent", () => {
    expect(
      assertSameOrigin(
        { referer: "https://app.example.com/dashboard" },
        allow,
      ),
    ).toBe(true);
  });

  it("rejects foreign origins", () => {
    expect(
      assertSameOrigin({ origin: "https://evil.example.com" }, allow),
    ).toBe(false);
  });

  it("rejects when allowlist is empty", () => {
    expect(assertSameOrigin({ origin: "https://app.example.com" }, [])).toBe(
      false,
    );
  });

  it("rejects invalid headers", () => {
    expect(assertSameOrigin({}, allow)).toBe(false);
    expect(assertSameOrigin({ origin: "not-a-url" }, allow)).toBe(false);
  });
});
