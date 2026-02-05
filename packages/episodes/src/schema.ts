import { z } from "zod";

// =============================================================================
// STRICT METADATA & PAYLOAD SCHEMAS
// =============================================================================
// These replace z.any() with explicit, validated types for AI-generated content.
// AI output MUST conform to these schemas or be rejected.

/**
 * JSON-serializable primitive values.
 * Used for metadata and custom payloads that need to be flexible but type-safe.
 */
const JsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

/**
 * Recursive JSON value schema.
 * Allows nested objects/arrays while maintaining type safety.
 */
const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    JsonPrimitiveSchema,
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Strict metadata schema for message metadata.
 * Defines known fields explicitly while allowing extension.
 */
export const MessageMetadataSchema = z
  .object({
    // Common metadata fields
    senderName: z.string().optional(),
    senderAvatar: z.string().optional(),
    timestamp: z.number().optional(),
    isForwarded: z.boolean().optional(),
    forwardCount: z.number().optional(),
    isStarred: z.boolean().optional(),
    replyCount: z.number().optional(),
    viewOnce: z.boolean().optional(),
    expiresAt: z.number().optional(),
    // Link preview
    linkPreview: z
      .object({
        url: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        siteName: z.string().optional(),
      })
      .optional(),
    // Location sharing
    location: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
      })
      .optional(),
    // Contact sharing
    contact: z
      .object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    // Document/file metadata
    document: z
      .object({
        filename: z.string(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
      })
      .optional(),
    // Poll metadata
    poll: z
      .object({
        question: z.string(),
        options: z.array(
          z.object({
            text: z.string(),
            votes: z.number().optional(),
            voters: z.array(z.string()).optional(),
          }),
        ),
        totalVotes: z.number().optional(),
        isAnonymous: z.boolean().optional(),
        allowMultiple: z.boolean().optional(),
      })
      .optional(),
  })
  .passthrough(); // Allow additional fields for forward compatibility

/**
 * Custom event payload schema.
 * Defines structure for CUSTOM app events from AI.
 */
export const CustomEventPayloadSchema = z
  .object({
    // Navigation actions
    navigateTo: z.string().optional(),
    scrollTo: z
      .object({
        target: z.string(),
        position: z.enum(["top", "center", "bottom"]).optional(),
        animated: z.boolean().optional(),
      })
      .optional(),
    // UI state changes
    showModal: z
      .object({
        id: z.string(),
        type: z.string().optional(),
        data: z.record(z.string(), JsonValueSchema).optional(),
      })
      .optional(),
    hideModal: z.string().optional(),
    // Form interactions
    formInput: z
      .object({
        fieldId: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      })
      .optional(),
    formSubmit: z
      .object({
        formId: z.string(),
        data: z.record(z.string(), JsonValueSchema).optional(),
      })
      .optional(),
    // Generic state update
    setState: z.record(z.string(), JsonValueSchema).optional(),
    // Animation triggers
    animate: z
      .object({
        target: z.string(),
        animation: z.string(),
        duration: z.number().optional(),
      })
      .optional(),
  })
  .passthrough(); // Allow additional fields for app-specific payloads

/**
 * Per-app state schema.
 * Defines known app state structures while allowing extension.
 */
export const AppStateSchema = z.record(
  z.string(), // appId
  z
    .object({
      // Common app state fields
      currentScreen: z.string().optional(),
      isLoading: z.boolean().optional(),
      error: z.string().optional(),
      // Screen-specific data (flexible but typed)
      screenData: z.record(z.string(), JsonValueSchema).optional(),
      // Navigation state
      navigationStack: z.array(z.string()).optional(),
      // Modal/overlay state
      activeModal: z.string().optional(),
      // Form state
      forms: z
        .record(
          z.string(),
          z.object({
            values: z.record(z.string(), JsonValueSchema).optional(),
            errors: z.record(z.string(), z.string()).optional(),
            isSubmitting: z.boolean().optional(),
          }),
        )
        .optional(),
      // App-specific extensions
      custom: z.record(z.string(), JsonValueSchema).optional(),
    })
    .passthrough(), // Allow additional fields per app
);

// --- App Icon & Home Screen ---
export const AppIconSchema = z.object({
  appId: z.string(),
  label: z.string(),
  icon: z.string(),
  badge: z.number().optional(),
});

export const AppFolderSchema = z.object({
  type: z.literal("folder"),
  name: z.string(),
  apps: z.array(AppIconSchema),
});

