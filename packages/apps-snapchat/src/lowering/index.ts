import type { NotificationIntentEmitter, TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { SnapchatEventType, SnapchatTrackEvent } from "../types/index.js";

export interface SnapchatLoweringHandler {
  lower: (event: TrackEvent, ctx: NotificationIntentEmitter) => RuntimeEvent[];
}

const ALLOWED_TYPES: readonly SnapchatEventType[] = [
  "SNAPCHAT_CONVERSATION_CREATE",
  "SNAPCHAT_CONVERSATION_OPEN",
  "SNAPCHAT_MESSAGE_SEND",
  "SNAPCHAT_MESSAGE_RECEIVE",
  "SNAPCHAT_SNAP_SEND",
  "SNAPCHAT_SNAP_RECEIVE",
  "SNAPCHAT_SNAP_OPEN",
  "SNAPCHAT_TYPING_START",
  "SNAPCHAT_TYPING_END",
  "SNAPCHAT_STREAK_UPDATE",
  "SNAPCHAT_SET_SCREEN",
  "SNAPCHAT_SET_DRAFT",
  "SNAPCHAT_MESSAGE_STATUS_SET",
  "SNAPCHAT_SCREENSHOT",
  "SNAPCHAT_SAVE_MESSAGE",
];

function isSnapchatTrackEvent(event: TrackEvent): event is SnapchatTrackEvent {
  return event.kind === "APP" && event.appId === "app_snapchat" && ALLOWED_TYPES.includes(event.type as SnapchatEventType);
}

function createRuntimeEvent(event: SnapchatTrackEvent): RuntimeEvent {
  return {
    at: event.at,
    kind: "APP",
    appId: "app_snapchat",
    type: event.type,
    payload: event.payload,
    deviceId: event.deviceId,
    _declarationOrder: event._declarationOrder,
  };
}

function emitNotification(
  event: Extract<
    SnapchatTrackEvent,
    { type: "SNAPCHAT_MESSAGE_RECEIVE" | "SNAPCHAT_SNAP_RECEIVE" }
  >,
  ctx: NotificationIntentEmitter,
): void {
  if (!event.deviceId) {
    throw new Error("[snapchatV2Lowering] incoming events require deviceId");
  }
  const title = event.payload.from;
  const body =
    event.type === "SNAPCHAT_SNAP_RECEIVE"
      ? event.payload.snapType === "video"
        ? "sent you a video Snap"
        : "sent you a Snap"
      : event.payload.text ?? "sent you a chat";

  ctx.emitNotification({
    id: event.payload.messageId ?? `snapchat_notification_${event.at}`,
    deviceId: event.deviceId,
    appId: "app_snapchat",
    deliverAtFrame: event.at,
    sequence: event._declarationOrder,
    content: { title, body },
    category: "message",
    threadId: event.payload.conversationId,
    groupId: `conversation:${event.payload.conversationId}`,
    interruption:
      event.type === "SNAPCHAT_SNAP_RECEIVE" ? "timeSensitive" : "active",
    privacy: "private",
    metadata: {
      kind: event.type === "SNAPCHAT_SNAP_RECEIVE" ? "snap" : "message",
    },
    reply:
      event.type === "SNAPCHAT_MESSAGE_RECEIVE"
        ? {
            actionId: "reply",
            placeholder: `Reply to ${title}`,
            textPayloadKey: "text",
            target: {
              appEvent: {
                type: "SNAPCHAT_MESSAGE_SEND",
                payload: { conversationId: event.payload.conversationId },
              },
            },
          }
        : undefined,
  });
}

export const snapchatV2Lowering: SnapchatLoweringHandler = {
  lower: (event: TrackEvent, ctx: NotificationIntentEmitter): RuntimeEvent[] => {
    if (event.kind !== "APP" || event.appId !== "app_snapchat") return [];

    if (!isSnapchatTrackEvent(event)) {
      throw new Error("[snapchatV2Lowering] Unsupported SNAPCHAT event type");
    }

    if (event.type === "SNAPCHAT_MESSAGE_RECEIVE" || event.type === "SNAPCHAT_SNAP_RECEIVE") {
      if (!(event.payload as { silent?: boolean }).silent) {
        emitNotification(event, ctx);
      }
    }

    return [createRuntimeEvent(event)];
  },
};
