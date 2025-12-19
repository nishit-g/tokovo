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
 * 4. Apply DirectorLite if no manual effects
 * 5. Build CSS styles
 * 
 * @module device-camera
 */

import { useMemo, useRef } from "react";
import type { CSSProperties } from "react";

// Import everything from device-camera
import {
    // Types
    CameraEffect,
    CameraTransform,
    DEFAULT_TRANSFORM,
    CameraState,

    // Processors
    processActiveEffects,

    // Anchors
    AnchorSnapshot,
    getAnchorsForApp,

    // Director-Lite
    deriveDirectorEffects,
    extractSignals,
} from "@tokovo/device-camera";

// Core imports for world/layout types
import type { WorldState, EventIndex } from "@tokovo/core";
import { getEventsInRange } from "@tokovo/core";

import { LayoutEngineOutput } from "./useLayoutEngine";

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

    /** Enable DirectorLite auto-camera */
    directorEnabled?: boolean;

    /** Debug mode for DirectorLite */
    directorDebug?: boolean;
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

export function useCameraEngine(input: CameraEngineInput): CameraEngineOutput {
    const {
        world,
        t,
        layoutOutput,
        eventIndex,
        directorEnabled = false,
        directorDebug = false,
    } = input;

    // Tracking state for smooth transitions
    const prevTransformRef = useRef<CameraTransform>(DEFAULT_TRANSFORM);

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
            anchorSnapshot = getAnchorsForApp(appId, world, layout, deviceId);
        }

        // =====================================================================
        // 2. GET EFFECTS FROM STATE (flat CameraEffect[] - no wrapper)
        // =====================================================================
        const effects: CameraEffect[] = world.camera?.activeEffects ?? [];

        // Filter to active manual effects
        const activeManualEffects = effects.filter(
            e => t >= e.startFrame && t < e.endFrame
        );

        // =====================================================================
        // 3. PROCESS EFFECTS THROUGH REGISTRY
        // =====================================================================
        let transform = processActiveEffects(
            t,
            effects,
            DEFAULT_TRANSFORM,
            anchorSnapshot,
            viewport
        );

        let directorSkipped: string | undefined;

        // =====================================================================
        // 4. DIRECTOR-LITE (if no manual effects active)
        // =====================================================================
        if (directorEnabled && activeManualEffects.length === 0 && eventIndex) {
            // Extract signals from recent events
            const windowStart = Math.max(0, t - 90);
            const windowEnd = t + 15;
            const eventsInWindow = getEventsInRange(eventIndex, windowStart, windowEnd);
            const signals = extractSignals(eventsInWindow, t, 90);

            // Derive camera effects from signals
            const directorResult = deriveDirectorEffects({
                t,
                signals,
                layoutModel: {
                    messageRects: {},
                    viewport,
                },
                seed: 42,
                debug: directorDebug,
                manualCameraEffects: effects,
            });

            if (directorResult.skipped) {
                directorSkipped = directorResult.skipped;
            }

            // Apply director effects
            if (!directorResult.skipped && directorResult.effects.length > 0) {
                for (const effect of directorResult.effects) {
                    // Apply based on category
                    if (effect.category === "framing" && effect.scale) {
                        const scaleAmount = effect.scale * effect.progress;
                        transform = {
                            ...transform,
                            scale: transform.scale * (1 + (scaleAmount - 1) * effect.progress),
                        };
                    }
                    if (effect.category === "shake" && effect.intensity) {
                        const shakeAmount = effect.intensity * (1 - effect.progress);
                        transform = {
                            ...transform,
                            shakeX: transform.shakeX + Math.sin(t * 0.5) * shakeAmount,
                            shakeY: transform.shakeY + Math.cos(t * 0.7) * shakeAmount,
                        };
                    }
                }
            }
        }

        // =====================================================================
        // 5. SMOOTH DECAY TO NEUTRAL (when no effects)
        // =====================================================================
        const hasActiveEffect = activeManualEffects.length > 0 ||
            (directorEnabled && !directorSkipped);

        if (!hasActiveEffect) {
            // Smoothly return to neutral
            const decayRate = 0.05;
            const prev = prevTransformRef.current;
            if (prev.scale !== 1 || prev.originX !== 0.5 || prev.originY !== 0.5) {
                transform = {
                    ...transform,
                    scale: lerp(prev.scale, 1, decayRate),
                    originX: lerp(prev.originX, 0.5, decayRate),
                    originY: lerp(prev.originY, 0.5, decayRate),
                };
            }
        }

        // Store for next frame
        prevTransformRef.current = transform;

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
    }, [world, t, layoutOutput, eventIndex, directorEnabled, directorDebug]);
}

// =============================================================================
// CSS BUILDERS
// =============================================================================

function buildCameraCSS(
    transform: CameraTransform,
    viewport: { width: number; height: number }
): CSSProperties {
    const transformString = `
        translate(${transform.translateX + transform.shakeX}px, ${transform.translateY + transform.shakeY}px)
        scale(${transform.scale})
        rotate(${transform.rotation}deg)
    `.replace(/\s+/g, ' ').trim();

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

    if (deviceScale === 1 && deviceTranslateX === 0 && deviceTranslateY === 0 && deviceRotation === 0) {
        return {};
    }

    return {
        transformOrigin: "center center",
        transform: `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`,
    };
}

// =============================================================================
// HELPERS
// =============================================================================

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
