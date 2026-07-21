import { describe, expect, it } from "vitest";
import type { DeviceOSState, HomeScreenConfig } from "@tokovo/core";
import { iPhone16Profile } from "../iphone16/profile.js";
import { PixelProfile } from "../pixel/profile.js";
import { getSystemLocalizedStrings } from "../surfaces/localization.js";
import { projectHomeScreen, projectLockscreen } from "../surfaces/project.js";
import { getSystemSurfaceTheme } from "../surfaces/theme.js";

const os = (overrides: Partial<DeviceOSState> = {}): DeviceOSState => ({
  locale: "en-US",
  appearance: "light",
  clock: Date.parse("2026-07-21T09:41:00Z"),
  battery: 86,
  charging: false,
  network: "wifi",
  wifiStrength: 3,
  cellStrength: 4,
  dnd: false,
  lowPowerMode: false,
  airplaneMode: false,
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
  it.each([
    [iPhone16Profile, "light"],
    [iPhone16Profile, "dark"],
    [PixelProfile, "light"],
    [PixelProfile, "dark"],
  ] as const)("resolves %s/%s without a fallback theme", (profile, appearance) => {
    const theme = getSystemSurfaceTheme(profile, appearance);
    expect(theme.id).toBe(`system:${profile.platform}:${appearance}`);
    expect(theme.geometry.pointScale).toBe(profile.pixelDensity);
    expect(theme.geometry.home.iconSize).toBeGreaterThan(100);
  });

  it("formats English, Hindi, Arabic and Japanese without host Intl", () => {
    const timestamp = Date.parse("2026-07-21T09:41:00Z");
    expect(getSystemLocalizedStrings(timestamp, "en-US").date).toContain("Tuesday");
    expect(getSystemLocalizedStrings(timestamp, "hi-IN").date).toContain("मंगलवार");
    expect(getSystemLocalizedStrings(timestamp, "ar-SA").direction).toBe("rtl");
    expect(getSystemLocalizedStrings(timestamp, "ja-JP").date).toContain("火曜日");
  });

  it("projects a localized RTL Android lockscreen with semantic anchors", () => {
    const projected = projectLockscreen({
      profile: PixelProfile,
      os: os({ locale: "ar-SA", appearance: "dark", hourCycle: "h24" }),
    });
    expect(projected.theme.id).toBe("system:android:dark");
    expect(projected.direction).toBe("rtl");
    expect(projected.time).toBe("٠٩:٤١");
    expect(projected.anchors["lockscreen.clock"]).toBeDefined();
  });

  it("projects stable home regions and per-app semantic anchors", () => {
    const first = projectHomeScreen({ profile: iPhone16Profile, os: os(), config: home });
    const second = projectHomeScreen({ profile: iPhone16Profile, os: os(), config: home });
    expect(second).toEqual(first);
    expect(first.anchors["homescreen.grid"]).toBeDefined();
    expect(first.anchors["homescreen.dock"]).toBeDefined();
    expect(first.anchors["homescreen.icon:app_whatsapp"]).toBeDefined();
  });

  it("mirrors authored home icon anchors for RTL locales", () => {
    const ltr = projectHomeScreen({ profile: PixelProfile, os: os(), config: home });
    const rtl = projectHomeScreen({ profile: PixelProfile, os: os({ locale: "ar-SA" }), config: home });
    expect(rtl.anchors["homescreen.icon:app_whatsapp"].x).toBeGreaterThan(
      ltr.anchors["homescreen.icon:app_whatsapp"].x,
    );
  });

  it("fails loudly for an invalid page-less home screen", () => {
    expect(() => projectHomeScreen({
      profile: PixelProfile,
      os: os(),
      config: { pages: [], dock: [] },
    })).toThrow("SYSTEM_HOME_INVALID");
  });
});

