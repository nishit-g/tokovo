/**
 * WhatsApp Runtime Reducer
 * 
 * Handles all WhatsApp-specific events.
 * Uses explicit type checking for safer event handling.
 */

import {
    TimelineEvent,
    WorldState,
    ReducerRegistry,
    APP_IDS
} from "@tokovo/core";

/**
 * WhatsApp reducer - handles all WhatsApp events
 */
export function whatsappReducer(draft: WorldState, event: TimelineEvent): void {
    // Only handle APP events for WhatsApp
    if (event.kind !== "APP") return;

    // Type assertion for APP events
    const appEvent = event as TimelineEvent & {
        appId: string;
        conversationId?: string;
        from?: string;
        text?: string;
        message?: {
            id?: string;
            type?: string;
            text?: string;
            status?: string;
            timestamp?: string;
            imageUrl?: string;
        };
        memberId?: string;
        memberName?: string;
        addedBy?: string;
        removedBy?: string;
        duration?: number;
        messageId?: string;
    };

    if (appEvent.appId !== APP_IDS.WHATSAPP) return;

    // Get conversation ID from event
    const conversationId = appEvent.conversationId;
    if (!conversationId) return;

    // Ensure conversation exists
    if (!draft.conversations[conversationId]) {
        draft.conversations[conversationId] = { id: conversationId, messages: [] };
    }
    const conversation = draft.conversations[conversationId];

    switch (event.type) {
        case "MESSAGE_RECEIVED": {
            const msgPayload = appEvent.message || {};
            conversation.messages.push({
                ...msgPayload,
                id: msgPayload.id || `msg_${event.at}_${appEvent.from}`,
                from: appEvent.from || "unknown",
                text: appEvent.text || msgPayload.text,
                type: (msgPayload.type as "text" | "image" | "voice" | "system") || "text",
                at: event.at,
                status: (msgPayload.status as "sending" | "sent" | "delivered" | "read") || "delivered",
            });
            break;
        }

        case "TYPING_START": {
            if (!conversation.typing) conversation.typing = {};
            if (appEvent.from) {
                conversation.typing[appEvent.from] = true;
            }
            break;
        }

        case "TYPING_END": {
            if (conversation.typing && appEvent.from) {
                delete conversation.typing[appEvent.from];
            }
            break;
        }

        case "GROUP_MEMBER_ADDED": {
            const addedBy = appEvent.addedBy === "me" ? "You" : appEvent.addedBy;
            conversation.messages.push({
                id: `sys_${event.at}_added_${appEvent.memberId}`,
                from: "system",
                type: "system",
                systemType: "member_added",
                text: `${addedBy} added ${appEvent.memberName}`,
                targetMember: appEvent.memberName,
                actorName: addedBy,
                at: event.at
            });
            if (!conversation.members) conversation.members = [];
            conversation.members.push({
                id: appEvent.memberId || "",
                name: appEvent.memberName || ""
            });
            break;
        }

        case "GROUP_MEMBER_REMOVED": {
            const removedBy = appEvent.removedBy === "me" ? "You" : appEvent.removedBy;
            conversation.messages.push({
                id: `sys_${event.at}_removed_${appEvent.memberId}`,
                from: "system",
                type: "system",
                systemType: "member_removed",
                text: `${removedBy} removed ${appEvent.memberName}`,
                targetMember: appEvent.memberName,
                actorName: removedBy,
                at: event.at
            });
            if (conversation.members) {
                conversation.members = conversation.members.filter(
                    (m: { id: string }) => m.id !== appEvent.memberId
                );
            }
            break;
        }

        case "VOICE_MESSAGE_RECEIVED": {
            conversation.messages.push({
                id: `voice_${event.at}_${appEvent.from}`,
                from: appEvent.from || "unknown",
                type: "voice",
                duration: appEvent.duration,
                at: event.at,
                status: "delivered"
            });
            break;
        }

        case "MESSAGE_READ": {
            if (appEvent.messageId) {
                const msg = conversation.messages.find(m => m.id === appEvent.messageId);
                if (msg) {
                    msg.status = "read";
                }
            }
            break;
        }
    }
}

// Register the reducer with the core engine
ReducerRegistry.registerAppReducer(APP_IDS.WHATSAPP, whatsappReducer);
