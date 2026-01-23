import { TimelineEvent } from "@tokovo/core";
import { createTrace } from "@tokovo/ir";
import { Tracer } from "../tracer";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

let eventMsgCounter = 0;

function generateEventMsgId(at: number): string {
  eventMsgCounter++;
  return `msg_${at}_${eventMsgCounter.toString(16).padStart(4, "0")}`;
}

export const messages = {
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
      trace: createTrace(Tracer.capture()),
      appId: options.appId || "app_whatsapp",
      conversationId,
      silent: options.silent,
      message: {
        id: generateEventMsgId(at),
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
      trace: createTrace(Tracer.capture()),
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
      trace: createTrace(Tracer.capture()),
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
      trace: createTrace(Tracer.capture()),
      appId,
      conversationId,
      message: {
        id: generateEventMsgId(at),
        from: "me",
        text: caption || "",
        imageUrl,
        timestamp: Date.now().toString(),
        status: "sent",
      },
    }) as const,

  /**
   * Receive an image
   */
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
      trace: createTrace(Tracer.capture()),
      appId,
      conversationId,
      message: {
        id: generateEventMsgId(at),
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
      trace: createTrace(Tracer.capture()),
      appId,
      conversationId,
      messageId,
      status: "read",
    }) satisfies TimelineEvent,
};
