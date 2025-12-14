export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

// =============================================================================
// NOTIFICATION IR (Intermediate Representation)
// =============================================================================

/** Notification priority levels */
export type NotificationPriority = "passive" | "active" | "timeSensitive" | "critical";

/** Notification lifecycle state */
export type NotificationState = "queued" | "delivered" | "headsUp" | "inShade" | "dismissed";

/** Notification delivery conditions */
export type NotificationDeliverWhen = "always" | "onlyWhenLocked" | "onlyWhenUnlocked" | "onlyWhenAppClosed";

/**
 * NotificationIR - Production-grade notification representation
 */
export interface Notification {
    id: string;
    deviceId?: string;                // Who receives it
    appId: string;

    // Content
    title: string;
    body: string;
    icon?: string;
    preview?: {
        kind: "text" | "image" | "video";
        value: string;
        aspectRatio?: number;
    };

    // Action buttons (max 3)
    actions?: Array<{
        id: string;
        label: string;
        icon?: string;
        destructive?: boolean;
    }>;
    replyable?: boolean;              // Quick reply input

    // Grouping
    groupKey?: string;
    threadId?: string;

    // Priority & Mode
    priority?: NotificationPriority;
    mode?: "lockscreen" | "headsup" | "both" | "silent";
    deliverWhen?: NotificationDeliverWhen;

    // === LIFECYCLE (state machine) ===
    at: number;                       // DSL spawn time
    deliveredAt?: number;             // When entered device state
    state?: NotificationState;
    updatedAt?: number;               // For updates (same id)
    dismissedAt?: number;

    // Heads-up lifecycle
    headsUp?: {
        shownAt?: number;
        hideAt?: number;
        duration?: number;            // OS default if not set
    };

    // Metadata
    metadata?: Record<string, any>;
}

// Alias for backward compatibility
export type NotificationIR = Notification;

/**
 * Notification group for stacking multiple notifications
 */
export interface NotificationGroup {
    key: string;
    appId: string;
    notifications: Notification[];
    collapsed: boolean;
    count: number;
    latestAt: number;
}

// =============================================================================
// NOTIFICATION POLICY (OS-level rules)
// =============================================================================

export interface NotificationPolicyIR {
    maxHeadsUpVisible: number;
    headsUpDurationByPriority: Record<NotificationPriority, number>;
    replaceOnNewFromSameThread: boolean;
    groupCollapseThreshold: number;
    autoGroupByApp: boolean;
    statusBarIconLimit: number;
    expandDurationMs: number;
}

export const IOS_NOTIFICATION_POLICY: NotificationPolicyIR = {
    maxHeadsUpVisible: 1,
    headsUpDurationByPriority: { passive: 0, active: 90, timeSensitive: 150, critical: 240 }, // frames
    replaceOnNewFromSameThread: true,
    groupCollapseThreshold: 3,
    autoGroupByApp: true,
    statusBarIconLimit: 0,
    expandDurationMs: 300,
};

export const ANDROID_NOTIFICATION_POLICY: NotificationPolicyIR = {
    maxHeadsUpVisible: 1,
    headsUpDurationByPriority: { passive: 0, active: 120, timeSensitive: 180, critical: 9999 },
    replaceOnNewFromSameThread: false,
    groupCollapseThreshold: 4,
    autoGroupByApp: true,
    statusBarIconLimit: 5,
    expandDurationMs: 200,
};

// =============================================================================
// NOTIFICATION CENTER STATE
// =============================================================================

export interface NotificationCenterState {
    items: Notification[];            // All notifications (persistent)
    headsUp: string | null;           // Currently shown notification ID
    headsUpQueue: string[];           // Pending heads-up if current is shown
    groups: NotificationGroup[];      // Computed groups
}

export const DEFAULT_NOTIFICATION_CENTER: NotificationCenterState = {
    items: [],
    headsUp: null,
    headsUpQueue: [],
    groups: [],
};

// =============================================================================
// DYNAMIC ISLAND STATE
// =============================================================================

export type DynamicIslandMode = "idle" | "minimal" | "compact" | "expanded";
export type DynamicIslandContent = "notification" | "music" | "call" | "timer" | null;

export interface DynamicIslandState {
    visible: boolean;
    mode: DynamicIslandMode;
    activeContent: DynamicIslandContent;
    lockedUntil?: number;             // Frame lock for animations
}

export const DEFAULT_DYNAMIC_ISLAND: DynamicIslandState = {
    visible: true,
    mode: "idle",
    activeContent: null,
};

// =============================================================================
// STATUS BAR ICONS (Android)
// =============================================================================

