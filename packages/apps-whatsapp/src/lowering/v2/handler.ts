import type { TrackEvent } from "@tokovo/ir";
import {
  getLoweringScratchpad,
  planTypedKeyboard,
  type RuntimeEvent,
} from "@tokovo/core";
import type { WhatsAppTrackEvent, WhatsAppEventType } from "../../types/events.js";

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
  const conversationId = (event.payload as { conversationId?: string })?.conversationId;
  return `${event.deviceId}::${conversationId ?? "unknown"}`;
}

function getTypingActor(event: WhatsAppTrackEvent): string | undefined {
  return (event.payload as { actor?: string })?.actor;
}

export const whatsappV2Lowering: V2LoweringHandler = {
  lower(event: TrackEvent, ctx?: unknown): RuntimeEvent[] {
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
