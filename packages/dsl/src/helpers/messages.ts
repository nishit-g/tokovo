/**
 * Message Event Factories
 *
 * Low-level event creators for messaging (WhatsApp, etc).
 */

import { TimelineEvent } from "@tokovo/core";


export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

let messageCounter = 0;

function generateMessageId(at: number, prefix = "msg"): string {
  messageCounter++;
  return `${prefix}_${at}_${messageCounter.toString(16).padStart(4, "0")}`;
}

export function resetMessageCounter(): void {
  messageCounter = 0;
}

export const messages = {
  /**
   * Send a message (from device owner)
   */
  send: (
    at: number,
    conversationId: string,
    text: string,
    options: { appId?: string; deviceId?: string; silent?: boolean } = {},
  ) =>
    ({
      at,
      kind: "MessageSent", // V2 IR
      deviceId: options.deviceId || "primary",
      appId: options.appId || "app_whatsapp",
      conversationId,
      silent: options.silent,
      message: {
        id: generateMessageId(at),
        from: "me",
        text,
        timestamp: Date.now().toString(),
        status: "sent",
      },
    }) as const,

  receive: (
    at: number,
    conversationId: string,
    from: string,
    text: string,
    options: { appId?: string; deviceId?: string; silent?: boolean } = {},
  ) =>
    ({
      at,
      kind: "MessageReceived",
      deviceId: options.deviceId || "primary",
      appId: options.appId || "app_whatsapp",
      conversationId,
      silent: options.silent,
      message: {
        id: generateMessageId(at),
        from,
        text,
        timestamp: Date.now().toString(),
        status: "delivered",
      },
    }) as const,

  /**
   * Start typing indicator
   */
  typingStart: (
    at: number,
    conversationId: string,
    from: string,
    appId = "app_whatsapp",
    deviceId = "primary",
  ) =>
    ({
      at,
      kind: "TypingStarted",
      deviceId,
      appId,
      conversationId,
      actor: from,
    }) as const,

  /**
   * Stop typing indicator
   */
  typingEnd: (
    at: number,
    conversationId: string,
    from: string,
    appId = "app_whatsapp",
    deviceId = "primary",
  ) =>
    ({
      at,
      kind: "TypingEnded",
      deviceId,
      appId,
      conversationId,
      actor: from,
    }) as const,

  /**
   * Send an image
   */
  sendImage: (
    at: number,
    conversationId: string,
    imageUrl: string,
    caption?: string,
    appId = "app_whatsapp",
    deviceId = "primary",
  ) =>
    ({
      at,
      kind: "MessageSent",
      deviceId,
      appId,
      conversationId,
      message: {
        id: generateMessageId(at, "img"),
        from: "me",
        text: caption || "",
        imageUrl,
        timestamp: Date.now().toString(),
        status: "sent",
      },
    }) as const,

  receiveImage: (
    at: number,
    conversationId: string,
    from: string,
    imageUrl: string,
    caption?: string,
    appId = "app_whatsapp",
    deviceId = "primary",
  ) =>
    ({
      at,
      kind: "MessageReceived",
      deviceId,
      appId,
      conversationId,
      message: {
        id: generateMessageId(at, "img"),
        from,
        text: caption || "",
        imageUrl,
        timestamp: Date.now().toString(),
        status: "delivered",
      },
    }) as const,

  // Status updates omitted for brevity/compatibility (retain legacy if needed, but these are V2 compliant core events)
  markRead: (
    at: number,
    conversationId: string,
    messageId: string,
    appId = "app_whatsapp",
  ): TimelineEvent =>
    ({
      at,
      kind: "APP",
      type: "MESSAGE_STATUS",
      appId,
      payload: {
        conversationId,
        messageId,
        status: "read",
      },
    }) satisfies TimelineEvent,
};
