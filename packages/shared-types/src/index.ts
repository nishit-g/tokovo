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
    isGroup?: boolean;
    participants?: string[]; // List of Character IDs
    groupName?: string;
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

export type AppType = 'whatsapp' | 'whatsapp_list' | 'lockscreen' | 'homescreen';

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
    batteryState: 'charging' | 'draining' | 'low_power';
    network: 'wifi' | '5g' | 'lte' | 'none';
    theme: 'light' | 'dark';
    apps: App[];
    activeAppId: string;
    activeScreen?: string; // For intra-app navigation
};

export type DeviceConfig = {
    model: string;
    color: string;
    wallpaper: string;
    theme: 'light' | 'dark';
    font: 'san_francisco' | 'roboto' | 'mono';
    network: 'wifi' | '5g' | 'lte' | 'none';
    batteryState: 'charging' | 'draining' | 'low_power';
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
    id: string;
    type: 'app_change';
    atSecond: number;
    appId: string;
};

export type ScreenChangeEvent = {
    id: string;
    type: 'screen_change';
    atSecond: number;
    screenId: string; // e.g., 'chat_list', 'chat_details', 'settings'
    appId: string;
};

export type NotificationEvent = {
    id: string;
    type: 'notification';
    atSecond: number;
    title: string;
    message: string;
    appId: string; // e.g., 'whatsapp' to show icon
    durationSeconds?: number;
};

export type TouchEvent = {
    id: string;
    type: 'touch';
    atSecond: number;
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
    action: 'tap' | 'swipe_up' | 'swipe_down' | 'swipe_left' | 'swipe_right' | 'long_press';
};

export type TimelineEvent = AppChangeEvent | ScreenChangeEvent | NotificationEvent | TouchEvent;

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
