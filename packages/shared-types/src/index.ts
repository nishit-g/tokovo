export type Message = {
    id: string;
    sender: string;
    atSecond: number;
    text: string;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'audio';
};

export type Conversation = {
    chatTitle: string;
    avatarAssetId: string;
    wallpaperAssetId?: string;
    messages: Message[];
};

export type TypingIndicator = {
    sender: string;
    fromSecond: number;
    toSecond: number;
};

export type WhatsAppData = {
    conversation: Conversation;
    typingIndicators: TypingIndicator[];
};

export type AppType = 'whatsapp' | 'lockscreen' | 'homescreen';

export type App = {
    id: string;
    type: AppType;
    data: WhatsAppData | Record<string, never>; // Allow empty data for system apps
};

export type Device = {
    id: string;
    os: 'ios' | 'android';
    model: string;
    time: string;
    carrier: string;
    batteryPercent: number;
    theme: 'light' | 'dark';
    apps: App[];
    activeAppId: string;
};

export type DeviceConfig = {
    wallpaper: string;
    theme: 'light' | 'dark';
    installedApps: AppType[];
};

export type Character = {
    id: string;
    name: string;
    avatar: string;
    deviceConfig: DeviceConfig;
    deviceState: Device; // Runtime state (battery, time, etc.)
};

export type AppChangeEvent = {
    type: 'app_change';
    atSecond: number;
    appId: string;
};

export type NotificationEvent = {
    type: 'notification';
    atSecond: number;
    title: string;
    message: string;
    appId: string; // e.g., 'whatsapp' to show icon
    durationSeconds?: number;
};

export type TouchEvent = {
    type: 'touch';
    atSecond: number;
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
    action: 'tap' | 'swipe_up' | 'swipe_down' | 'swipe_left' | 'swipe_right';
};

export type TimelineEvent = AppChangeEvent | NotificationEvent | TouchEvent;

export type Scene = {
    id: string;
    characterId: string; // Whose phone are we looking at?
    durationSeconds: number;
    events: TimelineEvent[];
};

export type MasterEpisode = {
    id: string;
    title: string;
    characters: Character[];
    scenes: Scene[];
    // Global state for shared data (like chat history)
    globalState: {
        conversations: Record<string, Conversation>; // keyed by conversationId
    };
};

// Legacy Episode type (can be deprecated or kept for single-scene compatibility)
export type Episode = {
    episodeId: string;
    fps: number;
    durationSeconds: number;
    characters: Character[];
    events: TimelineEvent[];
};
