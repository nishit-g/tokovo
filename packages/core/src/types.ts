export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

export interface DeviceState {
    id: DeviceId; // The instance ID (e.g., "alice_phone")
    profileId: string; // The hardware profile ID (e.g., "iphone16")
    isLocked: boolean;
    foregroundAppId?: AppId;
}

export interface ConversationState {
    id: ConversationId;
    messages: any[]; // To be defined more specifically if needed
}

export interface CameraViewConfig {
    type: "APP_VIEW"; // For MVP
    appId?: AppId;
}

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    camera: CameraViewConfig;
}

// Event Union
export type TimelineEvent =
    | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP"; appId?: AppId }
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig };
