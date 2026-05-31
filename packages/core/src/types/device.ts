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
  NotificationQueueState,
} from "./notification.js";

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
// SCREEN RECORDING
// =============================================================================

export type ScreenRecordingMode = "minimal" | "compact";

export interface ScreenRecordingState {
  enabled: boolean;
  mode: ScreenRecordingMode;
  startedAtFrame?: number;
  activeSinceFrame?: number;
  stoppedAtFrame?: number;
  stopFeedbackUntilFrame?: number;
}

// =============================================================================
// CALL STATE
// =============================================================================

export type CallDisplayMode = "overlay" | "fullscreen" | (string & {});
export type CallType =
  | "voice"
  | "video"
  | "facetime"
  | "whatsapp"
  | (string & {});

export interface CallerMetadata {
  posterImage?: string;
  posterColor?: string;
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
export type KeyboardType = "default" | "numeric" | "email" | "url" | "search";
export type ReturnKeyType = "return" | "send" | "search" | "done" | "go";

export interface KeyPressState {
  key: string;
  startFrame: number;
  duration: number;
}

/**
 * Represents an ongoing typing animation for optimized event handling.
 * Instead of emitting N KEYBOARD_KEY_PRESS events for N characters,
 * we emit a single KEYBOARD_TYPE event and selectors compute the active key.
 */
export interface TypingAnimation {
  text: string;
  startFrame: number;
  charDelay: number;
}

export interface KeyboardState {
  visible: boolean;
  showFrame: number | null;
  hideFrame: number | null;
  inputText: string;
  cursorPosition: number;
  activeKeyPresses: KeyPressState[];
  keyboardType: KeyboardType;
  returnKeyType: ReturnKeyType;
  suggestions: string[];
  activeSuggestionIndex: number | null;
  /** Active typing animation for optimized event count */
  typingAnimation?: TypingAnimation;
}

export const DEFAULT_KEYBOARD_STATE: KeyboardState = {
  visible: false,
  showFrame: null,
  hideFrame: null,
  inputText: "",
  cursorPosition: 0,
  activeKeyPresses: [],
  keyboardType: "default",
  returnKeyType: "return",
  suggestions: [],
  activeSuggestionIndex: null,
  typingAnimation: undefined,
};

// =============================================================================
// DEVICE OS STATE
// =============================================================================

export type NetworkType =
  | "wifi"
  | "5G"
  | "4G"
  | "LTE"
  | "3G"
  | "E"
  | "no-service";

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
  clock: 0,
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

export interface DeviceScreenDimensions {
  width: number;
  height: number;
  safeAreaTop: number;
  safeAreaBottom: number;
}

export interface DeviceState {
  id: string;
  profileId: string;
  ownerName?: string;
  isLocked: boolean;
  foregroundAppId?: string;

  /** Screen dimensions copied from device profile at creation */
  screenDimensions?: DeviceScreenDimensions;

  // Notifications
  notifications: NotificationInstance[];
  notificationCenter?: NotificationCenterState;
  dynamicIsland?: DynamicIslandState;
  statusBarIcons?: StatusBarIcon[];
  screenRecording?: ScreenRecordingState;

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

  // App UI theme/strategy (e.g., "whatsapp-storybook")
  appTheme?: string;

  /**
   * Deterministic device-level transitions authored by DEVICE events.
   * Renderer uses this as state-only input (no hidden timers/global singletons).
   */
  transition?: DeviceTransitionState;
}

export interface DeviceTransitionState {
  kind: "unlock" | "openApp" | "goHome";
  startFrame: number;
  durationFrames: number;
  style?: "faceIdSwipe" | "iosZoom" | (string & {});
  originX?: number;
  originY?: number;
}

// =============================================================================
// TYPE ALIASES
// =============================================================================

export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;
export type Platform = "ios" | "android";
