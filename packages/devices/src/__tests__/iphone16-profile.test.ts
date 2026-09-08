import { describe, expect, it } from "vitest";

import { iPhone16Constants, iPhone16Profile } from "../iphone16/profile.js";

describe("iPhone 16 physical display fit", () => {
  it("uses one symmetric slim bezel around the exact display surface", () => {
    const { dimensions, display } = iPhone16Profile;

    expect(display.x).toBe(iPhone16Constants.DISPLAY_INSET);
    expect(display.y).toBe(iPhone16Constants.DISPLAY_INSET);
    expect(dimensions.width - display.width - display.x).toBe(display.x);
    expect(dimensions.height - display.height - display.y).toBe(display.y);
    expect(iPhone16Constants.DISPLAY_INSET).toBeLessThan(30);
  });
});
