/**
 * WhatsApp Runtime Reducer
 * 
 * Handles all WhatsApp-specific events.
 * Uses explicit type checking for safer event handling.
 * 
 * Message types supported:
 * - text: Regular text messages
 * - image: Image with optional caption
 * - video: Video with thumbnail and duration
 * - gif: Animated GIF
 * - voice: Voice note with waveform
 * - system: System messages (member added/removed, etc.)
 * - deleted: Deleted message placeholder
 * - call_missed: Missed call indicator
 * - screenshot_alert: Screenshot notification
 */

import {
    TimelineEvent,
    WorldState,
    ReducerRegistry,
    APP_IDS
} from "@tokovo/core";

// Import WhatsApp-specific types (all app types now live in plugin)
import {
    WhatsAppMessage,
    WhatsAppConversation,
    WhatsAppState,
    WhatsAppMessageType,
    WhatsAppGroupMember,
} from "../types";

// Import group operation types
import {
    GROUP_EVENT_TYPES,
    isWhatsAppGroupEvent,
    isGroupMemberAddPayload,
    isGroupMemberRemovePayload,
    isGroupAdminChangePayload,
    GroupMemberAddPayload,
    GroupMemberRemovePayload,
    GroupAdminChangePayload,
} from "../ir/group-ops";

// =============================================================================
// TYPE-SAFE ACCESSORS
// =============================================================================

/**
 * Get WhatsApp conversations from WorldState with type safety.
 */
function getConversations(draft: WorldState): Record<string, WhatsAppConversation> {
    return draft.conversations as Record<string, WhatsAppConversation>;
}

/**
 * Get or create WhatsApp app state with type safety.
 */
function getAppState(draft: WorldState): WhatsAppState {
    if (!draft.appState) {
        draft.appState = {};
    }
    if (!draft.appState.app_whatsapp) {
        draft.appState.app_whatsapp = {};
    }
    return draft.appState.app_whatsapp as WhatsAppState;
}

/**
 * Generate a timestamp string from frame number.
 * Simulates time progression starting from 10:42.
 * Each message increments by 1-3 minutes for realism.
 */