export interface StatusBarIcon {
    appId: string;
    count: number;
    iconUrl?: string;
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

/** Call display mode - controlled via DSL */
export type CallDisplayMode = "overlay" | "fullscreen";

/** Call type */
export type CallType = "voice" | "video" | "facetime" | "whatsapp";

/** iOS Contact Poster metadata (iOS 17+) */
export interface CallerMetadata {
    posterImage?: string;
    posterStyle?: "modern" | "classic";
    posterNameFont?: string;
}

export interface CallState {
    status: "incoming" | "ringing" | "connecting" | "active" | "ended" | "declined";
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;

    /** Call type (voice, FaceTime, WhatsApp, etc.) */
    callType: CallType;

    /** Display mode - overlay (banner) or fullscreen */
    displayMode: CallDisplayMode;

    /** iOS Contact Poster metadata (iOS 17+) */
    callerMetadata?: CallerMetadata;

    /** Call controls */
    isMuted?: boolean;
    isSpeakerOn?: boolean;
    isOnHold?: boolean;

    /** Timestamps */
    startedAt?: number;
    answeredAt?: number;
    endedAt?: number;
}

// KEYBOARD STATE
// =============================================================================

/** Keyboard layout types */
export type KeyboardLayout = "qwerty" | "numbers" | "symbols" | "emoji";

/**
 * KeyboardState - Virtual keyboard for realistic typing simulation
 * 
 * This is DEVICE-level state, shared across all apps.
 * Apps read keyboard.inputText to show what's being typed.
 */
export interface KeyboardState {
    /** Whether keyboard is visible */
    visible: boolean;
    /** Current keyboard layout */
    layout: KeyboardLayout;
    /** Currently pressed key (for highlight) */
    currentKey: string | null;
    /** Frame when key was pressed (for pop-up timing) */
    keyPressedAt: number | null;
    /** Current text in input field (character-by-character) */
    inputText: string;
    /** Cursor position within inputText */
    cursorPosition: number;
    /** Whether cursor should blink */
    cursorVisible: boolean;
}

/** Default keyboard state */
export const DEFAULT_KEYBOARD_STATE: KeyboardState = {
    visible: false,
    layout: "qwerty",
    currentKey: null,
    keyPressedAt: null,
    inputText: "",
    cursorPosition: 0,
    cursorVisible: true,
};

// =============================================================================
// DEVICE OS STATE (Clock, Battery, Network, DND)
// =============================================================================

/** Network connection type */
export type NetworkType = "wifi" | "5G" | "4G" | "LTE" | "3G" | "E" | "no-service";

/**
 * DeviceOSState - Operating system level state
 * 
 * Controls the "reality simulation" layer:
 * - Time progression (status bar, message timestamps)
 * - Battery drain and low power mode
 * - Network conditions affecting message delivery
 * - Do Not Disturb mode
 */
export interface DeviceOSState {
    /** Current device time (Unix timestamp ms) */
    clock: number;
    /** Battery percentage (0-100) */
    battery: number;
    /** Whether device is charging */
    charging: boolean;
    /** Network connection type */
    network: NetworkType;
    /** WiFi signal strength (0-3) */
    wifiStrength: number;
    /** Cellular signal strength (0-4) */
    cellStrength: number;
    /** Do Not Disturb mode (suppresses heads-up notifications) */
    dnd: boolean;
    /** Low power mode enabled */
    lowPowerMode: boolean;
    /** Airplane mode enabled */
    airplaneMode: boolean;
}

/** Default OS state (normal day, full battery, good network) */
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
};

// =============================================================================
// DEVICE STATE
// =============================================================================

export interface DeviceState {
    id: string;
    profileId: string;
    ownerName?: string;
    isLocked: boolean;
    foregroundAppId?: string;

    // === NOTIFICATIONS (enhanced) ===
    notifications: Notification[];           // Legacy access
    notificationCenter?: NotificationCenterState;
    dynamicIsland?: DynamicIslandState;
    statusBarIcons?: StatusBarIcon[];

    // Background apps
    backgroundApps?: BackgroundAppState[];
    call?: CallState;
    homeScreen?: HomeScreenConfig;
    sound?: { activeSoundId?: string };
    theme?: DeviceTheme;

    // === KEYBOARD (for typing simulation) ===
    keyboard?: KeyboardState;

    // === OS LAYER (clock, battery, network, DND) ===
    os?: DeviceOSState;
}


// Device-level theme configuration
export interface DeviceTheme {
    platform?: "ios" | "android";          // UI style (default: ios)
    frameColor?: string;                    // Device bezel color (default: black)
    wallpaper?: string;                     // Lock/home screen wallpaper (URL or CSS gradient)
    statusBarStyle?: "light" | "dark";     // Status bar text color
    accentColor?: string;                   // App tint color override
}

// --- Home Screen Types ---

export interface HomeScreenConfig {
    wallpaper?: string;              // URL or CSS gradient
    pages: HomeScreenPage[];
    dock: AppIcon[];
}

export interface HomeScreenPage {
    apps: (AppIcon | AppFolder)[];
}

