/**
 * WhatsApp DSL Extension
 * 
 * Provides b.use("app_whatsapp").receive() / .send() / .typing() API
 * Part of Tier C plugin contract.
 * 
 * Uses the b.use() pattern - NO prototype mutation.
 * 
 * @see docs/FUCKING_MESS.md Section 6.3
 */

import type { DslExtension } from "@tokovo/core/src/types/plugin-contract";

// =============================================================================
// DSL API INTERFACE
// =============================================================================

export interface WhatsAppDslApi {
    /** Receive a message from someone */
    receive(from: string, text: string, options?: MessageOptions): void;

    /** Send a message (from "me") */
    send(text: string, options?: MessageOptions): void;

    /** Show typing indicator then message */
    typing(from: string, duration?: string): void;

    /** React to a message */
    react(messageId: string, emoji: string, from?: string): void;

    /** Navigate to a screen */
    navigate(screen: "chats" | "chat" | "story", conversationId?: string): void;

    /** Group chat operations */
    group: {
        addMember(memberId: string, addedBy?: string): void;
        removeMember(memberId: string, removedBy?: string): void;
        changeAdmin(memberId: string, isAdmin: boolean): void;
    };
}

export interface MessageOptions {
    messageType?: "text" | "image" | "video" | "audio";
    replyTo?: string;
    silent?: boolean;
}

// =============================================================================
// DSL EXTENSION
// =============================================================================

export const whatsappDsl: DslExtension<WhatsAppDslApi> = {
    createApi: (builder: any): WhatsAppDslApi => ({
        receive: (from: string, text: string, options?: MessageOptions) => {
            builder.ops.push({
                kind: "ReceiveMessage",
                actor: from,
                text,
                conversationId: builder.conversationId,
                message: {
                    type: options?.messageType || "text",
                    text,
                },
                silent: options?.silent,
            });
        },

        send: (text: string, options?: MessageOptions) => {
            builder.ops.push({
                kind: "SendMessage",
                actor: "me",
                text,
                conversationId: builder.conversationId,
                message: {
                    type: options?.messageType || "text",
                    text,
                },
                replyTo: options?.replyTo,
                silent: options?.silent,
            });
        },

        typing: (from: string, duration: string = "2s") => {
            builder.ops.push({
                kind: "TypingStart",
                actor: from,
                conversationId: builder.conversationId,
            });
            builder.wait(duration);
            builder.ops.push({
                kind: "TypingEnd",
                actor: from,
                conversationId: builder.conversationId,
            });
        },

        react: (messageId: string, emoji: string, from: string = "me") => {
            builder.ops.push({
                kind: "AddReaction",
                messageId,
                emoji,
                actor: from,
                conversationId: builder.conversationId,
            });
        },

        navigate: (screen: "chats" | "chat" | "story", conversationId?: string) => {
            builder.ops.push({
                kind: "NavigateScreen",
                screen,
                conversationId: conversationId || builder.conversationId,
            });
        },

        group: {
            addMember: (memberId: string, addedBy: string = "me") => {
                builder.ops.push({
                    kind: "Custom",
                    eventType: "whatsapp:group:memberAdded",
                    payload: {
                        memberId,
                        addedBy,
                        conversationId: builder.conversationId,
                    },
                });
            },

            removeMember: (memberId: string, removedBy: string = "me") => {
                builder.ops.push({
                    kind: "Custom",
                    eventType: "whatsapp:group:memberRemoved",
                    payload: {
                        memberId,
                        removedBy,
                        conversationId: builder.conversationId,
                    },
                });
            },

            changeAdmin: (memberId: string, isAdmin: boolean) => {
                builder.ops.push({
                    kind: "Custom",
                    eventType: "whatsapp:group:adminChanged",
                    payload: {
                        memberId,
                        isAdmin,
                        conversationId: builder.conversationId,
                    },
                });
            },
        },
    }),
};