function generateTimestamp(frame: number, messageIndex: number): string {
    // Base time: 10:42
    const baseHour = 10;
    const baseMinute = 42;

    // Add 1-2 minutes per message for realistic progression
    const totalMinutes = baseMinute + messageIndex * 2;
    const hours = baseHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * WhatsApp reducer - handles all WhatsApp events
 */
export function whatsappReducer(draft: WorldState, event: TimelineEvent): void {
    // Handle CustomOp events with WhatsApp namespace
    if (event.kind === "Custom") {
        handleCustomOp(draft, event as any);
        return;
    }

    // Only handle APP events for WhatsApp
    if (event.kind !== "APP") return;

    // Type assertion for APP events with extended payload
    const appEvent = event as TimelineEvent & {
        appId: string;
        conversationId?: string;
        from?: string;
        text?: string;
        message?: Partial<WhatsAppMessage>;
        // Media-specific fields
        imageUrl?: string;
        thumbnailUrl?: string;
        videoUrl?: string;
        gifUrl?: string;
        caption?: string;
        // Group-specific fields
        memberId?: string;
        memberName?: string;
        addedBy?: string;
        removedBy?: string;
        // Voice-specific fields
        duration?: number;
        // Read receipt fields
        messageId?: string;
        // Navigation fields
        screen?: string;
        // Device context
        deviceId?: string;
    };

    if (appEvent.appId !== APP_IDS.WHATSAPP) return;

    // Use string type for event.type to allow extended event types
    const eventType = event.type as string;

    // Handle navigation events (no conversation required)
    if (eventType === "SCREEN_NAVIGATED" || eventType === "NAVIGATE" || eventType === "SCREEN_CHANGE") {
        const appState = getAppState(draft);

        // Update the current screen
        const screen = appEvent.screen || "chat";
        appState.screen = screen;

        // Map screen to generic ViewKind
        appState.viewMode = screen === "chat" ? "CHAT" : "TRANSITION";

        // If navigating to a specific conversation
        if (appEvent.conversationId) {
            appState.conversationId = appEvent.conversationId;
        }

        return;
    }

    // Get conversation ID from event
    const conversationId = appEvent.conversationId;
    if (!conversationId) return;

    // Get conversations with type safety
    const conversations = getConversations(draft);

    // Ensure conversation exists
    if (!conversations[conversationId]) {
        conversations[conversationId] = {
            id: conversationId,
            messages: []
        } as WhatsAppConversation;
    }
    const conversation = conversations[conversationId];

    switch (eventType) {
        case "MESSAGE_RECEIVED":
        case "MESSAGE_SENT": {
            const msgPayload = appEvent.message || {};
            const msgType = (msgPayload.type || "text") as WhatsAppMessageType;

            // Generate timestamp based on message index
            const messageIndex = conversation.messages.length;
            const timestamp = generateTimestamp(event.at, messageIndex);

            const newMessage: WhatsAppMessage = {
                id: msgPayload.id || `msg_${event.at}_${appEvent.from}`,
                from: eventType === "MESSAGE_SENT" ? "me" : (appEvent.from || "unknown"),
                type: msgType,
                text: appEvent.text || msgPayload.text,
                at: event.at,
                status: (msgPayload.status as any) || (eventType === "MESSAGE_SENT" ? "sent" : "delivered"),
                edited: msgPayload.edited,
                timestamp,  // Dynamic timestamp
            };

            // Handle media-specific fields based on type
            switch (msgType) {
                case "image":
                    newMessage.imageUrl = msgPayload.imageUrl || appEvent.imageUrl;
                    newMessage.caption = msgPayload.caption || appEvent.caption;
                    break;
                case "video":
                    newMessage.thumbnailUrl = msgPayload.thumbnailUrl || appEvent.thumbnailUrl;
                    newMessage.videoUrl = msgPayload.videoUrl || appEvent.videoUrl;
                    newMessage.duration = msgPayload.duration || appEvent.duration || 0;
                    newMessage.caption = msgPayload.caption || appEvent.caption;
                    break;
                case "gif":
                    newMessage.gifUrl = msgPayload.gifUrl || appEvent.gifUrl;
                    break;
            }

            (conversation.messages as any[]).push(newMessage);


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
            (conversation.messages as any[]).push({
                id: `sys_${event.at}_added_${appEvent.memberId}`,
                from: "system",
                type: "system",
                systemType: "member_added",
                text: `${addedBy} added ${appEvent.memberName}`,
                targetMember: appEvent.memberName,
                actorName: addedBy,
                at: event.at
            } as WhatsAppMessage);
            if (!conversation.members) conversation.members = [];
            conversation.members.push({
                id: appEvent.memberId || "",
                name: appEvent.memberName || ""
            });
            break;
        }

        case "GROUP_MEMBER_REMOVED": {
            const removedBy = appEvent.removedBy === "me" ? "You" : appEvent.removedBy;
            (conversation.messages as any[]).push({
                id: `sys_${event.at}_removed_${appEvent.memberId}`,
                from: "system",
                type: "system",
                systemType: "member_removed",
                text: `${removedBy} removed ${appEvent.memberName}`,
                targetMember: appEvent.memberName,
                actorName: removedBy,
                at: event.at
            } as WhatsAppMessage);
            if (conversation.members) {
                conversation.members = conversation.members.filter(
                    (m: { id: string }) => m.id !== appEvent.memberId
                );
            }
            break;
        }

        case "VOICE_MESSAGE_RECEIVED": {
            (conversation.messages as any[]).push({
                id: `voice_${event.at}_${appEvent.from}`,
                from: appEvent.from || "unknown",
                type: "voice",
                duration: appEvent.duration,
                at: event.at,
                status: "delivered"
            } as WhatsAppMessage);
            break;
        }

        case "MESSAGE_READ": {
            if (appEvent.messageId) {
                // Cast to WhatsAppMessage[] since core's messages is now unknown[]
                const messages = conversation.messages as WhatsAppMessage[];
                const msg = messages.find(m => m.id === appEvent.messageId);
                if (msg) {
                    msg.status = "read";
                }
            }
            break;
        }

        case "REACTION_ADDED": {
            // Find the message and add/update the reaction
            if (appEvent.messageId) {
                const messages = conversation.messages as WhatsAppMessage[];
                const msg = messages.find(m => m.id === appEvent.messageId) as any;
                if (msg) {
                    // Initialize reactions array if needed
                    if (!msg.reactions) {
                        msg.reactions = [];
                    }

                    const emoji = (appEvent as any).emoji || "❤️";
                    const fromMe = (appEvent as any).fromMe || false;

                    // Check if this emoji already exists
                    const existing = msg.reactions.find((r: any) => r.emoji === emoji);
                    if (existing) {
                        existing.count += 1;
                        if (fromMe) existing.fromMe = true;
                    } else {
                        msg.reactions.push({
                            emoji,
                            count: 1,
                            fromMe,
                        });
                    }
                }
            }
            break;
        }

        case "INPUT_CHANGE": {
            // "OS-Level Input Management"
            // The OS has dispatched this event with the raw text from the keyboard.
            // We update the local conversation draft state.
            const text = (appEvent as any).payload?.text;
            if (conversation) {
                (conversation as any).draftText = text;
            }
            break;
        }
    }
}

// =============================================================================
// CUSTOM OP HANDLERS (WhatsApp-namespaced events)
// =============================================================================

interface CustomOpEvent {
    at: number;
    kind: "Custom";
    deviceId?: string;
    appId?: string;
    eventType: string;
    payload?: Record<string, any>;
}

/**
 * Handle CustomOp events with WhatsApp namespace.
 * Uses the event factory pattern from ir/group-ops.ts
 */
function handleCustomOp(draft: WorldState, event: CustomOpEvent): void {
    // Only handle whatsapp-namespaced events
    if (!event.eventType?.startsWith("whatsapp.")) return;
    if (event.appId && event.appId !== APP_IDS.WHATSAPP) return;

    const payload = event.payload;
    if (!payload) return;

    const conversationId = payload.conversationId;
    if (!conversationId) return;

    // Get conversations with type safety
    const conversations = getConversations(draft);

    // Ensure conversation exists
    if (!conversations[conversationId]) {
        conversations[conversationId] = {
            id: conversationId,
            messages: [],
            type: "group"  // CustomOps are typically group operations
        } as WhatsAppConversation;
    }
    const conversation = conversations[conversationId];

    switch (event.eventType) {
        case GROUP_EVENT_TYPES.MEMBER_ADDED: {
            if (!isGroupMemberAddPayload(event.eventType, payload)) break;

            // Add member if not already present
            if (!conversation.members) conversation.members = [];
            if (!conversation.members.find(m => m.id === payload.member.id)) {
                conversation.members.push({
                    id: payload.member.id,
                    name: payload.member.name,
                    avatar: payload.member.avatar,
                });
            }

            // Add system message
            const addedByName = payload.addedBy === "me" ? "You" : payload.addedBy;
            (conversation.messages as any[]).push({
                id: `sys_${event.at}_added_${payload.member.id}`,
                from: "system",
                type: "system",
                systemType: "member_added",
                text: `${addedByName} added ${payload.member.name}`,
                targetMember: payload.member.name,
                actorName: payload.addedBy,
                at: event.at,
            });
            break;
        }

        case GROUP_EVENT_TYPES.MEMBER_REMOVED: {
            if (!isGroupMemberRemovePayload(event.eventType, payload)) break;

            // Remove member from list
            if (conversation.members) {
                conversation.members = conversation.members.filter(
                    m => m.id !== payload.memberId
                );
            }

            // Add system message
            const wasMe = payload.memberId === "me";
            const removedByName = payload.removedBy === "me" ? "You" : payload.removedBy;

            const text = wasMe
                ? "You left the group"
                : `${removedByName} removed ${payload.memberName}`;

            (conversation.messages as any[]).push({
                id: `sys_${event.at}_removed_${payload.memberId}`,
                from: "system",
                type: "system",
                systemType: "member_removed",
                text,
                targetMember: payload.memberName,
                actorName: payload.removedBy,
                at: event.at,
            });
            break;
        }

        case GROUP_EVENT_TYPES.ADMIN_CHANGED: {
            if (!isGroupAdminChangePayload(event.eventType, payload)) break;

            // Update admin list
            if (!conversation.admins) conversation.admins = [];

            if (payload.action === "promote") {
                if (!conversation.admins.includes(payload.memberId)) {
                    conversation.admins.push(payload.memberId);
                }
            } else {
                conversation.admins = conversation.admins.filter(
                    id => id !== payload.memberId
                );
            }

            // Optionally add system message for admin changes
            const changedByName = payload.changedBy === "me" ? "You" : payload.changedBy;
            const memberName = payload.memberName || payload.memberId;
            const action = payload.action === "promote" ? "made" : "removed";
            const role = payload.action === "promote" ? "an admin" : "as admin";

            (conversation.messages as any[]).push({
                id: `sys_${event.at}_admin_${payload.memberId}`,
                from: "system",
                type: "system",
                systemType: "admin_change",
                text: `${changedByName} ${action} ${memberName} ${role}`,
                targetMember: memberName,
                actorName: payload.changedBy,
                at: event.at,
            });
            break;
        }

        case GROUP_EVENT_TYPES.INFO_UPDATED: {
            // Handle group info updates (name, avatar, description)
            const field = payload.field;
            const newValue = payload.newValue;
            const changedByName = payload.changedBy === "me" ? "You" : payload.changedBy;

            if (field === "name") {
                conversation.name = newValue;
                (conversation.messages as any[]).push({
                    id: `sys_${event.at}_name_changed`,
                    from: "system",
                    type: "system",
                    systemType: "group_name_changed",
                    text: `${changedByName} changed the group name to "${newValue}"`,
                    at: event.at,
                });
            } else if (field === "avatar") {
                conversation.avatar = newValue;
            }
            break;
        }
    }
}