export interface AppIcon {
    appId: string;
    label: string;
    icon: string;                    // URL or emoji
    badge?: number;
}

export interface AppFolder {
    type: "folder";
    name: string;
    apps: AppIcon[];
}

export interface ConversationState {
    id: ConversationId;
    type?: "dm" | "group";
    name?: string;                   // Contact or group name
    avatar?: string;

    // Group-specific
    members?: GroupMember[];
    admins?: string[];               // Member IDs who are admins

    messages: Message[];
    typing?: Record<string, boolean>;
}

export interface GroupMember {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
}

export interface Message {
    id: string;
    from: string;                    // "me" or member ID
    text?: string;
    type?: "text" | "image" | "video" | "gif" | "voice" | "system" | "deleted";
    at?: number;                     // Timestamp frame

    // System message
    systemType?: "member_added" | "member_removed" | "admin_change" | "group_created" | "group_name_changed";
    targetMember?: string;
    actorName?: string;

    // Voice message
    duration?: number;
    isPlaying?: boolean;
    playProgress?: number;

    // Image message
    imageUrl?: string;

    // Video message
    videoUrl?: string;
    thumbnailUrl?: string;

    // GIF message
    gifUrl?: string;

    // Caption for media messages
    caption?: string;

    // Layout hints
    height?: number;

    // Future features
    reactions?: Reaction[];
    replyTo?: ReplyTo;
    linkPreview?: LinkPreview;

    // Read status
    status?: "sending" | "sent" | "delivered" | "read";
}

// =============================================================================
// FUTURE FEATURES - Message Extensions
// =============================================================================

export interface Reaction {
    emoji: string;
    from: string;
    at?: number;
}

export interface ReplyTo {
    messageId: string;
    text?: string;
    from: string;
    type?: "text" | "image" | "video" | "gif" | "voice";
}

export interface LinkPreview {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

// =============================================================================
// CAMERA SYSTEM TYPES
// =============================================================================

// Easing types for smooth cinematic motion
export type EasingType =
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "bounce"
    | "elastic"
    | "cinematic";  // Custom S-curve for film-like motion

// =============================================================================
// TRANSITION SYSTEM TYPES
// =============================================================================

// Transition types for screen animations
export type TransitionType =
    | "FADE"
    | "SLIDE_LEFT"
    | "SLIDE_RIGHT"
    | "SLIDE_UP"
    | "SLIDE_DOWN"
    | "ZOOM_IN"
    | "ZOOM_OUT"
    | "CROSS_DISSOLVE";

// =============================================================================
// HIGHLIGHT SYSTEM TYPES
// =============================================================================

// Highlight styles for message emphasis
export type HighlightStyle =
    | "pulse"
    | "glow"
    | "shake"
    | "bounce"
    | "spotlight"
    | "scale";

// Camera effect types
export type CameraEffectType = "ZOOM" | "PAN" | "SHAKE" | "FOCUS" | "CUT" | "RESET";

// Targets for FOCUS effect - general purpose, not app-specific
export type FocusTarget =
    | { type: "app"; appId?: string }                                    // Focus on app viewport
    | { type: "notification"; notificationId?: string }                  // Focus on notification
    | { type: "message"; messageId: string; conversationId?: string }    // Focus on message bubble
    | { type: "device"; deviceId?: string }                              // Focus on device
    | { type: "element"; selector: string }                              // Focus on CSS selector
    | { type: "point"; x: number; y: number };                           // Focus on absolute point (0-1 normalized)

// Individual camera effect definitions
export interface CameraZoomEffect {
    type: "ZOOM";
    scale: number;           // 1.0 = default, >1 = zoom in, <1 = zoom out
    originX?: number;        // 0-1, default 0.5 (center)
    originY?: number;        // 0-1, default 0.5 (center)
    duration: number;        // frames
    easing?: EasingType;
}

export interface CameraPanEffect {
    type: "PAN";
    translateX: number;      // pixels (or normalized 0-1 if relative)
    translateY: number;      // pixels
    relative?: boolean;      // if true, translateX/Y are 0-1 normalized
    duration: number;        // frames
    easing?: EasingType;
}

export interface CameraShakeEffect {
    type: "SHAKE";
    intensity: number;       // amplitude in pixels
    frequency: number;       // shakes per second
    decay?: number;          // 0-1, how fast shake reduces (1 = instant stop, 0 = no decay)
    duration: number;        // frames
    seed?: number;           // for deterministic randomness
}

export interface CameraFocusEffect {
    type: "FOCUS";
    target: FocusTarget;
    scale?: number;          // zoom level when focused, default 1.5
    duration: number;        // frames
    easing?: EasingType;
    holdDuration?: number;   // frames to hold at focus before returning
}

export interface CameraCutEffect {
    type: "CUT";
    toDeviceId?: string;     // switch to different device
    toView?: "app" | "lockscreen" | "homescreen";
    fadeMs?: number;         // optional fade transition (0 = hard cut)
}

export interface CameraResetEffect {
    type: "RESET";
    duration: number;        // frames to animate back to default
    easing?: EasingType;
}

export type CameraEffect =
    | CameraZoomEffect
    | CameraPanEffect
    | CameraShakeEffect
    | CameraFocusEffect
    | CameraCutEffect
    | CameraResetEffect;

// Active camera effect (with timing info)
export interface ActiveCameraEffect {
    id: string;              // unique ID for this effect instance
    effect: CameraEffect;
    startFrame: number;
    endFrame: number;
    deviceId?: string;       // Target device (undefined = primary/active device)
}

// Computed camera transform (result of all active effects at time t)
export interface CameraTransform {
    translateX: number;
    translateY: number;
    scale: number;
    rotation: number;        // degrees
    originX: number;         // 0-1
    originY: number;         // 0-1

