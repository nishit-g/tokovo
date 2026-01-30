// NOTE: DeviceId, AppId, ConversationId, Platform are now in ./types/device.ts
// Import for local use and re-export for backward compatibility
import type { DeviceId as _DeviceId, AppId as _AppId } from "./types/device";
import type {
  AudioState as _AudioState,
  VideoConfig as _VideoConfig,
} from "./types/audio";
export type { DeviceId, AppId, ConversationId, Platform } from "./types/device";

// Local aliases for use in this file
type DeviceId = _DeviceId;
type AppId = _AppId;
type AudioState = _AudioState;
type VideoConfig = _VideoConfig;

// =============================================================================
// NOTIFICATION IR (Intermediate Representation)
// =============================================================================

/** Notification priority levels */
export type NotificationPriority =
  | "passive"
  | "active"
  | "timeSensitive"
  | "critical";

/** Notification lifecycle state */
export type NotificationState =
  | "queued"
  | "delivered"
  | "headsUp"
  | "inShade"
  | "dismissed";

/** Notification delivery conditions */
export type NotificationDeliverWhen =
  | "always"
  | "onlyWhenLocked"
  | "onlyWhenUnlocked"
  | "onlyWhenAppClosed";

/**
 * EXTENSIBLE REGISTRIES
 * Plugins can use Module Augmentation to add their own types here.
 *
 * Example:
 * declare module "@tokovo/core" {
 *   interface AppScreens {
 *     "app_whatsapp": "chat" | "list";
 *   }
 * }
 */
export interface AppScreens {
  [key: string]: string; // Fallback for unknown apps
}

export interface AppCallTypes {
  [key: string]: string;
}

/**
 * NotificationIR - Production-grade notification representation
 */
/**
 * NotificationIR - The Immutable Request
 * What the app sends. Stable, serializable, and device-agnostic.
 */
export interface NotificationIR {
  // Identity
  id: string;
  appId: string;
  channelId?: string; // e.g. "messages", "promotions"

  // Content
  title: string;
  body: string;
  icon?: string; // Asset Ref

  // Media / Rich Content
  preview?: {
    kind: "text" | "image" | "video";
    value: string;
    aspectRatio?: number;
  };
  payload?: Record<string, unknown>; // Custom data for custom renderers

  // Semantics
  category?: "message" | "call" | "system" | "reminder";
  threadKey?: string; // "chat_alice"
  groupKey?: string; // "whatsapp_messages"
  peopleIds?: string[]; // ["alice"] - for focus modes

  // Actions
  actions?: Array<{
    id: string;
    label: string;
    icon?: string;
    destructive?: boolean;
  }>;
  replyable?: boolean; // Quick reply input
}

/**
 * NotificationInstance - The Mutable State
 * What the Engine tracks. Includes lifecycle, timestamps, and OS state.
 */
export interface NotificationInstance {
  // Reference
  id: string;
  ir: NotificationIR;

  // Flattened fields from IR (for convenience)
  appId: string;
  title: string;
  body: string;
  icon?: string;

  // Lifecycle
  state:
    | "queued"
    | "pending"
    | "headsUp"
    | "inShade"
    | "onLockscreen"
    | "dismissed";

  // Timestamps (Frame numbers)
  createdAtFrame: number;
  deliveredAtFrame?: number;
  shownAtFrame?: number;
  dismissedAtFrame?: number;
  expiresAtFrame?: number;

  // Encapsulated State from OS
  deviceId?: string;

  // Computed Priority / Mode
  importance?: "low" | "default" | "high" | "critical";
  mode?: "lockscreen" | "headsup" | "both" | "silent";
  priority?: "low" | "default" | "high" | "urgent";
}

// Backward Compatibility / Alias (Deprecated)
// We keep this to avoid breaking everything immediately, but mapped to Instance
export type Notification = NotificationInstance;
export type NotificationIR_Alias = NotificationIR;

/**
 * Notification group for stacking multiple notifications
 */
