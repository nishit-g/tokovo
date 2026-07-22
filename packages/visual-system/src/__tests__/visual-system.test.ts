import { describe, expect, it } from "vitest";
import {
  createPlatformDesignRegistry,
  requireBackdropProfile,
  IOS_LIQUID_GLASS_PROFILE,
  resolveHardwareVisualIdentity,
  registerHardwareVisualIdentity,
  resolvePlatformVisuals,
  resolveSystemGeometry,
  solveEditorialOverlayViewport,
  type VisualHardwareProfile,
} from "../index.js";

const hardware: VisualHardwareProfile = {
  id: "iphone16",
  name: "iPhone 16 Pro Max",
  platform: "ios",
  type: "phone",
  dimensions: { width: 1380, height: 2928 },
  display: {
    x: 30,
    y: 30,
    width: 1320,
    height: 2868,
    ppi: 460,
    cornerRadius: 150,
  },
  pointScale: 3,
  platformProfileId: "ios:liquid-glass@1",
  systemSurfaces: true,
  hardwareRegions: [
    {
      id: "island",
      kind: "sensor-housing",
      rect: { x: 471, y: 33, width: 378, height: 111 },
    },
  ],
};

describe("visual system", () => {
  it("fails loudly on duplicate profiles", () => {
    expect(() =>
      createPlatformDesignRegistry([IOS_LIQUID_GLASS_PROFILE, IOS_LIQUID_GLASS_PROFILE]),
    ).toThrow("VISUAL_PROFILE_COLLISION");
  });

  it("projects one deterministic app viewport with keyboard occupancy", () => {
    const visuals = resolvePlatformVisuals({
      platformProfileId: "ios:liquid-glass@1",
      appearance: "dark",
      locale: "hi-IN",
      direction: "ltr",
      textScale: 1,
      contrast: "standard",
      motion: "full",
    });
    const first = resolveSystemGeometry(hardware, visuals, {
      keyboard: { visible: true, progress: 1 },
      notification: { bannerVisible: true },
    });
    const second = resolveSystemGeometry(hardware, visuals, {
      keyboard: { visible: true, progress: 1 },
      notification: { bannerVisible: true },
    });

    expect(first.viewport).toEqual({ x: 0, y: 0, width: 440, height: 956 });
    expect(first.appViewport.contentInsets).toEqual({
      top: 62,
      right: 0,
      bottom: 336,
      left: 0,
    });
    expect(first.regions.some((region) => region.kind === "hardware")).toBe(true);
    expect(first.signature).toBe(second.signature);
  });

  it("places PIP in protected negative space deterministically", () => {
    const input = {
      canvas: { width: 1080, height: 1920 },
      overlay: { width: 360, height: 560 },
      compositionProfileId: "handoff-pip" as const,
      protectedRegions: [{ x: 90, y: 240, width: 560, height: 1440 }],
    };
    const first = solveEditorialOverlayViewport(input);
    const second = solveEditorialOverlayViewport(input);
    expect(first).toEqual(second);
    expect(first.x).toBeGreaterThan(650);
    expect(first.y).toBe(680);
  });

  it("keeps built-in backdrops orientation-safe and signage-free", () => {
    for (const id of [
      "studio-quiet-dark",
      "studio-quiet-light",
      "ambient-depth",
      "editorial-neon",
    ] as const) {
      const profile = requireBackdropProfile(id);
      expect(profile.orientation).toBe("orientation-free");
      expect(profile.permitsTextOrSignage).toBe(false);
      expect(profile.subjectSafeRegions.length).toBeGreaterThan(0);
    }
  });

  it("explicitly disables OS-owned surfaces for frameless canvas hardware", () => {
    expect(resolveHardwareVisualIdentity("canvas")).toEqual({
      platform: "ios",
      platformProfileId: "ios:liquid-glass@1",
      systemSurfaces: false,
    });
    registerHardwareVisualIdentity("canvas-1080x1920", {
      platformProfileId: "ios:liquid-glass@1",
      systemSurfaces: false,
    });
    expect(resolveHardwareVisualIdentity("canvas-1080x1920").systemSurfaces).toBe(false);
  });
});
