import { WorldState, TimelineEvent } from "@tokovo/core";

import { initialInstagramState, InstagramState } from "./types";

export const instagramRuntime = (draft: WorldState, event: TimelineEvent) => {
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
        console.log(`[InstagramRuntime] Processing CUSTOM event: ${event.name}`, event.payload);
        switch (event.name) {
            case "NAVIGATE":
                appState.currentView = event.payload.view;
                console.log(`[InstagramRuntime] Navigated to: ${appState.currentView}`);
                break;
            // Add other custom events here
        }
        return;
    }

    // Legacy/Specific events (DM)
    const { conversationId, type } = event as any; // Cast to access specific fields if needed

    if (conversationId) {
        // Ensure conversation exists
        if (!draft.conversations[conversationId]) {
            draft.conversations[conversationId] = {
                id: conversationId,
                messages: [],
                typing: {}
            };
        }

        const conversation = draft.conversations[conversationId];

        switch (type) {
            case "MESSAGE_RECEIVED":
                conversation.messages.push({
                    id: `msg_${Date.now()}_${Math.random()}`,
                    from: event.from,
                    text: event.text,
                    at: event.at,
                    liked: false // Instagram specific
                });
                break;

            case "TYPING_START":
                if (!conversation.typing) conversation.typing = {};
                conversation.typing[event.from] = true;
                break;

            case "TYPING_END":
                if (conversation.typing) {
                    conversation.typing[event.from] = false;
                }
                break;
        }
    }
};
