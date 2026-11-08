import { describe, expect, it } from "vitest";
import { isAllowedUrl, ssrfGuard } from "../src/ssrfGuard.js";

describe("ssrfGuard", () => {
  it("allows public https URLs", () => {
    expect(isAllowedUrl("https://example.com/path")).toBe(true);
  });

  it("blocks localhost and private IPv4", () => {
    expect(isAllowedUrl("http://127.0.0.1")).toBe(false);
    expect(isAllowedUrl("http://10.0.0.5")).toBe(false);
    expect(isAllowedUrl("http://192.168.1.1")).toBe(false);
    expect(isAllowedUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
  });

  it("blocks metadata hostnames", () => {
    const result = ssrfGuard("http://metadata.google.internal/computeMetadata");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("blocked host");
    }
  });

  it("rejects invalid and non-http(s) URLs", () => {
    expect(ssrfGuard("not-url").ok).toBe(false);
    expect(ssrfGuard("file:///etc/passwd").ok).toBe(false);
  });
});
