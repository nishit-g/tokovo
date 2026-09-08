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

const WhatsAppSystemMessageTypeSchema = z.enum([
  "member_added",
  "member_removed",
  "admin_change",
  "group_created",
  "group_name_changed",
  "date_change",
  "encryption_notice",
  "business_notice",
  "safety_code_changed",
  "unread_divider",
  "disappearing_messages",
  "group_description_changed",
  "group_icon_changed",
  "phone_number_changed",
  "pinned_message",
]);

const WhatsAppMessageTypeSchema = z.enum([
  "text",
  "image",
  "video",
  "voice",
  "poll",
  "system",
  "gif",
  "link",
  "deleted",
  "sticker",
  "call",
  "call_missed",
  "screenshot_alert",
  "document",
  "contact",
  "location",
]);

// =============================================================================
// BASE SCHEMAS
// =============================================================================

const BaseEventSchema = z
  .object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.literal("app_whatsapp"),
    deviceId: z.string(),
  })
  .strict();

const ReplyToSchema = z
  .object({
    messageId: z.string().min(1),
    text: z.string().optional(),
    from: z.string().optional(),
    type: WhatsAppMessageTypeSchema.optional(),
    thumbnailUrl: z.string().optional(),
  })
  .strict();

// =============================================================================
// MESSAGE EVENTS
// =============================================================================

export const MessageReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      text: z.string(),
      from: z.string().min(1),
      messageType: z
        .enum(["text", "system", "call", "call_missed", "screenshot_alert"])
        .optional(),
      messageId: z.string().optional(),
      replyTo: ReplyToSchema.optional(),
      silent: z.boolean().optional(),
      systemType: WhatsAppSystemMessageTypeSchema.optional(),
      callType: z.enum(["voice", "video"]).optional(),
      callDuration: z.number().optional(),
    })
    .strict(),
});

export const MessageSentEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      text: z.string(),
      messageType: z.enum(["text", "call", "call_missed"]).optional(),
      messageId: z.string().optional(),
      replyTo: ReplyToSchema.optional(),
      silent: z.boolean().optional(),
      callType: z.enum(["voice", "video"]).optional(),
      callDuration: z.number().optional(),
    })
    .strict(),
});

// =============================================================================
// TYPING EVENTS
// =============================================================================

export const TypingStartEventSchema = BaseEventSchema.extend({
  type: z.literal("TYPING_START"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      actor: z.string().min(1),
    })
    .strict(),
});

export const TypingEndEventSchema = BaseEventSchema.extend({
  type: z.literal("TYPING_END"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      actor: z.string().min(1),
    })
    .strict(),
});

// =============================================================================
// MEDIA EVENTS
// =============================================================================

