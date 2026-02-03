/**
 * Camera Engine - Frame-based transform computation
 *
 * Pure computation layer that processes camera effects each frame.
 * Compatible with Remotion's frame-by-frame rendering.
 *
 * ARCHITECTURE:
 * 1. Get effects from world.camera.activeEffects (typed)
 * 2. Get anchors from registered providers
 * 3. Process all effects through processor registry
 * 4. Build CSS styles
 *
 * @module device-camera
 */

import { useMemo } from "react";
import type { CSSProperties } from "react";

// Import everything from device-camera
import {
  // Processors
  processActiveEffects,

  // Anchors
  AnchorSnapshot,
  getAnchorsForApp,
} from "@tokovo/device-camera";

// Core imports for world/layout types
import type { WorldState, EventIndex, CameraTransform } from "@tokovo/core";
import { DEFAULT_TRANSFORM } from "@tokovo/core";

import { LayoutEngineOutput } from "./useLayoutEngine";
import { useRendererRegistries } from "../RegistryContext";

// =============================================================================
// INPUT / OUTPUT TYPES
// =============================================================================

export interface CameraEngineInput {
  /** Current world state */
  world: WorldState;

  /** Current frame */
  t: number;

  /** Layout engine output */
  layoutOutput: LayoutEngineOutput;

  /** Event index for signal extraction */
  eventIndex?: EventIndex;
}

export interface CameraEngineOutput {
  /** Final computed transform */
  transform: CameraTransform;

  /** CSS styles for camera wrapper */
  cameraStyle: CSSProperties;

  /** CSS styles for device wrapper */
  deviceStyle: CSSProperties;

  /** Debug: why director was skipped */
  directorSkipped?: string;

  /** Anchor snapshot used this frame */
  anchorSnapshot?: AnchorSnapshot;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

type CameraEffect = Parameters<typeof processActiveEffects>[1][number];

export function useCameraEngine(input: CameraEngineInput): CameraEngineOutput {
  const { world, t, layoutOutput, eventIndex } = input;
  const registries = useRendererRegistries();

  return useMemo(() => {
    const { appId, profile, layout, deviceId } = layoutOutput;

    const viewport = {
      width: profile.dimensions.width,
      height: profile.dimensions.height,
    };

    // =====================================================================
    // 1. GET ANCHOR SNAPSHOT
    // =====================================================================
    let anchorSnapshot: AnchorSnapshot | undefined;
    if (appId) {
      anchorSnapshot = getAnchorsForApp(
        registries.anchors,
        appId,
        world,
        layout,
        deviceId,
      );
    }

    // =====================================================================
    // 2. GET EFFECTS FROM STATE (flat CameraEffect[] - no wrapper)
    // =====================================================================
    // Note: world.camera is BaseCameraState in core, but may be extended with activeEffects by device-camera
    const cameraWithEffects = world.camera as unknown as {
      activeEffects?: CameraEffect[];
    };
    const effects: CameraEffect[] = Array.isArray(
      cameraWithEffects.activeEffects,
    )
      ? cameraWithEffects.activeEffects
      : [];

    // =====================================================================
    // 3. PROCESS EFFECTS THROUGH REGISTRY
    // CRITICAL: Use DEFAULT_TRANSFORM as base, not previous frame state
    // Remotion renders frames in parallel, so useRef-based state is invalid
    // =====================================================================
    const transform = processActiveEffects(
      t,
      effects,
      DEFAULT_TRANSFORM, // CRITICAL: Pure computation, no inter-frame state
      anchorSnapshot,
      viewport,
      registries.anchors,
    );

    let directorSkipped: string | undefined;

    // NOTE: Decay smoothing removed - incompatible with Remotion parallel rendering
    // Camera snaps to neutral when no effects are active
    // For smooth decay, add a DECAY_TO_NEUTRAL effect with startFrame/endFrame

    // =====================================================================
    // 6. BUILD CSS STYLES
    // =====================================================================
    const cameraStyle = buildCameraCSS(transform, viewport);
    const deviceStyle = buildDeviceCSS(layout);

    return {
      transform,
      cameraStyle,
      deviceStyle,
      directorSkipped,
      anchorSnapshot,
    };
  }, [world, t, layoutOutput, eventIndex, registries]);
}

// =============================================================================
// CSS BUILDERS
// =============================================================================

function buildCameraCSS(
  transform: CameraTransform,
  viewport: { width: number; height: number },
): CSSProperties {
  const transformString = `
        translate(${transform.translateX + transform.shakeX}px, ${transform.translateY + transform.shakeY}px)
        scale(${transform.scale})
        rotate(${transform.rotation}deg)
    `
    .replace(/\s+/g, " ")
    .trim();

  return {
    width: viewport.width,
    height: viewport.height,
    transformOrigin: `${transform.originX * 100}% ${transform.originY * 100}%`,
    transform: transformString,
    transition: "none", // CRITICAL: No CSS transitions for Remotion
  };
}

function buildDeviceCSS(layout: unknown): CSSProperties {
  // Handle transition layouts with device transforms
  const transLayout = layout as {
    kind?: string;
    deviceScale?: number;
    deviceTranslateX?: number;
    deviceTranslateY?: number;
    deviceRotation?: number;
  };

  if (transLayout.kind !== "TRANSITION") {
    return {};
  }

  const {
    deviceScale = 1,
    deviceTranslateX = 0,
    deviceTranslateY = 0,
    deviceRotation = 0,
  } = transLayout;

  if (
    deviceScale === 1 &&
    deviceTranslateX === 0 &&
    deviceTranslateY === 0 &&
    deviceRotation === 0
  ) {
    return {};
  }

  return {
    transformOrigin: "center center",
    transform: `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`,
  };
}
