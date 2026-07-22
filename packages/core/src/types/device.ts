/**
 * Device Types - Device state, OS, and call surfaces
 *
 * @description Device-level types for OS state and call surfaces.
 */

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

export type ScreenRecordingPresentation = "compact" | "expanded" | "hidden";

export type ScreenRecordingCompletion = "saved" | "cancelled";

export interface ScreenRecordingState {
  /** True through the authored countdown and active capture. */
  isCapturing: boolean;
  /** Persistent compact indicator, explicit expanded control, or user-dismissed state. */
  presentation: ScreenRecordingPresentation;
  /** Whether microphone audio is included in the capture. */
  microphoneEnabled: boolean;
  /** Frame at which the capture request was made. */
  requestedAtFrame: number;
  /** Frame at which the three-second countdown completes. */
  captureStartedAtFrame: number;
  /** Frame at which capture stopped, if it has stopped. */
  captureStoppedAtFrame?: number;
  /** End of the deterministic system completion banner. */
  feedbackEndsAtFrame?: number;
  /** Whether the request produced a saved video or was cancelled during countdown. */
  completion?: ScreenRecordingCompletion;
  /** Presentation immediately before the most recent morph. */
  previousPresentation?: ScreenRecordingPresentation | "idle" | "countdown";
  /** Frame used to derive the current morph without browser-time animation. */
  presentationChangedAtFrame: number;
}

export type DynamicIslandPresentation = "idle" | "minimal" | "compact" | "expanded";
export type DynamicIslandActivity = "music" | "call" | "timer" | "recording" | "location" | null;

export interface DynamicIslandState {
  visible: boolean;
  presentation: DynamicIslandPresentation;
  activity: DynamicIslandActivity;
  updatedAtFrame?: number;
  lockedUntil?: number;
  appId?: string;
  content?: {
    title?: string;
    subtitle?: string;
    icon?: string;
    tint?: string;
    elapsedLabel?: string;
  };
}

export const DEFAULT_DYNAMIC_ISLAND: DynamicIslandState = {
  visible: true,
  presentation: "idle",
  activity: null,
};

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
// DEVICE OS STATE
// =============================================================================

export type NetworkType = "wifi" | "5G" | "4G" | "LTE" | "3G" | "E" | "no-service";

export interface DeviceOSState {
  locale: string;
  /** OS-owned surface appearance. App appearance remains independent. */
  appearance: "light" | "dark";
  /** Optional explicit clock convention; locale rules apply when omitted. */
  hourCycle?: "h12" | "h24";
  /** Optional authored lockscreen wallpaper asset or CSS background. */
  lockScreenWallpaper?: string;
  /** Deterministic platform accessibility and material preferences. */
  textScale: number;
  contrast: "standard" | "increased";
  motion: "full" | "reduced";
  transparency: "standard" | "reduced";
  materialPreference: "automatic" | "regular" | "clear";
  /** Android dynamic-color seed. Other platforms preserve it without applying it. */
  colorSeed?: string;
  clock: number;
  battery: number;
  charging: boolean;
  network: NetworkType;
  wifiStrength: number;
  cellStrength: number;
  dnd: boolean;
  lowPowerMode: boolean;
  airplaneMode: boolean;
}

export const DEFAULT_OS_STATE: DeviceOSState = {
  locale: "en-US",
  appearance: "light",
  textScale: 1,
  contrast: "standard",
  motion: "full",
  transparency: "standard",
  materialPreference: "automatic",
  clock: 1704102060000,
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
}

export interface DeviceState {
  id: string;
  profileId: string;
  ownerName?: string;
  isLocked: boolean;
  foregroundAppId?: string;

  /** Screen dimensions copied from device profile at creation */
  screenDimensions?: DeviceScreenDimensions;

  dynamicIsland?: DynamicIslandState;
  screenRecording?: ScreenRecordingState;

  // Background apps
  backgroundApps?: BackgroundAppState[];
  call?: CallState;
  homeScreen?: HomeScreenConfig;
  sound?: { activeSoundId?: string };
  theme?: DeviceTheme;

  // OS Layer
  os: DeviceOSState;

  // App UI theme/strategy (e.g., "whatsapp-storybook")
  appTheme?: string;

  // App color appearance authored independently from the theme strategy.
  appAppearance?: "light" | "dark";

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
  style: DeviceTransitionStyle;
  originX?: number;
  originY?: number;
}

export type DeviceTransitionStyle =
  | "platform-default"
  | "platform-unlock"
  | "ios-container-zoom"
  | "android-container-transform";

// =============================================================================
// TYPE ALIASES
// =============================================================================

export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;
export type Platform = "ios" | "android";
