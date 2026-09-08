export type {
  DeviceId,
  AppId,
  ConversationId,
  Platform,
  DeviceTransitionStyle,
} from "./types/device.js";

export type {
  AppScreens,
  AppCallTypes,
  BaseAppState,
  BackgroundAppState,
  ScreenRecordingPresentation,
  ScreenRecordingCompletion,
  ScreenRecordingState,
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
} from "./types/device.js";

export { DEFAULT_OS_STATE } from "./types/device.js";

export type {
  DynamicIslandState,
  DynamicIslandPresentation,
  DynamicIslandActivity,
} from "./types/device.js";
export { DEFAULT_DYNAMIC_ISLAND } from "./types/device.js";

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
// App instances are keyed by canonical `${deviceId}:${appId}` identifiers.
//
// Apps cast to their own types when accessing this data.
// =============================================================================

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

export type HighlightStyle = "pulse" | "glow" | "shake" | "bounce" | "spotlight" | "scale";

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
  DEFAULT_VIDEO_CONFIG,
  createDefaultAudioState,
} from "./types/audio.js";

// =============================================================================
// TOUCH STATE (for gesture visualization)
// =============================================================================

export { appInstanceId, parseAppInstanceId } from "./types/world-state.js";
export type {
  AppInstanceId,
  WorldState,
  TouchState,
} from "./types/world-state.js";
export type {
  EpisodeAssetKind,
  EpisodeAssetOwner,
  EpisodeAssetUsage,
  EpisodeAssetPrefetchStrategy,
  EpisodeAssetRef,
  PluginAssetCollectorContext,
  PluginAssetCollector,
} from "./types/asset-ref.js";

// =============================================================================
// EVENT TYPE - UNIFIED
// =============================================================================

/**
 * TimelineEvent is now an alias for RuntimeEvent.
 *
 * This completes the production type unification:
 * - All events use { at, kind, type, payload } shape
 * - All app-specific data goes in `payload` field
 * - No more "from/text location mismatch" bugs
 *
 * @see docs/ENGINEERING_HANDBOOK.md
 */
import type { RuntimeEvent } from "./types/runtime-event.js";
export type TimelineEvent = RuntimeEvent;

export type {
  AppRuntimeEvent,
  AudioPlayEvent,
  AudioStopEvent,
  AudioFadeOutEvent,
  AudioCrossfadeEvent,
  AudioStopAllEvent,
  AudioRuntimeEvent,
  OverlayRuntimeEvent,
  OSRuntimeEvent,
  CallRuntimeEvent,
  DeviceRuntimeEvent,
} from "./types/runtime-event.js";

// --- Layout System Types ---
// (types/index.ts is NOT exported from core/index.ts to avoid duplicates)

export type { AppViewportFrame } from "@tokovo/visual-system";

export type {
  ViewKind,
  LayoutRect,
  SemanticRegion,
  SemanticLayoutState,
  LayoutContext,
  LayoutCacheStore,
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
  LockscreenLayoutMeta,
  TransitionLayoutState,
  TransitionLayoutMeta,
} from "./types/layout.js";

// StatusBar theming
export { STATUS_BAR_PRESETS, resolveStatusBarTheme } from "./types/statusbar-theme.js";
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
  LockEvent,
  UnlockEvent,
  CloseAppEvent,
  GoHomeEvent,
  CallAnsweredEvent,
  CallEndedEvent,
  OpenAppPayload,
  SetBadgePayload,
  SetDynamicIslandPayload,
  SetScreenRecordingPayload,
  SetScreenRecordingEvent,
  IncomingCallPayload,
  BackgroundAppPayload,
  // Voice runtime event types
  VoiceEventType,
  VoicePlaySegmentEvent,
  VoiceStopEvent,
  VoiceRuntimeEvent,
  isRuntimeVoiceEvent,
} from "./types/runtime-event.js";

export type {
  CinematicSubjectProjection,
  CinematicSubjectProvider,
} from "./types/cinematic-subject.js";