export const HomeScreenPageSchema = z.object({
  apps: z.array(z.union([AppIconSchema, AppFolderSchema])),
});

export const HomeScreenConfigSchema = z.object({
  wallpaper: z.string().optional(),
  pages: z.array(HomeScreenPageSchema),
  dock: z.array(AppIconSchema),
});

// --- Device Events ---
export const DeviceEventSchema = z.discriminatedUnion("type", [
  // Lock/Unlock
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.enum(["LOCK", "UNLOCK"]),
  }),
  // Open/Close App
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.enum(["OPEN_APP", "CLOSE_APP"]),
    appId: z.string(),
  }),
  // Go Home
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.literal("GO_HOME"),
  }),
  // Set Badge
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.literal("SET_BADGE"),
    appId: z.string(),
    count: z.number(),
  }),
  // Show notification
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.literal("SHOW_NOTIFICATION"),
    appId: z.string(),
    title: z.string(),
    body: z.string(),
    mode: z.enum(["lockscreen", "headsup", "both"]).optional(),
    icon: z.string().optional(),
  }),
  // Dismiss notification
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.literal("DISMISS_NOTIFICATION"),
    notificationId: z.string(),
  }),
  // Incoming call
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.literal("INCOMING_CALL"),
    callerId: z.string(),
    callerName: z.string(),
    callerAvatar: z.string().optional(),
    isVideo: z.boolean().optional(),
  }),
  // Call answered
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.literal("CALL_ANSWERED"),
  }),
  // Call ended
  z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.literal("CALL_ENDED"),
  }),
]);

// --- App Events ---
export const AppEventSchema = z.discriminatedUnion("type", [
  // Message events
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("MESSAGE_RECEIVED"),
    conversationId: z.string(),
    from: z.string(),
    text: z.string().optional(),
    messageType: z
      .enum(["text", "system", "call", "call_missed", "screenshot_alert"])
      .optional(),
    metadata: MessageMetadataSchema.optional(),
  }),
  // Media Message events
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("IMAGE_MESSAGE_RECEIVED"),
    conversationId: z.string(),
    from: z.string(),
    imageUrl: z.string(),
    caption: z.string().optional(),
    text: z.string().optional(),
  }),
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("VIDEO_MESSAGE_RECEIVED"),
    conversationId: z.string(),
    from: z.string(),
    videoUrl: z.string(),
    thumbnailUrl: z.string().optional(),
    duration: z.number(),
    caption: z.string().optional(),
  }),
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("GIF_MESSAGE_RECEIVED"),
    conversationId: z.string(),
    from: z.string(),
    gifUrl: z.string(),
    caption: z.string().optional(),
  }),
  // Typing
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.enum(["TYPING_START", "TYPING_END"]),
    conversationId: z.string(),
    from: z.string(),
  }),
  // Voice message
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("VOICE_MESSAGE_RECEIVED"),
    conversationId: z.string(),
    from: z.string(),
    duration: z.number(),
  }),
  // Message interactions
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("MESSAGE_READ"),
    conversationId: z.string(),
    messageId: z.string(),
  }),
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("MESSAGE_DELETED"),
    conversationId: z.string(),
    messageId: z.string(),
  }),
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("MESSAGE_EDITED"),
    conversationId: z.string(),
    messageId: z.string(),
    newText: z.string(),
  }),
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("REACTION_ADDED"),
    conversationId: z.string(),
    messageId: z.string(),
    reaction: z.object({
      emoji: z.string(),
      count: z.number(),
      fromMe: z.boolean().optional(),
    }),
  }),
  // Group events
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("GROUP_MEMBER_ADDED"),
    conversationId: z.string(),
    memberId: z.string(),
    memberName: z.string(),
    addedBy: z.string(),
  }),
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("GROUP_MEMBER_REMOVED"),
    conversationId: z.string(),
    memberId: z.string(),
    memberName: z.string(),
    removedBy: z.string(),
  }),
  // Custom event
  z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.literal("CUSTOM"),
    name: z.string(),
    payload: CustomEventPayloadSchema.optional(),
  }),
]);

// --- Camera Events ---
export const CameraEventSchema = z.object({
  at: z.number(),
  kind: z.literal("CAMERA"),
  type: z.literal("SET_VIEW"),
  view: z.object({
    type: z.enum(["APP_VIEW", "TRANSITION"]),
    appId: z.string().optional(),
  }),
});

// --- Audio Events ---
export const AudioEventSchema = z.object({
  at: z.number(),
  kind: z.literal("AUDIO"),
  type: z.literal("PLAY_SOUND"),
  soundId: z.string(),
  volume: z.number().optional(),
});

