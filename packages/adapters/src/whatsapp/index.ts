/**
 * WhatsApp Adapter
 * 
 * Transforms Timeline IR operations to WhatsApp runtime events.
 * These events match the format expected by @tokovo/apps-whatsapp.
 */

import { TimelineOp } from "@tokovo/ir";
import { AppAdapter, RuntimeEvent, AdapterContext } from "../adapter";

/**
 * WhatsApp adapter implementation.
 */
export const WhatsAppAdapter: AppAdapter = {
    appId: "app_whatsapp",

    supports(op: TimelineOp): boolean {
        // Handle all app-related operations for WhatsApp
        if ("appId" in op && op.appId === "app_whatsapp") {
            return true;
        }
        // Also handle device operations targeting WhatsApp
        return false;
    },

    lower(op: TimelineOp, ctx: AdapterContext): RuntimeEvent[] {
        switch (op.kind) {
            case "DeviceUnlocked":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "UNLOCK",
                    deviceId: op.deviceId,
                    _trace: op.trace,
                }];

            case "AppOpened":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "OPEN_APP",
                    deviceId: op.deviceId,
                    appId: op.appId,
                    _trace: op.trace,
                }];

            case "ConversationOpened":
                // WhatsApp uses app state to navigate to conversation
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "NAVIGATE",
                    appId: op.appId,
                    screen: "chat",
                    conversationId: op.conversationId,
                    _trace: op.trace,
                }];

            case "TypingStarted":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "TYPING_START",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: op.actor,
                    _trace: op.trace,
                }];

            case "TypingEnded":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "TYPING_END",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: op.actor,
                    _trace: op.trace,
                }];

            case "MessageReceived":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_RECEIVED",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: op.message.from,
                    message: {
                        id: op.message.id,
                        type: op.message.type ?? "text",
                        text: op.message.text,
                        status: "delivered",
                        timestamp: op.message.timestamp,
                    },
                    _trace: op.trace,
                }];

            case "MessageSent":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_RECEIVED",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: "me",
                    message: {
                        id: op.message.id,
                        type: op.message.type ?? "text",
                        text: op.message.text,
                        status: "sent",
                        timestamp: op.message.timestamp,
                    },
                    _trace: op.trace,
                }];

            case "MessageRead":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_READ",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    messageId: op.messageId,
                    _trace: op.trace,
                }];

            case "MessageDeleted":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_DELETED",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    messageId: op.messageId,
                    _trace: op.trace,
                }];

            default:
                return [];
        }
    },
};
