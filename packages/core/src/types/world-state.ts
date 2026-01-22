/**
 * World State Types - Top-level state and touch
 *
 * @description WorldState and TouchState definitions.
 */

import type { DeviceId, DeviceState } from "./device";
import type { CameraState } from "./camera";
import type { AudioState, VideoConfig } from "./audio";

// =============================================================================
// WORLD STATE
// =============================================================================

export interface WorldState {
  devices: Record<DeviceId, DeviceState>;

  /**
   * Per-app state buckets.
   * Each app manages its own state structure (including conversations).
   * Example: appState["app_whatsapp"] = { conversations: {...}, screen: "chat" }
   */
  appState: Record<string, unknown>;

  // Engine primitives
  camera: CameraState;
  audio: AudioState;
  config?: VideoConfig;
}
