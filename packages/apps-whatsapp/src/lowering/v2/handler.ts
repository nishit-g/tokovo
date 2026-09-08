import type { NotificationIntentEmitter, TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { WhatsAppTrackEvent, WhatsAppEventType } from "../../types/events.js";
import { parseWhatsAppEventStrict } from "../../schemas/events.js";

export interface V2LoweringHandler {
  lower: (event: TrackEvent, ctx: NotificationIntentEmitter) => RuntimeEvent[];
}

function isWhatsAppTrackEvent(event: TrackEvent): event is WhatsAppTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_whatsapp"
  );
}

const EVENT_TYPE_TO_KIND: Record<WhatsAppEventType, true> = {
  MESSAGE_RECEIVED: true,
  MESSAGE_SENT: true,
  IMAGE_RECEIVED: true,
  IMAGE_SENT: true,
  VIDEO_RECEIVED: true,
  VIDEO_SENT: true,
  VOICE_RECEIVED: true,
  VOICE_SENT: true,
  GIF_RECEIVED: true,
  GIF_SENT: true,
  STICKER_RECEIVED: true,
  STICKER_SENT: true,
  DOCUMENT_RECEIVED: true,
  DOCUMENT_SENT: true,
  CONTACT_RECEIVED: true,
  CONTACT_SENT: true,
  LOCATION_RECEIVED: true,
  LOCATION_SENT: true,
  TYPING_START: true,
  TYPING_END: true,
  READ: true,
  MESSAGE_DELETED: true,
  MESSAGE_EDITED: true,
  MESSAGE_FORWARDED: true,
  MEDIA_DOWNLOAD_STARTED: true,
  MEDIA_DOWNLOAD_PROGRESS: true,
  MEDIA_DOWNLOAD_COMPLETED: true,
  MEDIA_DOWNLOAD_FAILED: true,
  MEDIA_PLAYBACK_STARTED: true,
  MEDIA_PLAYBACK_PROGRESS: true,
  MEDIA_PLAYBACK_PAUSED: true,
  MEDIA_PLAYBACK_COMPLETED: true,
  MEDIA_VIEWER_OPENED: true,
  MEDIA_VIEWER_CLOSED: true,
  STATUS_VIEWER_OPENED: true,
  STATUS_VIEWER_ADVANCED: true,
  STATUS_VIEWER_CLOSED: true,
  GESTURE_STARTED: true,
  GESTURE_UPDATED: true,
  GESTURE_COMPLETED: true,
  GESTURE_CANCELLED: true,
  REPLY_COMPOSER_DISMISSED: true,
  SET_LOCALE: true,
  CONVERSATION_OPENED: true,
  NAVIGATE_SCREEN: true,
  GROUP_MEMBER_ADDED: true,
  GROUP_MEMBER_REMOVED: true,
  GROUP_ADMIN_CHANGED: true,
  GROUP_INFO_UPDATED: true,
  PIN_CONVERSATION: true,
  UNPIN_CONVERSATION: true,
  MUTE_CONVERSATION: true,
  UNMUTE_CONVERSATION: true,
  ARCHIVE_CONVERSATION: true,
  UNARCHIVE_CONVERSATION: true,
  SET_DRAFT: true,
  REACTION_ADDED: true,
  MESSAGE_READ: true,
  MESSAGE_DELIVERY_FAILED: true,
  MESSAGE_RETRY_STARTED: true,
  MESSAGE_RETRY_COMPLETED: true,
};

export const WHATSAPP_EVENT_TYPES = Object.freeze(
  Object.keys(EVENT_TYPE_TO_KIND) as WhatsAppEventType[],
);

function createRuntimeEvent(event: WhatsAppTrackEvent, overrideType?: string): RuntimeEvent {
  const type = overrideType ?? event.type;
  const payload = (event.payload ?? {}) as unknown as Record<string, unknown>;

  return {
    at: event.at,
    appId: event.appId,
    deviceId: event.deviceId,
    kind: "APP" as const,
    type,
    payload: { ...payload },
  } as RuntimeEvent;
}