export interface NotificationGroup {
  key: string;
  appId: string;
  notifications: NotificationInstance[];
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
  headsUpDurationByPriority: {
    passive: 0,
    active: 90,
    timeSensitive: 150,
    critical: 240,
  }, // frames
  replaceOnNewFromSameThread: true,
  groupCollapseThreshold: 3,
  autoGroupByApp: true,
  statusBarIconLimit: 0,
  expandDurationMs: 300,
};

export const ANDROID_NOTIFICATION_POLICY: NotificationPolicyIR = {
  maxHeadsUpVisible: 1,
  headsUpDurationByPriority: {
    passive: 0,
    active: 120,
    timeSensitive: 180,
    critical: 9999,
  },
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
  items: Notification[]; // All notifications (persistent)
  headsUp: string | null; // Currently shown notification ID
  headsUpQueue: string[]; // Pending heads-up if current is shown
  groups: NotificationGroup[]; // Computed groups
}

export const DEFAULT_NOTIFICATION_CENTER: NotificationCenterState = {
  items: [],
  headsUp: null,
  headsUpQueue: [],
  groups: [],
};

export type {
  DynamicIslandState,
  DynamicIslandMode,
  DynamicIslandContent,
} from "./types/notification";
export { DEFAULT_DYNAMIC_ISLAND } from "./types/notification";

import type { DynamicIslandState } from "./types/notification";

// =============================================================================
// STATUS BAR ICONS (Android)
// =============================================================================

export interface StatusBarIcon {
  appId: string;
  count: number;
  iconUrl?: string;
}

// =============================================================================
// APP STATE CONTRACT
// =============================================================================

/**
 * Base interface that ALL App States should extend to be compatible with True OS.
 * This replaces heuristic string matching in the Layout Engine.
 */
export interface BaseAppState {
  /**
   * The overarching layout mode this app is currently in.
   * IF provided, the OS will respect this over default metadata strategies.
   */
  viewMode?: import("./types/layout").ViewKind;

  /** Context for CHAT view */
  conversationId?: string;

  /** Context for STORY view */
  activeStoryId?: string;

  // Future standard fields:
  // title?: string;       // Dynamic title bar override
  // themeColor?: string;  // Dynamic status bar color override
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
// KEYBOARD STATE - Re-export from types/device.ts
// =============================================================================

export type {
  KeyboardLayout,
  KeyboardType,
  ReturnKeyType,
  KeyPressState,
  KeyboardState,
} from "./types/device";

export { DEFAULT_KEYBOARD_STATE } from "./types/device";

export type { TypingAnimation } from "./types/device";

import type { KeyboardState } from "./types/device";

// =============================================================================
// DEVICE OS STATE (Clock, Battery, Network, DND)
// =============================================================================

/** Call display mode - controlled via DSL */
export type CallDisplayMode = "overlay" | "fullscreen" | (string & {});

/**
 * Call type
 * Open for extension by plugins (e.g. "telegram", "messenger")
 */
export type CallType =
  | "voice"
  | "video"
  | "facetime"
  | "whatsapp"
  | (string & {});

/** iOS Contact Poster metadata (iOS 17+) */
export interface CallerMetadata {
  posterImage?: string;
  posterColor?: string; // Background color if image missing
  posterStyle?: "modern" | "classic" | (string & {});
  posterNameFont?: string;
}

export interface CallState {
  status:
    | "incoming"
    | "ringing"
    | "connecting"
    | "active"
    | "ended"
    | "declined";
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

// =============================================================================
// DEVICE OS STATE (Clock, Battery, Network, DND)
// =============================================================================

/** Network connection type */
export type NetworkType =
  | "wifi"
  | "5G"
  | "4G"
  | "LTE"
  | "3G"
  | "E"
  | "no-service";

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

  /** Active notifications */
  notifications: NotificationInstance[];
  /** Dismissed notifications history */
  notificationHistory: NotificationInstance[];
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
  notifications: [],
  notificationHistory: [],
};

// =============================================================================
// DEVICE SCREEN DIMENSIONS
// =============================================================================

export interface DeviceScreenDimensions {
  width: number;
  height: number;
  safeAreaTop: number;
  safeAreaBottom: number;
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

  screenDimensions?: DeviceScreenDimensions;

