/**
 * Layout Engine
 *
 * Pure computation layer that determines:
 * - Which device is active
 * - What view kind to display (CHAT, FEED, LOCKSCREEN, etc.)
 * - Layout positions and scroll state
 *
 * Input: world + time
 * Output: layout blueprint (no JSX)
 */

import { useMemo } from "react";
import {
    WorldState,
    DeviceState,
    LAYOUT,
} from "@tokovo/core";
import { computeLayout, LayoutState, ViewKind, LayoutContext } from "../layout";
import { iPhone16Profile, PixelProfile, DeviceProfile } from "@tokovo/devices";

// =============================================================================
// INPUT / OUTPUT TYPES
// =============================================================================

export interface LayoutEngineInput {
    world: WorldState;
    t: number;
    focusDeviceId?: string;
}

export interface LayoutEngineOutput {
    /** Active device ID */
    deviceId: string;
    /** Active device state */
    device: DeviceState;
    /** Foreground app ID (if any) */
    appId: string | undefined;
    /** What type of view to render */
    viewKind: ViewKind;
    /** Computed layout state */
    layout: LayoutState;
    /** Device profile (iPhone16, Pixel, etc.) */
    profile: DeviceProfile;
    /** Platform variant */
    variant: "ios" | "android";
    /** Active conversation (for chat views) */
    activeConversationId?: string;
    /** Active story (for story views) */
    activeStoryId?: string;
    /** Viewport height after accounting for header/input */
    effectiveViewportHeight: number;
}

// =============================================================================
// LAYOUT ENGINE HOOK
// =============================================================================

export function useLayoutEngine(input: LayoutEngineInput): LayoutEngineOutput | null {
    const { world, t, focusDeviceId } = input;

    return useMemo(() => {
        // 1. Determine active device
        const deviceId = focusDeviceId || world.camera?.activeDeviceId || Object.keys(world.devices)[0];
        const device = world.devices[deviceId];

        if (!device) {
            console.warn(`[LayoutEngine] Device not found: ${deviceId}`);
            return null;
        }

        const appId = device.foregroundAppId;

        // 2. Determine ViewKind
        let viewKind: ViewKind = "TRANSITION";
        let activeConversationId: string | undefined;
        let activeStoryId: string | undefined;

        if (device.isLocked) {
            viewKind = "LOCKSCREEN";
        } else if (appId) {
            if (appId === "app_whatsapp") {
                viewKind = "CHAT";
                activeConversationId = Object.keys(world.conversations)[0];
            } else if (appId === "app_instagram") {
                const appState = world.appState?.["app_instagram"];
                const currentView = appState?.currentView || "feed";

                switch (currentView) {
                    case "dm":
                        viewKind = "CHAT";
                        activeConversationId = Object.keys(world.conversations)[0];
                        break;
                    case "stories":
                        viewKind = "STORY";
                        activeStoryId = appState?.stories?.activeStoryId;
                        break;
                    case "feed":
                    case "explore":
                    case "profile":
                    case "notifications":
                    case "reels":
                    case "post":
                        viewKind = "FEED";
                        break;
                    default:
                        viewKind = "FEED";
                }
            } else if (appId === "app_twitter") {
                viewKind = "FEED";
            }
        } else {
            // No app open, show home screen
            viewKind = "HOMESCREEN";
        }

        // 3. Get device profile
        const profile = device.profileId === "pixel" ? PixelProfile : iPhone16Profile;
        const isPixel = device.profileId.includes("pixel");
        const variant: "ios" | "android" = isPixel ? "android" : "ios";

        // 4. Compute effective viewport height
        const effectiveViewportHeight = viewKind === "CHAT"
            ? profile.dimensions.height - LAYOUT.CHAT_HEADER_HEIGHT - LAYOUT.CHAT_INPUT_HEIGHT
            : profile.dimensions.height;

        // 5. Build layout context and compute layout
        const layoutContext: LayoutContext = {
            world,
            t,
            activeDeviceId: deviceId,
            activeAppId: appId || "",
            viewKind,
            activeConversationId,
            activeStoryId,
            viewportWidth: profile.dimensions.width,
            viewportHeight: effectiveViewportHeight,
        };

        const layout = computeLayout(layoutContext);

        return {
            deviceId,
            device,
            appId,
            viewKind,
            layout,
            profile,
            variant,
            activeConversationId,
            activeStoryId,
            effectiveViewportHeight,
        };
    }, [world, t, focusDeviceId]);
}
