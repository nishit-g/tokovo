/**
 * Device Anchor Provider (OS-level)
 *
 * Canonical device-owned anchors that must be available regardless of app:
 * - device
 * - app
 * - dynamicIsland (if supported by device profile)
 *
 * This provider is intentionally NOT app-specific. It is registered under the
 * synthetic appId `app_device`, and merged into every app anchor snapshot by
 * the AnchorRegistry.
 */

import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  Rect,
} from "../types/anchor.js";
import type { WorldState } from "../types.js";

export const DEVICE_ANCHOR_PROVIDER_ID = "app_device";

function getViewportDimensions(
  device: WorldState["devices"][string] | undefined,
  context?: AnchorProviderContext,
): {
  width: number;
  height: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  platform: "ios" | "android";
  dynamicIsland?: {
    centerX: number;
    topY: number;
    collapsedWidth: number;
    collapsedHeight: number;
    expandedWidth?: number;
    expandedHeight?: number;
    cornerRadius?: number;
  };
} {
  const profileId = device?.profileId;
  const profile = context?.getDeviceProfile?.(profileId);
  if (profile) {
    return {
      width: profile.dimensions.width,
      height: profile.dimensions.height,
      safeAreaTop: profile.safeArea?.top ?? 0,
      safeAreaBottom: profile.safeArea?.bottom ?? 0,
      platform: (profile as { platform?: "ios" | "android" }).platform ?? "ios",
      dynamicIsland: profile.dynamicIsland,
    };
  }

  // Legacy fallback from DeviceState (used in some tests)
  if (device?.screenDimensions) {
    return {
      width: device.screenDimensions.width,
      height: device.screenDimensions.height,
      safeAreaTop: device.screenDimensions.safeAreaTop,
      safeAreaBottom: device.screenDimensions.safeAreaBottom,
      platform: "ios",
    };
  }

  return {
    width: 430,
    height: 932,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    platform: "ios",
  };
}

function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

export const DeviceAnchorProvider: AnchorProvider = {
  appId: DEVICE_ANCHOR_PROVIDER_ID,

  framing: {
    device: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 0, targetFill: 1.0 },
    app: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 0, targetFill: 1.0 },
    dynamicIsland: { anchorPoint: { x: 0.5, y: 0.05 }, paddingPx: 8, targetFill: 0.15 },
    keyboard: { anchorPoint: { x: 0.5, y: 0.82 }, paddingPx: 8, targetFill: 0.62 },
    "lockscreen.clock": { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 12, targetFill: 0.48 },
    "lockscreen.controls": { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 12, targetFill: 0.36 },
    "homescreen.grid": { anchorPoint: { x: 0.5, y: 0.42 }, paddingPx: 16, targetFill: 0.74 },
    "homescreen.dock": { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 12, targetFill: 0.38 },
    "homescreen.search": { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 10, targetFill: 0.42 },
  },

  getAnchors(
    world: WorldState,
    _layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const anchors: Record<string, Rect> = {};
    const device = world.devices?.[deviceId];
    const viewport = getViewportDimensions(device, context);

    // Full device frame (screen rect)
    anchors.device = rect(0, 0, viewport.width, viewport.height);

    // App surface: for now equal to the device frame (safe-area specific anchors can be added later)
    anchors.app = anchors.device;

    // Dynamic Island: exists if the device profile supports it
    if (viewport.dynamicIsland) {
      const di = viewport.dynamicIsland;
      const w = di.collapsedWidth || di.expandedWidth || viewport.width * 0.4;
      const h = di.collapsedHeight || di.expandedHeight || 37;
      anchors.dynamicIsland = rect(di.centerX - w / 2, di.topY, w, h);
    }

    return {
      anchors,
      deviceId,
      appId: DEVICE_ANCHOR_PROVIDER_ID,
    };
  },
};
