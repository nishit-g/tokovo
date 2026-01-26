// NOTE: DeviceId, AppId, ConversationId, Platform are now in ./types/device.ts
// Import for local use and re-export for backward compatibility
import type { DeviceId as _DeviceId, AppId as _AppId } from "./types/device";
export type { DeviceId, AppId, ConversationId, Platform } from "./types/device";

// Local aliases for use in this file
type DeviceId = _DeviceId;
type AppId = _AppId;

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
// CALL STATE
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

/** Entry in the typing schedule */
export interface TypingScheduleEntry {
  key: string;
  frame: number;
}

/** Active typing sequence - allows renderer to derive state from frame */
export interface TypingSchedule {
  entries: TypingScheduleEntry[];
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface KeyboardState {
  /** Whether keyboard is visible */
  visible: boolean;
  /** Current keyboard layout */
  layout: KeyboardLayout;
  /** Currently pressed key (for highlight) - legacy, derived from schedule in renderer */
  currentKey: string | null;
  /** Frame when key was pressed (for pop-up timing) - legacy */
  keyPressedAt: number | null;
  /** Frame when visibility last changed (for animations) */
  visibilityChangedAt: number;
  /** Current text in input field (character-by-character) */
  inputText: string;
  /** Cursor position within inputText */
  cursorPosition: number;
  /** Whether cursor should blink */
  cursorVisible: boolean;
  /** Selection range */
  selectionStart: number | null;
  /** Selection range */
  selectionEnd: number | null;
  /** Auto-complete suggestions */
  suggestions: string[];
  /** Highlighted suggestion index */
  highlightedSuggestion: number | null;
  /** Visual pop-up state */
  keyPressVisual: { key: string; frame: number } | null;
  /** Enterprise: Typing schedule for derived animation */
  typingSchedule: TypingSchedule | null;
}

/** Default keyboard state */
export const DEFAULT_KEYBOARD_STATE: KeyboardState = {
  visible: false,
  layout: "qwerty",
  currentKey: null,
  keyPressedAt: null,
  visibilityChangedAt: -1,
  inputText: "",
  cursorPosition: 0,
  cursorVisible: true,
  selectionStart: null,
  selectionEnd: null,
  suggestions: [],
  highlightedSuggestion: null,
  keyPressVisual: null,
  typingSchedule: null,
};

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

// Audio bus types - routes audio through mixer
export type AudioBus = "music" | "ui" | "sfx" | "voice" | "master";

// Sound origin - where the sound comes from
export type SoundOrigin = "device" | "app" | "world";

// Bus configuration
export interface AudioBusConfig {
  baseGain: number; // 0-1, default volume for this bus
  maxConcurrent: number; // Max simultaneous sounds on this bus
}

// Envelope for attack/release (avoid clicks, add cinema feel)
export interface AudioEnvelope {
  attack: number; // Frames to fade in
  release: number; // Frames to fade out
  curve?: "linear" | "easeOut" | "easeIn";
}

// Ducking rule - temporarily lower another bus
export interface DuckRule {
  targetBus: AudioBus; // Bus to duck (usually "music")
  amount: number; // 0-1 multiplier (0.25 = duck to 25%)
  attack: number; // Frames to duck down
  release: number; // Frames to recover
}

// =============================================================================
// LAYOUT PRIMITIVES
// =============================================================================
// Note: LayoutRect moved to ./types/layout.ts (re-exported at bottom of file)

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
  priority: number; // Higher = more important (voice=100, music=10)
  origin?: SoundOrigin;
  envelope?: AudioEnvelope;
  duck?: DuckRule; // If this sound should duck others

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
  crossfadeFrames?: number; // Frames to crossfade when changing
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
  backgroundColor?: string; // Video background (default: #0a0a1a)
  width?: number; // Composition width (default: 1080)
  height?: number; // Composition height (default: 1920)
  fps?: number; // Frames per second (default: 30)

  // Multi-device layout theming
  layout?: {
    splitLineColor?: string; // Divider color in split views
    splitLineWidth?: number; // Divider thickness
    pipBorderColor?: string; // PIP overlay border
    pipBorderWidth?: number; // PIP border thickness
    pipShadow?: string; // PIP drop shadow
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
} from "./types/runtime-event";

export type { SemanticAnchorId } from "./types/anchor";
