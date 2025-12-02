export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

export interface Notification {
    id: string;
    appId: string;
    title: string;
    body: string;
    at: number;
}

export interface DeviceState {
    id: string; // The instance ID (e.g., "alice_phone")
    profileId: string; // The hardware profile ID (e.g., "iphone16")
    isLocked: boolean;
    foregroundAppId?: string;
    notifications: Notification[];
}

export interface ConversationState {
    id: ConversationId;
    messages: any[]; // To be defined more specifically if needed
    typing?: Record<string, boolean>;
}

export interface CameraViewConfig {
    type: "APP_VIEW"; // For MVP
    appId?: AppId;
}

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    appState: Record<AppId, any>; // Generic state for apps (Feed, Profile, etc.)
    camera: CameraViewConfig;
}

// Event Union
export type TimelineEvent =
    | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP"; appId?: AppId }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SHOW_NOTIFICATION"; appId: string; title: string; body: string }
    // WhatsApp / Generic Chat
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    // Instagram DM
    | { at: number; kind: "APP"; appId: AppId; type: "DM_MESSAGE_RECEIVED" | "DM_MESSAGE_SENT"; conversationId: ConversationId; from: string; text?: string; media?: any }
    | { at: number; kind: "APP"; appId: AppId; type: "DM_TYPING_START" | "DM_TYPING_END"; conversationId: ConversationId; from: string }
    | { at: number; kind: "APP"; appId: AppId; type: "DM_REACT_MESSAGE"; conversationId: ConversationId; messageId: string; reaction: string }
    | { at: number; kind: "APP"; appId: AppId; type: "DM_SEND_IMAGE" | "DM_SEND_VIDEO"; conversationId: ConversationId; from: string; url: string }
    // Instagram Feed
    | { at: number; kind: "APP"; appId: AppId; type: "FEED_SCROLL_POSITION"; y: number }
    | { at: number; kind: "APP"; appId: AppId; type: "FEED_OPEN_POST" | "FEED_LIKE_POST" | "FEED_SAVE_POST" | "FEED_VIEW_VIDEO"; postId: string }
    // Instagram Stories
    | { at: number; kind: "APP"; appId: AppId; type: "STORY_OPEN" | "STORY_NEXT" | "STORY_PREVIOUS"; storyId?: string }
    | { at: number; kind: "APP"; appId: AppId; type: "STORY_REACTION_SENT"; storyId: string; reaction: string }
    // Instagram Profile
    | { at: number; kind: "APP"; appId: AppId; type: "PROFILE_OPEN" | "PROFILE_SCROLL"; username?: string; y?: number }
    | { at: number; kind: "APP"; appId: AppId; type: "PROFILE_OPEN_HIGHLIGHT" | "PROFILE_OPEN_POST"; id: string }
    // Instagram Post Viewer
    | { at: number; kind: "APP"; appId: AppId; type: "POST_OPEN" | "POST_SCROLL_COMMENTS" | "POST_LIKE" | "POST_SAVE" | "POST_SHARE"; postId: string }
    // Instagram Notifications
    | { at: number; kind: "APP"; appId: AppId; type: "INSTA_NOTIFICATION_RECEIVED"; notification: any }
    | { at: number; kind: "APP"; appId: AppId; type: "INSTA_NOTIFICATION_OPEN"; notificationId: string }
    // Instagram Reels
    | { at: number; kind: "APP"; appId: AppId; type: "REEL_OPEN" | "REEL_SCROLL_NEXT" | "REEL_SCROLL_PREVIOUS" | "REEL_LIKE" | "REEL_COMMENT"; reelId?: string }
    // Camera
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig };
