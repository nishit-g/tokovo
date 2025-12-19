/**
 * WhatsApp V2 Lowering
 *
 * Converts V2 TrackEvents to RuntimeEvents.
 * This is the V2 interface that takes TrackEvent directly.
 */

import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";

/**
 * V2 Lowering interface for track-based compiler.
 */
export interface V2LoweringHandler {
    lower: (event: TrackEvent) => RuntimeEvent[];
}

/**
 * WhatsApp V2 lowering - converts WhatsApp TrackEvents to RuntimeEvents.
 */
export const whatsappV2Lowering: V2LoweringHandler = {
    lower(event: TrackEvent): RuntimeEvent[] {
        const e = event as any;
        const base = {
            at: e.at,
            kind: "APP" as const,
            appId: e.appId,
            deviceId: e.deviceId,
        };

        switch (e.type) {
            case "MESSAGE_RECEIVED":
                return [{
                    ...base,
                    type: "MESSAGE_RECEIVED",
                    conversationId: e.payload.conversationId,
                    from: e.payload.from,
                    text: e.payload.text,
                    payload: e.payload, // Pass full payload for replyTo, etc.
                } as any];

            case "MESSAGE_SENT":
                return [{
                    ...base,
                    type: "MESSAGE_SENT",
                    conversationId: e.payload.conversationId,
                    text: e.payload.text,
                    payload: e.payload, // Pass full payload for replyTo, etc.
                } as any];

            case "TYPING_START":
                return [{
                    ...base,
                    type: "TYPING_START",
                    conversationId: e.payload.conversationId,
                    from: e.payload.actor,
                } as any];

            case "TYPING_END":
                return [{
                    ...base,
                    type: "TYPING_END",
                    conversationId: e.payload.conversationId,
                    from: e.payload.actor,
                } as any];

            case "IMAGE_RECEIVED":
                return [{
                    ...base,
                    type: "RECEIVE_IMAGE",
                    payload: e.payload,
                } as any];

            case "REACT":
                return [{
                    ...base,
                    type: "REACT",
                    conversationId: e.payload.conversationId,  // Required at root!
                    payload: e.payload,
                } as any];

            case "READ":
                return [{
                    ...base,
                    type: "READ_MESSAGES",
                    payload: { conversationId: e.payload.conversationId },
                } as any];

            // Pass through media events directly
            case "IMAGE_SENT":
            case "VIDEO_RECEIVED":
            case "VIDEO_SENT":
            case "VOICE_RECEIVED":
            case "VOICE_SENT":
            case "GIF_RECEIVED":
            case "GIF_SENT":
            case "DATE_SEPARATOR":
                return [{
                    ...base,
                    type: e.type,
                    payload: e.payload,
                    conversationId: e.payload?.conversationId,
                } as any];

            // Navigation events - pass to core navigation handler
            case "CONVERSATION_OPENED":
                return [{
                    ...base,
                    type: e.type,
                    conversationId: e.payload?.conversationId,  // Root level for reducer!
                    payload: e.payload,
                } as any];

            case "NAVIGATE_SCREEN":
            case "GO_BACK":
                return [{
                    ...base,
                    type: e.type,
                    payload: e.payload,
                } as any];

            default:
                console.warn(`[whatsappV2Lowering] Unknown event type: ${e.type}`);
                return [];
        }
    }
};
