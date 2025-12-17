/**
 * World State Types - Top-level state and touch
 * 
 * @description WorldState and TouchState definitions.
 */

import type { DeviceId, DeviceState } from "./device";
import type { CameraState } from "./camera";
import type { AudioState, VideoConfig } from "./audio";

// =============================================================================
// TOUCH STATE
// =============================================================================

export interface TouchState {
    id: string;
    x: number;
    y: number;
    startedAt: number;
    type: "tap" | "long_press" | "drag";
    endX?: number;
    endY?: number;
}

// =============================================================================
// WORLD STATE
// =============================================================================

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;

    // App-specific data - apps cast to their own types
    conversations: Record<string, unknown>;
    appState: Record<string, unknown>;

    // Engine primitives
    camera: CameraState;
    audio: AudioState;
    config?: VideoConfig;

    // Active touch points
    touches?: TouchState[];
}