  // === NOTIFICATIONS (enhanced) ===
  notifications: Notification[]; // Legacy access
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

  // === SCHEDULER STATE (V2) ===
  /**
   * Source of truth for what IS showing.
   * Computed by the Engine, consumed by Renderer.
   */
  notificationQueues?: NotificationQueueState;

  // App UI theme/strategy (e.g., "whatsapp-ghibli")
  appTheme?: string;
}

export interface NotificationQueueState {
  /** The single notification currently showing as Heads-Up */
  headsUp: NotificationInstance | null;
  /** Notifications currently on lockscreen (ordered) */
  lockScreen: NotificationInstance[];
  /** Dynamic Island state (expanded/compact) */
  dynamicIsland?: DynamicIslandState;
}

// Device-level theme configuration
export interface DeviceTheme {
  platform?: "ios" | "android"; // UI style (default: ios)
  frameColor?: string; // Device bezel color (default: black)
  wallpaper?: string; // Lock/home screen wallpaper (URL or CSS gradient)
  statusBarStyle?: "light" | "dark"; // Status bar text color
  accentColor?: string; // App tint color override
}

// --- Home Screen Types ---

export interface HomeScreenConfig {
  wallpaper?: string; // URL or CSS gradient
  pages: HomeScreenPage[];
  dock: AppIcon[];
}

export interface HomeScreenPage {
  apps: (AppIcon | AppFolder)[];
}

export interface AppIcon {
  appId: string;
  label: string;
  icon: string; // URL or emoji
  badge?: number;
}

export interface AppFolder {
  type: "folder";
  name: string;
  apps: AppIcon[];
}
// =============================================================================
// APP DATA - REMOVED FROM CORE
// =============================================================================
//
// The following types have been REMOVED from core:
// - ConversationState
// - GroupMember
// - Message
// - Reaction
// - ReplyTo
// - LinkPreview
//
// These are app-specific concepts. Each plugin defines its own types.
// WorldState.conversations is now Record<string, unknown>.
// WorldState.appState is Record<string, unknown>.
//
// Apps cast to their own types when accessing this data.
// =============================================================================

// =============================================================================
// CAMERA SYSTEM TYPES (core owns base types, device-camera extends them)
// =============================================================================

// Core camera types (no device-camera dependency)
export type { CameraTransform, BaseCameraState } from "./types/camera";
export {
  DEFAULT_TRANSFORM,
  DEFAULT_CAMERA_TRANSFORM,
  DEFAULT_BASE_CAMERA_STATE,
} from "./types/camera";

// =============================================================================
// TRANSITION SYSTEM TYPES (not camera-specific, stays in core)
// =============================================================================

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
// HIGHLIGHT SYSTEM TYPES (not camera-specific, stays in core)
// =============================================================================

export type HighlightStyle =
  | "pulse"
  | "glow"
  | "shake"
  | "bounce"
  | "spotlight"
  | "scale";

// =============================================================================
// MULTI-DEVICE / POV TYPES (stays in core)
// =============================================================================

import type { ViewLayoutMode, PIPPosition } from "./types/layout";
export type { ViewLayoutMode, PIPPosition };

export interface ViewLayout {
  mode: ViewLayoutMode;
  primaryDeviceId: string;
  secondaryDeviceId?: string;
  pipPosition?: PIPPosition;
  pipScale?: number;
}

export const DEFAULT_VIEW_LAYOUT: ViewLayout = {
  mode: "SINGLE",
  primaryDeviceId: "main_phone",
};

// =============================================================================
// CAMERA STATE (re-exported from canonical source)
// =============================================================================

import type { BaseCameraState as _BaseCameraState } from "./types/camera";

type BaseCameraState = _BaseCameraState;

// =============================================================================
// AUDIO SYSTEM TYPES (Production-Grade)
// =============================================================================
// AUDIO TYPES (re-exported from ./types/audio.ts)
// =============================================================================

export type {
  AudioBus,
  SoundOrigin,
  AudioBusConfig,
  AudioEnvelope,
  DuckRule,
  SoundCue,
  SoundCueMetadata,
  MusicBed,
  MoodTag,
  CrossfadeCurve,
  AudioState,
  VideoConfig,
} from "./types/audio";

export {
  DEFAULT_BUS_CONFIG,
  DEFAULT_AUDIO_STATE,
  DEFAULT_VIDEO_CONFIG,
} from "./types/audio";

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

