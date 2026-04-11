import type { TrackEvent } from "@tokovo/ir";
import {
  createScopedLogger,
  getLoweringScratchpad,
  planTypedKeyboard,
  type RuntimeEvent,
} from "@tokovo/core";
import type { WhatsAppTrackEvent, WhatsAppEventType } from "../../types/events.js";

const log = createScopedLogger("app");

export interface V2LoweringHandler {
  lower: (event: TrackEvent, ctx?: unknown) => RuntimeEvent[];
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

function createRuntimeEvent(event: WhatsAppTrackEvent, overrideType?: string): RuntimeEvent {
  const type = overrideType ?? event.type;
  const payload = (event.payload ?? {}) as Record<string, unknown>;

  const base = {
    at: event.at,
    appId: event.appId,
    deviceId: event.deviceId,
    conversationId: (payload as { conversationId?: string }).conversationId ?? event.conversationId,
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
      result.conversationId = (payload as { conversationId?: string }).conversationId;
      break;

    case "NAVIGATE_SCREEN":
      result.screen = (payload as { screen?: string }).screen;
      break;
  }

  return result as unknown as RuntimeEvent;
}

function createKeyboardClearEvent(deviceId: string, at: number): RuntimeEvent {
  return {
    at,
    kind: "DEVICE",
    type: "KEYBOARD_CLEAR",
    deviceId,
    payload: {},
  } as RuntimeEvent;
}

const TIMING_HELPER_EVENT_TYPES = new Set<WhatsAppEventType>(["TYPING_START", "TYPING_END"]);
type AuthoredTypingSpan = { startAt: number; endAt?: number };
type WhatsAppTypingScratchpad = {
  lastEventAtByConversation: Map<string, number>;
  activeMeTypingStartByConversation: Map<string, number>;
  recentMeTypingSpanByConversation: Map<string, AuthoredTypingSpan>;
};

function computeNotBeforeFrame(prevAt: number, submitAt: number): number {
  if (prevAt <= 0) return 0;
  return Math.max(0, Math.min(prevAt + 1, submitAt - 1));
}

function shouldTrackConversationTiming(eventType: WhatsAppEventType): boolean {
  return !TIMING_HELPER_EVENT_TYPES.has(eventType);
}

function getConversationKey(event: WhatsAppTrackEvent): string {
  const conversationId =
    event.conversationId ?? (event.payload as { conversationId?: string })?.conversationId;
  return `${event.deviceId}::${conversationId ?? "unknown"}`;
}

function getTypingActor(event: WhatsAppTrackEvent): string | undefined {
  return (event.payload as { actor?: string })?.actor;
}

export const whatsappV2Lowering: V2LoweringHandler = {
  lower(event: TrackEvent, ctx?: unknown): RuntimeEvent[] {
    if (!isWhatsAppTrackEvent(event)) {
      log.warn("WhatsApp lowering received non-WhatsApp event", {
        event: "whatsapp.lowering.non_whatsapp_event",
      });
      return [];
    }

    const eventType = event.type;
    const isKnownType = EVENT_TYPE_TO_KIND[eventType];

    if (!isKnownType) {
      log.warn(`WhatsApp lowering received unknown event type ${eventType}`, {
        event: "whatsapp.lowering.unknown_event_type",
        type: eventType,
      });
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

    const scratchpad = getLoweringScratchpad<WhatsAppTypingScratchpad>(
      ctx,
      "app_whatsapp.lowering",
      () => ({
        lastEventAtByConversation: new Map(),
        activeMeTypingStartByConversation: new Map(),
        recentMeTypingSpanByConversation: new Map(),
      }),
    );
    const key = getConversationKey(event);

    if (eventType === "TYPING_START" && getTypingActor(event) === "me") {
      scratchpad.activeMeTypingStartByConversation.set(key, event.at);
    }

    if (eventType === "TYPING_END" && getTypingActor(event) === "me") {
      const activeStart = scratchpad.activeMeTypingStartByConversation.get(key) ?? event.at;
      scratchpad.activeMeTypingStartByConversation.delete(key);
      scratchpad.recentMeTypingSpanByConversation.set(key, {
        startAt: activeStart,
        endAt: event.at,
      });
    }

    if (eventType === "MESSAGE_SENT" && event.payload?.typed) {
      const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
      const activeTypingStart = scratchpad.activeMeTypingStartByConversation.get(key);
      const recentTypingSpan = scratchpad.recentMeTypingSpanByConversation.get(key);
      const authoredTypingStart =
        recentTypingSpan?.endAt === event.at ? recentTypingSpan.startAt : activeTypingStart;
      const notBeforeFrame =
        authoredTypingStart !== undefined && authoredTypingStart < event.at
          ? authoredTypingStart
          : computeNotBeforeFrame(prevAt, event.at);
      const payload = event.payload as { text?: string; charDelay?: number };
      const text = payload?.text ?? "";

      const plan = planTypedKeyboard({
        deviceId: event.deviceId,
        submitAt: event.at,
        text,
        requestedCharDelay: payload?.charDelay ?? 3,
        notBeforeFrame,
        allowCompressedCharDelay: authoredTypingStart !== undefined,
        keyboardType: "default",
        returnKeyType: "send",
      });

      scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, event.at));
      scratchpad.activeMeTypingStartByConversation.delete(key);
      if (recentTypingSpan?.endAt === event.at) {
        scratchpad.recentMeTypingSpanByConversation.delete(key);
      }

      if (!plan.ok) {
        // Not enough time to animate full typing after context start.
        // Better to skip keyboard than to show it early or truncate the draft.
        return [createRuntimeEvent(event)];
      }

      const [showEv, typeEv, pressEv, hideEv] = plan.events;
      return [
        showEv,
        typeEv,
        pressEv,
        createRuntimeEvent(event),
        createKeyboardClearEvent(event.deviceId, event.at),
        hideEv,
      ];
    }

    // Update last-seen timestamp for conversation-scoped timing heuristics.
    if (shouldTrackConversationTiming(eventType)) {
      const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
      scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, event.at));
    }

    return [createRuntimeEvent(event)];
  },
};
