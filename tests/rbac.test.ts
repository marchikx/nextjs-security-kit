import { describe, expect, it } from "vitest";
import { assertCan, can, permissionsFor } from "../src/rbac.js";

describe("rbac", () => {
  it("grants admin all permissions", () => {
    expect(can("admin", "settings:write")).toBe(true);
    expect(permissionsFor("admin").length).toBeGreaterThan(0);
  });

  it("limits viewer to read", () => {
    expect(can("viewer", "content:read")).toBe(true);
    expect(can("viewer", "content:write")).toBe(false);
  });

  it("assertCan throws for denied permission", () => {
    expect(() => assertCan("viewer", "users:write")).toThrow();
  });
});
