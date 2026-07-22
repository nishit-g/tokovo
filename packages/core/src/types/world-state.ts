/**
 * World State Types - Top-level state and touch
 *
 * @description WorldState and TouchState definitions.
 */

import type { DeviceId, DeviceState } from "./device.js";
import type { AudioState, VideoConfig } from "./audio.js";

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

export type AppInstanceId = `${DeviceId}:${string}`;

export function appInstanceId(deviceId: DeviceId, appId: string): AppInstanceId {
  if (!deviceId || !appId) {
    throw new Error("APP_INSTANCE_ID_INVALID: deviceId and appId are required");
  }
  if (deviceId.includes(":") || appId.includes(":")) {
    throw new Error(
      `APP_INSTANCE_ID_INVALID: deviceId and appId cannot contain ":" (${deviceId}, ${appId})`,
    );
  }
  return `${deviceId}:${appId}`;
}

export function parseAppInstanceId(id: AppInstanceId): {
  deviceId: DeviceId;
  appId: string;
} {
  const separator = id.indexOf(":");
  if (separator <= 0 || separator === id.length - 1 || id.indexOf(":", separator + 1) >= 0) {
    throw new Error(`APP_INSTANCE_ID_INVALID: malformed app instance id "${id}"`);
  }
  return { deviceId: id.slice(0, separator), appId: id.slice(separator + 1) };
}

// =============================================================================
// WORLD STATE
// =============================================================================

export interface WorldState {
  devices: Record<DeviceId, DeviceState>;

  /**
   * Canonical app state, keyed by stable device/app instance identity.
   * The shape is identical for single-device and multi-device episodes.
   */
  appInstances: Record<AppInstanceId, unknown>;

  /**
   * State owned by registered non-app capabilities such as editorial overlays.
   * Capability packages namespace their entries and register exact reducers.
   */
  capabilityState: Record<string, unknown>;

  // Engine primitives
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