export const ImageReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("IMAGE_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      from: z.string().min(1),
      caption: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const ImageSentEventSchema = BaseEventSchema.extend({
  type: z.literal("IMAGE_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      caption: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const VideoReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("VIDEO_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      from: z.string().min(1),
      duration: z.number().nonnegative().optional(),
      caption: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const VideoSentEventSchema = BaseEventSchema.extend({
  type: z.literal("VIDEO_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      duration: z.number().nonnegative().optional(),
      caption: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const VoiceReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("VOICE_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      from: z.string().min(1),
      duration: z.number().positive(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const VoiceSentEventSchema = BaseEventSchema.extend({
  type: z.literal("VOICE_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      duration: z.number().positive(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const GifReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("GIF_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      from: z.string().min(1),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const GifSentEventSchema = BaseEventSchema.extend({
  type: z.literal("GIF_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const StickerReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("STICKER_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      from: z.string().min(1),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const StickerSentEventSchema = BaseEventSchema.extend({
  type: z.literal("STICKER_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().min(1),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const DocumentReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("DOCUMENT_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().optional(),
      from: z.string().min(1),
      fileName: z.string().min(1),
      fileSize: z.union([z.string(), z.number()]).optional(),
      fileType: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const DocumentSentEventSchema = BaseEventSchema.extend({
  type: z.literal("DOCUMENT_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      url: z.string().optional(),
      fileName: z.string().min(1),
      fileSize: z.union([z.string(), z.number()]).optional(),
      fileType: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const ContactReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("CONTACT_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      from: z.string(),
      contactName: z.string().min(1),
      contactPhone: z.string().optional(),
      contactAvatarUrl: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const ContactSentEventSchema = BaseEventSchema.extend({
  type: z.literal("CONTACT_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      contactName: z.string().min(1),
      contactPhone: z.string().optional(),
      contactAvatarUrl: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const LocationReceivedEventSchema = BaseEventSchema.extend({
  type: z.literal("LOCATION_RECEIVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      from: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      locationName: z.string().optional(),
      locationAddress: z.string().optional(),
      mapThumbnailUrl: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

export const LocationSentEventSchema = BaseEventSchema.extend({
  type: z.literal("LOCATION_SENT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      latitude: z.number(),
      longitude: z.number(),
      locationName: z.string().optional(),
      locationAddress: z.string().optional(),
      mapThumbnailUrl: z.string().optional(),
      messageId: z.string().min(1).optional(),
    })
    .strict(),
});

// =============================================================================
// INTERACTION EVENTS
// =============================================================================

export const ReactionAddedEventSchema = BaseEventSchema.extend({
  type: z.literal("REACTION_ADDED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
      emoji: z.string().min(1),
      fromMe: z.boolean().optional(),
    })
    .strict(),
});

export const MessageReadEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_READ"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
    })
    .strict(),
});

export const MessageDeliveryFailedEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_DELIVERY_FAILED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
      failureReason: z.string().min(1),
    })
    .strict(),
});

export const MessageRetryStartedEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_RETRY_STARTED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
    })
    .strict(),
});

export const MessageRetryCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_RETRY_COMPLETED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
    })
    .strict(),
});

export const MessageDeletedEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_DELETED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
      deletedForEveryone: z.boolean().optional(),
      deletedBy: z.string().optional(),
    })
    .strict(),
});

export const MessageEditedEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_EDITED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
      newText: z.string(),
    })
    .strict(),
});

export const MessageForwardedEventSchema = BaseEventSchema.extend({
  type: z.literal("MESSAGE_FORWARDED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      sourceMessageId: z.string().min(1),
      messageId: z.string().min(1).optional(),
      messageType: z.string().optional(),
      text: z.string().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      gifUrl: z.string().optional(),
      forwardedFrom: z.string().optional(),
    })
    .strict(),
});

// =============================================================================
// MEDIA LIFECYCLE EVENTS
// =============================================================================

const MediaLifecyclePayloadSchema = z
  .object({
    conversationId: z.string().min(1),
    messageId: z.string().min(1),
    progress: z.number().min(0).max(1).optional(),
    failureReason: z.string().min(1).optional(),
  })
  .strict();

export const MediaDownloadStartedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_DOWNLOAD_STARTED"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaDownloadProgressEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_DOWNLOAD_PROGRESS"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaDownloadCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_DOWNLOAD_COMPLETED"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaDownloadFailedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_DOWNLOAD_FAILED"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaPlaybackStartedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_PLAYBACK_STARTED"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaPlaybackProgressEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_PLAYBACK_PROGRESS"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaPlaybackPausedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_PLAYBACK_PAUSED"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaPlaybackCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_PLAYBACK_COMPLETED"),
  payload: MediaLifecyclePayloadSchema,
});

export const MediaViewerOpenedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_VIEWER_OPENED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
    })
    .strict(),
});

export const MediaViewerClosedEventSchema = BaseEventSchema.extend({
  type: z.literal("MEDIA_VIEWER_CLOSED"),
  payload: z.object({}).strict(),
});

export const StatusViewerOpenedEventSchema = BaseEventSchema.extend({
  type: z.literal("STATUS_VIEWER_OPENED"),
  payload: z.object({ statusId: z.string().min(1) }).strict(),
});

