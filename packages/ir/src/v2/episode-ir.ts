/**
 * TrackEpisodeIR - Intermediate representation from DSL build()
 *
 * This is what ep.build() returns.
 * It contains devices, tracks, markers, and director config.
 * prepareTrackEpisode() transforms this into a prepared runtime episode.
 */

import type { InputSessionIR } from "./input-session.js";
import type {
  NotificationIntentIR,
  NotificationInteractionIR,
} from "./notification.js";

import type { TrackEvent } from "./track-event.js";

// =============================================================================
// DEVICE + APP BOOTSTRAP CONFIG
// =============================================================================

export interface OSConfig {
  /** BCP 47 locale used by OS-owned surfaces. */
  locale?: string;
  /** OS-owned surface appearance, independent from app appearance. */
  appearance?: "light" | "dark";
  /** Explicit 12/24-hour convention. Locale rules apply when omitted. */
  hourCycle?: "h12" | "h24";
  /** Lockscreen wallpaper asset path, URL, data URI, or CSS background. */
  lockScreenWallpaper?: string;
  time?: Date | number;
  battery?: number;
  charging?: boolean;
  network?: "wifi" | "5G" | "4G" | "3G" | "none";
  strength?: number;
  dnd?: boolean;
}

export interface DeviceConfig {
  id: string;
  profile: string;
  app: string;
  os?: OSConfig;
  /** UI theme/strategy to use (e.g., "whatsapp-storybook") */
  theme?: string;
  /** App color appearance, independent of the selected theme variant. */
  appearance?: "light" | "dark";
  /** Start the device locked at frame 0 */
  locked?: boolean;
  /** Apps installed on the home screen (deterministic icon layout) */
  installedApps?: string[];
  /** Optional home screen layout override */
  homeScreen?: {
    preset?: "ios-default" | "android-default";
    dock?: string[];
    pages?: string[][];
    wallpaper?: string;
  };
  /** Start with screen recording indicator enabled */
  screenRecording?: boolean;
}

export interface AppSnapshotEntry<AppId extends string = string> {
  appId: AppId;
  deviceId: string;
  snapshotVersion: number;
  snapshot: unknown;
}

export interface AppInitialViewEntry<AppId extends string = string> {
  appId: AppId;
  deviceId: string;
  viewVersion: number;
  view: unknown;
}

// =============================================================================
// MARKER/SECTION
// =============================================================================

export interface Marker {
  id: string;
  frame: number;
}

export interface Section {
  id: string;
  startFrame: number;
  endFrame: number;
}

// =============================================================================
// VOICE CONFIG
// =============================================================================

export interface VoiceScriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  durationMs?: number;
  speaker: string;
  text?: string;
}

export interface VoiceScriptDefinition<T extends string = string> {
  id: string;
  manifestPath: string;
  audioPath: string;
  durationMs: number;
  segments: Record<T, VoiceScriptSegment>;
  start(segmentId: T, fps?: number): number;
  end(segmentId: T, fps?: number): number;
  duration(segmentId: T, fps?: number): number;
}

export interface VoiceScheduleItem<T extends string = string> {
  segmentId: T;
  at: number;
  volume?: number;
  speed?: number;
}

export interface VoiceSegmentSchedule {
  segmentId: string;
  at: number;
  volume?: number;
  speed?: number;
}

export interface VoiceConfig {
  /** Path to voice manifest JSON (relative to public/) - optional when segments embedded */
  manifestPath?: string;
  /** Path to audio file (relative to public/) */
  audioPath: string;
  /** Use per-segment control with individual timing */
  usePerSegmentControl?: boolean;
  /** Schedule for when each segment plays (only used with usePerSegmentControl) */
  segmentSchedule?: VoiceSegmentSchedule[];
  /** Start frame for simple voice playback */
  startFrame?: number;
  /** Volume level (0-1) */
  volume?: number;
  /** Embedded segment data (eliminates runtime manifest fetch) */
  segments?: VoiceScriptSegment[];
  /** Total duration in ms (when segments embedded) */
  durationMs?: number;
}

// =============================================================================
// DIRECTOR STYLE
// =============================================================================

export type DirectorStyle = "ViralDramaV1" | "Cinematic" | "Documentary";

// =============================================================================
// BACKGROUND CONFIG (from @tokovo/background)
// =============================================================================

/**
 * Background configuration for the episode.
 * Can be a preset ID string or a full config object.
 */
export type BackgroundConfigIR =
  | string // Preset ID like "ambient-night"
  | {
    type: "solid" | "gradient" | "image" | "video" | "particles" | "ambient";
    color?: string;
    gradient?: string;
    src?: string;
    preset?: string;
    blur?: number;
    opacity?: number;
    scale?: number;
    position?: "cover" | "contain" | "fill" | "center";
    loop?: boolean;
    playbackRate?: number;
  };

