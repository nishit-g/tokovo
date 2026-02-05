/**
 * Camera Lowering Handler - DSL → Runtime event transformation
 *
 * Transforms camera DSL IR events into runtime timeline operations.
 *
 * @module device-camera/lowering
 */

// =============================================================================
// TYPES
// =============================================================================

import type { CameraTrackEvent } from "@tokovo/ir";

interface RuntimeEvent {
  at: number;
  kind: "CAMERA";
  type: string;
  [key: string]: unknown;
}

interface LoweringContext {
  fps: number;
}

interface TrackPresetDefaults {
  scale: number;
  smoothing: number;
  deadZonePx: number;
  maxVelocityPxPerSec: number;
  predictiveLookaheadFrames: number;
}

const TRACK_PRESETS: Record<string, TrackPresetDefaults> = {
  cinematic: {
    scale: 1.1,
    smoothing: 0.2,
    deadZonePx: 12,
    maxVelocityPxPerSec: 840,
    predictiveLookaheadFrames: 2,
  },
  drama: {
    scale: 1.17,
    smoothing: 0.16,
    deadZonePx: 10,
    maxVelocityPxPerSec: 1080,
    predictiveLookaheadFrames: 3,
  },
  "fast-beat": {
    scale: 1.12,
    smoothing: 0.14,
    deadZonePx: 9,
    maxVelocityPxPerSec: 1260,
    predictiveLookaheadFrames: 4,
  },
  calm: {
    scale: 1.06,
    smoothing: 0.24,
    deadZonePx: 14,
    maxVelocityPxPerSec: 680,
    predictiveLookaheadFrames: 1,
  },
};

// =============================================================================
// LOWERING HANDLER
// =============================================================================

/**
 * Lower camera DSL events to runtime events
 *
 * Mappings:
 * - SET → CUT (instant camera change)
 * - ANIMATE_START → ZOOM (animated zoom)
 * - SHAKE_START → SHAKE (screen shake)
 * - FOCUS → focus (semantic anchor focus)
 * - TRACK_START → track (continuous follow)
 * - RESET → RESET (return to neutral)
 */
export function cameraV2Lowering(
  event: CameraTrackEvent,
  _ctx: LoweringContext,
): RuntimeEvent[] {
  const { _declarationOrder, payload, ...rest } = event as CameraTrackEvent & {
    _declarationOrder?: number;
    payload?: Record<string, unknown>;
  };

  // Merge payload into top level for reducer
  const baseEvent = {
    ...rest,
    ...(payload || {}),
    at: event.at,
    kind: "CAMERA" as const,
  };

  switch (event.type) {
    // =================================================================
    // SET → CUT (instant)
    // =================================================================
    case "SET":
      return [
        {
          ...baseEvent,
          type: "CUT",
        },
      ];

    // =================================================================
    // ANIMATE_START → ZOOM
    // =================================================================
    case "ANIMATE_START":
      return [
        {
          ...baseEvent,
          type: "zoom",
          scale: payload?.scale ?? 1,
          translateX: payload?.x ?? 0,
          translateY: payload?.y ?? 0,
          originX: payload?.originX,
          originY: payload?.originY,
          easing: payload?.easing ?? "ease-out",
        },
      ];
    case "ANIMATE_END":
      return [];

    // =================================================================
    // SHAKE_START → SHAKE
    // =================================================================
    case "SHAKE_START":
      return [
        {
          ...baseEvent,
          type: "shake",
          intensity: (payload?.intensityX as number) ?? 5,
          intensityX: payload?.intensityX,
          intensityY: payload?.intensityY,
          frequency: payload?.frequency ?? 15,
          decay: payload?.decay ?? 0.8,
        },
      ];
    case "SHAKE_END":
      return [];

    // =================================================================
    // FOCUS → focus (processor registered as 'focus')
    // =================================================================
    case "FOCUS":
      return [
        {
          ...baseEvent,
          type: "focus",
          anchorId: payload?.anchorId ?? payload?.anchor ?? "device",
          scale: payload?.scale,
          preset: payload?.preset,
        },
      ];

    // =================================================================
    // TRACK_START → track (processor registered as 'track')
    // =================================================================
    case "TRACK_START":
      const presetName = (payload?.preset as string | undefined) ?? "cinematic";
      const preset = TRACK_PRESETS[presetName] ?? TRACK_PRESETS.cinematic;
      return [
        {
          ...baseEvent,
          type: "track",
          anchorId: payload?.anchorId ?? payload?.anchor ?? "device",
          preset: presetName,
          scale: payload?.scale ?? preset.scale,
          smoothing: payload?.smoothing ?? preset.smoothing,
          deadZonePx: payload?.deadZonePx ?? preset.deadZonePx,
          maxVelocityPxPerSec:
            payload?.maxVelocityPxPerSec ?? preset.maxVelocityPxPerSec,
          predictiveLookaheadFrames:
            payload?.predictiveLookaheadFrames ??
            preset.predictiveLookaheadFrames,
        },
      ];
    case "TRACK_END":
      return [];

    // =================================================================
    // RESET → RESET
    // =================================================================
    case "RESET":
      return [
        {
          ...baseEvent,
          type: "reset",
          spring: payload?.spring,
          easing: payload?.easing ?? "ease-out",
        },
      ];

    // =================================================================
    // PUNCH_ZOOM → punch-zoom
    // =================================================================
    case "PUNCH_ZOOM":
      return [
        {
          ...baseEvent,
          type: "punch-zoom",
          intensity: payload?.intensity ?? 0.15,
          direction: payload?.direction ?? "in",
          spring: payload?.spring ?? "punch",
        },
      ];

    // =================================================================
    // DUTCH_TILT → dutch-tilt
    // =================================================================
    case "DUTCH_TILT":
      return [
        {
          ...baseEvent,
          type: "dutch-tilt",
          angle: payload?.angle ?? 5,
          spring: payload?.spring ?? "dramatic",
        },
      ];

    // =================================================================
    // FLASH → flash
    // =================================================================
    case "FLASH":
      return [
        {
          ...baseEvent,
          type: "flash",
          color: payload?.color ?? "white",
          intensity: payload?.intensity ?? 1,
        },
      ];

    // =================================================================
    // WHIP_PAN → whip-pan
    // =================================================================
    case "WHIP_PAN":
      return [
        {
          ...baseEvent,
          type: "whip-pan",
          direction: payload?.direction ?? "left",
          blur: payload?.blur ?? 20,
        },
      ];

    default:
      throw new Error(`[cameraV2Lowering] Unknown CAMERA event type: ${event.type}`);
  }
}

// =============================================================================
// EVENT TYPES FOR REGISTRATION
// =============================================================================

export const CAMERA_EVENT_TYPES = [
  // DSL types
  "SET",
  "ANIMATE_START",
  "ANIMATE_END",
  "SHAKE_START",
  "SHAKE_END",
  "FOCUS",
  "TRACK_START",
  "TRACK_END",
  "RESET",
  "PUNCH_ZOOM",
  "DUTCH_TILT",
  "FLASH",
  "WHIP_PAN",
] as const;
