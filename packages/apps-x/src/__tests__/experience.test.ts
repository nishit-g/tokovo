import { describe, expect, it } from "vitest";
import { resolveXExperience } from "../experience/resolver.js";

describe("X VNext experience resolver", () => {
  it("resolves platform-specific typography and touch metrics", () => {
    const ios = resolveXExperience({ platform: "ios", appearance: "light", locale: "en-US", reducedMotion: false, increasedContrast: false, textScale: 1 });
    const android = resolveXExperience({ platform: "android", appearance: "light", locale: "en-US", reducedMotion: false, increasedContrast: false, textScale: 1 });
    expect(ios.type.family).toContain("SF Pro Text");
    expect(android.type.family).toContain("Roboto Flex");
    expect(ios.metrics.touchTarget).toBe(44);
    expect(android.metrics.touchTarget).toBe(48);
  });

  it("resolves light, dim, and lights-out as distinct palettes", () => {
    const light = resolveXExperience({ platform: "ios", appearance: "light", locale: "en-US", reducedMotion: false, increasedContrast: false, textScale: 1 });
    const dim = resolveXExperience({ platform: "ios", appearance: "dark", themeId: "x-dim", locale: "en-US", reducedMotion: false, increasedContrast: false, textScale: 1 });
    const lightsOut = resolveXExperience({ platform: "ios", appearance: "dark", themeId: "x-lights-out", locale: "en-US", reducedMotion: false, increasedContrast: false, textScale: 1 });
    expect(new Set([light.colors.background, dim.colors.background, lightsOut.colors.background]).size).toBe(3);
    expect(lightsOut.colors.background).toBe("#000000");
  });

  it("supports Arabic RTL and Hindi copy without changing platform metrics", () => {
    const ar = resolveXExperience({ platform: "android", appearance: "dark", locale: "ar-SA", reducedMotion: false, increasedContrast: false, textScale: 1 });
    const hi = resolveXExperience({ platform: "android", appearance: "dark", locale: "hi-IN", reducedMotion: false, increasedContrast: false, textScale: 1 });
    expect(ar.direction).toBe("rtl");
    expect(ar.t("notifications")).toBe("التنبيهات");
    expect(hi.direction).toBe("ltr");
    expect(hi.t("composePlaceholder")).toContain("क्या");
  });

  it("rejects unsupported themes and light/dark mismatches", () => {
    const base = { platform: "ios" as const, appearance: "light" as const, locale: "en-US" as const, reducedMotion: false, increasedContrast: false, textScale: 1 };
    expect(() => resolveXExperience({ ...base, themeId: "storybook" })).toThrow(/X_THEME_UNSUPPORTED/);
    expect(() => resolveXExperience({ ...base, themeId: "x-dim" })).toThrow(/X_THEME_APPEARANCE_MISMATCH/);
  });
});
