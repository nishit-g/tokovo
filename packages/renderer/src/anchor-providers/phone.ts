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

        // Device dimensions
        const viewportWidth = 430;  // iPhone 16
        const viewportHeight = 932;

        // =========================================================================
        // CALL POSTER (iOS 17+ style)
        // =========================================================================
        if (call && (call.status === "incoming" || call.status === "ringing")) {
            // Contact poster takes most of the screen
            anchors.callPoster = {
                x: 0,
                y: 100,  // Below status bar
                width: viewportWidth,
                height: 500,  // Large poster area
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
