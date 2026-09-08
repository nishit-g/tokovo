import { describe, expect, it } from "vitest";
import { iPhone16Profile, PixelProfile } from "@tokovo/devices";
import { resolveAppDesignWidth } from "../engines/useLayoutEngine.js";

describe("native app scale", () => {
  it("keeps phone apps on the OS point grid and preserves canvas authoring width", () => {
    const width = resolveAppDesignWidth(iPhone16Profile, 393);
    expect(width).toBe(440);
    expect(iPhone16Profile.display.width / width).toBe(iPhone16Profile.pointScale);
    expect(PixelProfile.display.width / resolveAppDesignWidth(PixelProfile, 393)).toBeCloseTo(
      PixelProfile.pointScale,
    );
    expect(resolveAppDesignWidth({ ...iPhone16Profile, type: "desktop" }, 1080)).toBe(1080);
  });
});
