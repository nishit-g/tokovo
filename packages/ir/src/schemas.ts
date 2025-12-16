import { z } from "zod";
import { Trace } from "./trace";

// =============================================================================
// TRACE SCHEMA
// =============================================================================

export const TraceSchema = z.object({
    source: z.object({
        file: z.string(),
        line: z.number(),
        column: z.number().optional(),
    }).optional(),
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
    type: z.enum(["text", "image", "video", "gif", "voice", "system", "deleted", "screenshot_alert", "call_missed"]).optional(),
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
    reactions: z.array(z.object({
        emoji: z.string(),
        count: z.number(),
        fromMe: z.boolean().optional(),
    })).optional(),
    replyTo: z.object({
        messageId: z.string(),
        text: z.string(),
        from: z.string(),
        type: z.string().optional(),
    }).optional(),
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

const EasingSchema = z.enum(["linear", "ease-in", "ease-out", "ease-in-out", "cinematic"]);

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
    payload: z.record(z.any()).optional(),
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
