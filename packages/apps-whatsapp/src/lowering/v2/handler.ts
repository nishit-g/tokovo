/**
 * WhatsApp V2 Lowering
 *
 * Converts V2 TrackEvents to RuntimeEvents with V2 event kinds.
 */

import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";

export interface V2LoweringHandler {
  lower: (event: TrackEvent) => RuntimeEvent[];
}

export const whatsappV2Lowering: V2LoweringHandler = {
  lower(event: TrackEvent): RuntimeEvent[] {
    const e = event as any;
    const base = {
      at: e.at,
      appId: e.appId || "app_whatsapp",
      deviceId: e.deviceId,
      conversationId: e.payload?.conversationId || e.conversationId,
    };

    switch (e.type) {
      case "MESSAGE_RECEIVED":
        return [
          {
            ...base,
            kind: "MessageReceived",
            from: e.payload.from,
            text: e.payload.text,
            payload: e.payload,
          } as any,
        ];

      case "MESSAGE_SENT":
        return [
          {
            ...base,
            kind: "MessageSent",
            text: e.payload.text,
            payload: e.payload,
          } as any,
        ];

      case "TYPING_START":
        return [
          {
            ...base,
            kind: "TypingStarted",
            actor: e.payload.actor,
            payload: e.payload,
          } as any,
        ];

      case "TYPING_END":
        return [
          {
            ...base,
            kind: "TypingEnded",
            actor: e.payload.actor,
            payload: e.payload,
          } as any,
        ];

      case "IMAGE_RECEIVED":
        return [
          {
            ...base,
            kind: "ImageReceived",
            from: e.payload.from,
            url: e.payload.url,
            caption: e.payload.caption,
            payload: e.payload,
          } as any,
        ];

      case "IMAGE_SENT":
        return [
          {
            ...base,
            kind: "ImageSent",
            url: e.payload.url,
            caption: e.payload.caption,
            payload: e.payload,
          } as any,
        ];

      case "VIDEO_RECEIVED":
        return [
          {
            ...base,
            kind: "VideoReceived",
            from: e.payload.from,
            url: e.payload.url,
            duration: e.payload.duration,
            payload: e.payload,
          } as any,
        ];

      case "VIDEO_SENT":
        return [
          {
            ...base,
            kind: "VideoSent",
            url: e.payload.url,
            duration: e.payload.duration,
            payload: e.payload,
          } as any,
        ];

      case "REACT":
        return [
          {
            ...base,
            kind: "React",
            payload: e.payload,
          } as any,
        ];

      case "READ":
      case "READ_MESSAGES":
        return [
          {
            ...base,
            kind: "ReadMessages",
            payload: e.payload,
          } as any,
        ];

      case "CONVERSATION_OPENED":
        return [
          {
            ...base,
            kind: "ConversationOpened",
            conversationId: e.payload?.conversationId || e.conversationId,
            payload: e.payload,
          } as any,
        ];

      case "NAVIGATE_SCREEN":
        return [
          {
            ...base,
            kind: "NavigateScreen",
            screen: e.payload?.screen,
            payload: e.payload,
          } as any,
        ];

      case "GO_BACK":
        return [
          {
            ...base,
            kind: "NavigateScreen",
            screen: "chats",
            payload: { screen: "chats" },
          } as any,
        ];

      case "MESSAGE_DELETED":
        return [
          {
            ...base,
            kind: "MessageDeleted",
            payload: e.payload,
          } as any,
        ];

      case "MESSAGE_EDITED":
        return [
          {
            ...base,
            kind: "MessageEdited",
            payload: e.payload,
          } as any,
        ];

      case "MESSAGE_FORWARDED":
        return [
          {
            ...base,
            kind: "MessageForwarded",
            payload: e.payload,
          } as any,
        ];

      case "VOICE_RECEIVED":
        return [
          {
            ...base,
            kind: "VoiceReceived",
            payload: e.payload,
          } as any,
        ];

      case "VOICE_SENT":
        return [
          {
            ...base,
            kind: "VoiceSent",
            payload: e.payload,
          } as any,
        ];

      case "GIF_RECEIVED":
        return [
          {
            ...base,
            kind: "GifReceived",
            payload: e.payload,
          } as any,
        ];

      case "GIF_SENT":
        return [
          {
            ...base,
            kind: "GifSent",
            payload: e.payload,
          } as any,
        ];

      case "STICKER_RECEIVED":
        return [
          {
            ...base,
            kind: "StickerReceived",
            payload: e.payload,
          } as any,
        ];

      case "STICKER_SENT":
        return [
          {
            ...base,
            kind: "StickerSent",
            payload: e.payload,
          } as any,
        ];

      case "DOCUMENT_RECEIVED":
        return [
          {
            ...base,
            kind: "DocumentReceived",
            payload: e.payload,
          } as any,
        ];

      case "DOCUMENT_SENT":
        return [
          {
            ...base,
            kind: "DocumentSent",
            payload: e.payload,
          } as any,
        ];

      case "CONTACT_RECEIVED":
        return [
          {
            ...base,
            kind: "ContactReceived",
            payload: e.payload,
          } as any,
        ];

      case "CONTACT_SENT":
        return [
          {
            ...base,
            kind: "ContactSent",
            payload: e.payload,
          } as any,
        ];

      case "LOCATION_RECEIVED":
        return [
          {
            ...base,
            kind: "LocationReceived",
            payload: e.payload,
          } as any,
        ];

      case "LOCATION_SENT":
        return [
          {
            ...base,
            kind: "LocationSent",
            payload: e.payload,
          } as any,
        ];

      case "DATE_SEPARATOR":
        return [
          {
            ...base,
            kind: "DateSeparator",
            payload: e.payload,
          } as any,
        ];

      default:
        console.warn(`[whatsappV2Lowering] Unknown event type: ${e.type}`);
        return [];
    }
  },
};