export const StatusViewerAdvancedEventSchema = BaseEventSchema.extend({
  type: z.literal("STATUS_VIEWER_ADVANCED"),
  payload: z.object({ direction: z.enum(["next", "previous"]) }).strict(),
});

export const StatusViewerClosedEventSchema = BaseEventSchema.extend({
  type: z.literal("STATUS_VIEWER_CLOSED"),
  payload: z.object({}).strict(),
});

// =============================================================================
// AUTHORED MESSAGE GESTURES AND LOCALE
// =============================================================================

export const GestureStartedEventSchema = BaseEventSchema.extend({
  type: z.literal("GESTURE_STARTED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
      gesture: z.enum(["long_press", "swipe_reply"]),
    })
    .strict(),
});

export const GestureUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("GESTURE_UPDATED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
      progress: z.number().min(0).max(1),
    })
    .strict(),
});

export const GestureCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal("GESTURE_COMPLETED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
    })
    .strict(),
});

export const GestureCancelledEventSchema = BaseEventSchema.extend({
  type: z.literal("GESTURE_CANCELLED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      messageId: z.string().min(1),
    })
    .strict(),
});

export const ReplyComposerDismissedEventSchema = BaseEventSchema.extend({
  type: z.literal("REPLY_COMPOSER_DISMISSED"),
  payload: z.object({ conversationId: z.string().min(1) }).strict(),
});

export const SetLocaleEventSchema = BaseEventSchema.extend({
  type: z.literal("SET_LOCALE"),
  payload: z.object({ locale: z.enum(["en-US", "ar"]) }).strict(),
});

// =============================================================================
// NAVIGATION EVENTS
// =============================================================================

export const NavigateScreenEventSchema = BaseEventSchema.extend({
  type: z.literal("NAVIGATE_SCREEN"),
  payload: z
    .object({
      scroll: z
        .object({
          offset: z.number().finite().nonnegative(),
          durationFrames: z.number().int().nonnegative(),
        })
        .strict()
        .optional(),
      screen: z.enum([
        "chats",
        "chat",
        "updates",
        "calls",
        "communities",
        "settings",
        "profile",
      ]),
      conversationId: z.string().min(1).optional(),
    })
    .strict(),
});

export const ConversationOpenedEventSchema = BaseEventSchema.extend({
  type: z.literal("CONVERSATION_OPENED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
    })
    .strict(),
});

export const ReadMessagesEventSchema = BaseEventSchema.extend({
  type: z.literal("READ"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      count: z.number().int().nonnegative().optional(),
    })
    .strict(),
});

// =============================================================================
// GROUP EVENTS
// =============================================================================

export const GroupMemberAddedEventSchema = BaseEventSchema.extend({
  type: z.literal("GROUP_MEMBER_ADDED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      memberId: z.string().min(1),
      memberName: z.string().min(1),
      addedBy: z.string().min(1).optional(),
    })
    .strict(),
});

export const GroupMemberRemovedEventSchema = BaseEventSchema.extend({
  type: z.literal("GROUP_MEMBER_REMOVED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      memberId: z.string().min(1),
      memberName: z.string().min(1),
      removedBy: z.string().min(1).optional(),
    })
    .strict(),
});

export const GroupAdminChangedEventSchema = BaseEventSchema.extend({
  type: z.literal("GROUP_ADMIN_CHANGED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      memberId: z.string().min(1),
      memberName: z.string().min(1).optional(),
      action: z.enum(["promote", "demote"]),
      changedBy: z.string().min(1),
    })
    .strict(),
});

export const GroupInfoUpdatedEventSchema = BaseEventSchema.extend({
  type: z.literal("GROUP_INFO_UPDATED"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      field: z.enum(["name", "avatar", "description"]),
      newValue: z.string(),
      changedBy: z.string().min(1),
    })
    .strict(),
});

// =============================================================================
// CONVERSATION STATE EVENTS
// =============================================================================

