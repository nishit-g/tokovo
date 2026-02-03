/**
 * World State Types - Top-level state and touch
 *
 * @description WorldState and TouchState definitions.
 */

import type { DeviceId, DeviceState } from "./device";
import type { BaseCameraState } from "./camera";
import type { AudioState, VideoConfig } from "./audio";

// =============================================================================
// APP STATE MAP - Extensible via module augmentation
// =============================================================================

/**
 * Plugin state registry. Plugins extend this via module augmentation:
 *
 * @example
 * declare module "@tokovo/core" {
 *   interface AppStateMap {
 *     app_whatsapp: WhatsAppState;
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppStateMap {
  // Plugins augment this interface
}

type AppStateKeys = keyof AppStateMap;
type HasAppStateKeys = AppStateKeys extends never ? false : true;

type ResolvedAppState = HasAppStateKeys extends true
  ? { [K in AppStateKeys]: AppStateMap[K] } & Record<string, unknown>
  : Record<string, unknown>;

// =============================================================================
// WORLD STATE
// =============================================================================

export interface WorldState {
  devices: Record<DeviceId, DeviceState>;

  /**
   * Per-app state buckets. Type-safe when plugins augment AppStateMap.
   */
  appState: ResolvedAppState;

  // Engine primitives
  camera: BaseCameraState;
  audio: AudioState;
  config?: VideoConfig;

  /** Active touch points for visualization */
  touches?: TouchState[];
}

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
