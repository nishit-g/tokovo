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
  resolveAnchorWithFallback,
} from "@tokovo/device-camera";

// Core imports for world/layout types
import type {
  WorldState,
  EventIndex,
  CameraTransform,
  AnchorProviderContext,
} from "@tokovo/core";
import { DEFAULT_TRANSFORM } from "@tokovo/core";

import { LayoutEngineOutput } from "./useLayoutEngine.js";
import { useRendererRegistries } from "../RegistryContext.js";

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

  /** Composition FPS for deterministic effect timing */
  fps?: number;

  /**
   * If true, the renderer must not apply any camera transforms.
   * Used in multi-device layouts where only the active device should be camera-driven.
   */
  disabled?: boolean;
  debug?: boolean;
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

  /** Debug telemetry for current frame */
  debugInfo?: {
    activeEffectType?: string;
    activeEffectId?: string;
    requestedAnchor?: string;
    resolvedAnchor?: string;
    fallbackUsed: boolean;
    resolvedRect?: { x: number; y: number; width: number; height: number };
    warnings: string[];
    trackDiagnostics?: {
      deadZonePx: number;
      maxVelocityPxPerSec: number;
      predictiveLookaheadFrames: number;
      deltaX: number;
      deltaY: number;
      adjustedDeltaX: number;
      adjustedDeltaY: number;
      maxPerFrameX: number;
      maxPerFrameY: number;
      deadZoneActiveX: boolean;
      deadZoneActiveY: boolean;
      velocityClampedX: boolean;
      velocityClampedY: boolean;
    };
    anchors?: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >;
    effectTimeline: Array<{
      id: string;
      type: string;
      startFrame: number;
      endFrame: number;
      anchorId?: string;
    }>;
  };
}

// =============================================================================
// MAIN HOOK
// =============================================================================

type CameraEffect = Parameters<typeof processActiveEffects>[1][number];

