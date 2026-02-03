/**
 * CompiledEpisode - The ONLY input to the runtime
 *
 * This is the single canonical artifact that prepareEpisode() produces.
 * The renderer/engine should NEVER accept raw events or SceneIR.
 *
 * @see docs/FUCKING_MESS.md Section 5
 */

import { RuntimeEvent } from "./runtime-event";

// =============================================================================
// ASSET MANIFEST
// =============================================================================

export interface AssetManifest {
  sounds: Record<string, string>; // soundId -> file path
  images?: Record<string, string>; // imageId -> file path
  fonts?: Record<string, string>; // fontId -> file path
  icons?: Record<string, string>; // iconId -> file path
}

// =============================================================================
// LAYOUT CONFIG
// =============================================================================

export type LayoutMode = "SINGLE" | "SPLIT" | "GRID";

export interface DeviceRegion {
  deviceId: string;
  region: {
    x: number; // 0-1 normalized
    y: number; // 0-1 normalized
    width: number; // 0-1 normalized
    height: number; // 0-1 normalized
  };
}

export interface EpisodeLayoutConfig {
  mode: LayoutMode;
  devices: DeviceRegion[];
  primaryDeviceId?: string;
}

// =============================================================================
// DEBUG INFO
// =============================================================================

export interface DebugInfo {
  buildTimestamp?: number;
  buildVersion?: string;
  sourceEpisodeId?: string;
  sourceDslFile?: string;
}

// =============================================================================
// COMPILED EPISODE
// =============================================================================

/**
 * The ONLY runtime input - everything needed to render an episode
 */
export interface CompiledEpisode {
  // === Metadata ===
  id: string;
  title?: string;
  description?: string;

  // === Video Config ===
  durationInFrames: number;
  fps: number;
  width?: number;
  height?: number;

  // === Runtime Data ===
  /** Derived from SceneIR, NOT hand-crafted */
  initialWorld: import("../types").WorldState;

  /** All events sorted by `at` */
  events: RuntimeEvent[];

  /** Pre-computed event index for O(1) frame lookups */
  eventIndex?: import("../utils/event-utils").EventIndex;

  /** Pre-computed keyframed index for incremental replay */
  keyframedEventIndex?: import("../utils/event-utils").KeyframedEventIndex;

  // === Assets ===
  /** Validated at compile time */
  assets: AssetManifest;

  // === Layout ===
  /** Multi-device layout configuration */
  layout?: EpisodeLayoutConfig;

  // === Debug ===
  debug?: DebugInfo;
}

// =============================================================================
// PREPARE OPTIONS
// =============================================================================

export interface PrepareOptions {
  /** Strict mode - fail fast on any error (default: true in render, false in preview) */
  strict?: boolean;

  /** Mode - affects error handling */
  mode?: "preview" | "render";

  /** Validate assets exist */
  validateAssets?: boolean;

  /** Include debug info */
  includeDebug?: boolean;

  /** Episode overrides */
  overrides?: {
    fps?: number;
    durationInFrames?: number;
  };
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isCompiledEpisode(obj: unknown): obj is CompiledEpisode {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "durationInFrames" in obj &&
    "fps" in obj &&
    "initialWorld" in obj &&
    "events" in obj &&
    Array.isArray((obj as CompiledEpisode).events)
  );
}
