/**
 * Notification Anchor Provider
 *
 * Extracts semantic anchors from notification overlays.
 * Handles heads-up notifications and Dynamic Island.
 */

import {
  AnchorProvider,
  AnchorSnapshot,
  LayoutRect,
  SemanticAnchorId,
} from "@tokovo/core";
import type { WorldState, AnchorProviderContext } from "@tokovo/core";

const APP_ID = "app_notification";

function getViewportDimensions(
  device: WorldState["devices"][string] | undefined,
  context?: AnchorProviderContext,
): { width: number; height: number; safeAreaTop: number } {
  const profileId = device?.profileId;
  const profile = context?.getDeviceProfile?.(profileId);
  if (profile) {
    return {
      width: profile.dimensions.width,
      height: profile.dimensions.height,
      safeAreaTop: profile.safeArea?.top ?? 0,
    };
  }
  if (device?.screenDimensions) {
    return {
      width: device.screenDimensions.width,
      height: device.screenDimensions.height,
      safeAreaTop: device.screenDimensions.safeAreaTop,
    };
  }
  return { width: 430, height: 932, safeAreaTop: 0 };
}

function resolveProfile(
  device: WorldState["devices"][string] | undefined,
  context?: AnchorProviderContext,
) {
  const profileId = device?.profileId;
  return context?.getDeviceProfile?.(profileId);
}

/**
 * Notification Anchor Provider
 *
 * Exposes anchors for:
 * - headsUpNotification: Banner notification at top
 * - dynamicIsland: Dynamic Island (iOS 14+)
 * - device: Full frame fallback
 */
export const NotificationAnchorProvider: AnchorProvider = {
  appId: APP_ID,

  framing: {
    headsUpNotification: {
      anchorPoint: { x: 0.5, y: 0.1 },
      paddingPx: 16,
      targetFill: 0.35,
    },
    dynamicIsland: {
      anchorPoint: { x: 0.5, y: 0.05 },
      paddingPx: 8,
      targetFill: 0.15,
    },
    device: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1.0,
    },
  },

  getAnchors(
    world: WorldState,
    _layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const anchors: Partial<Record<SemanticAnchorId, LayoutRect>> = {};

    const device = world.devices[deviceId];
    const notifications = device?.notifications || [];

    const profile = resolveProfile(device, context);
    const viewport = getViewportDimensions(device, context);
    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;
    const safeAreaTop =
      profile?.safeArea?.top ?? viewport.safeAreaTop ?? 0;
    const dynamicIsland = profile?.dynamicIsland;

    // =========================================================================
    // HEADS-UP NOTIFICATION
    // =========================================================================
    const activeHeadsUp = notifications.find((n) => {
      if (n.dismissedAtFrame !== undefined) return false;
      const mode = n.mode || "both";
      return mode !== "lockscreen";
    });

    if (activeHeadsUp) {
      const headsUpTop = dynamicIsland
        ? dynamicIsland.topY + dynamicIsland.collapsedHeight + 12
        : safeAreaTop + 12;
      // Heads-up at top of screen, below Dynamic Island
      anchors.headsUpNotification = {
        x: 16,
        y: headsUpTop,
        width: viewportWidth - 32,
        height: 100, // Typical banner height
      };
    }

    // =========================================================================
    // DYNAMIC ISLAND
    // =========================================================================
    // Dynamic Island is resolved from device shell capabilities
    if (dynamicIsland) {
      const width =
        dynamicIsland.collapsedWidth ||
        dynamicIsland.expandedWidth ||
        viewportWidth * 0.4;
      const height =
        dynamicIsland.collapsedHeight ||
        dynamicIsland.expandedHeight ||
        37;
      anchors.dynamicIsland = {
        x: dynamicIsland.centerX - width / 2,
        y: dynamicIsland.topY,
        width,
        height,
      };
    }

    // =========================================================================
    // DEVICE (full frame — final fallback, from viewport)
    // =========================================================================
    anchors.device = {
      x: 0,
      y: 0,
      width: viewportWidth,
      height: viewportHeight,
    };

    return {
      anchors: anchors as Record<string, LayoutRect>,
      deviceId,
      appId: APP_ID,
    };
  },
};
