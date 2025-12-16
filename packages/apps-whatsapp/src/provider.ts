
import { AnchorProvider, AnchorSnapshot, LayoutRect, AnchorFraming } from "@tokovo/core";

// Define the framing configuration for WhatsApp
export const WHATSAPP_FRAMING: Record<string, AnchorFraming> = {
    lastMessage: {
        anchorPoint: { x: 0.5, y: 0.75 },  // Lower-third, slightly off-center
        paddingPx: 24,
        targetFill: 0.55,
    },
    profile: {
        anchorPoint: { x: 0.5, y: 0.15 },  // Top area for profile
        paddingPx: 16,
        targetFill: 0.30,
    },
    inputArea: {
        anchorPoint: { x: 0.5, y: 0.9 },   // Very bottom of frame
        paddingPx: 16,
        targetFill: 0.4,
    },
    typingIndicator: {
        anchorPoint: { x: 0.5, y: 0.82 },  // Just above input
        paddingPx: 20,
        targetFill: 0.3,
    },
    reactionBubble: {
        anchorPoint: { x: 0.5, y: 0.5 },
        paddingPx: 40,
        targetFill: 0.3,
    },
    device: {
        anchorPoint: { x: 0.5, y: 0.5 },
        paddingPx: 0,
        targetFill: 1.0,
    }
};

export const WhatsAppAnchorProvider: AnchorProvider = {
    appId: "app_whatsapp",

    // The App now OWNS its framing config!
    framing: WHATSAPP_FRAMING,

    getAnchors(
        world,
        layout: unknown,
        deviceId: string
    ): AnchorSnapshot {
        const anchors: AnchorSnapshot["anchors"] = {};

        // Type guard for chat layout
        if (!layout || typeof layout !== "object" || (layout as any).kind !== "CHAT") {
            // If not in chat, at least return device
            anchors.device = { x: 0, y: 0, width: 430, height: 932 };
            return { anchors, deviceId, appId: "app_whatsapp" };
        }

        const regions = (layout as any).regions as Record<string, { rect: LayoutRect, metadata?: any }>;

        if (regions) {
            // 1. Last Message (Dynamic content)
            if (regions["lastMessage"]) {
                anchors.lastMessage = regions["lastMessage"].rect;
            }

            // 2. Typing Indicator (Volatile)
            if (regions["typingIndicator"]) {
                anchors.typingIndicator = regions["typingIndicator"].rect;
            }

            // 3. Input Area (Static/Stable)
            if (regions["inputArea"]) {
                anchors.inputArea = {
                    ...regions["inputArea"].rect,
                    metadata: { sticky: true }
                };
            }

            // 4. Profile Picture (Sticky Header)
            if (regions["profile"]) {
                anchors.profile = {
                    ...regions["profile"].rect,
                    metadata: regions["profile"].metadata // Should contain { sticky: true }
                };
            }
        }

        // Always provide device fallback
        anchors.device = { x: 0, y: 0, width: 430, height: 932 };

        return { anchors, deviceId, appId: "app_whatsapp" };
    }
};
