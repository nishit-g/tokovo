import { describe, expect, it } from "vitest";
import type { DeviceOSState, HomeScreenConfig } from "@tokovo/core";
import { DEFAULT_OS_STATE } from "@tokovo/core";
import { iPhone16Profile } from "../iphone16/profile.js";
import { PixelProfile } from "../pixel/profile.js";
import { getSystemLocalizedStrings } from "../surfaces/localization.js";
import { projectHomeScreen, projectLockscreen } from "../surfaces/project.js";
import { resolveSystemSurfaceDesign } from "../surfaces/theme.js";

const os = (overrides: Partial<DeviceOSState> = {}): DeviceOSState => ({
  ...DEFAULT_OS_STATE,
  locale: "en-US",
  appearance: "light",
  clock: Date.parse("2026-07-21T09:41:00Z"),
  battery: 86,
  charging: false,
  network: "wifi",
  wifiStrength: 3,
  cellStrength: 4,
  dnd: false,
  ...overrides,
});

const home: HomeScreenConfig = {
  pages: [
    {
      apps: [
        { appId: "app_whatsapp", label: "WhatsApp", icon: "builtin" },
        { appId: "app_x", label: "X", icon: "builtin", badge: 7 },
      ],
    },
  ],
  dock: [{ appId: "app_imessage", label: "Messages", icon: "builtin" }],
};

describe("canonical system surfaces", () => {
  it.each([iPhone16Profile, PixelProfile])(
    "keeps the display aperture physically inset inside %s",
    (profile) => {
      expect(profile.display.x).toBeGreaterThan(0);
      expect(profile.display.y).toBeGreaterThan(0);
      expect(profile.dimensions.width).toBe(profile.display.x * 2 + profile.display.width);
      expect(profile.dimensions.height).toBe(profile.display.y * 2 + profile.display.height);
    },
  );

  it.each([
    [iPhone16Profile, "light"],
    [iPhone16Profile, "dark"],
    [PixelProfile, "light"],
    [PixelProfile, "dark"],
  ] as const)("resolves %s/%s without a fallback theme", (profile, appearance) => {
    const design = resolveSystemSurfaceDesign(profile, appearance);
    expect(design.theme.id).toBe(`${profile.platformProfileId}:${appearance}:system-surfaces`);
    expect(design.layout.pointScale).toBe(profile.pointScale);
    expect(design.layout.home.iconSize).toBeGreaterThan(100);
  });

  it("formats English, Hindi, Arabic and Japanese without host Intl", () => {
    const timestamp = Date.parse("2026-07-21T09:41:00Z");
    expect(getSystemLocalizedStrings(timestamp, "en-US").date).toContain("Tuesday");
    expect(getSystemLocalizedStrings(timestamp, "hi-IN").date).toContain("मंगलवार");
    expect(getSystemLocalizedStrings(timestamp, "ar-SA").direction).toBe("rtl");
    expect(getSystemLocalizedStrings(timestamp, "ja-JP").date).toContain("火曜日");
  });

  it("projects a localized RTL Android lockscreen with cinematic subjects", () => {
    const projected = projectLockscreen({
      profile: PixelProfile,
      os: os({ locale: "ar-SA", appearance: "dark", hourCycle: "h24" }),
    });
    expect(projected.theme.id).toBe("android:material3@1:dark:system-surfaces");
    expect(projected.direction).toBe("rtl");
    expect(projected.time).toBe("٠٩:٤١");
    expect(projected.cinematicSubjects["lockscreen.clock"]).toBeDefined();
  });

  it("projects stable home regions and per-app cinematic subjects", () => {
    const first = projectHomeScreen({
      profile: iPhone16Profile,
      os: os(),
      config: home,
    });
    const second = projectHomeScreen({
      profile: iPhone16Profile,
      os: os(),
      config: home,
    });
    expect(second).toEqual(first);
    expect(first.cinematicSubjects["homescreen.grid"]).toBeDefined();
    expect(first.cinematicSubjects["homescreen.dock"]).toBeDefined();
    expect(first.cinematicSubjects["homescreen.icon:app_whatsapp"]).toBeDefined();
    expect(
      first.cinematicSubjects["homescreen.dock"].y +
        first.cinematicSubjects["homescreen.dock"].height,
    ).toBeLessThan(iPhone16Profile.display.height);
  });

  it("mirrors authored home icon subjects for RTL locales", () => {
    const ltr = projectHomeScreen({
      profile: PixelProfile,
      os: os(),
      config: home,
    });
    const rtl = projectHomeScreen({
      profile: PixelProfile,
      os: os({ locale: "ar-SA" }),
      config: home,
    });
    expect(rtl.cinematicSubjects["homescreen.icon:app_whatsapp"].x).toBeGreaterThan(
      ltr.cinematicSubjects["homescreen.icon:app_whatsapp"].x,
    );
  });

  it("fails loudly for an invalid page-less home screen", () => {
    expect(() =>
      projectHomeScreen({
        profile: PixelProfile,
        os: os(),
        config: { pages: [], dock: [] },
      }),
    ).toThrow("SYSTEM_HOME_INVALID");
  });

  it("rejects empty authored wallpapers instead of substituting the profile default", () => {
    expect(() =>
      projectLockscreen({
        profile: iPhone16Profile,
        os: os({ lockScreenWallpaper: "   " }),
      }),
    ).toThrow("SYSTEM_WALLPAPER_INVALID");
    expect(() =>
      projectHomeScreen({
        profile: PixelProfile,
        os: os(),
        config: { ...home, wallpaper: "" },
      }),
    ).toThrow("SYSTEM_WALLPAPER_INVALID");
  });
});