    // Shake offsets (added on top of main transform)
    shakeX: number;
    shakeY: number;
}

// =============================================================================
// MULTI-DEVICE / POV TYPES
// =============================================================================

// View layout modes for multi-device rendering
export type ViewLayoutMode =
    | "SINGLE"              // One device fills the frame
    | "SPLIT_HORIZONTAL"    // Side by side (left/right)
    | "SPLIT_VERTICAL"      // Stacked (top/bottom)
    | "PIP";                // Picture-in-Picture (main + small overlay)

// PIP position options
export type PIPPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

// Layout configuration for multi-device views
export interface ViewLayout {
    mode: ViewLayoutMode;
    primaryDeviceId: string;
    secondaryDeviceId?: string;
    pipPosition?: PIPPosition;
    pipScale?: number;
}

// Default view layout
export const DEFAULT_VIEW_LAYOUT: ViewLayout = {
    mode: "SINGLE",
    primaryDeviceId: "main_phone",
};

// Full camera state (stored in WorldState)
export interface CameraState {
    // Base view (for backward compatibility)
    baseView: "APP_VIEW" | "TRANSITION";
    appId?: AppId;

    // Multi-device support
    activeDeviceId: string;
    layout: ViewLayout;

    // Active effects (from timeline) - global + per-device
    activeEffects: ActiveCameraEffect[];

    // Computed transform for primary device
    transform: CameraTransform;

    // Per-device transforms (computed by engine)
    deviceTransforms: Record<DeviceId, CameraTransform>;
}

// Default camera transform
export const DEFAULT_CAMERA_TRANSFORM: CameraTransform = {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotation: 0,
    originX: 0.5,
    originY: 0.5,
    shakeX: 0,
    shakeY: 0,
};

// Default camera state
export const DEFAULT_CAMERA_STATE: CameraState = {
    baseView: "APP_VIEW",
    activeDeviceId: "main_phone",
    layout: { ...DEFAULT_VIEW_LAYOUT },
    activeEffects: [],
    transform: { ...DEFAULT_CAMERA_TRANSFORM },
    deviceTransforms: {},
};

// Legacy type for backward compatibility
export interface CameraViewConfig {
    type: "APP_VIEW" | "TRANSITION";
    appId?: AppId;
}

// =============================================================================
// AUDIO SYSTEM TYPES (Production-Grade)
// =============================================================================

// Audio bus types - routes audio through mixer
export type AudioBus = "music" | "ui" | "sfx" | "voice" | "master";

// Sound origin - where the sound comes from
export type SoundOrigin = "device" | "app" | "world";

// Bus configuration
export interface AudioBusConfig {
    baseGain: number;          // 0-1, default volume for this bus
    maxConcurrent: number;     // Max simultaneous sounds on this bus
}

// Envelope for attack/release (avoid clicks, add cinema feel)
export interface AudioEnvelope {
    attack: number;            // Frames to fade in
    release: number;           // Frames to fade out
    curve?: "linear" | "easeOut" | "easeIn";
}

// Ducking rule - temporarily lower another bus
export interface DuckRule {
    targetBus: AudioBus;       // Bus to duck (usually "music")
    amount: number;            // 0-1 multiplier (0.25 = duck to 25%)
    attack: number;            // Frames to duck down
    release: number;           // Frames to recover
}

// Sound cue - enhanced active sound with mixing metadata
export interface SoundCue {
    // Core fields (from ActiveSound)
    soundId: string;
    startFrame: number;
    volume: number;
    loop?: boolean;
    deviceId?: string;
    duration?: number;

    // Mixing fields
    bus: AudioBus;
    priority: number;          // Higher = more important (voice=100, music=10)
    origin?: SoundOrigin;
    envelope?: AudioEnvelope;
    duck?: DuckRule;           // If this sound should duck others

