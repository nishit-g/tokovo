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

// Extended message type for WhatsApp-specific features
type WhatsAppMessageType =
    | "text"
    | "image"
    | "video"
    | "gif"
    | "voice"
    | "system"
    | "deleted"
    | "call_missed"
    | "screenshot_alert";

interface WhatsAppReaction {
    emoji: string;
    count: number;
    fromMe?: boolean;
}

interface ReplyToData {
    messageId: string;
    text: string;
    from: string;
    type?: "text" | "image" | "video" | "voice";
    thumbnailUrl?: string;
}

interface WhatsAppMessage {
    id: string;
    from: string;
    type: WhatsAppMessageType;
    text?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    gifUrl?: string;
    caption?: string;
    duration?: number;
    status?: "sending" | "sent" | "delivered" | "read";
    at?: number;
    edited?: boolean;
    systemType?: string;
    targetMember?: string;
    actorName?: string;
    isPlaying?: boolean;
    playProgress?: number;
    // React and reply
    reactions?: WhatsAppReaction[];
    replyTo?: ReplyToData;
    // Timestamp display
    timestamp?: string;
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
    };

    if (appEvent.appId !== APP_IDS.WHATSAPP) return;

    // Use string type for event.type to allow extended event types
    const eventType = event.type as string;

    // Handle navigation events (no conversation required)
    if (eventType === "SCREEN_NAVIGATED" || eventType === "NAVIGATE" || eventType === "SCREEN_CHANGE") {
        // Ensure appState exists for WhatsApp
        if (!draft.appState) {
            draft.appState = {};
        }
        if (!draft.appState.app_whatsapp) {
            draft.appState.app_whatsapp = {};
        }

        // Update the current screen
        const screen = appEvent.screen || "chat";
        draft.appState.app_whatsapp.screen = screen;

        // STANDARD CONTRACT ADHERENCE
        // Map screen to generic ViewKind
        if (screen === "chat") {
            (draft.appState.app_whatsapp as any).viewMode = "CHAT";
        } else {
            (draft.appState.app_whatsapp as any).viewMode = "TRANSITION"; // or "LIST" if we had it
        }

        // If navigating to a specific conversation
        if (appEvent.conversationId) {
            draft.appState.app_whatsapp.conversationId = appEvent.conversationId;
        }

        return;
    }

    // Get conversation ID from event
    const conversationId = appEvent.conversationId;
    if (!conversationId) return;

    // Ensure conversation exists
    if (!draft.conversations[conversationId]) {
        (draft.conversations as any)[conversationId] = { id: conversationId, messages: [] };
    }
    const conversation = draft.conversations[conversationId];

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
                const msg = conversation.messages.find(m => m.id === appEvent.messageId);
                if (msg) {
                    msg.status = "read";
                }
            }
            break;
        }

        case "REACTION_ADDED": {
            // Find the message and add/update the reaction
            if (appEvent.messageId) {
                const msg = conversation.messages.find(m => m.id === appEvent.messageId) as any;
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

// Register the reducer with the core engine
ReducerRegistry.registerAppReducer(APP_IDS.WHATSAPP, whatsappReducer);
