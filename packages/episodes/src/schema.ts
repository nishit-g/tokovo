import { z } from "zod";

// --- App Icon & Home Screen ---
export const AppIconSchema = z.object({
    appId: z.string(),
    label: z.string(),
    icon: z.string(),
    badge: z.number().optional()
});

export const AppFolderSchema = z.object({
    type: z.literal("folder"),
    name: z.string(),
    apps: z.array(AppIconSchema)
});

export const HomeScreenPageSchema = z.object({
    apps: z.array(z.union([AppIconSchema, AppFolderSchema]))
});

export const HomeScreenConfigSchema = z.object({
    wallpaper: z.string().optional(),
    pages: z.array(HomeScreenPageSchema),
    dock: z.array(AppIconSchema)
});

// --- Device Events ---
export const DeviceEventSchema = z.discriminatedUnion("type", [
    // Lock/Unlock
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.enum(["LOCK", "UNLOCK"])
    }),
    // Open/Close App
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.enum(["OPEN_APP", "CLOSE_APP"]),
        appId: z.string()
    }),
    // Go Home
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("GO_HOME")
    }),
    // Set Badge
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("SET_BADGE"),
        appId: z.string(),
        count: z.number()
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
export const AppEventSchema = z.discriminatedUnion("type", [
    // Message events
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("MESSAGE_RECEIVED"),
        conversationId: z.string(),
        from: z.string(),
        text: z.string().optional()
    }),
    // Typing
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.enum(["TYPING_START", "TYPING_END"]),
        conversationId: z.string(),
        from: z.string()
    }),
    // Voice message
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("VOICE_MESSAGE_RECEIVED"),
        conversationId: z.string(),
        from: z.string(),
        duration: z.number()
    }),
    // Message read
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("MESSAGE_READ"),
        conversationId: z.string(),
        messageId: z.string()
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
        addedBy: z.string()
    }),
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("GROUP_MEMBER_REMOVED"),
        conversationId: z.string(),
        memberId: z.string(),
        memberName: z.string(),
        removedBy: z.string()
    }),
    // Custom event
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("CUSTOM"),
        name: z.string(),
        payload: z.any().optional()
    })
]);

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

// --- Message Schema ---
export const MessageSchema = z.object({
    id: z.string(),
    from: z.string(),
    text: z.string().optional(),
    type: z.enum(["text", "image", "voice", "system"]).optional(),
    at: z.number().optional(),
    status: z.enum(["sending", "sent", "delivered", "read"]).optional(),
    // System message fields
    systemType: z.enum(["member_added", "member_removed", "admin_change", "group_created"]).optional(),
    targetMember: z.string().optional(),
    actorName: z.string().optional(),
    // Voice message fields
    duration: z.number().optional(),
    isPlaying: z.boolean().optional(),
    playProgress: z.number().optional()
});

// --- Group Member Schema ---
export const GroupMemberSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    phone: z.string().optional()
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
    typing: z.record(z.boolean()).optional()
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
    call: CallStateSchema.optional(),
    homeScreen: HomeScreenConfigSchema.optional()
});

// --- Camera View Schema ---
export const CameraViewSchema = z.object({
    type: z.enum(["APP_VIEW", "TRANSITION"]),
    appId: z.string().optional()
});

// --- Episode Meta Schema ---
export const EpisodeMetaSchema = z.object({
    title: z.string().optional(),
    fps: z.number().optional(),
    durationInFrames: z.number().optional()
}).optional();

// --- Episode Schema ---
export const EpisodeSchema = z.object({
    meta: EpisodeMetaSchema,
    initialWorld: z.object({
        devices: z.record(DeviceStateSchema),
        conversations: z.record(ConversationStateSchema),
        appState: z.record(z.any()).optional(),
        camera: CameraViewSchema
    }),
    events: z.array(TimelineEventSchema)
});

// Type exports
export type Episode = z.infer<typeof EpisodeSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type DeviceState = z.infer<typeof DeviceStateSchema>;
export type ConversationState = z.infer<typeof ConversationStateSchema>;
export type Message = z.infer<typeof MessageSchema>;
