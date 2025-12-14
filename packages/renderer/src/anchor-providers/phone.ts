/**
 * Phone Anchor Provider
 *
 * Extracts semantic anchors from phone/call screens.
 * Handles incoming call, active call, and Dynamic Island states.
 */

import {
    AnchorProvider,
    AnchorSnapshot,
    SemanticAnchorId,
    LayoutRect,
} from "@tokovo/core";
import type { WorldState, CallState } from "@tokovo/core";

const APP_ID = "app_phone";

// Device profile lookup (mirrors WhatsApp provider)
function getDeviceProfile(profileId?: string): { dimensions: { width: number; height: number } } {
    const profiles: Record<string, { dimensions: { width: number; height: number } }> = {
        iphone16: { dimensions: { width: 430, height: 932 } },
        iphone15: { dimensions: { width: 430, height: 932 } },
        iphone14: { dimensions: { width: 390, height: 844 } },
        pixel8: { dimensions: { width: 412, height: 915 } },
        pixel7: { dimensions: { width: 412, height: 915 } },
    };
    return profiles[profileId || "iphone16"] || profiles.iphone16;
}

/**
 * Phone Anchor Provider
 *
 * Exposes anchors for:
 * - callPoster: Contact poster image (iOS 17 style)
 * - acceptButton: Answer button
 * - declineButton: Decline button
 * - device: Full frame fallback
 */
export const PhoneAnchorProvider: AnchorProvider = {
    appId: APP_ID,

    getAnchors(
        world: WorldState,
        layout: unknown,
        deviceId: string
    ): AnchorSnapshot {
        const anchors: Partial<Record<SemanticAnchorId, LayoutRect>> = {};

        const device = world.devices[deviceId];
        const call = device?.call;

        // Get viewport dimensions from device profile (NOT hardcoded)
        const profile = getDeviceProfile(device?.profileId);
        const viewportWidth = profile.dimensions.width;
        const viewportHeight = profile.dimensions.height;

        // =========================================================================
        // CALL POSTER (iOS 17+ style)
        // =========================================================================
        if (call && (call.status === "incoming" || call.status === "ringing")) {
            // Contact poster takes most of the screen
            anchors.callPoster = {
                x: 0,
                y: 100,  // Below status bar
                width: viewportWidth,
                height: viewportHeight * 0.55,  // Relative to viewport
            };

            // Accept button (green, bottom right area)
            anchors.acceptButton = {
                x: viewportWidth * 0.6,
                y: viewportHeight - 200,
                width: 100,
                height: 100,
            };

            // Decline button (red, bottom left area)
            anchors.declineButton = {
                x: viewportWidth * 0.15,
                y: viewportHeight - 200,
                width: 100,
                height: 100,
            };
        }

        // =========================================================================
        // ACTIVE CALL (mute, speaker, etc.)
        // =========================================================================
        if (call && call.status === "active") {
            // During active call, poster is centered
            anchors.callPoster = {
                x: viewportWidth * 0.25,
                y: 150,
                width: viewportWidth * 0.5,
                height: 300,
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
            anchors,
            deviceId,
            appId: APP_ID,
        };
    },
};
