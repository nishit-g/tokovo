import {
    AnchorProvider,
    AnchorSnapshot,
    SemanticAnchorId,
    LayoutRect,
    ChatLayoutState,
    APP_IDS
} from "@tokovo/core";

const APP_ID = APP_IDS.WHATSAPP;

// Production-grade anchor provider converting Layout Engine output to Semantic Anchors
export const WhatsAppAnchors: AnchorProvider = {
    appId: APP_ID,

    // Static Framing Definitions
    framing: {
        // Conversation / Messages
        message: {
            anchorPoint: { x: 0.5, y: 0.5 },
            paddingPx: 40,
            targetFill: 0.6
        },
        message_me: {
            anchorPoint: { x: 0.6, y: 0.5 },
            paddingPx: 40,
            targetFill: 0.6
        },
        message_other: {
            anchorPoint: { x: 0.4, y: 0.5 },
            paddingPx: 40,
            targetFill: 0.6
        },
        device: {
            anchorPoint: { x: 0.5, y: 0.5 },
            paddingPx: 0,
            targetFill: 1.0
        },

        // System / Status
        typing: {
            anchorPoint: { x: 0.35, y: 0.5 },
            paddingPx: 30,
            targetFill: 0.3
        },
        input: {
            anchorPoint: { x: 0.5, y: 0.8 },
            paddingPx: 20,
            targetFill: 0.9
        },

        // Nav
        header: {
            anchorPoint: { x: 0.5, y: 0.15 },
            paddingPx: 10,
            targetFill: 0.9
        },
        profile: {
            anchorPoint: { x: 0.2, y: 0.15 }, // Focus specifically on avatar
            paddingPx: 50,
            targetFill: 0.4
        }
    },

    // Dynamic extraction from Computed Layout
    getAnchors(
        world,
        layout,
        deviceId
    ): AnchorSnapshot {
        // Cast generic layout to ChatLayoutState
        const chatLayout = layout as ChatLayoutState;
        const anchors: Partial<Record<SemanticAnchorId, LayoutRect>> = {};

        // If no layout (e.g. app not active), return empty or device fallback
        if (!chatLayout || !chatLayout.semantic) {
            // Fallback to device? Or empty.
            return { anchors: {}, deviceId, appId: APP_ID };
        }

        // Map Semantic Regions to Anchors
        // ChatLayoutState.semantic.regions is Record<string, SemanticRegion>
        const regions = chatLayout.semantic.regions;
        for (const [key, region] of Object.entries(regions)) {
            // Mapping strategy: 
            // 1. ID match (e.g. "msg_123")
            // 2. Tag match? (Layout Engine provides specific IDs)
            // The Camera system requests specific IDs like "msg_123".
            // So we just pass them through.

            // We can also alias standard semantic names like "lastMessage"
            anchors[key] = region.rect;
        }

        // Computed Aliases
        if (chatLayout.meta?.lastMessageId && regions[chatLayout.meta.lastMessageId]) {
            anchors["lastMessage"] = regions[chatLayout.meta.lastMessageId].rect;
        }

        // Input area and Header are already in regions from layout.ts

        return {
            anchors,
            deviceId,
            appId: APP_ID,
        };
    }
};
