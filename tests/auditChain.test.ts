import { describe, expect, it } from "vitest";
import { AuditChain } from "../src/auditChain.js";

describe("AuditChain", () => {
  it("appends linked records", () => {
    const chain = new AuditChain();
    const r1 = chain.append("login", "2026-01-01T00:00:00.000Z");
    const r2 = chain.append("logout", "2026-01-01T00:01:00.000Z");
    expect(r2.prevHash).toBe(r1.hash);
    expect(chain.verify()).toBe(true);
  });

  it("detects tampering", () => {
    const chain = new AuditChain();
    chain.append("event");
    const internal = chain as unknown as {
      records: Array<{ payload: string }>;
    };
    internal.records[0].payload = "tampered";
    expect(chain.verify()).toBe(false);
  });

  it("requires string payload", () => {
    const chain = new AuditChain();
    expect(() =>
      chain.append(undefined as unknown as string),
    ).toThrow();
  });
});
