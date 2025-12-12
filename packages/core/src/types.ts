export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

export interface Notification {
    id: string;
    appId: string;
    title: string;
    body: string;
    at: number;
    dismissedAt?: number;         // When auto-dismissed or manually dismissed
    mode?: "lockscreen" | "headsup" | "both";  // Display mode (default: both)
    icon?: string;                // App icon URL (optional)
}

export interface CallState {
    status: "incoming" | "active" | "ended";
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
    startedAt?: number;
    endedAt?: number;
}

export interface DeviceState {
    id: string;
    profileId: string;
    ownerName?: string;            // Who owns this device (for POV - their messages on right)
    isLocked: boolean;
    foregroundAppId?: string;
    notifications: Notification[];
    call?: CallState;
    homeScreen?: HomeScreenConfig;
    sound?: {
        activeSoundId?: string;
    };
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
    type?: "text" | "image" | "voice" | "system";
    at?: number;                     // Timestamp frame

    // System message
    systemType?: "member_added" | "member_removed" | "admin_change" | "group_created" | "group_name_changed";
    targetMember?: string;
    actorName?: string;

    // Voice message
    duration?: number;
    isPlaying?: boolean;
    playProgress?: number;

    // Read status
    status?: "sending" | "sent" | "delivered" | "read";
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
// AUDIO SYSTEM TYPES
// =============================================================================

// Active sound instance
export interface ActiveSound {
    soundId: string;
    startFrame: number;
    volume: number;
    loop?: boolean;
    deviceId?: string;  // If set, only plays for this device's context
    duration?: number;  // Optional duration in frames
}

// Audio state (stored in WorldState)
export interface AudioState {
    activeSounds: Record<string, ActiveSound>;  // key = unique instance ID
    backgroundMusic?: {
        soundId: string;
        volume: number;
        loop: boolean;
        startFrame: number;
    };
}

// Default audio state
export const DEFAULT_AUDIO_STATE: AudioState = {
    activeSounds: {},
};

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    appState: Record<AppId, any>;
    camera: CameraState;
    audio: AudioState;
}

// Event Union
export type TimelineEvent =
    // Device events
    | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP" | "GO_HOME"; appId?: AppId }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SHOW_NOTIFICATION"; appId: string; title: string; body: string; mode?: "lockscreen" | "headsup" | "both"; icon?: string }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "DISMISS_NOTIFICATION"; notificationId: string }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SET_BADGE"; appId: string; count: number }
    // Call events
    | { at: number; kind: "DEVICE"; deviceId: string; type: "INCOMING_CALL"; callerId: string; callerName: string; callerAvatar?: string; isVideo?: boolean }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "CALL_ANSWERED" }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "CALL_ENDED" }
    // App events - messaging
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_READ"; conversationId: ConversationId; messageId: string }
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
    | { at: number; kind: "AUDIO"; type: "BACKGROUND_MUSIC"; soundId: string; volume?: number; loop?: boolean };

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
}

export interface TypingLayout {
    y: number;
    height: number;
    opacity: number;
}

export interface ChatLayoutMeta {
    lastMessageId?: string;
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
