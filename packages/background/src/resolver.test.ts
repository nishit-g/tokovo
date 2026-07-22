import { describe, expect, it } from "vitest";

import { fromPreset, resolveBackground } from "./resolver.js";

describe("resolveBackground", () => {
  it("resolves a governed backdrop profile", () => {
    expect(resolveBackground("studio-quiet-dark")).toMatchObject({
      type: "gradient",
      _resolved: true,
    });
    expect(resolveBackground(fromPreset("studio-quiet-dark"))).toMatchObject({
      type: "gradient",
      _resolved: true,
    });
  });

  it("rejects an unregistered backdrop profile", () => {
    expect(() => resolveBackground("missing-profile" as never)).toThrow(
      "BACKGROUND_PRESET_MISSING",
    );
  });

  it("rejects incomplete and unregistered background configurations", () => {
    expect(() => resolveBackground({ type: "solid" })).toThrow("BACKGROUND_SOLID_INVALID");
    expect(() => resolveBackground({ type: "gradient" })).toThrow("BACKGROUND_GRADIENT_INVALID");
    expect(() => resolveBackground({ type: "image" })).toThrow("BACKGROUND_ASSET_MISSING");
    expect(() => resolveBackground({ type: "unknown" } as never)).toThrow(
      "BACKGROUND_TYPE_UNREGISTERED",
    );
  });
});
