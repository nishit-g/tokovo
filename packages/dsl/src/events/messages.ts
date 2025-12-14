/**
 * Message Event Factories
 * 
 * Low-level event creators for messaging (WhatsApp, etc).
 */

import { TimelineEvent } from "@tokovo/core";

/**
 * Message event factories
 */
export const messages = {
    /**
     * Send a message (from device owner)
     */
    send: (at: number, conversationId: string, text: string, appId = "app_whatsapp"): TimelineEvent => ({
        at,
        kind: "APP",
        appId,
        type: "MESSAGE_RECEIVED",
        conversationId,
        from: "me",
        text,
    } as TimelineEvent),

    /**
     * Receive a message (from someone else)
     */
    receive: (at: number, conversationId: string, from: string, text: string, appId = "app_whatsapp"): TimelineEvent => ({
        at,
        kind: "APP",
        appId,
        type: "MESSAGE_RECEIVED",
        conversationId,
        from,
        text,
    } as TimelineEvent),

    /**
     * Start typing indicator
     */
    typingStart: (at: number, conversationId: string, from: string, appId = "app_whatsapp"): TimelineEvent => ({
        at,
        kind: "APP",
        appId,
        type: "TYPING_START",
        conversationId,
        from,
    } as TimelineEvent),

    /**
     * Stop typing indicator
     */
    typingEnd: (at: number, conversationId: string, from: string, appId = "app_whatsapp"): TimelineEvent => ({
        at,
        kind: "APP",
        appId,
        type: "TYPING_END",
        conversationId,
        from,
    } as TimelineEvent),

    /**
     * Send an image
     */
    sendImage: (at: number, conversationId: string, imageUrl: string, caption?: string, appId = "app_whatsapp"): TimelineEvent => ({
        at,
        kind: "APP",
        appId,
        type: "MESSAGE_RECEIVED",
        conversationId,
        from: "me",
        imageUrl,
        caption,
    } as TimelineEvent),

    /**
     * Receive an image
     */
    receiveImage: (at: number, conversationId: string, from: string, imageUrl: string, caption?: string, appId = "app_whatsapp"): TimelineEvent => ({
        at,
        kind: "APP",
        appId,
        type: "MESSAGE_RECEIVED",
        conversationId,
        from,
        imageUrl,
        caption,
    } as TimelineEvent),
};