export function useCameraEngine(input: CameraEngineInput): CameraEngineOutput {
  const {
    world,
    t,
    layoutOutput,
    eventIndex,
    disabled,
    fps = 30,
    debug,
  } = input;
  const registries = useRendererRegistries();

  return useMemo(() => {
    const { appId, profile, layout, deviceId } = layoutOutput;

    const viewport = {
      width: profile.dimensions.width,
      height: profile.dimensions.height,
    };

    if (disabled) {
      const transform = { ...DEFAULT_TRANSFORM };
      return {
        transform,
        cameraStyle: buildCameraCSS(transform, viewport),
        deviceStyle: buildDeviceCSS(layout),
        ...(debug
          ? {
            debugInfo: {
              fallbackUsed: false,
              warnings: ["camera_disabled"],
              effectTimeline: [],
            },
          }
          : {}),
      };
    }

    // =====================================================================
    // 1. GET EFFECTS FROM STATE (flat CameraEffect[] - no wrapper)
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

    const hasEffects = effects.length > 0;

    // Fast path: no active effects and debug is disabled.
    if (!hasEffects && !debug) {
      const transform = { ...DEFAULT_TRANSFORM };
      return {
        transform,
        cameraStyle: buildCameraCSS(transform, viewport),
        deviceStyle: buildDeviceCSS(layout),
      };
    }

    // =====================================================================
    // 2. GET ANCHOR SNAPSHOT
    // =====================================================================
    let anchorSnapshot: AnchorSnapshot | undefined;
    if (hasEffects || debug) {
      const anchorContext: AnchorProviderContext = {
        getDeviceProfile: (profileId?: string) => {
          if (!profileId) return undefined;
          return (
            registries.devices.devices.get(profileId) ??
            registries.devices.devices.get("iphone16")
          );
        },
        getDeviceShell: (profileId?: string) => {
          if (!profileId) return undefined;
          return registries.devices.shells.get(profileId);
        },
      };

      if (appId) {
        anchorSnapshot = getAnchorsForApp(
          registries.plugins.anchors,
          appId,
          world,
          layout,
          deviceId,
          anchorContext,
        );
      } else {
        // Lockscreen / homescreen still need device-level anchors for camera effects.
        anchorSnapshot = getAnchorsForApp(
          registries.plugins.anchors,
          "app_device",
          world,
          layout,
          deviceId,
          anchorContext,
        );
      }
    }

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
      registries.plugins.anchors,
      fps,
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

    if (!debug) {
      return {
        transform,
        cameraStyle,
        deviceStyle,
        directorSkipped,
      };
    }

    const activeAnchorEffect = effects
      .filter(
        (effect) =>
          (effect.type === "focus" || effect.type === "track") &&
          t >= effect.startFrame &&
          t < effect.endFrame,
      )
      .sort((a, b) => b.startFrame - a.startFrame)[0] as
      | (CameraEffect & { anchorId?: string })
      | undefined;

    const effectTimeline = effects
      .map((effect) => ({
        id: (effect as { id?: string }).id ?? `${effect.type}_${effect.startFrame}`,
        type: effect.type,
        startFrame: effect.startFrame,
        endFrame: effect.endFrame,
        anchorId: (effect as { anchorId?: string }).anchorId,
      }))
      .sort((a, b) => a.startFrame - b.startFrame);

    let debugInfo: CameraEngineOutput["debugInfo"] = {
      activeEffectType: activeAnchorEffect?.type,
      activeEffectId: (activeAnchorEffect as { id?: string } | undefined)?.id,
      requestedAnchor: activeAnchorEffect?.anchorId,
      fallbackUsed: false,
      warnings: [],
      effectTimeline,
      anchors: anchorSnapshot?.anchors,
    };

    if (
      activeAnchorEffect?.anchorId &&
      anchorSnapshot &&
      anchorSnapshot.anchors &&
      viewport
    ) {
      const resolved = resolveAnchorWithFallback(
        activeAnchorEffect.anchorId,
        anchorSnapshot.anchors,
        viewport,
      );

      const warnings: string[] = [];
      if (resolved.isFallback) {
        warnings.push("fallback_used");
      }

      let trackDiagnostics: NonNullable<
        CameraEngineOutput["debugInfo"]
      >["trackDiagnostics"];
      if (activeAnchorEffect.type === "track") {
        const track = activeAnchorEffect as CameraEffect & {
          deadZonePx?: number;
          maxVelocityPxPerSec?: number;
          predictiveLookaheadFrames?: number;
        };
        const deadZonePx = Math.max(0, track.deadZonePx ?? 14);
        const maxVelocityPxPerSec = Math.max(60, track.maxVelocityPxPerSec ?? 720);
        const predictiveLookaheadFrames = Math.max(
          0,
          track.predictiveLookaheadFrames ?? 0,
        );
        const predictiveFactor = Math.min(0.35, predictiveLookaheadFrames / fps);

        const targetOriginX =
          resolved.rect.x / viewport.width + resolved.rect.width / viewport.width / 2;
        const targetOriginY =
          resolved.rect.y / viewport.height + resolved.rect.height / viewport.height / 2;

        const predictedOriginX =
          targetOriginX + (targetOriginX - transform.originX) * predictiveFactor;
        const predictedOriginY =
          targetOriginY + (targetOriginY - transform.originY) * predictiveFactor;

        const deltaX = predictedOriginX - transform.originX;
        const deltaY = predictedOriginY - transform.originY;
        const deadZoneX = deadZonePx / viewport.width;
        const deadZoneY = deadZonePx / viewport.height;
        const adjustedDeltaX = Math.abs(deltaX) <= deadZoneX ? 0 : deltaX;
        const adjustedDeltaY = Math.abs(deltaY) <= deadZoneY ? 0 : deltaY;
        const maxPerFrameX = (maxVelocityPxPerSec / viewport.width) / fps;
        const maxPerFrameY = (maxVelocityPxPerSec / viewport.height) / fps;
        const velocityClampedX = Math.abs(adjustedDeltaX) > maxPerFrameX;
        const velocityClampedY = Math.abs(adjustedDeltaY) > maxPerFrameY;
        const deadZoneActiveX = adjustedDeltaX === 0 && deltaX !== 0;
        const deadZoneActiveY = adjustedDeltaY === 0 && deltaY !== 0;

        if (deadZoneActiveX || deadZoneActiveY) {
          warnings.push("dead_zone_active");
        }
        if (velocityClampedX || velocityClampedY) {
          warnings.push("velocity_clamped");
        }

        trackDiagnostics = {
          deadZonePx,
          maxVelocityPxPerSec,
          predictiveLookaheadFrames,
          deltaX,
          deltaY,
          adjustedDeltaX,
          adjustedDeltaY,
          maxPerFrameX,
          maxPerFrameY,
          deadZoneActiveX,
          deadZoneActiveY,
          velocityClampedX,
          velocityClampedY,
        };
      }

      debugInfo = {
        activeEffectType: activeAnchorEffect.type,
        activeEffectId: (activeAnchorEffect as { id?: string }).id,
        requestedAnchor: activeAnchorEffect.anchorId,
        resolvedAnchor: resolved.anchor,
        fallbackUsed: resolved.isFallback,
        resolvedRect: resolved.rect,
        warnings,
        trackDiagnostics,
        effectTimeline,
        anchors: anchorSnapshot.anchors,
      };
    } else if (activeAnchorEffect?.anchorId) {
      debugInfo.warnings.push("anchor_snapshot_missing");
    }

    return {
      transform,
      cameraStyle,
      deviceStyle,
      directorSkipped,
      anchorSnapshot,
      debugInfo,
    };
  }, [world, t, layoutOutput, eventIndex, registries, fps, debug]);
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