    // Fade tracking (set by engine)
    fadeTarget?: number;
    fadeDuration?: number;
    fadeStartFrame?: number;
}

// Legacy ActiveSound (backward compatible)
export interface ActiveSound {
    soundId: string;
    startFrame: number;
    volume: number;
    loop?: boolean;
    deviceId?: string;
    duration?: number;
}

// Music bed - persistent background music with mood
export interface MusicBed {
    id: string;
    soundId: string;
    startFrame: number;
    loop: boolean;
    baseGain: number;
    moodTag?: "tense" | "romantic" | "chaotic" | "calm" | "dramatic";
    crossfadeFrames?: number;  // Frames to crossfade when changing
}

// Full audio state with bus system
export interface AudioState {
    // Active sounds (key = unique instance ID)
    activeSounds: Record<string, SoundCue | ActiveSound>;

    // Bus configuration
    buses: {
        music: AudioBusConfig;
        ui: AudioBusConfig;
        sfx: AudioBusConfig;
        voice: AudioBusConfig;
    };

    // Music bed (special handling for background music)
    musicBed?: MusicBed;

    // Legacy background music (backward compatible)
    backgroundMusic?: {
        soundId: string;
        volume: number;
        loop: boolean;
        startFrame: number;
    };
}

// Default bus configuration
export const DEFAULT_BUS_CONFIG: AudioState["buses"] = {
    music: { baseGain: 0.35, maxConcurrent: 1 },
    ui: { baseGain: 0.9, maxConcurrent: 3 },
    sfx: { baseGain: 0.8, maxConcurrent: 4 },
    voice: { baseGain: 1.0, maxConcurrent: 1 },
};

// Default audio state
export const DEFAULT_AUDIO_STATE: AudioState = {
    activeSounds: {},
    buses: DEFAULT_BUS_CONFIG,
};

// =============================================================================
// VIDEO CONFIGURATION
// =============================================================================

// Global video configuration (applies to entire composition)
export interface VideoConfig {
    // Canvas
    backgroundColor?: string;               // Video background (default: #0a0a1a)
    width?: number;                         // Composition width (default: 1080)
    height?: number;                        // Composition height (default: 1920)
    fps?: number;                           // Frames per second (default: 30)

    // Multi-device layout theming
    layout?: {
        splitLineColor?: string;            // Divider color in split views
        splitLineWidth?: number;            // Divider thickness
        pipBorderColor?: string;            // PIP overlay border
        pipBorderWidth?: number;            // PIP border thickness
        pipShadow?: string;                 // PIP drop shadow
    };

    // Watermark (optional)
    watermark?: {
        text?: string;
        image?: string;
        position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
        opacity?: number;
    };
}

// Default video config
export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
    backgroundColor: "#0a0a1a",
    width: 1080,
    height: 1920,
    fps: 30,
    layout: {
        splitLineColor: "#333333",
        splitLineWidth: 2,
        pipBorderColor: "#333333",
        pipBorderWidth: 2,
        pipShadow: "0 10px 40px rgba(0,0,0,0.5)",
    },
};

// =============================================================================
// TOUCH STATE (for gesture visualization)
// =============================================================================

export interface TouchState {
    /** Unique touch identifier */
    id: string;
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
    /** Frame when touch started */
    startedAt: number;
    /** Touch type */
    type: "tap" | "long_press" | "drag";
    /** For drag: end coordinates */
    endX?: number;
    endY?: number;
}

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    appState: Record<AppId, any>;
    camera: CameraState;
    audio: AudioState;
    config?: VideoConfig;                   // Global video configuration
    /** Active touch points for visualization */
    touches?: TouchState[];
}

