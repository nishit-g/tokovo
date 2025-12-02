import { produce } from "immer";
import { TimelineEvent, WorldState } from "@tokovo/core";
import { InstagramState } from "../types";

export function dmReducer(draft: WorldState, event: TimelineEvent, instagram: InstagramState) {
    if (event.kind !== "APP") return;

    // Helper to ensure conversation exists
    const ensureConversation = (id: string) => {
        if (!draft.conversations[id]) {
            draft.conversations[id] = { id, messages: [] };
        }
        return draft.conversations[id];
    };

    switch (event.type) {
        case "DM_MESSAGE_RECEIVED":
        case "DM_MESSAGE_SENT": {
            const conversation = ensureConversation(event.conversationId);
            conversation.messages.push({
                id: `msg_${event.at}_${event.from}_${event.text?.substring(0, 5)}`,
                from: event.from,
                text: event.text,
                at: event.at,
                media: event.media
            });
            break;
        }
        case "DM_TYPING_START": {
            const conversation = ensureConversation(event.conversationId);
            if (!conversation.typing) conversation.typing = {};
            conversation.typing[event.from] = true;
            break;
        }
        case "DM_TYPING_END": {
            const conversation = ensureConversation(event.conversationId);
            if (conversation.typing) delete conversation.typing[event.from];
            break;
        }
        // ... Handle other DM events
    }
}