// --- Combined Timeline Event ---
export const TimelineEventSchema = z.union([
  DeviceEventSchema,
  AppEventSchema,
  CameraEventSchema,
  AudioEventSchema,
]);

// --- Message Schema ---
export const MessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  text: z.string().optional(),
  type: z
    .enum([
      "text",
      "image",
      "video",
      "gif",
      "voice",
      "system",
      "deleted",
      "screenshot_alert",
      "call",
      "call_missed",
    ])
    .optional(),
  at: z.number().optional(),
  status: z.enum(["sending", "sent", "delivered", "read"]).optional(),

  // Media fields
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  gifUrl: z.string().optional(),
  caption: z.string().optional(),

  // Voice/Video specific
  duration: z.number().optional(),
  isPlaying: z.boolean().optional(),
  playProgress: z.number().optional(),
  callType: z.enum(["voice", "video"]).optional(),

  // Interactions
  reactions: z
    .array(
      z.object({
        emoji: z.string(),
        count: z.number(),
        fromMe: z.boolean().optional(),
      }),
    )
    .optional(),

  replyTo: z
    .object({
      messageId: z.string(),
      text: z.string(),
      from: z.string(),
      type: z.string().optional(),
    })
    .optional(),

  edited: z.boolean().optional(),

  // System message fields
  systemType: z
    .enum([
      "member_added",
      "member_removed",
      "admin_change",
      "group_created",
      "group_name_changed",
      "date_change",
      "encryption_notice",
    ])
    .optional(),
  targetMember: z.string().optional(),
  actorName: z.string().optional(),

  // Flexible metadata
  metadata: MessageMetadataSchema.optional(),
});

// --- Group Member Schema ---
export const GroupMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
});

// --- Conversation Schema ---
export const ConversationStateSchema = z.object({
  id: z.string(),
  type: z.enum(["dm", "group"]).optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  members: z.array(GroupMemberSchema).optional(),
  admins: z.array(z.string()).optional(),
  messages: z.array(MessageSchema),
  typing: z.record(z.boolean()).optional(),
});

// --- Notification Schema ---
export const NotificationSchema = z.object({
  id: z.string(),
  appId: z.string(),
  title: z.string(),
  body: z.string(),
  at: z.number(),
  dismissedAt: z.number().optional(),
  mode: z.enum(["lockscreen", "headsup", "both"]).optional(),
  icon: z.string().optional(),
});

// --- Call State Schema ---
export const CallStateSchema = z.object({
  status: z.enum(["incoming", "active", "ended"]),
  callerId: z.string(),
  callerName: z.string(),
  callerAvatar: z.string().optional(),
  isVideo: z.boolean().optional(),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
});

// --- Device State Schema ---
export const DeviceStateSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  isLocked: z.boolean(),
  foregroundAppId: z.string().optional(),
  notifications: z.array(NotificationSchema).optional(),
  call: CallStateSchema.optional(),
  homeScreen: HomeScreenConfigSchema.optional(),
});

// --- Camera View Schema ---
export const CameraViewSchema = z.object({
  type: z.enum(["APP_VIEW", "TRANSITION"]),
  appId: z.string().optional(),
});

// --- Episode Meta Schema ---
export const EpisodeMetaSchema = z
  .object({
    title: z.string().optional(),
    fps: z.number().optional(),
    durationInFrames: z.number().optional(),
  })
  .optional();

// --- Episode Schema V1 (Current) ---
export const EpisodeSchemaV1 = z.object({
  version: z.literal(1).default(1),
  meta: EpisodeMetaSchema,
  initialWorld: z.object({
    devices: z.record(DeviceStateSchema),
    conversations: z.record(ConversationStateSchema),
    appState: AppStateSchema.optional(),
    camera: CameraViewSchema,
  }),
  events: z.array(TimelineEventSchema),
});

export const EpisodeSchema = EpisodeSchemaV1;

// Type exports
export type EpisodeV1 = z.infer<typeof EpisodeSchemaV1>;
export type Episode = EpisodeV1;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type DeviceState = z.infer<typeof DeviceStateSchema>;
export type ConversationState = z.infer<typeof ConversationStateSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MessageMetadata = z.infer<typeof MessageMetadataSchema>;
export type CustomEventPayload = z.infer<typeof CustomEventPayloadSchema>;
export type AppState = z.infer<typeof AppStateSchema>;
