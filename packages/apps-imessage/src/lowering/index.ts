import type { NotificationIntentEmitter, TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { IMessageTrackEvent, IMessageEventType, IMessageEventPayload } from "../types/index.js";

export interface IMessageLoweringHandler {
  lower: (event: TrackEvent, ctx: NotificationIntentEmitter) => RuntimeEvent[];
}

function isIMessageTrackEvent(event: TrackEvent): event is IMessageTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_imessage"
  );
}

function createRuntimeEvent(
  event: TrackEvent,
  type: IMessageEventType,
  payload: IMessageEventPayload,
): RuntimeEvent {
  return {
    at: event.at,
    kind: "APP",
    appId: "app_imessage",
    type,
    payload,
    deviceId: event.deviceId,
  } as RuntimeEvent;
}

function emitNotification(
  event: Extract<IMessageTrackEvent, { type: "IMESSAGE_MESSAGE_RECEIVE" }>,
  ctx: NotificationIntentEmitter,
): void {
  if (!event.deviceId) {
    throw new Error("[iMessageV2Lowering] incoming messages require deviceId");
  }
  const title = event.payload.from;
  const body = event.payload.text ?? "sent you a message";
  ctx.emitNotification({
    id: event.payload.messageId ?? `imessage_notification_${event.at}`,
    deviceId: event.deviceId,
    appId: "app_imessage",
    deliverAtFrame: event.at,
    sequence: event._declarationOrder,
    content: { title, body },
    category: "message",
    threadId: event.payload.conversationId,
    groupId: `conversation:${event.payload.conversationId}`,
    interruption: "active",
    privacy: "private",
    reply: {
      actionId: "reply",
      placeholder: `Reply to ${title}`,
      textPayloadKey: "text",
      target: {
        appEvent: {
          type: "IMESSAGE_MESSAGE_SEND",
          payload: { conversationId: event.payload.conversationId },
        },
      },
    },
    metadata: { kind: "message" },
  });
}

export const iMessageV2Lowering: IMessageLoweringHandler = {
  lower: (event: TrackEvent, ctx: NotificationIntentEmitter): RuntimeEvent[] => {
    if (!isIMessageTrackEvent(event)) return [];
    const type = event.type as IMessageEventType | undefined;
    if (!type) return [];
    const payload = (event.payload ?? {}) as IMessageEventPayload;

    if (type === "IMESSAGE_MESSAGE_RECEIVE" && !(payload as { silent?: boolean }).silent) {
      emitNotification(
        event as Extract<IMessageTrackEvent, { type: "IMESSAGE_MESSAGE_RECEIVE" }>,
        ctx,
      );
    }

    return [createRuntimeEvent(event, type, payload)];
  },
};