// Event Union
export type TimelineEvent =
    // Device events - core
    | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP" | "GO_HOME"; appId?: AppId }

    // === NOTIFICATION EVENTS (IR-compliant) ===
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "SHOW_NOTIFICATION";
        appId: string; title: string; body: string;
        mode?: "lockscreen" | "headsup" | "both" | "silent";
        priority?: NotificationPriority;
        deliverWhen?: NotificationDeliverWhen;
        groupKey?: string; threadId?: string;
        icon?: string;
        preview?: { kind: "text" | "image" | "video"; value: string; aspectRatio?: number };
        actions?: Array<{ id: string; label: string; icon?: string; destructive?: boolean }>;
        replyable?: boolean;
        metadata?: Record<string, any>;
    }
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "UPDATE_NOTIFICATION";
        notificationId: string;
        patch: Partial<{ title: string; body: string; preview: Notification["preview"]; metadata: Record<string, any> }>;
    }
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "DISMISS_NOTIFICATION";
        notificationId?: string;        // Specific notification
        groupKey?: string;               // Entire group
        all?: boolean;                   // All notifications
    }
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "TAP_NOTIFICATION";
        notificationId: string;
        actionId?: string;               // Button action ID or "open" (default)
    }
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "SWIPE_NOTIFICATION";
        notificationId: string;
        direction: "left" | "right";
        action: "dismiss" | "archive" | "snooze" | "mark_read";
    }
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "REPLY_NOTIFICATION";
        notificationId: string;
        text: string;
    }
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "TOGGLE_NOTIFICATION_PANEL";
        open: boolean;
    }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "CLEAR_ALL_NOTIFICATIONS" }
    | {
        at: number; kind: "DEVICE"; deviceId: string; type: "SET_DYNAMIC_ISLAND";
        visible: boolean;
        mode?: DynamicIslandMode;
    }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SET_BADGE"; appId: string; count: number }

    // Call events
    | { at: number; kind: "DEVICE"; deviceId: string; type: "INCOMING_CALL"; callerId: string; callerName: string; callerAvatar?: string; isVideo?: boolean }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "CALL_ANSWERED" }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "CALL_ENDED" }

    // Background app events
    | { at: number; kind: "DEVICE"; deviceId: string; type: "START_BACKGROUND_APP"; appId: string; indicator?: "music" | "call" | "recording" | "location"; label?: string }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "STOP_BACKGROUND_APP"; appId: string }
    // App events - messaging
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_READ"; conversationId: ConversationId; messageId: string }
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_STATUS"; conversationId: ConversationId; messageId: string; status: "sending" | "sent" | "delivered" | "read" | "failed" }
    // App events - voice message
    | { at: number; kind: "APP"; appId: AppId; type: "VOICE_MESSAGE_RECEIVED"; conversationId: ConversationId; from: string; duration: number }
    | { at: number; kind: "APP"; appId: AppId; type: "VOICE_MESSAGE_PLAY"; conversationId: ConversationId; messageId: string }
    // App events - group
    | { at: number; kind: "APP"; appId: AppId; type: "GROUP_MEMBER_ADDED"; conversationId: ConversationId; memberId: string; memberName: string; addedBy: string }
    | { at: number; kind: "APP"; appId: AppId; type: "GROUP_MEMBER_REMOVED"; conversationId: ConversationId; memberId: string; memberName: string; removedBy: string }
    | { at: number; kind: "APP"; appId: AppId; type: "GROUP_ADMIN_CHANGE"; conversationId: ConversationId; memberId: string; isAdmin: boolean }
    // App events - custom
    | { at: number; kind: "APP"; appId: AppId; type: "CUSTOM"; name: string; payload?: any }
    // Camera events - CINEMATIC SYSTEM (deviceId optional - defaults to all/active device)
    | { at: number; kind: "CAMERA"; type: "ZOOM"; deviceId?: string; scale: number; originX?: number; originY?: number; duration: number; easing?: EasingType }
    | { at: number; kind: "CAMERA"; type: "PAN"; deviceId?: string; translateX: number; translateY: number; relative?: boolean; duration: number; easing?: EasingType }
    | { at: number; kind: "CAMERA"; type: "SHAKE"; deviceId?: string; intensity: number; frequency: number; decay?: number; duration: number; seed?: number }
    | { at: number; kind: "CAMERA"; type: "FOCUS"; deviceId?: string; target: FocusTarget; scale?: number; duration: number; easing?: EasingType; holdDuration?: number }
    | { at: number; kind: "CAMERA"; type: "CUT"; toDeviceId?: string; toView?: string; fadeMs?: number }
    | { at: number; kind: "CAMERA"; type: "RESET"; deviceId?: string; duration: number; easing?: EasingType }
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig }  // Legacy support
    // Camera events - MULTI-DEVICE / POV
    | { at: number; kind: "CAMERA"; type: "LAYOUT"; mode: ViewLayoutMode; primaryDeviceId: string; secondaryDeviceId?: string; pipPosition?: PIPPosition; pipScale?: number; duration?: number; easing?: EasingType }
    // Audio events - SOUND SYSTEM
    | { at: number; kind: "AUDIO"; type: "PLAY_SOUND"; soundId: string; instanceId?: string; volume?: number; duration?: number; loop?: boolean; deviceId?: string }
    | { at: number; kind: "AUDIO"; type: "STOP_SOUND"; instanceId: string }
    | { at: number; kind: "AUDIO"; type: "FADE_VOLUME"; instanceId: string; toVolume: number; duration: number }
    | { at: number; kind: "AUDIO"; type: "BACKGROUND_MUSIC"; soundId: string; volume?: number; loop?: boolean }
    // Keyboard events - TYPING SIMULATION
    | { at: number; kind: "KEYBOARD"; type: "SHOW"; deviceId?: string; layout?: KeyboardLayout }
    | { at: number; kind: "KEYBOARD"; type: "HIDE"; deviceId?: string }
    | { at: number; kind: "KEYBOARD"; type: "KEY_DOWN"; deviceId?: string; key: string }
    | { at: number; kind: "KEYBOARD"; type: "KEY_UP"; deviceId?: string }
    | { at: number; kind: "KEYBOARD"; type: "TYPE_CHAR"; deviceId?: string; char: string }
    | { at: number; kind: "KEYBOARD"; type: "BACKSPACE"; deviceId?: string }
    | { at: number; kind: "KEYBOARD"; type: "SET_TEXT"; deviceId?: string; text: string }
    | { at: number; kind: "KEYBOARD"; type: "CLEAR"; deviceId?: string }
    // Transition events - SCREEN ANIMATIONS
    | { at: number; kind: "TRANSITION"; type: TransitionType; from: string; to: string; duration: number; easing?: EasingType }
    // Highlight events - MESSAGE EMPHASIS
    | { at: number; kind: "HIGHLIGHT"; type: "MESSAGE"; messageId: string; conversationId?: string; style: HighlightStyle; duration: number; color?: string }
    | { at: number; kind: "HIGHLIGHT"; type: "ELEMENT"; selector: string; style: HighlightStyle; duration: number; color?: string }
    | { at: number; kind: "HIGHLIGHT"; type: "CLEAR"; targetId?: string }
    // OS events - DEVICE SIMULATION
    | { at: number; kind: "OS"; type: "SET_TIME"; deviceId?: string; time: number }
    | { at: number; kind: "OS"; type: "SET_BATTERY"; deviceId?: string; level: number; charging?: boolean }
    | { at: number; kind: "OS"; type: "DRAIN_BATTERY"; deviceId?: string; rate: number } // rate = % per second
    | { at: number; kind: "OS"; type: "SET_NETWORK"; deviceId?: string; network: NetworkType; strength?: number }
    | { at: number; kind: "OS"; type: "SET_DND"; deviceId?: string; enabled: boolean }
    | { at: number; kind: "OS"; type: "SET_LOW_POWER"; deviceId?: string; enabled: boolean }
    | { at: number; kind: "OS"; type: "SET_AIRPLANE"; deviceId?: string; enabled: boolean }
    // Touch events - GESTURE VISUALIZATION
    | { at: number; kind: "TOUCH"; type: "TAP"; deviceId?: string; x: number; y: number; duration?: number }
    | { at: number; kind: "TOUCH"; type: "LONG_PRESS"; deviceId?: string; x: number; y: number; duration: number }
    | { at: number; kind: "TOUCH"; type: "DRAG"; deviceId?: string; startX: number; startY: number; endX: number; endY: number; duration: number }
    | { at: number; kind: "TOUCH"; type: "SCROLL"; deviceId?: string; y: number; velocity?: number }
    // Call events - PHONE CALL SIMULATION
    | { at: number; kind: "CALL"; type: "INCOMING"; deviceId?: string; callerId: string; callerName: string; callerAvatar?: string; isVideo?: boolean; callType?: CallType; displayMode?: CallDisplayMode; callerMetadata?: CallerMetadata }
    | { at: number; kind: "CALL"; type: "ANSWER"; deviceId?: string }
    | { at: number; kind: "CALL"; type: "DECLINE"; deviceId?: string }
    | { at: number; kind: "CALL"; type: "END"; deviceId?: string }
    | { at: number; kind: "CALL"; type: "TOGGLE_MUTE"; deviceId?: string }
    | { at: number; kind: "CALL"; type: "TOGGLE_SPEAKER"; deviceId?: string }
    | { at: number; kind: "CALL"; type: "TOGGLE_HOLD"; deviceId?: string };

