/**
 * Instagram Runtime - Event Reducer
 *
 * Handles Instagram app events and updates world state.
 *
 * @module @tokovo/apps-instagram/runtime
 */

import { WorldState, TimelineEvent } from "@tokovo/core";
import { initialInstagramState, InstagramState } from "./types";

/**
 * Instagram event reducer.
 *
 * Canonical 3-arg signature: (world, event, ctx?)
 * ctx is optional for backward compatibility with legacy replay()
 *
 * Handles:
 * - CUSTOM events for navigation
 * - MESSAGE_RECEIVED for DMs
 * - TYPING_START/END for typing indicators
 */
export const instagramRuntime = (
    world: WorldState,
    event: TimelineEvent,
    _ctx?: { frame?: number; fps?: number }
): void => {
    // Alias for mutation (backward compat with draft naming)
    const draft = world;
    if (event.kind !== "APP" || event.appId !== "app_instagram") return;

    // Initialize app state if missing
    if (!draft.appState) {
        draft.appState = {};
    }
    if (!draft.appState["app_instagram"]) {
        draft.appState["app_instagram"] = initialInstagramState;
    }

    const appState = draft.appState["app_instagram"] as InstagramState;

    // Handle generic custom events
    if (event.type === "CUSTOM") {
        const customEvent = event as { name?: string; payload?: Record<string, unknown> };
        console.log(`[InstagramRuntime] Processing CUSTOM event: ${customEvent.name}`, customEvent.payload);
        switch (customEvent.name) {
            case "NAVIGATE":
                if (customEvent.payload?.view) {
                    appState.currentView = customEvent.payload.view as InstagramState["currentView"];
                    console.log(`[InstagramRuntime] Navigated to: ${appState.currentView}`);
                }
                break;
        }
        return;
    }

    // Cast event to access DM-specific fields
    const dmEvent = event as {
        conversationId?: string;
        type: string;
        from?: string;
        text?: string;
        at: number;
    };

    if (dmEvent.conversationId) {
        const { conversationId } = dmEvent;

        // Ensure conversation exists
        if (!draft.conversations[conversationId]) {
            draft.conversations[conversationId] = {
                id: conversationId,
                messages: [],
                typing: {},
            };
        }

        const conversation = draft.conversations[conversationId];

        switch (dmEvent.type) {
            case "MESSAGE_RECEIVED": {
                const msgId = `msg_${event.at}_${Math.random().toString(36).slice(2, 8)}`;
                conversation.messages.push({
                    id: msgId,
                    from: dmEvent.from || "unknown",
                    text: dmEvent.text || "",
                    at: dmEvent.at,
                    type: "text",
                    status: "delivered",
                });
                break;
            }

            case "TYPING_START": {
                if (!conversation.typing) conversation.typing = {};
                if (dmEvent.from) {
                    conversation.typing[dmEvent.from] = true;
                }
                break;
            }

            case "TYPING_END": {
                if (conversation.typing && dmEvent.from) {
                    conversation.typing[dmEvent.from] = false;
                }
                break;
            }
        }
    }
};
