import { describe, expect, it } from "vitest";

import { deriveKeyPressFromChar } from "../keyboard/index.js";

describe("typewriter keyboard mapping", () => {
  it("uses Shift for uppercase letters only", () => {
    expect(deriveKeyPressFromChar("A").keys).toEqual(["SHIFT", "A"]);
    expect(deriveKeyPressFromChar("a").keys).toEqual(["A"]);
  });

  it("does not fake a physical key for unsupported scripts", () => {
    expect(deriveKeyPressFromChar("न")).toEqual({ keys: [], category: "key" });
  });
});
