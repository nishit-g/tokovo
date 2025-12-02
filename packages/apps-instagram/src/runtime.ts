import { produce } from "immer";
import { WorldState, TimelineEvent } from "@tokovo/core";

export const instagramRuntime = (state: WorldState, event: TimelineEvent) => {
    if (event.kind !== "APP" || event.appId !== "app_instagram") return state;

    return produce(state, (draft) => {
        const { conversationId, type } = event;

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
    });
};
