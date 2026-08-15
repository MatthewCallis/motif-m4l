import { describe, expect, it } from "vitest";
import { classNames } from "../../../../src/max/library/ui/class-names.js";

describe("classNames", () => {
  it("joins strings and skips falsy tokens", () => {
    expect(classNames("btn", "accent")).toBe("btn accent");
    expect(classNames("btn", false, null, undefined, "", 0, "wide")).toBe("btn wide");
    expect(classNames()).toBe("");
  });

  it("keeps a number token and ignores a lone true", () => {
    expect(classNames(2, true, "col")).toBe("2 col");
  });

  it("includes object keys only when the value is truthy", () => {
    expect(classNames("tag-mode-btn", { active: true, hidden: false })).toBe("tag-mode-btn active");
    expect(classNames({ open: true, "has-error": true })).toBe("open has-error");
    expect(classNames({ "": true, hidden: true })).toBe("hidden");
  });

  it("flattens nested arrays", () => {
    expect(classNames(["btn", { accent: true }], ["hidden", null])).toBe("btn accent hidden");
  });
});
