import { produce } from "immer";
import { TimelineEvent, WorldState, ReducerRegistry } from "@tokovo/core";

export function whatsappReducer(draft: WorldState, event: TimelineEvent) {
    if (event.kind !== "APP" || event.appId !== "app_whatsapp") return;

    const conversationId = (event as any).conversationId;
    if (!conversationId) return;

    if (!draft.conversations[conversationId]) {
        draft.conversations[conversationId] = { id: conversationId, messages: [] };
    }
    const conversation = draft.conversations[conversationId];

    switch (event.type) {
        case "MESSAGE_RECEIVED":
        case "MESSAGE_SENT":
            const msgPayload = (event as any).message || {};
            conversation.messages.push({
                id: msgPayload.id || `msg_${event.at}_${(event as any).from}`,
                from: (event as any).from,
                text: (event as any).text || msgPayload.text,
                type: msgPayload.type || "text",
                at: event.at,
                status: msgPayload.status || "delivered",
                ...msgPayload
            });
            break;

        case "TYPING_START":
            if (!conversation.typing) conversation.typing = {};
            conversation.typing[(event as any).from] = true;
            break;

        case "TYPING_END":
            if (conversation.typing) {
                delete conversation.typing[(event as any).from];
            }
            break;

        case "GROUP_MEMBER_ADDED":
            // Add system message
            const addedBy = (event as any).addedBy === "me" ? "You" : (event as any).addedBy;
            conversation.messages.push({
                id: `sys_${event.at}_added_${(event as any).memberId}`,
                from: "system",
                type: "system",
                systemType: "member_added",
                text: `${addedBy} added ${(event as any).memberName}`,
                targetMember: (event as any).memberName,
                actorName: addedBy,
                at: event.at
            });
            // Add member to list
            if (!conversation.members) conversation.members = [];
            conversation.members.push({
                id: (event as any).memberId,
                name: (event as any).memberName
            });
            break;

        case "GROUP_MEMBER_REMOVED":
            const removedBy = (event as any).removedBy === "me" ? "You" : (event as any).removedBy;
            conversation.messages.push({
                id: `sys_${event.at}_removed_${(event as any).memberId}`,
                from: "system",
                type: "system",
                systemType: "member_removed",
                text: `${removedBy} removed ${(event as any).memberName}`,
                targetMember: (event as any).memberName,
                actorName: removedBy,
                at: event.at
            });
            // Remove member from list
            if (conversation.members) {
                conversation.members = conversation.members.filter(
                    (m: any) => m.id !== (event as any).memberId
                );
            }
            break;

        case "VOICE_MESSAGE_RECEIVED":
            conversation.messages.push({
                id: `voice_${event.at}_${(event as any).from}`,
                from: (event as any).from,
                type: "voice",
                duration: (event as any).duration,
                at: event.at,
                status: "delivered"
            });
            break;

        case "MESSAGE_READ":
            const msg = conversation.messages.find((m: any) => m.id === (event as any).messageId);
            if (msg) {
                msg.status = "read";
            }
            break;
    }
}

// Register itself
ReducerRegistry.registerAppReducer("app_whatsapp", whatsappReducer);