// --- Layout System Types ---

export type ViewKind =
    | "CHAT"
    | "FEED"
    | "STORY"
    | "LOCKSCREEN"
    | "HOMESCREEN"
    | "TRANSITION";

export interface LayoutContext {
    world: WorldState;
    t: number; // current frame
    activeDeviceId: string;
    activeAppId: string;
    viewKind: ViewKind;

    // View-specific selectors
    activeConversationId?: string;   // CHAT
    activeFeedId?: string;           // FEED (e.g. timeline id)
    activeStoryId?: string;          // STORY (e.g. story reel id)

    viewportWidth: number;
    viewportHeight: number;

    // Optional configuration overrides
    config?: Partial<LayoutConfig>;
}

// --- LayoutConfig ---

export interface LayoutConfig {
    // Global-ish things
    cinematicMode: "NONE" | "FOLLOW_LAST_MESSAGE" | "FOCUS_ON_RANGE";

    // Chat-specific
    chat: ChatLayoutConfig;

    // Feed-specific
    feed: FeedLayoutConfig;

    // Story-specific
    story: StoryLayoutConfig;

    // Lock screen
    lockscreen: LockscreenLayoutConfig;

    // Transitions
    transition: TransitionLayoutConfig;
}

export interface ChatLayoutConfig {
    bubbleWidth: number;
    baseBubbleHeight: number;
    charsPerLine: number;
    lineHeight: number;
    verticalGap: number;
    topPadding: number;
    bottomPadding: number;

