/**
 * WhatsApp Anchor Provider
 *
 * Extracts semantic anchors from WhatsApp chat layout.
 * Apps are the ONLY source of truth for what can be focused.
 */

import {
    AnchorProvider,
    AnchorSnapshot,
    SemanticAnchorId,
    LayoutRect,
    WhatsAppAnchorId,
    LAYOUT,
} from "@tokovo/core";
import type { WorldState } from "@tokovo/core";
import type { ChatLayoutState } from "../layout/types";

const APP_ID = "app_whatsapp";

/**
 * WhatsApp Anchor Provider
 *
 * Exposes anchors for:
 * - lastMessage: Most recent message bubble
 * - typingIndicator: Typing dots (when active)
 * - inputArea: Input bar (always available)
 * - reactionBubble: Active reaction popup (when visible)
 */
export const WhatsAppAnchorProvider: AnchorProvider = {
    appId: APP_ID,

    getAnchors(
        world: WorldState,
        layout: unknown,
        deviceId: string
    ): AnchorSnapshot {
        const anchors: Partial<Record<SemanticAnchorId, LayoutRect>> = {};

        // Type guard for chat layout
        if (!layout || typeof layout !== "object" || (layout as any).kind !== "CHAT") {
            // Not a chat layout — return device anchor only
            return {
                anchors: { device: getDeviceRect(world, deviceId) },
                deviceId,
                appId: APP_ID,
            };
        }

        const chatLayout = layout as ChatLayoutState;
        const device = world.devices[deviceId];
        const profile = getDeviceProfile(device?.profileId);
        const viewportWidth = profile?.dimensions?.width ?? 430;
        const viewportHeight = profile?.dimensions?.height ?? 932;

        // =========================================================================
        // LAST MESSAGE
        // =========================================================================
        const lastMessageId = chatLayout.meta?.lastMessageId;
        if (lastMessageId && chatLayout.messageLayouts[lastMessageId]?.rect) {
            anchors.lastMessage = chatLayout.messageLayouts[lastMessageId].rect;
        }

        // =========================================================================
        // TYPING INDICATOR
        // =========================================================================
        if (chatLayout.typingLayout?.rect) {
            anchors.typingIndicator = chatLayout.typingLayout.rect;
        }

        // =========================================================================
        // INPUT AREA (always available)
        // =========================================================================
        const inputHeight = LAYOUT.CHAT_INPUT_HEIGHT;
        anchors.inputArea = {
            x: 0,
            y: chatLayout.scrollY + viewportHeight - inputHeight,
            width: viewportWidth,
            height: inputHeight,
        };

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

// =============================================================================
// HELPERS
// =============================================================================

function getDeviceRect(world: WorldState, deviceId: string): LayoutRect {
    const device = world.devices[deviceId];
    const profile = getDeviceProfile(device?.profileId);
    return {
        x: 0,
        y: 0,
        width: profile?.dimensions?.width ?? 430,
        height: profile?.dimensions?.height ?? 932,
    };
}

function getDeviceProfile(profileId?: string): { dimensions: { width: number; height: number } } | null {
    // Simplified profile lookup — in production, use DeviceProfiles registry
    const profiles: Record<string, { dimensions: { width: number; height: number } }> = {
        iphone16: { dimensions: { width: 430, height: 932 } },
        iphone15: { dimensions: { width: 430, height: 932 } },
        iphone14: { dimensions: { width: 390, height: 844 } },
        pixel8: { dimensions: { width: 412, height: 915 } },
    };
    return profiles[profileId || "iphone16"] || profiles.iphone16;
}
