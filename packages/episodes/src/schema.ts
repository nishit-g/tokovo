import { z } from "zod";

// --- Device Events ---
export const DeviceEventSchema = z.discriminatedUnion("type", [
    // Lock/Unlock/App events
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.enum(["LOCK", "UNLOCK", "OPEN_APP", "CLOSE_APP"]),
        appId: z.string().optional()
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
        icon: z.string().optional()
    }),
    // Dismiss notification
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("DISMISS_NOTIFICATION"),
        notificationId: z.string()
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
        isVideo: z.boolean().optional()
    }),
    // Call answered
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("CALL_ANSWERED")
    }),
    // Call ended
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("CALL_ENDED")
    })
]);

// --- App Events ---
export const AppEventSchema = z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.enum(["MESSAGE_RECEIVED", "TYPING_START", "TYPING_END"]),
    conversationId: z.string(),
    from: z.string(),
    text: z.string().optional()
});

// --- Camera Events ---
export const CameraEventSchema = z.object({
    at: z.number(),
    kind: z.literal("CAMERA"),
    type: z.literal("SET_VIEW"),
    view: z.object({
        type: z.enum(["APP_VIEW", "TRANSITION"]),
        appId: z.string().optional()
    })
});

// --- Audio Events ---
export const AudioEventSchema = z.object({
    at: z.number(),
    kind: z.literal("AUDIO"),
    type: z.literal("PLAY_SOUND"),
    soundId: z.string(),
    volume: z.number().optional()
});

// --- Combined Timeline Event ---
export const TimelineEventSchema = z.union([
    DeviceEventSchema,
    AppEventSchema,
    CameraEventSchema,
    AudioEventSchema
]);

// --- Notification Schema ---
export const NotificationSchema = z.object({
    id: z.string(),
    appId: z.string(),
    title: z.string(),
    body: z.string(),
    at: z.number(),
    dismissedAt: z.number().optional(),
    mode: z.enum(["lockscreen", "headsup", "both"]).optional(),
    icon: z.string().optional()
});

// --- Call State Schema ---
export const CallStateSchema = z.object({
    status: z.enum(["incoming", "active", "ended"]),
    callerId: z.string(),
    callerName: z.string(),
    callerAvatar: z.string().optional(),
    isVideo: z.boolean().optional(),
    startedAt: z.number().optional(),
    endedAt: z.number().optional()
});

// --- Device State Schema ---
export const DeviceStateSchema = z.object({
    id: z.string(),
    profileId: z.string(),
    isLocked: z.boolean(),
    foregroundAppId: z.string().optional(),
    notifications: z.array(NotificationSchema).optional(),
    call: CallStateSchema.optional()
});

// --- World State Schemas ---
export const ConversationStateSchema = z.object({
    id: z.string(),
    messages: z.array(z.object({
        id: z.string(),
        from: z.string(),
        text: z.string().optional(),
        at: z.number(),
    })),
    typing: z.record(z.boolean()).optional(),
});

export const CameraViewSchema = z.object({
    type: z.enum(["APP_VIEW", "TRANSITION"]),
    appId: z.string().optional(),
});

// --- Episode Schema ---
export const EpisodeSchema = z.object({
    initialWorld: z.object({
        devices: z.record(DeviceStateSchema),
        conversations: z.record(ConversationStateSchema),
        appState: z.record(z.any()).optional(),
        camera: CameraViewSchema,
    }),
    events: z.array(TimelineEventSchema),
});
