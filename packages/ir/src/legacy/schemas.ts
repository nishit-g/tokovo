import { z } from "zod";
import { Trace } from "../trace";

// =============================================================================
// TRACE SCHEMA
// =============================================================================

export const TraceSchema = z.object({
  source: z
    .object({
      file: z.string(),
      line: z.number(),
      column: z.number().optional(),
    })
    .optional(),
  episodeId: z.string().optional(),
  deviceId: z.string().optional(),
  beat: z.number().optional(),
  trackId: z.string().optional(),
  sceneOpIndex: z.number().optional(),
});

// =============================================================================
// SHARED OP BASE
// =============================================================================

const TimelineOpBaseSchema = z.object({
  at: z.number(),
  trace: TraceSchema,
});

// =============================================================================
// DEVICE & APP OPS
// =============================================================================

export const DeviceUnlockedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("DeviceUnlocked"),
  deviceId: z.string(),
});

export const AppOpenedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("AppOpened"),
  deviceId: z.string(),
  appId: z.string(),
});

export const ConversationOpenedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("ConversationOpened"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
});

export const ScreenNavigatedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("ScreenNavigated"),
  deviceId: z.string(),
  appId: z.string(),
  screen: z.string(),
  conversationId: z.string().optional(),
  transition: z.enum(["push", "pop", "present", "dismiss"]).optional(),
});

// =============================================================================
// TYPING OPS
// =============================================================================

export const TypingStartedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("TypingStarted"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
  actor: z.string(),
});

export const TypingEndedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("TypingEnded"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
  actor: z.string(),
});

// =============================================================================
// MESSAGE OPS
// =============================================================================

const MessagePayloadSchema = z.object({
  id: z.string(),
  text: z.string().optional(),
  from: z.string(),
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
      "call_missed",
    ])
    .optional(),
  timestamp: z.string().optional(),
  // Media
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  gifUrl: z.string().optional(),
  caption: z.string().optional(),
  duration: z.number().optional(),
  height: z.number().optional(),
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
});

export const MessageReceivedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("MessageReceived"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
  message: MessagePayloadSchema,
});

export const MessageSentOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("MessageSent"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
  message: MessagePayloadSchema,
});

export const MessageReadOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("MessageRead"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
  messageId: z.string(),
});

export const MessageDeletedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("MessageDeleted"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
  messageId: z.string(),
});

export const ReactionAddedOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("ReactionAdded"),
  deviceId: z.string(),
  appId: z.string(),
  conversationId: z.string(),
  messageId: z.string(),
  reaction: z.object({
    emoji: z.string(),
    count: z.number(),
    fromMe: z.boolean().optional(),
  }),
});

// =============================================================================
// CAMERA OPS
// =============================================================================

const EasingSchema = z.enum([
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "cinematic",
]);

export const TimelineCameraZoomOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("CameraZoom"),
  scale: z.number(),
  duration: z.number(),
  originX: z.number().optional(),
  originY: z.number().optional(),
  easing: EasingSchema.optional(),
});

export const TimelineCameraShakeOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("CameraShake"),
  deviceId: z.string(),
  intensity: z.number().optional(),
  frequency: z.number().optional(),
  decay: z.number().optional(),
  duration: z.number(),
});

export const TimelinePOVSwitchOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("POVSwitch"),
  deviceId: z.string(),
  transition: z.enum(["cut", "crossfade", "wipe"]).optional(),
});

export const TimelineSplitPOVOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("SplitPOV"),
  devices: z.array(z.string()),
  layout: z.enum(["horizontal", "vertical", "pip", "split-diagonal"]),
});

export const TimelineAnchorFocusOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("AnchorFocus"),
  anchor: z.string(),
  preset: z.string().optional(),
  shake: z.number().optional(),
  align: z.object({ x: z.number(), y: z.number() }).optional(),
  duration: z.number(),
  easing: EasingSchema.optional(),
});

export const TimelineAnchorTrackOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("AnchorTrack"),
  anchor: z.string(),
  duration: z.number(),
  smoothing: z.number().optional(),
  preset: z.string().optional(),
  align: z.object({ x: z.number(), y: z.number() }).optional(),
  easing: EasingSchema.optional(),
});

// =============================================================================
// KEYBOARD OPS
// =============================================================================

export const KeyboardTypeOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("KeyboardType"),
  text: z.string(),
});

export const KeyboardInputOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("KeyboardInput"),
  type: z.enum(["keyDown", "keyUp"]),
  key: z.string(),
});

export const CustomOpSchema = TimelineOpBaseSchema.extend({
  kind: z.literal("Custom"),
  deviceId: z.string().optional(),
  appId: z.string().optional(),
  eventType: z.string(),
  payload: z.record(z.string(), z.any()).optional(),
});

// =============================================================================
// MASTER SCHEMA
// =============================================================================

