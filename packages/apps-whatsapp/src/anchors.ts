/**
 * WhatsApp Anchors - Semantic anchor definitions for WhatsApp plugin
 * 
 * @description Provides anchors for camera focus/track operations:
 * - lastMessage: The most recent message in the conversation
 * - inputArea: The message input area at the bottom
 * - header: The conversation header with avatar/name
 * - message:* : Wildcard for specific message IDs
 * 
 * @see docs-v2/DSL_REVAMP.md#anchors-system
 */

import type { AnchorRegistry, Rect } from "@tokovo/core";
import type { WorldState } from "@tokovo/core";

// =============================================================================
// CONSTANTS
// =============================================================================

// Default iPhone 16 dimensions
const DEVICE_WIDTH = 393;
const DEVICE_HEIGHT = 852;

// UI Element heights (approximate)
const HEADER_HEIGHT = 60;
const INPUT_HEIGHT = 52;
const MESSAGE_HEIGHT = 40;  // Approximate per message

// =============================================================================
// ANCHOR PROVIDERS
// =============================================================================

/**
 * WhatsApp anchors for camera operations.
 */
export const WhatsAppAnchors: AnchorRegistry = {
    /**
     * The most recent message in the active conversation.
     */
    lastMessage: (world: WorldState, deviceId: string): Rect | null => {
        // Find active conversation
        const device = world.devices?.[deviceId];
        if (!device) return null;

        const conversations = device.conversations || {};
        const activeConvId = Object.keys(conversations).find(id => {
            const conv = conversations[id];
            return conv?.messages && conv.messages.length > 0;
        });

        if (!activeConvId) return null;

        const messages = conversations[activeConvId]?.messages || [];
        if (messages.length === 0) return null;

        // Estimate position of last message
        // For a more accurate implementation, this would need layout info from the renderer
        const messageY = DEVICE_HEIGHT - INPUT_HEIGHT - 20 - (MESSAGE_HEIGHT);

        return {
            x: 20,
            y: messageY,
            width: DEVICE_WIDTH - 40,
            height: MESSAGE_HEIGHT,
        };
    },

    /**
     * The message input area at the bottom.
     */
    inputArea: (_world: WorldState, _deviceId: string): Rect => ({
        x: 0,
        y: DEVICE_HEIGHT - INPUT_HEIGHT,
        width: DEVICE_WIDTH,
        height: INPUT_HEIGHT,
    }),

    /**
     * The conversation header with avatar and name.
     */
    header: (_world: WorldState, _deviceId: string): Rect => ({
        x: 0,
        y: 0,
        width: DEVICE_WIDTH,
        height: HEADER_HEIGHT,
    }),

    /**
     * The avatar in the header.
     */
    avatar: (_world: WorldState, _deviceId: string): Rect => ({
        x: 50,
        y: 10,
        width: 40,
        height: 40,
    }),

    /**
     * Wildcard anchor for specific message by ID.
     * Usage: cam.focus("message:msg_001")
     */
    "message:*": (world: WorldState, deviceId: string, messageId?: string): Rect | null => {
        if (!messageId) return null;

        const device = world.devices?.[deviceId];
        if (!device) return null;

        // Find the message in any conversation
        for (const convId of Object.keys(device.conversations || {})) {
            const conv = device.conversations?.[convId];
            if (!conv?.messages) continue;

            const msgIndex = conv.messages.findIndex((m: any) => m.id === messageId);
            if (msgIndex !== -1) {
                // Estimate position based on index from bottom
                const messagesFromBottom = conv.messages.length - msgIndex - 1;
                const estimatedY = DEVICE_HEIGHT - INPUT_HEIGHT - 20 -
                    (messagesFromBottom + 1) * MESSAGE_HEIGHT;

                return {
                    x: 20,
                    y: Math.max(HEADER_HEIGHT + 10, estimatedY),
                    width: DEVICE_WIDTH - 40,
                    height: MESSAGE_HEIGHT,
                };
            }
        }

        return null;
    },
};

// =============================================================================
// REGISTRATION
// =============================================================================

/**
 * Register WhatsApp anchors with the global registry.
 */
export function registerWhatsAppAnchors(): void {
    // Dynamic import to avoid circular dependency
    import("@tokovo/core").then(({ registerAnchors }) => {
        registerAnchors("app_whatsapp", WhatsAppAnchors);
    });
}
