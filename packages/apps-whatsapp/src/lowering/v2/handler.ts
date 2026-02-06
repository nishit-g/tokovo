import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { WhatsAppTrackEvent, WhatsAppEventType } from "../../types/events.js";

export interface V2LoweringHandler {
  lower: (event: TrackEvent) => RuntimeEvent[];
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
  REACT: true,
  READ: true,
  READ_MESSAGES: true,
  MESSAGE_DELETED: true,
  MESSAGE_EDITED: true,
  MESSAGE_FORWARDED: true,
  VOICE_PLAY: true,
  VOICE_PAUSE: true,
  CONVERSATION_OPENED: true,
  NAVIGATE_SCREEN: true,
  GO_BACK: true,
  DATE_SEPARATOR: true,
  GROUP_MEMBER_ADDED: true,
  GROUP_MEMBER_REMOVED: true,
  PIN_CONVERSATION: true,
  UNPIN_CONVERSATION: true,
  MUTE_CONVERSATION: true,
  UNMUTE_CONVERSATION: true,
  ARCHIVE_CONVERSATION: true,
  UNARCHIVE_CONVERSATION: true,
  SET_DRAFT: true,
  REACTION_ADDED: true,
  MESSAGE_READ: true,
  VOICE_MESSAGE_RECEIVED: true,
};

function createRuntimeEvent(
  event: WhatsAppTrackEvent,
  overrideType?: string,
): RuntimeEvent {
  const type = overrideType ?? event.type;
  const payload = (event.payload ?? {}) as Record<string, unknown>;

  const base = {
    at: event.at,
    appId: event.appId,
    deviceId: event.deviceId,
    conversationId:
      (payload as { conversationId?: string }).conversationId ??
      event.conversationId,
    kind: "APP" as const,
    type,
    payload: { ...payload },
  };

  const result: Record<string, unknown> = { ...base };

  switch (type) {
    case "MESSAGE_RECEIVED":
      result.from = (payload as { from?: string }).from;
      result.text = (payload as { text?: string }).text;
      break;

    case "MESSAGE_SENT":
      result.text = (payload as { text?: string }).text;
      break;

    case "TYPING_START":
    case "TYPING_END":
      result.actor = (payload as { actor?: string }).actor;
      break;

    case "IMAGE_RECEIVED":
      result.from = (payload as { from?: string }).from;
      result.url = (payload as { url?: string }).url;
      result.caption = (payload as { caption?: string }).caption;
      break;

    case "IMAGE_SENT":
      result.url = (payload as { url?: string }).url;
      result.caption = (payload as { caption?: string }).caption;
      break;

    case "VIDEO_RECEIVED":
      result.from = (payload as { from?: string }).from;
      result.url = (payload as { url?: string }).url;
      result.duration = (payload as { duration?: number }).duration;
      break;

    case "VIDEO_SENT":
      result.url = (payload as { url?: string }).url;
      result.duration = (payload as { duration?: number }).duration;
      break;

    case "CONVERSATION_OPENED":
      result.conversationId = (payload as { conversationId?: string })
        .conversationId;
      break;

    case "NAVIGATE_SCREEN":
      result.screen = (payload as { screen?: string }).screen;
      break;
  }

  return result as unknown as RuntimeEvent;
}

function expandTypedMessage(event: WhatsAppTrackEvent): RuntimeEvent[] {
  const payload = event.payload as { text?: string; charDelay?: number };
  const text = payload?.text || "";
  const charDelay = payload?.charDelay || 3;
  const deviceId = event.deviceId;
  const messageAt = event.at;

  const typeDuration = text.length * charDelay;
  const keyboardShowAt = messageAt - typeDuration - 20;
  const typeStartAt = messageAt - typeDuration - 5;
  const returnPressAt = messageAt - 3;
  const keyboardHideAt = messageAt + 15;

  const events: RuntimeEvent[] = [];

  events.push({
    at: keyboardShowAt,
    kind: "DEVICE",
    type: "KEYBOARD_SHOW",
    deviceId,
    payload: { keyboardType: "default", returnKeyType: "send" },
  } as unknown as RuntimeEvent);

  events.push({
    at: typeStartAt,
    kind: "DEVICE",
    type: "KEYBOARD_TYPE",
    deviceId,
    payload: { text, charDelay },
  } as unknown as RuntimeEvent);

  events.push({
    at: returnPressAt,
    kind: "DEVICE",
    type: "KEYBOARD_KEY_PRESS",
    deviceId,
    payload: { key: "return", duration: 4 },
  } as unknown as RuntimeEvent);

  // Keep type in APP_* namespace so runtime normalization can map it.
  events.push(createRuntimeEvent(event));

  events.push({
    at: keyboardHideAt,
    kind: "DEVICE",
    type: "KEYBOARD_HIDE",
    deviceId,
    payload: {},
  } as unknown as RuntimeEvent);

  return events;
}

export const whatsappV2Lowering: V2LoweringHandler = {
  lower(event: TrackEvent): RuntimeEvent[] {
    if (!isWhatsAppTrackEvent(event)) {
      console.warn("[whatsappV2Lowering] Received non-WhatsApp event");
      return [];
    }

    const eventType = event.type;
    const isKnownType = EVENT_TYPE_TO_KIND[eventType];

    if (!isKnownType) {
      console.warn(`[whatsappV2Lowering] Unknown event type: ${eventType}`);
      return [];
    }

    if (eventType === "GO_BACK") {
      const goBackEvent: Record<string, unknown> = {
        at: event.at,
        appId: event.appId,
        deviceId: event.deviceId,
        conversationId: event.conversationId,
        kind: "APP",
        type: "NAVIGATE_SCREEN",
        payload: { screen: "chats" },
      };
      return [goBackEvent as unknown as RuntimeEvent];
    }

    if (eventType === "MESSAGE_SENT" && event.payload?.typed) {
      return expandTypedMessage(event);
    }

    return [createRuntimeEvent(event)];
  },
};
