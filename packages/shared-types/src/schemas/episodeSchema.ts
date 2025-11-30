import { z } from 'zod';

export const MessageSchema = z.object({
    id: z.string(),
    sender: z.string(),
    atSecond: z.number(),
    text: z.string(),
    status: z.enum(['sent', 'delivered', 'read']),
    type: z.enum(['text', 'image', 'audio']),
});

export const ConversationSchema = z.object({
    chatTitle: z.string(),
    avatarAssetId: z.string(),
    wallpaperAssetId: z.string().optional(),
    isGroup: z.boolean().optional(),
    participants: z.array(z.string()).optional(),
    groupName: z.string().optional(),
    messages: z.array(MessageSchema),
});

export const TypingIndicatorSchema = z.object({
    sender: z.string(),
    fromSecond: z.number(),
    toSecond: z.number(),
});

export const WhatsAppDataSchema = z.object({
    conversation: ConversationSchema,
    typingIndicators: z.array(TypingIndicatorSchema),
});

export const AppTypeSchema = z.enum(['whatsapp', 'whatsapp_list', 'lockscreen', 'homescreen']);

export const AppSchema = z.object({
    id: z.string(),
    type: AppTypeSchema,
    data: z.union([WhatsAppDataSchema, z.record(z.never())]),
});

export const DeviceConfigSchema = z.object({
    model: z.string(),
    color: z.string(),
    wallpaper: z.string(),
    theme: z.enum(['light', 'dark']),
    font: z.enum(['san_francisco', 'roboto', 'mono']),
    network: z.enum(['wifi', '5g', 'lte', 'none']),
    batteryState: z.enum(['charging', 'draining', 'low_power']),
    installedApps: z.array(AppTypeSchema),
});

export const CharacterSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
    deviceConfig: DeviceConfigSchema,
    // deviceState is runtime, so we might not validate it in the static JSON import
});

export const AppChangeEventSchema = z.object({
    id: z.string(),
    type: z.literal('app_change'),
    atSecond: z.number(),
    appId: z.string(),
});

export const ScreenChangeEventSchema = z.object({
    id: z.string(),
    type: z.literal('screen_change'),
    atSecond: z.number(),
    screenId: z.string(),
    appId: z.string(),
});

export const NotificationEventSchema = z.object({
    id: z.string(),
    type: z.literal('notification'),
    atSecond: z.number(),
    title: z.string(),
    message: z.string(),
    appId: z.string(),
    durationSeconds: z.number().optional(),
});

export const TouchEventSchema = z.object({
    id: z.string(),
    type: z.literal('touch'),
    atSecond: z.number(),
    x: z.number(),
    y: z.number(),
    action: z.enum(['tap', 'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right', 'long_press']),
});

export const TimelineEventSchema = z.discriminatedUnion('type', [
    AppChangeEventSchema,
    ScreenChangeEventSchema,
    NotificationEventSchema,
    TouchEventSchema,
]);

export const SceneSchema = z.object({
    id: z.string(),
    characterId: z.string(),
    durationSeconds: z.number(),
    events: z.array(TimelineEventSchema),
});

export const MasterEpisodeSchema = z.object({
    id: z.string(),
    title: z.string(),
    characters: z.array(CharacterSchema),
    scenes: z.array(SceneSchema),
    globalState: z.object({
        conversations: z.record(ConversationSchema),
    }),
});
