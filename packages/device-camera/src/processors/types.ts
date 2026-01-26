/**
 * Effect Processor Types
 *
 * Interface for camera effect processors.
 * Each processor handles one effect type.
 *
 * @module device-camera/processors
 */

import type { CameraEffect, CameraEffectType } from "../types";
import type { CameraTransform } from "@tokovo/core";

// =============================================================================
// PROCESSOR CONTEXT
// =============================================================================

export interface EffectProcessorContext {
  /** Current frame number */
  t: number;

  /** The effect to process */
  effect: CameraEffect;

  /** Current transform state */
  transform: CameraTransform;

  /** Resolved anchors (for focus/track) */
  anchorSnapshot?: {
    anchors: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >;
    deviceId: string;
    appId: string;
  };

  /** Viewport dimensions */
  viewport?: {
    width: number;
    height: number;
  };
}

// =============================================================================
// PROCESSOR INTERFACE
// =============================================================================

export interface EffectProcessor {
  /** Effect type this processor handles */
  type: CameraEffectType;

  /**
   * Process the effect and return updated transform.
   * MUST be a pure function.
   */
  process(ctx: EffectProcessorContext): CameraTransform;
}
