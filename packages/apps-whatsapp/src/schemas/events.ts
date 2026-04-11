/**
 * WhatsApp Event Schemas - Normalized Reducer Shapes
 *
 * These schemas validate the normalized WhatsApp event shape consumed by
 * the reducer/handlers. Runtime APP events are normalized before parsing.
 * TypeScript types are DERIVED from these schemas.
 * Validation happens at the reducer entry point.
 */
import { createScopedLogger } from "@tokovo/core";
import { z } from "zod";

const log = createScopedLogger("schema");

// =============================================================================
// BASE SCHEMAS
// =============================================================================

const BaseEventSchema = z.object({
  at: z.number(),
  appId: z.literal("app_whatsapp"),
  deviceId: z.string(),
  conversationId: z.string().optional(),
});

const MessageRefSchema = z.object({
  messageId: z.string().optional(),
  id: z.string().optional(),
  index: z.union([z.number(), z.literal("last")]).optional(),
});

const ReplyToSchema = z.object({
  messageId: z.string().optional(),
  id: z.string().optional(),
  index: z.union([z.number(), z.literal("last")]).optional(),
  text: z.string().optional(),
  from: z.string().optional(),
  type: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

// =============================================================================
// MESSAGE EVENTS
// =============================================================================

export const MessageReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("MessageReceived"),
  from: z.string(),
  text: z.string().optional(),
  payload: z
    .object({
      text: z.string().optional(),
      from: z.string().optional(),
      messageType: z
        .enum([
          "text",
          "image",
          "video",
          "voice",
          "gif",
          "sticker",
          "document",
          "contact",
          "location",
          "link",
          "system",
          "call",
          "call_missed",
          "screenshot_alert",
        ])
        .optional(),
      messageId: z.string().optional(),
      replyTo: ReplyToSchema.optional(),
      systemType: z.string().optional(),
      callType: z.enum(["voice", "video"]).optional(),
      callDuration: z.number().optional(),
    })
    .optional(),
  message: z
    .object({
      id: z.string().optional(),
      text: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      edited: z.boolean().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      gifUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      caption: z.string().optional(),
      duration: z.number().optional(),
      systemType: z.string().optional(),
    })
    .optional(),
});

export const MessageSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("MessageSent"),
  text: z.string().optional(),
  payload: z
    .object({
      text: z.string().optional(),
      messageType: z
        .enum([
          "text",
          "image",
          "video",
          "voice",
          "gif",
          "sticker",
          "document",
          "contact",
          "location",
          "link",
          "call",
          "call_missed",
        ])
        .optional(),
      messageId: z.string().optional(),
      url: z.string().optional(),
      caption: z.string().optional(),
      durationSeconds: z.number().optional(),
      replyTo: ReplyToSchema.optional(),
      systemType: z.string().optional(),
      callType: z.enum(["voice", "video"]).optional(),
      callDuration: z.number().optional(),
    })
    .optional(),
  message: z
    .object({
      id: z.string().optional(),
      text: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      edited: z.boolean().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      gifUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      caption: z.string().optional(),
      duration: z.number().optional(),
      systemType: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// TYPING EVENTS
// =============================================================================

export const TypingStartEventSchema = BaseEventSchema.extend({
  kind: z.literal("TypingStarted"),
  from: z.string().optional(),
  payload: z
    .object({
      actor: z.string().optional(),
    })
    .optional(),
});

export const TypingEndEventSchema = BaseEventSchema.extend({
  kind: z.literal("TypingEnded"),
  from: z.string().optional(),
  payload: z
    .object({
      actor: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// MEDIA EVENTS
// =============================================================================

export const ImageReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("ImageReceived"),
  from: z.string(),
  payload: z
    .object({
      url: z.string().optional(),
      from: z.string().optional(),
      caption: z.string().optional(),
    })
    .optional(),
});

export const ImageSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("ImageSent"),
  payload: z
    .object({
      url: z.string().optional(),
      caption: z.string().optional(),
    })
    .optional(),
});

export const VideoReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("VideoReceived"),
  from: z.string(),
  payload: z
    .object({
      url: z.string().optional(),
      from: z.string().optional(),
      duration: z.number().optional(),
      caption: z.string().optional(),
    })
    .optional(),
});

