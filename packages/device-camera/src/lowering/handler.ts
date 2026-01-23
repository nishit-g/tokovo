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
 * - FOCUS → ANCHOR_FOCUS (semantic anchor focus)
 * - TRACK_START → ANCHOR_TRACK (continuous follow)
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
          type: "ZOOM",
          scale: payload?.scale ?? 1,
          translateX: payload?.x ?? 0,
          translateY: payload?.y ?? 0,
          originX: payload?.originX,
          originY: payload?.originY,
          easing: payload?.easing ?? "ease-out",
        },
      ];

    // =================================================================
    // SHAKE_START → SHAKE
    // =================================================================
    case "SHAKE_START":
      return [
        {
          ...baseEvent,
          type: "SHAKE",
          intensity: (payload?.intensityX as number) ?? 5,
          intensityX: payload?.intensityX,
          intensityY: payload?.intensityY,
          frequency: payload?.frequency ?? 15,
          decay: payload?.decay ?? 0.8,
        },
      ];

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
      return [
        {
          ...baseEvent,
          type: "track",
          anchorId: payload?.anchorId ?? payload?.anchor ?? "device",
          scale: payload?.scale ?? 1.05,
          smoothing: payload?.lag ?? 0.18,
        },
      ];

    // =================================================================
    // RESET → RESET
    // =================================================================
    case "RESET":
      return [
        {
          ...baseEvent,
          type: "RESET",
        },
      ];

    // =================================================================
    // Pass-through for already-runtime events
    // =================================================================
    case "ZOOM":
    case "SHAKE":
    case "ANCHOR_FOCUS":
    case "ANCHOR_TRACK":
    case "CUT":
      return [baseEvent];

    default:
      console.warn(`[cameraV2Lowering] Unknown event type: ${event.type}`);
      return [baseEvent];
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
  // Runtime types
  "ZOOM",
  "SHAKE",
  "ANCHOR_FOCUS",
  "ANCHOR_TRACK",
  "CUT",
] as const;
