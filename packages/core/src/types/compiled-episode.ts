/**
 * CompiledEpisode - The ONLY input to the runtime
 *
 * This is the canonical artifact produced by prepareTrackEpisode().
 * The renderer/engine should NEVER accept raw events or SceneIR.
 *
 * @see docs/architecture/core-runtime.md
 */

import { RuntimeEvent } from "./runtime-event.js";

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
  /** Keyframe interval used when building keyframedEventIndex */
  keyframeInterval?: number;
  /** Signature for detecting event mismatches across caches */
  eventSignature?: string;
  /** Deterministic config used during preparation */
  config?: import("../config").TokovoConfigType;

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

  /** Deterministic config used to compute derived indexes */
  config?: import("../config").TokovoConfigType;

  /** Optional deterministic timestamp for debug metadata */
  debugTimestamp?: number;

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
