import { describe, expect, it } from "vitest";
import { csvEscape, csvRow } from "../src/csvEscape.js";

describe("csvEscape", () => {
  it("leaves simple cells unchanged", () => {
    expect(csvEscape("hello")).toBe("hello");
  });

  it("quotes cells with commas and quotes", () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    expect(csvEscape("a,b")).toBe('"a,b"');
  });

  it("builds a row", () => {
    expect(csvRow(["a", "b,c"])).toBe('a,"b,c"');
  });
});
