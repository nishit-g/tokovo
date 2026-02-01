/**
 * TrackEpisodeIR - Intermediate representation from DSL build()
 *
 * This is what ep.build() returns.
 * It contains devices, tracks, markers, and director config.
 * prepareEpisode() transforms this into CompiledEpisode.
 */

import type { TrackEvent } from "./track-event";

// =============================================================================
// DEVICE CONFIG
// =============================================================================

export interface Message {
  from: string;
  text?: string;
  image?: string;
  video?: string;
  voice?: string;
  timestamp?: number; // Negative = before episode start
}

export interface ConversationConfig {
  id: string;
  name: string;
  avatar?: string;
  type?: "dm" | "group";
  participants?: string[];
  /** Pre-existing messages in the conversation (chat history) */
  initialMessages?: Message[];
  unreadCount?: number;
  isMuted?: boolean;
  isPinned?: boolean;
  hasStatus?: boolean;
}

export interface OSConfig {
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
  conversations?: ConversationConfig[];
  os?: OSConfig;
  /** UI theme/strategy to use (e.g., "whatsapp-ghibli") */
  theme?: string;
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
// TRACK EPISODE IR
// =============================================================================

/**
 * TrackEpisodeIR - The output of ep.build()
 *
 * This is the intermediate representation that the DSL produces.
 * It gets passed to prepareEpisode() along with plugins to create CompiledEpisode.
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

  /** Device configurations */
  devices: DeviceConfig[];

  /** All track events (sorted by frame + declaration order) */
  events: TrackEvent[];

  /** Point markers for debugging */
  markers: Marker[];

  /** Section markers for debugging */
  sections: Section[];

  /** Optional director style for auto-camera */
  director?: DirectorStyle;

  /** Voice configuration for narration/dialogue */
  voice?: VoiceConfig;
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
}
