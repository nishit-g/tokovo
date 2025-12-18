/**
 * Call Scheduler
 * 
 * Determines call UI visibility and display mode.
 */

import type { DeviceState } from "@tokovo/core";

// =============================================================================
// SCHEDULER
// =============================================================================

export const CallScheduler = {
    /**
     * Check if call UI should be visible
     */
    shouldShowCallUI(device: DeviceState, t: number): boolean {
        if (!device.call) return false;

        const { status, endedAt } = device.call;

        // Hide after ended/declined (with brief delay for animation)
        if (status === "ended" || status === "declined") {
            const endFrame = endedAt || 0;
            // Keep visible for 60 frames (2s at 30fps) after ending
            return t < endFrame + 60;
        }

        // Show for all other statuses (incoming, active, etc.)
        return true;
    },

    /**
     * Get the display mode for current call state
     */
    getDisplayMode(device: DeviceState): "fullscreen" | "banner" | "dynamicIsland" | "hidden" {
        if (!device.call) return "hidden";

        const { status, displayMode } = device.call;

        switch (status) {
            case "incoming":
                // Incoming: banner if unlocked, fullscreen if locked
                return device.isLocked ? "fullscreen" : "banner";

            case "active":
                // Active: use specified display mode
                if (displayMode === "pip" || displayMode === "dynamicIsland") {
                    return "dynamicIsland";
                }
                return "fullscreen";

            case "ended":
            case "declined":
                // Show briefly then hide
                return "hidden";

            default:
                return "hidden";
        }
    },

    /**
     * Check if ringtone should play
     */
    shouldPlayRingtone(device: DeviceState, t: number): boolean {
        if (!device.call) return false;
        if (device.call.status !== "incoming") return false;
        if (device.os?.dnd) return false;

        // Ring for max 30 seconds (900 frames at 30fps)
        const startFrame = device.call.startedAt || 0;
        return t < startFrame + 900;
    },
};
