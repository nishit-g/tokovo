/**
 * Device Types - Device state, OS, keyboard, call
 * 
 * @description All device-level types including OS state, call, keyboard.
 */

import type {
    NotificationInstance,
    NotificationCenterState,
    DynamicIslandState,
    StatusBarIcon,
    NotificationQueueState
} from "./notification";

// =============================================================================
// EXTENSIBLE REGISTRIES
// =============================================================================

/**
 * Plugins can use Module Augmentation to add their own types here.
 */
export interface AppScreens {
    [key: string]: string;
}

export interface AppCallTypes {
    [key: string]: string;
}

// =============================================================================
// BASE APP STATE
// =============================================================================

export interface BaseAppState {
    viewMode?: import("./layout").ViewKind;
    conversationId?: string;
    activeStoryId?: string;
}

// =============================================================================
// BACKGROUND APP STATE
// =============================================================================

export interface BackgroundAppState {
    appId: string;
    startedAt: number;
    indicator?: "music" | "call" | "recording" | "location";
    label?: string;
}

// =============================================================================
// CALL STATE
// =============================================================================

export type CallDisplayMode = "overlay" | "fullscreen" | (string & {});
export type CallType = "voice" | "video" | "facetime" | "whatsapp" | (string & {});

export interface CallerMetadata {
    posterImage?: string;
    posterColor?: string;
    posterStyle?: "modern" | "classic" | (string & {});
    posterNameFont?: string;
}

export interface CallState {
    status: "incoming" | "ringing" | "connecting" | "active" | "ended" | "declined";
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
    callType: CallType;
    displayMode: CallDisplayMode;
    callerMetadata?: CallerMetadata;
    isMuted?: boolean;
    isSpeakerOn?: boolean;
    isOnHold?: boolean;
    startedAt?: number;
    answeredAt?: number;
    endedAt?: number;
}

// =============================================================================
// KEYBOARD STATE
// =============================================================================

export type KeyboardLayout = "qwerty" | "numbers" | "symbols" | "emoji";

export interface KeyboardState {
    visible: boolean;
    layout: KeyboardLayout;
    currentKey: string | null;
    keyPressedAt: number | null;
    visibilityChangedAt: number;
    inputText: string;
    cursorPosition: number;
    cursorVisible: boolean;
}

export const DEFAULT_KEYBOARD_STATE: KeyboardState = {
    visible: false,
    layout: "qwerty",
    currentKey: null,
    keyPressedAt: null,
    visibilityChangedAt: 0,
    inputText: "",
    cursorPosition: 0,
    cursorVisible: true,
};

// =============================================================================
// DEVICE OS STATE
// =============================================================================

export type NetworkType = "wifi" | "5G" | "4G" | "LTE" | "3G" | "E" | "no-service";

export interface DeviceOSState {
    clock: number;
    battery: number;
    charging: boolean;
    network: NetworkType;
    wifiStrength: number;
    cellStrength: number;
    dnd: boolean;
    lowPowerMode: boolean;
    airplaneMode: boolean;
    notifications: NotificationInstance[];
    notificationHistory: NotificationInstance[];
}

export const DEFAULT_OS_STATE: DeviceOSState = {
    clock: Date.now(),
    battery: 85,
    charging: false,
    network: "wifi",
    wifiStrength: 3,
    cellStrength: 4,
    dnd: false,
    lowPowerMode: false,
    airplaneMode: false,
    notifications: [],
    notificationHistory: [],
};

// =============================================================================
// DEVICE THEME
// =============================================================================

export interface DeviceTheme {
    platform?: "ios" | "android";
    frameColor?: string;
    wallpaper?: string;
    statusBarStyle?: "light" | "dark";
    accentColor?: string;
}

// =============================================================================
// HOME SCREEN
// =============================================================================

export interface HomeScreenConfig {
    wallpaper?: string;
    pages: HomeScreenPage[];
    dock: AppIcon[];
}

export interface HomeScreenPage {
    apps: (AppIcon | AppFolder)[];
}

export interface AppIcon {
    appId: string;
    label: string;
    icon: string;
    badge?: number;
}

export interface AppFolder {
    type: "folder";
    name: string;
    apps: AppIcon[];
}

// =============================================================================
// DEVICE STATE
// =============================================================================

export interface DeviceState {
    id: string;
    profileId: string;
    ownerName?: string;
    isLocked: boolean;
    foregroundAppId?: string;

    // Notifications
    notifications: NotificationInstance[];
    notificationCenter?: NotificationCenterState;
    dynamicIsland?: DynamicIslandState;
    statusBarIcons?: StatusBarIcon[];

    // Background apps
    backgroundApps?: BackgroundAppState[];
    call?: CallState;
    homeScreen?: HomeScreenConfig;
    sound?: { activeSoundId?: string };
    theme?: DeviceTheme;

    // Keyboard
    keyboard?: KeyboardState;

    // OS Layer
    os?: DeviceOSState;

    // Scheduler State (V2)
    notificationQueues?: NotificationQueueState;

    // App UI theme/strategy (e.g., "whatsapp-ghibli")
    appTheme?: string;
}

// =============================================================================
// TYPE ALIASES
// =============================================================================

export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;
export type Platform = "ios" | "android";
