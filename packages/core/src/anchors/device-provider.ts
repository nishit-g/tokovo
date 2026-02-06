/**
 * Device Anchor Provider (OS-level)
 *
 * Canonical device-owned anchors that must be available regardless of app:
 * - device
 * - app
 * - keyboard (when visible)
 * - dynamicIsland (if supported by device profile)
 * - headsUpNotification / notification_banner (when a non-lockscreen notification is active)
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

function getKeyboardHeightPx(platform: "ios" | "android"): number {
  // Must match TokovoConfig defaults (core/src/config/index.ts)
  return platform === "android" ? 800 : 900;
}

function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

export const DeviceAnchorProvider: AnchorProvider = {
  appId: DEVICE_ANCHOR_PROVIDER_ID,

  framing: {
    device: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 0, targetFill: 1.0 },
    app: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 0, targetFill: 1.0 },
    keyboard: { anchorPoint: { x: 0.5, y: 0.85 }, paddingPx: 16, targetFill: 0.65 },
    dynamicIsland: { anchorPoint: { x: 0.5, y: 0.05 }, paddingPx: 8, targetFill: 0.15 },
    headsUpNotification: { anchorPoint: { x: 0.5, y: 0.1 }, paddingPx: 16, targetFill: 0.35 },
    notification_banner: { anchorPoint: { x: 0.5, y: 0.1 }, paddingPx: 16, targetFill: 0.35 },
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

    // Keyboard: only when visible (so camera targeting is deterministic)
    if (device?.keyboard?.visible) {
      const h = getKeyboardHeightPx(viewport.platform);
      anchors.keyboard = rect(0, viewport.height - h, viewport.width, h);
    }

    // Dynamic Island: exists if the device profile supports it
    if (viewport.dynamicIsland) {
      const di = viewport.dynamicIsland;
      const w = di.collapsedWidth || di.expandedWidth || viewport.width * 0.4;
      const h = di.collapsedHeight || di.expandedHeight || 37;
      anchors.dynamicIsland = rect(di.centerX - w / 2, di.topY, w, h);
    }

    // Heads-up notification banner: if any active notification is not lockscreen-only
    const notifications = device?.notifications ?? [];
    const activeHeadsUp = notifications.find((n) => {
      if ((n as any).dismissedAtFrame !== undefined) return false;
      const mode = (n as any).mode || "both";
      return mode !== "lockscreen";
    });

    if (activeHeadsUp) {
      const headsUpTop = viewport.dynamicIsland
        ? viewport.dynamicIsland.topY +
          viewport.dynamicIsland.collapsedHeight +
          12
        : viewport.safeAreaTop + 12;
      const bannerRect = rect(16, headsUpTop, viewport.width - 32, 100);
      anchors.headsUpNotification = bannerRect;
      anchors.notification_banner = bannerRect;
    }

    return {
      anchors,
      deviceId,
      appId: DEVICE_ANCHOR_PROVIDER_ID,
    };
  },
};