export const TimelineOpSchema = z.discriminatedUnion("kind", [
  DeviceUnlockedOpSchema,
  AppOpenedOpSchema,
  ConversationOpenedOpSchema,
  TypingStartedOpSchema,
  TypingEndedOpSchema,
  MessageReceivedOpSchema,
  MessageSentOpSchema,
  MessageReadOpSchema,
  MessageDeletedOpSchema,
  ReactionAddedOpSchema,
  ScreenNavigatedOpSchema,
  TimelineCameraZoomOpSchema,
  TimelineCameraShakeOpSchema,
  TimelinePOVSwitchOpSchema,
  TimelineSplitPOVOpSchema,
  TimelineAnchorFocusOpSchema,
  TimelineAnchorTrackOpSchema,
  KeyboardTypeOpSchema,
  KeyboardInputOpSchema,
  CustomOpSchema,
]);

export function validateTimelineOp(op: unknown) {
  return TimelineOpSchema.parse(op);
}

// =============================================================================
// SCENE IR SCHEMAS
// =============================================================================

export const DurationExprSchema = z.union([
  z.string().regex(/^[\d.]+(s|ms|frames)$/),
  z.string(),
  z.number(),
]);

// Helper for Recursive Types (ConcurrentOp)
const BaseSceneOpSchema = z.union([
  z.object({ kind: z.literal("Wait"), duration: DurationExprSchema }),
  z.object({
    kind: z.literal("TypingStart"),
    actor: z.string(),
    conversationId: z.string(),
  }),
  z.object({
    kind: z.literal("TypingEnd"),
    actor: z.string(),
    conversationId: z.string(),
  }),
  z.object({
    kind: z.literal("SendMessage"),
    actor: z.string(),
    text: z.string(),
    conversationId: z.string(),
    meta: MessagePayloadSchema.optional(),
  }),
  z.object({
    kind: z.literal("ReceiveMessage"),
    actor: z.string(),
    text: z.string(),
    conversationId: z.string(),
    meta: MessagePayloadSchema.optional(),
  }),
  z.object({ kind: z.literal("ReadMessage"), ref: z.any() }), // Todo: RefSchema
  z.object({ kind: z.literal("DeleteMessage"), ref: z.any() }),
  z.object({
    kind: z.literal("EditMessage"),
    ref: z.any(),
    newText: z.string(),
  }),
  z.object({
    kind: z.literal("ForwardMessage"),
    ref: z.any(),
    toConversationId: z.string(),
    forwardedFrom: z.string().optional(),
  }),

  // Media ops
  z.object({
    kind: z.literal("SendImage"),
    imageUrl: z.string(),
    conversationId: z.string(),
    caption: z.string().optional(),
    height: z.number().optional(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("ReceiveImage"),
    actor: z.string(),
    imageUrl: z.string(),
    conversationId: z.string(),
    caption: z.string().optional(),
    height: z.number().optional(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("SendVideo"),
    videoUrl: z.string(),
    conversationId: z.string(),
    duration: z.number(),
    caption: z.string().optional(),
    height: z.number().optional(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("ReceiveVideo"),
    actor: z.string(),
    videoUrl: z.string(),
    conversationId: z.string(),
    duration: z.number(),
    caption: z.string().optional(),
    height: z.number().optional(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("SendGif"),
    gifUrl: z.string(),
    conversationId: z.string(),
    height: z.number().optional(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("ReceiveGif"),
    actor: z.string(),
    gifUrl: z.string(),
    conversationId: z.string(),
    height: z.number().optional(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("SendVoice"),
    conversationId: z.string(),
    duration: z.number(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("ReceiveVoice"),
    actor: z.string(),
    conversationId: z.string(),
    duration: z.number(),
    skipAutoTiming: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("PlayVoice"),
    ref: z.any().optional(),
    startAt: z.number().optional(),
  }),
  z.object({
    kind: z.literal("PauseVoice"),
    ref: z.any().optional(),
  }),

  // Camera/POV
  z.object({
    kind: z.literal("POVSwitch"),
    deviceId: z.string(),
    transition: z.enum(["cut", "crossfade", "wipe"]).optional(),
  }),
  z.object({
    kind: z.literal("SplitPOV"),
    devices: z.array(z.string()),
    layout: z.any(),
  }),
  z.object({
    kind: z.literal("CameraZoom"),
    scale: z.number(),
    duration: DurationExprSchema.optional(),
    originX: z.number().optional(),
    originY: z.number().optional(),
    easing: EasingSchema.optional(),
  }),
  z.object({
    kind: z.literal("CameraShake"),
    deviceId: z.string(),
    intensity: z.number().optional(),
    frequency: z.number().optional(),
    decay: z.number().optional(),
    duration: DurationExprSchema.optional(),
  }),
  z.object({
    kind: z.literal("AnchorFocus"),
    anchor: z.string(),
    preset: z.string().optional(),
    shake: z.number().optional(),
    duration: DurationExprSchema.optional(),
    easing: EasingSchema.optional(),
  }),
  z.object({
    kind: z.literal("AnchorTrack"),
    anchor: z.string(),
    duration: DurationExprSchema.optional(),
    smoothing: z.number().optional(),
    easing: EasingSchema.optional(),
  }),

  // Navigation
  z.object({
    kind: z.literal("NavigateScreen"),
    screen: z.enum(["chats-list", "chat", "settings", "status", "calls"]),
  }),
  z.object({ kind: z.literal("OpenChat"), conversationId: z.string() }),
  z.object({ kind: z.literal("GoBack") }),

  // Reserved
  z.object({
    kind: z.literal("AddReaction"),
    ref: z.any(),
    actor: z.string(),
    emoji: z.string(),
  }),
  z.object({
    kind: z.literal("VoiceNoteSent"),
    actor: z.string(),
    conversationId: z.string(),
    durationMs: z.number(),
  }),
  z.object({
    kind: z.literal("VoiceNoteReceived"),
    actor: z.string(),
    conversationId: z.string(),
    durationMs: z.number(),
  }),
  z.object({
    kind: z.literal("MissedCall"),
    actor: z.string(),
    conversationId: z.string(),
  }),
  z.object({
    kind: z.literal("OnlineStatusChanged"),
    actor: z.string(),
    status: z.enum(["online", "offline", "typing", "last_seen"]),
  }),
  z.object({ kind: z.literal("ScreenshotTaken"), conversationId: z.string() }),
  z.object({ kind: z.literal("BlockedUser"), actor: z.string() }),

  // Keyboard
  z.object({ kind: z.literal("ShowKeyboard"), deviceId: z.string() }),
  z.object({ kind: z.literal("HideKeyboard"), deviceId: z.string() }),
  z.object({
    kind: z.literal("SimulateTyping"),
    deviceId: z.string(),
    text: z.string(),
  }),
  z.object({ kind: z.literal("ClearKeyboardText"), deviceId: z.string() }),

  // Conversation operations
  z.object({ kind: z.literal("PinConversation"), conversationId: z.string() }),
  z.object({
    kind: z.literal("UnpinConversation"),
    conversationId: z.string(),
  }),
  z.object({
    kind: z.literal("MuteConversation"),
    conversationId: z.string(),
    until: z.number().optional(),
  }),
  z.object({
    kind: z.literal("UnmuteConversation"),
    conversationId: z.string(),
  }),
  z.object({
    kind: z.literal("ArchiveConversation"),
    conversationId: z.string(),
  }),
  z.object({
    kind: z.literal("UnarchiveConversation"),
    conversationId: z.string(),
  }),
]);

// Recursive Schema for Concurrent Op
export const SceneOpSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    BaseSceneOpSchema,
    z.object({
      kind: z.literal("Concurrent"),
      tracks: z.array(z.array(SceneOpSchema)),
    }),
  ]),
);

export const BeatSchema = z.object({
  name: z.string(),
  ops: z.array(SceneOpSchema),
  meta: z
    .object({
      isImprov: z.boolean().optional(),
      rhythm: z.enum(["fast", "normal", "slow"]).optional(),
      intensity: z.number().optional(),
    })
    .optional(),
});

export const DeviceSceneSchema = z.object({
  deviceId: z.string(),
  profileId: z.string(),
  appId: z.string(),
  conversations: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      avatar: z.string().optional(),
      type: z.enum(["dm", "group"]).optional(),
    }),
  ),
  beats: z.array(BeatSchema),
});

export const SceneIRSchema = z.object({
  episodeId: z.string(),
  meta: z.object({
    fps: z.number(),
    durationInFrames: z.number().optional(),
  }),
  devices: z.array(DeviceSceneSchema),
  cameraTrack: z
    .array(
      z.object({
        at: DurationExprSchema,
        op: SceneOpSchema,
      }),
    )
    .optional(),
  scenes: z
    .array(
      z.object({
        name: z.string(),
        deviceBeats: z.record(z.string(), z.array(BeatSchema)),
      }),
    )
    .optional(),
});

// =============================================================================
// NOTIFICATION SCHEMAS
// =============================================================================

export const NotificationActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  destructive: z.boolean().optional(),
});

export const NotificationIRSchema = z.object({
  id: z.string(),
  appId: z.string(),
  channelId: z.string().optional(),
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  preview: z
    .object({
      kind: z.enum(["text", "image", "video"]),
      value: z.string(),
      aspectRatio: z.number().optional(),
    })
    .optional(),
  payload: z.any().optional(),
  category: z.enum(["message", "call", "system", "reminder"]).optional(),
  threadKey: z.string().optional(),
  groupKey: z.string().optional(),
  peopleIds: z.array(z.string()).optional(),
  actions: z.array(NotificationActionSchema).optional(),
  replyable: z.boolean().optional(),
});

// =============================================================================
// HELPER FOR GENERIC VALIDATION
// =============================================================================

export function validateNotificationIR(data: unknown) {
  return NotificationIRSchema.parse(data);
}
