/**
 * Message Event Factories
 * 
 * Low-level event creators for messaging (WhatsApp, etc).
 */

import { TimelineEvent } from "@tokovo/core";

/** Message status for tick progression */
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

/**
 * Message event factories
 */
export const messages = {
    /**
     * Send a message (from device owner)
     */
    send: (at: number, conversationId: string, text: string, appId = "app_whatsapp") => ({
        at,
        kind: "MessageSent", // V2 IR
        appId,
        conversationId,
        message: {
            id: `msg_${Math.random().toString(36).substr(2, 9)}`,
            from: "me",
            text,
            timestamp: Date.now(),
            status: "sent"
        }
    } as const),

    /**
     * Receive a message (from someone else)
     */
    receive: (at: number, conversationId: string, from: string, text: string, appId = "app_whatsapp") => ({
        at,
        kind: "MessageReceived", // V2 IR
        deviceId: "primary",
        trace: "dsl",
        appId,
        conversationId,
        message: {
            id: `msg_${Math.random().toString(36).substr(2, 9)}`,
            from,
            text,
            timestamp: Date.now(),
            status: "delivered"
        }
    } as const),

    /**
     * Start typing indicator
     */
    typingStart: (at: number, conversationId: string, from: string, appId = "app_whatsapp") => ({
        at,
        kind: "TypingStarted",
        appId,
        conversationId,
        actor: from
    } as const),

    /**
     * Stop typing indicator
     */
    typingEnd: (at: number, conversationId: string, from: string, appId = "app_whatsapp") => ({
        at,
        kind: "TypingEnded",
        appId,
        conversationId,
        actor: from
    } as const),

    /**
     * Send an image
     */
    sendImage: (at: number, conversationId: string, imageUrl: string, caption?: string, appId = "app_whatsapp") => ({
        at,
        kind: "MessageSent",
        appId,
        conversationId,
        message: {
            id: `msg_${Math.random().toString(36).substr(2, 9)}`,
            from: "me",
            text: caption || "",
            imageUrl,
            timestamp: Date.now(),
            status: "sent"
        }
    } as const),

    /**
     * Receive an image
     */
    receiveImage: (at: number, conversationId: string, from: string, imageUrl: string, caption?: string, appId = "app_whatsapp") => ({
        at,
        kind: "MessageReceived",
        appId,
        conversationId,
        message: {
            id: `msg_${Math.random().toString(36).substr(2, 9)}`,
            from,
            text: caption || "",
            imageUrl,
            timestamp: Date.now(),
            status: "delivered"
        }
    } as const),

    // Status updates omitted for brevity/compatibility (retain legacy if needed, but these are V2 compliant core events)
    markRead: (at: number, conversationId: string, messageId: string, appId = "app_whatsapp") => ({
        at, kind: "APP", type: "MESSAGE_STATUS", appId, conversationId, messageId, status: "read"
    } as any)
};
