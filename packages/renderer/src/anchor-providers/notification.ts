/**
 * Notification Anchor Provider
 *
 * Extracts semantic anchors from notification overlays.
 * Handles heads-up notifications and Dynamic Island.
 */

import {
    AnchorProvider,
    AnchorSnapshot,
    SemanticAnchorId,
    LayoutRect,
} from "@tokovo/core";
import type { WorldState, Notification } from "@tokovo/core";

const APP_ID = "app_notification";

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

    getAnchors(
        world: WorldState,
        layout: unknown,
        deviceId: string
    ): AnchorSnapshot {
        const anchors: Partial<Record<SemanticAnchorId, LayoutRect>> = {};

        const device = world.devices[deviceId];
        const notifications = device?.notifications || [];

        // Device dimensions
        const viewportWidth = 430;
        const viewportHeight = 932;

        // =========================================================================
        // HEADS-UP NOTIFICATION
        // =========================================================================
        const activeHeadsUp = notifications.find(n => {
            if (n.dismissedAt !== undefined) return false;
            const mode = n.mode || "both";
            return mode !== "lockscreen";
        });

        if (activeHeadsUp) {
            // Heads-up at top of screen, below Dynamic Island
            anchors.headsUpNotification = {
                x: 16,
                y: 60,  // Below Dynamic Island
                width: viewportWidth - 32,
                height: 100,  // Typical banner height
            };
        }

        // =========================================================================
        // DYNAMIC ISLAND
        // =========================================================================
        // Dynamic Island is always available on modern iPhones
        const hasDynamicIsland = device?.profileId?.includes("iphone1") || true;
        if (hasDynamicIsland) {
            anchors.dynamicIsland = {
                x: viewportWidth * 0.3,
                y: 11,
                width: viewportWidth * 0.4,
                height: 37,
            };
        }

        // =========================================================================
        // DEVICE (full frame — final fallback)
        // =========================================================================
        anchors.device = {
            x: 0,
            y: 0,
            width: viewportWidth,
            height: viewportHeight,
        };

        return {
            anchors,
            deviceId,
            appId: APP_ID,
        };
    },
};