// =============================================================================
// HAND PERFORMANCE CONFIG
// =============================================================================

export type HandTypingMode = "oneThumb" | "twoThumbs";
export type HandMotionPreset = "steady" | "walking" | "nervous";
export type Handedness = "left" | "right";

export interface HandRigAssetsIR {
  /** Rear grip/palm plate rendered behind the simulated device. */
  underlaySrc: string;
  /** Foreground left-thumb cutout used for key, tap, and swipe motion. */
  leftThumbSrc: string;
  /** Foreground right-thumb cutout used for key, tap, and swipe motion. */
  rightThumbSrc: string;
}

export interface HandPerformanceStageIR {
  /** Multiplier applied after the normal fit-to-composition device scale. */
  deviceScale?: number;
  /** Stage offset in composition pixels after scaling. */
  offsetX?: number;
  offsetY?: number;
  /** Generated grip-plate width as a multiple of the device width. */
  gripWidthRatio?: number;
  /** Grip-plate top as a multiple of the device height. */
  gripTopRatio?: number;
  /** Foreground thumb width as a multiple of the device width. */
  thumbWidthRatio?: number;
}

export type HandPerformanceCueIR =
  | {
      kind: "hold";
      startFrame: number;
      endFrame: number;
      motion: HandMotionPreset;
      intensity?: number;
    }
  | {
      kind: "type";
      startFrame: number;
      endFrame: number;
      mode: HandTypingMode;
      intensity?: number;
    }
  | {
      kind: "tap";
      startFrame: number;
      endFrame: number;
      target: string;
      hand?: Handedness;
      intensity?: number;
    }
  | {
      kind: "swipe";
      startFrame: number;
      endFrame: number;
      direction: "up" | "down" | "left" | "right";
      hand?: Handedness;
      intensity?: number;
    };

/**
 * Visual direction for a deterministic, device-attached hand rig.
 *
 * Authored cues plus the prepared input program are sufficient to derive the
 * complete pose at any frame, so this does not introduce hidden timers.
 */
export interface HandPerformanceIR {
  deviceId: string;
  rigId: string;
  assets: HandRigAssetsIR;
  defaultMotion?: HandMotionPreset;
  defaultTypingMode?: HandTypingMode;
  motionIntensity?: number;
  stage?: HandPerformanceStageIR;
  cues: HandPerformanceCueIR[];
}

// =============================================================================
// TRACK EPISODE IR
// =============================================================================

/**
 * TrackEpisodeIR - The output of ep.build()
 *
 * This is the intermediate representation that the DSL produces.
 * It gets passed to prepareTrackEpisode() along with plugins to create runtime output.
 */
export interface TrackEpisodeIR {
  /** Episode ID */
  id: string;

  /** Frames per second */
  fps: number;

  /** Total duration in frames */
  durationInFrames: number;

  /** Episode title (metadata) */
  title?: string;

  /** Episode description (metadata) */
  description?: string;

  /** Deterministic seed for any randomized builders */
  seed?: number | string;

  /** Device configurations */
  devices: DeviceConfig[];

  /** Plugin-owned app snapshots to hydrate before frame 0 */
  appSnapshots: AppSnapshotEntry[];

  /** Explicit plugin-owned initial views at frame 0 */
  initialViews: AppInitialViewEntry[];

  /** All track events (sorted by frame + declaration order) */
  events: TrackEvent[];

  /** Immutable, field-scoped input sessions compiled for random-frame replay. */
  inputSessions?: InputSessionIR[];

  /** Semantic notification delivery requests. Never lowered to device-state events. */
  notificationIntents?: NotificationIntentIR[];

  /** Authored notification actions and notification-center lifecycle operations. */
  notificationInteractions?: NotificationInteractionIR[];

  /** Point markers for debugging */
  markers: Marker[];

  /** Section markers for debugging */
  sections: Section[];

  /** Optional director style for auto-camera */
  director?: DirectorStyle;

  /** Voice configuration for narration/dialogue */
  voice?: VoiceConfig;

  /** Background configuration for the video canvas */
  background?: BackgroundConfigIR;

  /** Optional physical hand rigs composited around authored devices. */
  handPerformances?: HandPerformanceIR[];
}

// =============================================================================
// EPISODE CONFIG
// =============================================================================

/**
 * Config passed to episode() function
 */
export interface TrackEpisodeConfig {
  fps: number;
  duration: string | number;
  title?: string;
  description?: string;
  /** Deterministic seed for any randomized builders */
  seed?: number | string;
}