export const VideoSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("VideoSent"),
  payload: z
    .object({
      url: z.string().optional(),
      duration: z.number().optional(),
      caption: z.string().optional(),
    })
    .optional(),
});

export const VoiceReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("VoiceReceived"),
  from: z.string(),
  payload: z
    .object({
      from: z.string().optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

export const VoiceSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("VoiceSent"),
  payload: z
    .object({
      duration: z.number().optional(),
    })
    .optional(),
});

export const GifReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("GifReceived"),
  from: z.string(),
  payload: z
    .object({
      url: z.string().optional(),
      from: z.string().optional(),
    })
    .optional(),
});

export const GifSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("GifSent"),
  payload: z
    .object({
      url: z.string().optional(),
    })
    .optional(),
});

export const StickerReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("StickerReceived"),
  from: z.string(),
  payload: z
    .object({
      url: z.string().optional(),
      from: z.string().optional(),
    })
    .optional(),
});

export const StickerSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("StickerSent"),
  payload: z
    .object({
      url: z.string().optional(),
    })
    .optional(),
});

export const DocumentReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("DocumentReceived"),
  from: z.string(),
  payload: z
    .object({
      url: z.string().optional(),
      from: z.string().optional(),
      fileName: z.string().optional(),
      fileSize: z.union([z.string(), z.number()]).optional(),
      fileType: z.string().optional(),
    })
    .optional(),
});

export const DocumentSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("DocumentSent"),
  payload: z
    .object({
      url: z.string().optional(),
      fileName: z.string().optional(),
      fileSize: z.union([z.string(), z.number()]).optional(),
      fileType: z.string().optional(),
    })
    .optional(),
});

export const ContactReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("ContactReceived"),
  from: z.string(),
  payload: z
    .object({
      from: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      contactAvatar: z.string().optional(),
      contactAvatarUrl: z.string().optional(),
    })
    .optional(),
});

export const ContactSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("ContactSent"),
  payload: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      contactAvatar: z.string().optional(),
      contactAvatarUrl: z.string().optional(),
    })
    .optional(),
});

export const LocationReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("LocationReceived"),
  from: z.string(),
  payload: z
    .object({
      from: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      name: z.string().optional(),
      label: z.string().optional(),
      address: z.string().optional(),
      locationName: z.string().optional(),
      locationAddress: z.string().optional(),
      mapThumbnailUrl: z.string().optional(),
    })
    .optional(),
});