export const PinConversationEventSchema = BaseEventSchema.extend({
  type: z.literal("PIN_CONVERSATION"),
  payload: z.object({ conversationId: z.string().min(1) }).strict(),
});

export const UnpinConversationEventSchema = BaseEventSchema.extend({
  type: z.literal("UNPIN_CONVERSATION"),
  payload: z.object({ conversationId: z.string().min(1) }).strict(),
});

export const MuteConversationEventSchema = BaseEventSchema.extend({
  type: z.literal("MUTE_CONVERSATION"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      until: z.string().optional(),
    })
    .strict(),
});

export const UnmuteConversationEventSchema = BaseEventSchema.extend({
  type: z.literal("UNMUTE_CONVERSATION"),
  payload: z.object({ conversationId: z.string().min(1) }).strict(),
});

export const ArchiveConversationEventSchema = BaseEventSchema.extend({
  type: z.literal("ARCHIVE_CONVERSATION"),
  payload: z.object({ conversationId: z.string().min(1) }).strict(),
});

export const UnarchiveConversationEventSchema = BaseEventSchema.extend({
  type: z.literal("UNARCHIVE_CONVERSATION"),
  payload: z.object({ conversationId: z.string().min(1) }).strict(),
});

export const SetDraftEventSchema = BaseEventSchema.extend({
  type: z.literal("SET_DRAFT"),
  payload: z
    .object({
      conversationId: z.string().min(1),
      text: z.string(),
    })
    .strict(),
});

// =============================================================================
// UNION OF ALL WHATSAPP EVENTS
// =============================================================================

export const WhatsAppEventSchema = z.discriminatedUnion("type", [
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
  ReactionAddedEventSchema,
  MessageReadEventSchema,
  MessageDeliveryFailedEventSchema,
  MessageRetryStartedEventSchema,
  MessageRetryCompletedEventSchema,
  MessageDeletedEventSchema,
  MessageEditedEventSchema,
  MessageForwardedEventSchema,
  MediaDownloadStartedEventSchema,
  MediaDownloadProgressEventSchema,
  MediaDownloadCompletedEventSchema,
  MediaDownloadFailedEventSchema,
  MediaPlaybackStartedEventSchema,
  MediaPlaybackProgressEventSchema,
  MediaPlaybackPausedEventSchema,
  MediaPlaybackCompletedEventSchema,
  MediaViewerOpenedEventSchema,
  MediaViewerClosedEventSchema,
  StatusViewerOpenedEventSchema,
  StatusViewerAdvancedEventSchema,
  StatusViewerClosedEventSchema,
  GestureStartedEventSchema,
  GestureUpdatedEventSchema,
  GestureCompletedEventSchema,
  GestureCancelledEventSchema,
  ReplyComposerDismissedEventSchema,
  SetLocaleEventSchema,
  NavigateScreenEventSchema,
  ConversationOpenedEventSchema,
  ReadMessagesEventSchema,
  GroupMemberAddedEventSchema,
  GroupMemberRemovedEventSchema,
  GroupAdminChangedEventSchema,
  GroupInfoUpdatedEventSchema,
  PinConversationEventSchema,
  UnpinConversationEventSchema,
  MuteConversationEventSchema,
  UnmuteConversationEventSchema,
  ArchiveConversationEventSchema,
  UnarchiveConversationEventSchema,
  SetDraftEventSchema,
]);

export const AnyWhatsAppEventSchema = WhatsAppEventSchema;

// =============================================================================
// DERIVED TYPES - TypeScript types from Zod schemas
// =============================================================================

export type WhatsAppEvent = z.infer<typeof WhatsAppEventSchema>;
export type WhatsAppEventKind = WhatsAppEvent["type"];
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
export type ReactionAddedEvent = z.infer<typeof ReactionAddedEventSchema>;
export type MessageReadEvent = z.infer<typeof MessageReadEventSchema>;
export type MessageDeliveryFailedEvent = z.infer<
  typeof MessageDeliveryFailedEventSchema
