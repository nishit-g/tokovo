// NOTE: DeviceId, AppId, ConversationId, Platform are now in ./types/device.ts
// Re-export for backward compatibility
export type { DeviceId, AppId, ConversationId, Platform } from "./types/device.js";

export type {
  AppScreens,
  AppCallTypes,
  BaseAppState,
  BackgroundAppState,
  CallDisplayMode,
  CallType,
  CallerMetadata,
  CallState,
  NetworkType,
  DeviceOSState,
  DeviceScreenDimensions,
  DeviceState,
  DeviceTheme,
  HomeScreenConfig,
  HomeScreenPage,
  AppIcon,
  AppFolder,
  KeyboardLayout,
  KeyboardType,
  ReturnKeyType,
  KeyPressState,
  KeyboardState,
  TypingAnimation,
} from "./types/device.js";

export { DEFAULT_OS_STATE, DEFAULT_KEYBOARD_STATE } from "./types/device.js";

export type {
  NotificationPriority,
  NotificationState,
  NotificationDeliverWhen,
  NotificationIR,
  NotificationInstance,
  Notification,
  NotificationIR_Alias,
  NotificationGroup,
  NotificationPolicyIR,
  NotificationCenterState,
  StatusBarIcon,
  DynamicIslandState,
  DynamicIslandMode,
  DynamicIslandContent,
  NotificationQueueState,
} from "./types/notification.js";

export {
  IOS_NOTIFICATION_POLICY,
  ANDROID_NOTIFICATION_POLICY,
  DEFAULT_NOTIFICATION_CENTER,
  DEFAULT_DYNAMIC_ISLAND,
} from "./types/notification.js";

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
export type { CameraTransform, BaseCameraState } from "./types/camera.js";
export {
  DEFAULT_TRANSFORM,
  DEFAULT_CAMERA_TRANSFORM,
  DEFAULT_BASE_CAMERA_STATE,
} from "./types/camera.js";

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

import type { ViewLayoutMode, PIPPosition } from "./types/layout.js";
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
} from "./types/audio.js";

export {
  DEFAULT_BUS_CONFIG,
  DEFAULT_AUDIO_STATE,
  DEFAULT_VIDEO_CONFIG,
} from "./types/audio.js";

// =============================================================================
// TOUCH STATE (for gesture visualization)
// =============================================================================

export type { WorldState, TouchState } from "./types/world-state.js";

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
import type { RuntimeEvent } from "./types/runtime-event.js";
export type TimelineEvent = RuntimeEvent;

export type {
  AudioPlayEvent,
  AudioStopEvent,
  AudioFadeOutEvent,
  AudioCrossfadeEvent,
  AudioStopAllEvent,
  AudioRuntimeEvent,
  OverlayRuntimeEvent,
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
} from "./types/runtime-event.js";

// --- Layout System Types ---
// Re-export from types/layout.ts for backward compatibility
// (types/index.ts is NOT exported from core/index.ts to avoid duplicates)

export type {
  ViewKind,
  LayoutRect,
  SemanticRegion,
  SemanticLayoutState,
  LayoutContext,
  LayoutCacheStore,
  SafeAreaInsets,
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
  FullscreenLayoutState,
  StoryLayoutState,
  StoryItemLayout,
  LockscreenLayoutState,
  NotificationLayout,
  LockscreenLayoutMeta,
  TransitionLayoutState,
  TransitionLayoutMeta,
} from "./types/layout.js";

// StatusBar theming
export {
  STATUS_BAR_PRESETS,
  resolveStatusBarTheme,
} from "./types/statusbar-theme.js";
export type {
  StatusBarPreset,
  StatusBarCustomTheme,
  StatusBarTheme,
  ResolvedStatusBarTheme,
} from "./types/statusbar-theme.js";

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
} from "./types/runtime-event.js";

export type { SemanticAnchorId } from "./types/anchor.js";