  /**
   * Per-app state buckets.
   * Each app manages its own state structure (including conversations).
   */
  appState: Record<string, unknown>;

  // Engine primitives
  camera: BaseCameraState;
  audio: AudioState;
  config?: VideoConfig;

  /** Active touch points for visualization */
  touches?: TouchState[];
}

// =============================================================================
// EVENT TYPE - UNIFIED
// =============================================================================

/**
 * TimelineEvent is now an alias for RuntimeEvent.
 *
 * This completes the enterprise type unification:
 * - All events use { at, kind, type, payload } shape
 * - All app-specific data goes in `payload` field
 * - No more "from/text location mismatch" bugs
 *
 * @see docs/FUCKING_MESS.md Section 4
 */
import type { RuntimeEvent } from "./types/runtime-event";
export type TimelineEvent = RuntimeEvent;

export type {
  AudioPlayEvent,
  AudioStopEvent,
  AudioFadeOutEvent,
  AudioCrossfadeEvent,
  AudioStopAllEvent,
  AudioRuntimeEvent,
  CameraZoomEvent,
  CameraPanEvent,
  CameraShakeEvent,
  CameraResetEvent,
  CameraHoldEvent,
  CameraAnchorFocusEvent,
  CameraAnchorTrackEvent,
  CameraFocusEvent,
  CameraCutEvent,
  CameraSetLayoutEvent,
  CameraSetViewEvent,
  CameraLayoutEvent,
  CameraRuntimeEvent,
  OSRuntimeEvent,
  CallRuntimeEvent,
  DeviceRuntimeEvent,
} from "./types/runtime-event";

// --- Layout System Types ---
// Re-export from types/layout.ts for backward compatibility
// (types/index.ts is NOT exported from core/index.ts to avoid duplicates)

export type {
  ViewKind,
  LayoutRect,
  SemanticRegion,
  SemanticLayoutState,
  LayoutContext,
  LayoutConfig,
  ChatLayoutConfig,
  FeedLayoutConfig,
  StoryLayoutConfig,
  LockscreenLayoutConfig,
  TransitionLayoutConfig,
  LayoutState,
  BaseLayoutState,
  ChatLayoutState,
  ChatMessageLayout,
  TypingLayout,
  ChatLayoutMeta,
  FeedLayoutState,
  FeedItemLayout,
  FeedLayoutMeta,
  StoryLayoutState,
  StoryItemLayout,
  LockscreenLayoutState,
  NotificationLayout,
  LockscreenLayoutMeta,
  TransitionLayoutState,
  TransitionLayoutMeta,
} from "./types/layout";

// StatusBar theming
export {
  STATUS_BAR_PRESETS,
  resolveStatusBarTheme,
} from "./types/statusbar-theme";
export type {
  StatusBarPreset,
  StatusBarCustomTheme,
  StatusBarTheme,
  ResolvedStatusBarTheme,
} from "./types/statusbar-theme";

// Re-export runtime event types (for typed device events)
export type {
  RuntimeEvent,
  OpenAppEvent,
  SetBadgeEvent,
  SetDynamicIslandEvent,
  IncomingCallEvent,
  StartBackgroundAppEvent,
  StopBackgroundAppEvent,
  ShowNotificationEvent,
  LockEvent,
  UnlockEvent,
  CloseAppEvent,
  GoHomeEvent,
  CallAnsweredEvent,
  CallEndedEvent,
  OpenAppPayload,
  SetBadgePayload,
  SetDynamicIslandPayload,
  IncomingCallPayload,
  BackgroundAppPayload,
  NotificationPayload as RuntimeNotificationPayload,
  // Voice runtime event types
  VoiceEventType,
  VoicePlaySegmentEvent,
  VoiceStopEvent,
  VoiceRuntimeEvent,
  isRuntimeVoiceEvent,
} from "./types/runtime-event";

export type { SemanticAnchorId } from "./types/anchor";
