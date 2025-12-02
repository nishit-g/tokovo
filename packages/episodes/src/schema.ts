import { z } from "zod";

export const DeviceEventSchema = z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.enum(["LOCK", "UNLOCK", "OPEN_APP", "CLOSE_APP"]),
    appId: z.string().optional()
});

export const AppEventSchema = z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.enum(["MESSAGE_RECEIVED", "TYPING_START", "TYPING_END"]),
    conversationId: z.string(),
    from: z.string(),
    text: z.string().optional()
});

export const CameraEventSchema = z.object({
    at: z.number(),
    kind: z.literal("CAMERA"),
    type: z.literal("SET_VIEW"),
    view: z.object({
        type: z.literal("APP_VIEW"),
        appId: z.string().optional()
    })
});

export const TimelineEventSchema = z.discriminatedUnion("kind", [
    DeviceEventSchema,
    AppEventSchema,
    CameraEventSchema
]);

// --- World State Schemas ---

export const DeviceStateSchema = z.object({
    id: z.string(),
    profileId: z.string(),
    isLocked: z.boolean(),
    foregroundAppId: z.string().optional(),
});

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
    type: z.literal("APP_VIEW"),
    appId: z.string().optional(),
});

export const EpisodeSchema = z.object({
    initialWorld: z.object({
        devices: z.record(DeviceStateSchema),
        conversations: z.record(ConversationStateSchema),
        camera: CameraViewSchema,
    }),
    events: z.array(TimelineEventSchema),
});