>;
export type MessageRetryStartedEvent = z.infer<
  typeof MessageRetryStartedEventSchema
>;
export type MessageRetryCompletedEvent = z.infer<
  typeof MessageRetryCompletedEventSchema
>;
export type MessageDeletedEvent = z.infer<typeof MessageDeletedEventSchema>;
export type MessageEditedEvent = z.infer<typeof MessageEditedEventSchema>;
export type MessageForwardedEvent = z.infer<typeof MessageForwardedEventSchema>;
export type MediaDownloadStartedEvent = z.infer<
  typeof MediaDownloadStartedEventSchema
>;
export type MediaDownloadProgressEvent = z.infer<
  typeof MediaDownloadProgressEventSchema
>;
export type MediaDownloadCompletedEvent = z.infer<
  typeof MediaDownloadCompletedEventSchema
>;
export type MediaDownloadFailedEvent = z.infer<
  typeof MediaDownloadFailedEventSchema
>;
export type MediaPlaybackStartedEvent = z.infer<
  typeof MediaPlaybackStartedEventSchema
>;
export type MediaPlaybackProgressEvent = z.infer<
  typeof MediaPlaybackProgressEventSchema
>;
export type MediaPlaybackPausedEvent = z.infer<
  typeof MediaPlaybackPausedEventSchema
>;
export type MediaPlaybackCompletedEvent = z.infer<
  typeof MediaPlaybackCompletedEventSchema
>;
export type MediaViewerOpenedEvent = z.infer<
  typeof MediaViewerOpenedEventSchema
>;
export type MediaViewerClosedEvent = z.infer<
  typeof MediaViewerClosedEventSchema
>;
export type StatusViewerOpenedEvent = z.infer<
  typeof StatusViewerOpenedEventSchema
>;
export type StatusViewerAdvancedEvent = z.infer<
  typeof StatusViewerAdvancedEventSchema
>;
export type StatusViewerClosedEvent = z.infer<
  typeof StatusViewerClosedEventSchema
>;
export type GestureStartedEvent = z.infer<typeof GestureStartedEventSchema>;
export type GestureUpdatedEvent = z.infer<typeof GestureUpdatedEventSchema>;
export type GestureCompletedEvent = z.infer<typeof GestureCompletedEventSchema>;
export type GestureCancelledEvent = z.infer<typeof GestureCancelledEventSchema>;
export type ReplyComposerDismissedEvent = z.infer<
  typeof ReplyComposerDismissedEventSchema
>;
export type SetLocaleEvent = z.infer<typeof SetLocaleEventSchema>;
export type NavigateScreenEvent = z.infer<typeof NavigateScreenEventSchema>;
export type ConversationOpenedEvent = z.infer<
  typeof ConversationOpenedEventSchema
>;
export type ReadMessagesEvent = z.infer<typeof ReadMessagesEventSchema>;
export type GroupMemberAddedEvent = z.infer<typeof GroupMemberAddedEventSchema>;
export type GroupMemberRemovedEvent = z.infer<
  typeof GroupMemberRemovedEventSchema
>;
export type GroupAdminChangedEvent = z.infer<
  typeof GroupAdminChangedEventSchema
>;
export type GroupInfoUpdatedEvent = z.infer<typeof GroupInfoUpdatedEventSchema>;
export type PinConversationEvent = z.infer<typeof PinConversationEventSchema>;
export type UnpinConversationEvent = z.infer<
  typeof UnpinConversationEventSchema
>;
export type MuteConversationEvent = z.infer<typeof MuteConversationEventSchema>;
export type UnmuteConversationEvent = z.infer<
  typeof UnmuteConversationEventSchema
>;
export type ArchiveConversationEvent = z.infer<
  typeof ArchiveConversationEventSchema
>;
export type UnarchiveConversationEvent = z.infer<
  typeof UnarchiveConversationEventSchema
>;
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
