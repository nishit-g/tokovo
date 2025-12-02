import { produce } from "immer";
import { TimelineEvent, WorldState, ReducerRegistry } from "@tokovo/core";

export function whatsappReducer(draft: WorldState, event: TimelineEvent) {
    if (event.kind !== "APP" || event.appId !== "app_whatsapp") return;

    const conversationId = event.conversationId;
    if (!draft.conversations[conversationId]) {
        draft.conversations[conversationId] = { id: conversationId, messages: [] };
    }
    const conversation = draft.conversations[conversationId];

    switch (event.type) {
        case "MESSAGE_RECEIVED":
            conversation.messages.push({
                id: `msg_${event.at}_${event.from}_${event.text?.substring(0, 5)}`, // Deterministic ID
                from: event.from,
                text: event.text,
                at: event.at
            });
            break;
        case "TYPING_START":
            if (!conversation.typing) conversation.typing = {};
            conversation.typing[event.from] = true;
            break;
        case "TYPING_END":
            if (conversation.typing) {
                delete conversation.typing[event.from];
            }
            break;
    }
}

// Register itself
ReducerRegistry.registerAppReducer("app_whatsapp", whatsappReducer);
