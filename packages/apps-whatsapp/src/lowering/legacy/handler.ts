/**
 * WhatsApp Lowering Handler
 * 
 * Converts TimelineOp (from compiler) to RuntimeEvent[] (for engine)
 * Part of Tier B plugin contract.
 * 
 * @see docs/FUCKING_MESS.md Section 6.2
 */

import type { LoweringHandler, LowerContext } from "@tokovo/core/src/types/plugin-contract";
import type { RuntimeEvent } from "@tokovo/core/src/types/runtime-event";
import { APP_IDS } from "@tokovo/core";

// =============================================================================
// PAYLOAD TYPES
// =============================================================================

export interface MessageReceivedPayload {
    from: string;
    text: string;
    conversationId: string;
    messageId: string;
    messageType?: "text" | "image" | "video" | "audio" | "document" | "sticker";
    timestamp?: string;
    replyTo?: string;
}

export interface MessageSentPayload {
    text: string;
    conversationId: string;
    messageId: string;
    messageType?: "text" | "image" | "video" | "audio" | "document";
    timestamp?: string;
}

export interface TypingPayload {
    conversationId: string;
    from: string;
}

export interface ReactionPayload {
    messageId: string;
    conversationId: string;
    emoji: string;
    from: string;
}

export interface ScreenNavigatedPayload {
    screen: "chats" | "chat" | "story" | "camera" | "settings" | "profile";
    conversationId?: string;
}

// =============================================================================
// LOWERING HANDLER
// =============================================================================

export const whatsappLowering: LoweringHandler = {
    handles: [
        "MessageReceived",
        "MessageSent",
        "TypingStarted",
        "TypingEnded",
        "ReactionAdded",
        "ScreenNavigated",
    ],

    lower: (op: any, ctx: LowerContext): RuntimeEvent[] => {
        const baseEvent = {
            at: op.at,
            kind: "APP" as const,
            appId: APP_IDS.WHATSAPP,
            deviceId: ctx.deviceId,
            _trace: op.trace,
        };

        switch (op.kind) {
            case "MessageReceived": {
                const payload: MessageReceivedPayload = {
                    from: (op as any).actor || (op as any).from,
                    text: (op as any).text || (op as any).message?.text || "",
                    conversationId: (op as any).conversationId || ctx.conversationId || "",
                    messageId: (op as any).message?.id || `msg_${op.at}`,
                    messageType: (op as any).message?.type || "text",
                };
                return [{
                    ...baseEvent,
                    type: "MESSAGE_RECEIVED",
                    payload,
                }] as RuntimeEvent[];
            }

            case "MessageSent": {
                const payload: MessageSentPayload = {
                    text: (op as any).text || (op as any).message?.text || "",
                    conversationId: (op as any).conversationId || ctx.conversationId || "",
                    messageId: (op as any).message?.id || `msg_${op.at}`,
                    messageType: (op as any).message?.type || "text",
                };
                return [{
                    ...baseEvent,
                    type: "MESSAGE_SENT",
                    payload,
                }] as RuntimeEvent[];
            }

            case "TypingStarted": {
                const payload: TypingPayload = {
                    conversationId: (op as any).conversationId || ctx.conversationId || "",
                    from: (op as any).actor || (op as any).from || "",
                };
                return [{
                    ...baseEvent,
                    type: "TYPING_START",
                    payload,
                }] as RuntimeEvent[];
            }

            case "TypingEnded": {
                const payload: TypingPayload = {
                    conversationId: (op as any).conversationId || ctx.conversationId || "",
                    from: (op as any).actor || (op as any).from || "",
                };
                return [{
                    ...baseEvent,
                    type: "TYPING_END",
                    payload,
                }] as RuntimeEvent[];
            }

            case "ReactionAdded": {
                const payload: ReactionPayload = {
                    messageId: (op as any).messageId || "",
                    conversationId: (op as any).conversationId || ctx.conversationId || "",
                    emoji: (op as any).emoji || "❤️",
                    from: (op as any).actor || (op as any).from || "",
                };
                return [{
                    ...baseEvent,
                    type: "REACTION_ADDED",
                    payload,
                }] as RuntimeEvent[];
            }

            case "ScreenNavigated": {
                const payload: ScreenNavigatedPayload = {
                    screen: (op as any).screen || "chats",
                    conversationId: (op as any).conversationId,
                };
                return [{
                    ...baseEvent,
                    type: "SCREEN_NAVIGATED",
                    payload,
                }] as RuntimeEvent[];
            }

            default:
                console.warn(`[WhatsApp Lowering] Unknown op kind: ${op.kind}`);
                return [];
        }
    }
};
