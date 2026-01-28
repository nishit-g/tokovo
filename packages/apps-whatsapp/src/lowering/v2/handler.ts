import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { WhatsAppTrackEvent, WhatsAppEventType } from "../../types/events";

export interface V2LoweringHandler {
  lower: (event: TrackEvent) => RuntimeEvent[];
}

type WhatsAppRuntimeEventKind =
  | "MessageReceived"
  | "MessageSent"
  | "TypingStarted"
  | "TypingEnded"
  | "ImageReceived"
  | "ImageSent"
  | "VideoReceived"
  | "VideoSent"
  | "VoiceReceived"
  | "VoiceSent"
  | "GifReceived"
  | "GifSent"
  | "StickerReceived"
  | "StickerSent"
  | "DocumentReceived"
  | "DocumentSent"
  | "ContactReceived"
  | "ContactSent"
  | "LocationReceived"
  | "LocationSent"
  | "React"
  | "ReadMessages"
  | "ConversationOpened"
  | "NavigateScreen"
  | "MessageDeleted"
  | "MessageEdited"
  | "MessageForwarded"
  | "DateSeparator"
  | "GroupMemberAdded"
  | "GroupMemberRemoved"
  | "ReactionAdded"
  | "MessageRead"
  | "VoiceMessageReceived"
  | "VoicePlay"
  | "VoicePause"
  | "PinConversation"
  | "UnpinConversation"
  | "MuteConversation"
  | "UnmuteConversation"
  | "ArchiveConversation"
  | "UnarchiveConversation"
  | "SetDraft";

function isWhatsAppTrackEvent(event: TrackEvent): event is WhatsAppTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_whatsapp"
  );
}

const EVENT_TYPE_TO_KIND: Record<WhatsAppEventType, WhatsAppRuntimeEventKind> =
  {
    MESSAGE_RECEIVED: "MessageReceived",
    MESSAGE_SENT: "MessageSent",
    IMAGE_RECEIVED: "ImageReceived",
    IMAGE_SENT: "ImageSent",
    VIDEO_RECEIVED: "VideoReceived",
    VIDEO_SENT: "VideoSent",
    VOICE_RECEIVED: "VoiceReceived",
    VOICE_SENT: "VoiceSent",
    GIF_RECEIVED: "GifReceived",
    GIF_SENT: "GifSent",
    STICKER_RECEIVED: "StickerReceived",
    STICKER_SENT: "StickerSent",
    DOCUMENT_RECEIVED: "DocumentReceived",
    DOCUMENT_SENT: "DocumentSent",
    CONTACT_RECEIVED: "ContactReceived",
    CONTACT_SENT: "ContactSent",
    LOCATION_RECEIVED: "LocationReceived",
    LOCATION_SENT: "LocationSent",
    TYPING_START: "TypingStarted",
    TYPING_END: "TypingEnded",
    REACT: "React",
    READ: "ReadMessages",
    READ_MESSAGES: "ReadMessages",
    MESSAGE_DELETED: "MessageDeleted",
    MESSAGE_EDITED: "MessageEdited",
    MESSAGE_FORWARDED: "MessageForwarded",
    VOICE_PLAY: "VoicePlay",
    VOICE_PAUSE: "VoicePause",
    CONVERSATION_OPENED: "ConversationOpened",
    NAVIGATE_SCREEN: "NavigateScreen",
    GO_BACK: "NavigateScreen",
    DATE_SEPARATOR: "DateSeparator",
    GROUP_MEMBER_ADDED: "GroupMemberAdded",
    GROUP_MEMBER_REMOVED: "GroupMemberRemoved",
    PIN_CONVERSATION: "PinConversation",
    UNPIN_CONVERSATION: "UnpinConversation",
    MUTE_CONVERSATION: "MuteConversation",
    UNMUTE_CONVERSATION: "UnmuteConversation",
    ARCHIVE_CONVERSATION: "ArchiveConversation",
    UNARCHIVE_CONVERSATION: "UnarchiveConversation",
    SET_DRAFT: "SetDraft",
    REACTION_ADDED: "ReactionAdded",
    MESSAGE_READ: "MessageRead",
    VOICE_MESSAGE_RECEIVED: "VoiceMessageReceived",
  };

function createRuntimeEvent(
  event: WhatsAppTrackEvent,
  kind: WhatsAppRuntimeEventKind,
): RuntimeEvent {
  const base = {
    at: event.at,
    appId: event.appId,
    deviceId: event.deviceId,
    conversationId: event.payload?.conversationId ?? event.conversationId,
    kind,
    payload: { ...event.payload },
  };

  const result: Record<string, unknown> = { ...base };

  switch (event.type) {
    case "MESSAGE_RECEIVED":
      result.from = event.payload.from;
      result.text = event.payload.text;
      break;

    case "MESSAGE_SENT":
      result.text = event.payload.text;
      break;

    case "TYPING_START":
    case "TYPING_END":
      result.actor = event.payload.actor;
      break;

    case "IMAGE_RECEIVED":
      result.from = event.payload.from;
      result.url = event.payload.url;
      result.caption = event.payload.caption;
      break;

    case "IMAGE_SENT":
      result.url = event.payload.url;
      result.caption = event.payload.caption;
      break;

    case "VIDEO_RECEIVED":
      result.from = event.payload.from;
      result.url = event.payload.url;
      result.duration = event.payload.duration;
      break;

    case "VIDEO_SENT":
      result.url = event.payload.url;
      result.duration = event.payload.duration;
      break;

    case "CONVERSATION_OPENED":
      result.conversationId = event.payload.conversationId;
      break;

    case "NAVIGATE_SCREEN":
      result.screen = event.payload.screen;
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

  events.push(createRuntimeEvent(event, "MessageSent"));

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
    const kind = EVENT_TYPE_TO_KIND[eventType];

    if (!kind) {
      console.warn(`[whatsappV2Lowering] Unknown event type: ${eventType}`);
      return [];
    }

    if (eventType === "GO_BACK") {
      const goBackEvent: Record<string, unknown> = {
        at: event.at,
        appId: event.appId,
        deviceId: event.deviceId,
        conversationId: event.conversationId,
        kind: "NavigateScreen",
        screen: "chats",
        payload: { screen: "chats" },
      };
      return [goBackEvent as unknown as RuntimeEvent];
    }

    if (eventType === "MESSAGE_SENT" && event.payload?.typed) {
      return expandTypedMessage(event);
    }

    return [createRuntimeEvent(event, kind)];
  },
};