export const LocationSentEventSchema = BaseEventSchema.extend({
  kind: z.literal("LocationSent"),
  payload: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      name: z.string().optional(),
      label: z.string().optional(),
      address: z.string().optional(),
      locationName: z.string().optional(),
      locationAddress: z.string().optional(),
      mapThumbnailUrl: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// INTERACTION EVENTS
// =============================================================================

export const ReactEventSchema = BaseEventSchema.extend({
  kind: z.literal("React"),
  payload: z
    .object({
      emoji: z.string().optional(),
      messageRef: MessageRefSchema.optional(),
    })
    .optional(),
});

export const ReactionAddedEventSchema = BaseEventSchema.extend({
  kind: z.literal("ReactionAdded"),
  messageId: z.string(),
  emoji: z.string().optional(),
  fromMe: z.boolean().optional(),
});

export const MessageReadEventSchema = BaseEventSchema.extend({
  kind: z.literal("MessageRead"),
  messageId: z.string(),
});

export const MessageDeletedEventSchema = BaseEventSchema.extend({
  kind: z.literal("MessageDeleted"),
  payload: z
    .object({
      messageRef: MessageRefSchema.optional(),
      messageId: z.string().optional(),
      deletedForEveryone: z.boolean().optional(),
      deletedBy: z.string().optional(),
    })
    .optional(),
});

export const MessageEditedEventSchema = BaseEventSchema.extend({
  kind: z.literal("MessageEdited"),
  payload: z
    .object({
      messageRef: MessageRefSchema.optional(),
      messageId: z.string().optional(),
      newText: z.string(),
    })
    .optional(),
});

export const MessageForwardedEventSchema = BaseEventSchema.extend({
  kind: z.literal("MessageForwarded"),
  payload: z
    .object({
      messageRef: MessageRefSchema.optional(),
      messageId: z.string().optional(),
      messageType: z.string().optional(),
      text: z.string().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      gifUrl: z.string().optional(),
      forwardedFrom: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// VOICE PLAYBACK EVENTS
// =============================================================================

export const VoicePlayEventSchema = BaseEventSchema.extend({
  kind: z.literal("VoicePlay"),
  payload: z
    .object({
      messageId: z.string().optional(),
      messageRef: MessageRefSchema.optional(),
      startAt: z.number().optional(),
    })
    .optional(),
});

export const VoicePauseEventSchema = BaseEventSchema.extend({
  kind: z.literal("VoicePause"),
  payload: z
    .object({
      messageId: z.string().optional(),
    })
    .optional(),
});

export const VoiceProgressEventSchema = BaseEventSchema.extend({
  kind: z.literal("VoiceProgress"),
  payload: z
    .object({
      messageId: z.string().optional(),
      progress: z.number().optional(),
    })
    .optional(),
});

export const VoiceMessageReceivedEventSchema = BaseEventSchema.extend({
  kind: z.literal("VoiceMessageReceived"),
  from: z.string(),
  duration: z.number().optional(),
});

// =============================================================================
// NAVIGATION EVENTS
// =============================================================================

export const NavigateScreenEventSchema = BaseEventSchema.extend({
  kind: z.literal("NavigateScreen"),
  screen: z.string().optional(),
  payload: z
    .object({
      screen: z.string().optional(),
    })
    .optional(),
});

export const ConversationOpenedEventSchema = BaseEventSchema.extend({
  kind: z.literal("ConversationOpened"),
  payload: z
    .object({
      conversationId: z.string().optional(),
    })
    .optional(),
});

export const ReadMessagesEventSchema = BaseEventSchema.extend({
  kind: z.literal("ReadMessages"),
  payload: z
    .object({
      count: z.number().optional(),
    })
    .optional(),
});

// =============================================================================
// GROUP EVENTS
// =============================================================================

export const GroupMemberAddedEventSchema = BaseEventSchema.extend({
  kind: z.literal("GroupMemberAdded"),
  memberId: z.string(),
  memberName: z.string(),
  addedBy: z.string().optional(),
});

export const GroupMemberRemovedEventSchema = BaseEventSchema.extend({
  kind: z.literal("GroupMemberRemoved"),
  memberId: z.string(),
  memberName: z.string(),
  removedBy: z.string().optional(),
});

export const DateSeparatorEventSchema = BaseEventSchema.extend({
  kind: z.literal("DateSeparator"),
  payload: z
    .object({
      text: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// CONVERSATION STATE EVENTS
// =============================================================================

export const PinConversationEventSchema = BaseEventSchema.extend({
  kind: z.literal("PinConversation"),
});

export const UnpinConversationEventSchema = BaseEventSchema.extend({
  kind: z.literal("UnpinConversation"),
});

export const MuteConversationEventSchema = BaseEventSchema.extend({
  kind: z.literal("MuteConversation"),
  payload: z
    .object({
      until: z.string().optional(),
    })
    .optional(),
});

export const UnmuteConversationEventSchema = BaseEventSchema.extend({
  kind: z.literal("UnmuteConversation"),
});

export const ArchiveConversationEventSchema = BaseEventSchema.extend({
  kind: z.literal("ArchiveConversation"),
});

export const UnarchiveConversationEventSchema = BaseEventSchema.extend({
  kind: z.literal("UnarchiveConversation"),
});

export const SetDraftEventSchema = BaseEventSchema.extend({
  kind: z.literal("SetDraft"),
  payload: z
    .object({
      text: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// CUSTOM EVENT (for group operations and extensions)
// =============================================================================

export const CustomEventSchema = z.object({
  at: z.number(),
  kind: z.literal("Custom"),
  deviceId: z.string().optional(),
  appId: z.string().optional(),
  eventType: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

// =============================================================================
// UNION OF ALL WHATSAPP EVENTS
// =============================================================================

export const WhatsAppEventSchema = z.discriminatedUnion("kind", [
  MessageReceivedEventSchema,
  MessageSentEventSchema,
  TypingStartEventSchema,
  TypingEndEventSchema,
  ImageReceivedEventSchema,
  ImageSentEventSchema,
  VideoReceivedEventSchema,
  VideoSentEventSchema,
  VoiceReceivedEventSchema,
  VoiceSentEventSchema,
  GifReceivedEventSchema,
  GifSentEventSchema,
  StickerReceivedEventSchema,
  StickerSentEventSchema,
  DocumentReceivedEventSchema,
  DocumentSentEventSchema,
  ContactReceivedEventSchema,
  ContactSentEventSchema,
  LocationReceivedEventSchema,
  LocationSentEventSchema,
  ReactEventSchema,
  ReactionAddedEventSchema,
  MessageReadEventSchema,
  MessageDeletedEventSchema,
  MessageEditedEventSchema,
  MessageForwardedEventSchema,
  VoicePlayEventSchema,
  VoicePauseEventSchema,
  VoiceMessageReceivedEventSchema,
  NavigateScreenEventSchema,
  ConversationOpenedEventSchema,
  ReadMessagesEventSchema,
  GroupMemberAddedEventSchema,
  GroupMemberRemovedEventSchema,
  DateSeparatorEventSchema,
  PinConversationEventSchema,
  UnpinConversationEventSchema,
  MuteConversationEventSchema,
  UnmuteConversationEventSchema,
  ArchiveConversationEventSchema,
  UnarchiveConversationEventSchema,
  SetDraftEventSchema,
]);

// Custom events are handled separately (they have kind: "Custom", not in discriminated union)
export const AnyWhatsAppEventSchema = z.union([WhatsAppEventSchema, CustomEventSchema]);

// =============================================================================
// DERIVED TYPES - TypeScript types from Zod schemas
// =============================================================================

export type WhatsAppEvent = z.infer<typeof WhatsAppEventSchema>;
export type WhatsAppEventKind = WhatsAppEvent["kind"];
export type CustomEvent = z.infer<typeof CustomEventSchema>;
export type AnyWhatsAppEvent = z.infer<typeof AnyWhatsAppEventSchema>;

// Individual event types
export type MessageReceivedEvent = z.infer<typeof MessageReceivedEventSchema>;
export type MessageSentEvent = z.infer<typeof MessageSentEventSchema>;
export type TypingStartEvent = z.infer<typeof TypingStartEventSchema>;
export type TypingEndEvent = z.infer<typeof TypingEndEventSchema>;
export type ImageReceivedEvent = z.infer<typeof ImageReceivedEventSchema>;
export type ImageSentEvent = z.infer<typeof ImageSentEventSchema>;
export type VideoReceivedEvent = z.infer<typeof VideoReceivedEventSchema>;
export type VideoSentEvent = z.infer<typeof VideoSentEventSchema>;
export type VoiceReceivedEvent = z.infer<typeof VoiceReceivedEventSchema>;
export type VoiceSentEvent = z.infer<typeof VoiceSentEventSchema>;
export type GifReceivedEvent = z.infer<typeof GifReceivedEventSchema>;
export type GifSentEvent = z.infer<typeof GifSentEventSchema>;
export type StickerReceivedEvent = z.infer<typeof StickerReceivedEventSchema>;
export type StickerSentEvent = z.infer<typeof StickerSentEventSchema>;
export type DocumentReceivedEvent = z.infer<typeof DocumentReceivedEventSchema>;
export type DocumentSentEvent = z.infer<typeof DocumentSentEventSchema>;
export type ContactReceivedEvent = z.infer<typeof ContactReceivedEventSchema>;
export type ContactSentEvent = z.infer<typeof ContactSentEventSchema>;
export type LocationReceivedEvent = z.infer<typeof LocationReceivedEventSchema>;
export type LocationSentEvent = z.infer<typeof LocationSentEventSchema>;
export type ReactEvent = z.infer<typeof ReactEventSchema>;
export type ReactionAddedEvent = z.infer<typeof ReactionAddedEventSchema>;
export type MessageReadEvent = z.infer<typeof MessageReadEventSchema>;
export type MessageDeletedEvent = z.infer<typeof MessageDeletedEventSchema>;
export type MessageEditedEvent = z.infer<typeof MessageEditedEventSchema>;
export type MessageForwardedEvent = z.infer<typeof MessageForwardedEventSchema>;
export type VoicePlayEvent = z.infer<typeof VoicePlayEventSchema>;
export type VoicePauseEvent = z.infer<typeof VoicePauseEventSchema>;
export type VoiceMessageReceivedEvent = z.infer<typeof VoiceMessageReceivedEventSchema>;
export type NavigateScreenEvent = z.infer<typeof NavigateScreenEventSchema>;
export type ConversationOpenedEvent = z.infer<typeof ConversationOpenedEventSchema>;
export type ReadMessagesEvent = z.infer<typeof ReadMessagesEventSchema>;
export type GroupMemberAddedEvent = z.infer<typeof GroupMemberAddedEventSchema>;
export type GroupMemberRemovedEvent = z.infer<typeof GroupMemberRemovedEventSchema>;
export type DateSeparatorEvent = z.infer<typeof DateSeparatorEventSchema>;
export type PinConversationEvent = z.infer<typeof PinConversationEventSchema>;
export type UnpinConversationEvent = z.infer<typeof UnpinConversationEventSchema>;
export type MuteConversationEvent = z.infer<typeof MuteConversationEventSchema>;
export type UnmuteConversationEvent = z.infer<typeof UnmuteConversationEventSchema>;
export type ArchiveConversationEvent = z.infer<typeof ArchiveConversationEventSchema>;
export type UnarchiveConversationEvent = z.infer<typeof UnarchiveConversationEventSchema>;
export type SetDraftEvent = z.infer<typeof SetDraftEventSchema>;

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate an event at the reducer entry point.
 * Returns the parsed event if valid, or null if invalid.
 */
export function parseWhatsAppEvent(event: unknown): AnyWhatsAppEvent | null {
  const result = AnyWhatsAppEventSchema.safeParse(event);
  if (result.success) {
    return result.data;
  }
  // In development, log validation errors
  if (process.env.NODE_ENV === "development") {
    log.warn("WhatsApp reducer received invalid event", {
      event: "whatsapp.schema.invalid_event",
      issues: result.error.issues,
    });
  }
  return null;
}

/**
 * Type guard - use when you need to check without parsing
 */
export function isWhatsAppEvent(event: unknown): event is AnyWhatsAppEvent {
  return AnyWhatsAppEventSchema.safeParse(event).success;
}

/**
 * Strict parse - throws on invalid event
 */
export function parseWhatsAppEventStrict(event: unknown): AnyWhatsAppEvent {
  return AnyWhatsAppEventSchema.parse(event);
}
