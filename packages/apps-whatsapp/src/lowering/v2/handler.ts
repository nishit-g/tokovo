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
                } as any];

            case "MESSAGE_SENT":
                return [{
                    ...base,
                    type: "MESSAGE_SENT",
                    conversationId: e.payload.conversationId,
                    text: e.payload.text,
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
                    payload: e.payload,
                } as any];

            case "READ":
                return [{
                    ...base,
                    type: "READ_MESSAGES",
                    payload: { conversationId: e.payload.conversationId },
                } as any];

            default:
                console.warn(`[whatsappV2Lowering] Unknown event type: ${e.type}`);
                return [];
        }
    }
};