    messageAppearDuration: number;
    messageAppearOffset: number;
    scrollEasingDuration: number;
    maxScrollCatchupSpeed: number;

    lockToBottom: boolean;
}

export interface FeedLayoutConfig {
    cardWidth: number;
    baseCardHeight: number;
    verticalGap: number;
    topPadding: number;
    bottomPadding: number;

    // For variable-height posts, same trick as chat:
    charsPerLine: number;
    lineHeight: number;

    scrollEasingDuration: number;
    maxScrollCatchupSpeed: number;

    startAtTop: boolean;      // typical feed behaviour
    autoScroll?: boolean;     // for cinematic auto-scroll episodes
}

export interface StoryLayoutConfig {
    // Each story = full-screen page
    defaultStoryDuration: number; // in frames
    progressBarHeight: number;
    storyGap: number;             // for 3D-ish page stack if needed

    // Animation
    storyTransitionDuration: number; // frames between stories
}

export interface LockscreenLayoutConfig {
    topPadding: number;
    notificationGap: number;
    notificationWidth: number;
    baseNotificationHeight: number;
    charsPerLine: number;
    lineHeight: number;

    stackMaxNotifications: number; // older ones collapsed/hidden
    appearDuration: number;
}

export interface TransitionLayoutConfig {
    // Device position in composition
    defaultScale: number;
    zoomedScale: number;
    panDuration: number;
    zoomDuration: number;

    // Optionally, per-transition presets (open app, unlock, etc.)
}

// --- LayoutState ---

export type LayoutState =
    | ChatLayoutState
    | FeedLayoutState
    | StoryLayoutState
    | LockscreenLayoutState
    | TransitionLayoutState;

export interface BaseLayoutState {
    kind: ViewKind;
}

// ChatLayoutState

export interface ChatLayoutState extends BaseLayoutState {
    kind: "CHAT";
    scrollY: number;
    contentHeight: number;
    isAtBottom: boolean;
    messageLayouts: Record<string, ChatMessageLayout>;
    typingLayout?: TypingLayout | null;
    meta: ChatLayoutMeta;
}

export interface ChatMessageLayout {
    id: string;
    y: number;
    height: number;
    opacity: number;
    translateY: number;
    translateX: number;
    // Rect for director targeting (x, y relative to content, not viewport)
    rect?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface TypingLayout {
    y: number;
    height: number;
    opacity: number;
    // Rect for director targeting
    rect?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface ChatLayoutMeta {
    lastMessageId?: string;
    /** Whether this is a group chat (more than 2 unique senders) */
    isGroupChat?: boolean;
}

// FeedLayoutState

export interface FeedLayoutState extends BaseLayoutState {
    kind: "FEED";
    scrollY: number;
    contentHeight: number;
    isAtBottom: boolean;
    itemLayouts: Record<string, FeedItemLayout>;
    meta: FeedLayoutMeta;
}

export interface FeedItemLayout {
    id: string;
    y: number;
    height: number;
    opacity: number;
    translateY: number;
    scale: number;   // for subtle parallax / entry
}

export interface FeedLayoutMeta {
    firstVisibleItemId?: string;
    lastVisibleItemId?: string;
    focusedItemId?: string; // for cinematic highlight
}

// StoryLayoutState

export interface StoryLayoutState extends BaseLayoutState {
    kind: "STORY";
    activeStoryIndex: number;
    storyCount: number;
    storyProgress: number; // 0..1 within current story
    storyLayouts: StoryItemLayout[];
}

export interface StoryItemLayout {
    id: string;
    index: number;
    // For 3D card stack / page-motion effects:
    translateX: number;
    translateY: number;
    scale: number;
    opacity: number;
}

// LockscreenLayoutState

export interface LockscreenLayoutState extends BaseLayoutState {
    kind: "LOCKSCREEN";
    notificationLayouts: NotificationLayout[];
    meta: LockscreenLayoutMeta;
}

export interface NotificationLayout {
    id: string;
    y: number;
    height: number;
    opacity: number;
    translateY: number;
}

export interface LockscreenLayoutMeta {
    // Add any meta fields if needed
}

// TransitionLayoutState

export interface TransitionLayoutState extends BaseLayoutState {
    kind: "TRANSITION";
    // These values are for the outer DeviceFrame / TokovoRenderer
    deviceTranslateX: number;
    deviceTranslateY: number;
    deviceScale: number;
    deviceRotation: number;
    overlayOpacity: number;
    meta: TransitionLayoutMeta;
}

export interface TransitionLayoutMeta {
    // Add any meta fields if needed
}