const INCOMING_NOTIFICATION_TYPES = new Set<WhatsAppEventType>([
  "MESSAGE_RECEIVED",
  "IMAGE_RECEIVED",
  "VIDEO_RECEIVED",
  "VOICE_RECEIVED",
  "GIF_RECEIVED",
  "STICKER_RECEIVED",
  "DOCUMENT_RECEIVED",
  "CONTACT_RECEIVED",
  "LOCATION_RECEIVED",
]);

function incomingBody(type: WhatsAppEventType, payload: Record<string, unknown>): string {
  switch (type) {
    case "MESSAGE_RECEIVED":
      return typeof payload.text === "string" ? payload.text : "New message";
    case "IMAGE_RECEIVED":
      return typeof payload.caption === "string" ? payload.caption : "📷 Photo";
    case "VIDEO_RECEIVED":
      return typeof payload.caption === "string" ? payload.caption : "🎥 Video";
    case "VOICE_RECEIVED":
      return "🎤 Voice message";
    case "GIF_RECEIVED":
      return "GIF";
    case "STICKER_RECEIVED":
      return "Sticker";
    case "DOCUMENT_RECEIVED":
      return typeof payload.fileName === "string" ? `📄 ${payload.fileName}` : "📄 Document";
    case "CONTACT_RECEIVED":
      return "👤 Contact";
    case "LOCATION_RECEIVED":
      return "📍 Location";
    default:
      return "New message";
  }
}

function emitIncomingNotification(
  event: WhatsAppTrackEvent,
  ctx: NotificationIntentEmitter,
): void {
  if (!event.deviceId) {
    throw new Error("WhatsApp incoming events require deviceId");
  }
  const payload = (event.payload ?? {}) as unknown as Record<string, unknown>;
  const conversationId = payload.conversationId;
  const from = payload.from;
  if (typeof conversationId !== "string" || typeof from !== "string") {
    throw new Error(`${event.type} requires conversationId and from`);
  }
  const id =
    typeof payload.messageId === "string"
      ? payload.messageId
      : `whatsapp_notification_${event.at}_${event._declarationOrder ?? 0}`;
  const media =
    event.type === "IMAGE_RECEIVED" && typeof payload.url === "string"
      ? { kind: "image" as const, src: payload.url, alt: incomingBody(event.type, payload) }
      : event.type === "VIDEO_RECEIVED" && typeof payload.url === "string"
        ? { kind: "video" as const, src: payload.url, alt: incomingBody(event.type, payload) }
        : undefined;
  ctx.emitNotification({
    id,
    deviceId: event.deviceId,
    appId: "app_whatsapp",
    deliverAtFrame: event.at,
    sequence: event._declarationOrder,
    content: {
      title: from,
      body: incomingBody(event.type, payload),
      media,
    },
    category: "message",
    threadId: conversationId,
    groupId: `conversation:${conversationId}`,
    interruption: "active",
    privacy: "private",
    reply: {
      actionId: "reply",
      placeholder: `Reply to ${from}`,
      textPayloadKey: "text",
      target: {
        appEvent: {
          type: "MESSAGE_SENT",
          payload: {
            conversationId,
            messageId: `notification-reply:${id}`,
          },
        },
      },
    },
    metadata: { kind: event.type.toLowerCase() },
  });
}

export const whatsappV2Lowering: V2LoweringHandler = {
  lower(event: TrackEvent, ctx: NotificationIntentEmitter): RuntimeEvent[] {
    if (!isWhatsAppTrackEvent(event)) {
      throw new Error(
        `WhatsApp lowering received an event for "${(event as { appId?: string }).appId ?? "unknown"}"`,
      );
    }

    const eventType = event.type;
    const isKnownType = EVENT_TYPE_TO_KIND[eventType];

    if (!isKnownType) {
      throw new Error(`Unknown WhatsApp event type "${eventType}"`);
    }
    parseWhatsAppEventStrict({
      at: event.at,
      kind: event.kind,
      appId: event.appId,
      deviceId: event.deviceId,
      type: event.type,
      payload: event.payload,
    });

    if (
      INCOMING_NOTIFICATION_TYPES.has(eventType) &&
      !(event.payload as { silent?: boolean }).silent
    ) {
      emitIncomingNotification(event, ctx);
    }

    return [createRuntimeEvent(event)];
  },
};
