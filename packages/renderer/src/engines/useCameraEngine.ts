/**
 * Camera Engine
 *
 * Pure computation layer that determines:
 * - Base camera transform from world state
 * - DirectorLite effects (if enabled)
 * - Final CSS styles for camera wrapper
 *
 * Input: world + time + layout
 * Output: camera transform (no JSX)
 */

import { useMemo } from "react";
import {
    WorldState,
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
    EventIndex,
    getEventsInRange,
    deriveDirectorEffects,
    extractSignals,
    ChatLayoutState,
    DirectorOutput,
} from "@tokovo/core";
import { LayoutEngineOutput } from "./useLayoutEngine";
import { createDirectorLayoutModel } from "../layout/director-adapter";
import { applyDirectorEffects, Viewport } from "../camera-composer";

// =============================================================================
// INPUT / OUTPUT TYPES
// =============================================================================

export interface CameraEngineInput {
    world: WorldState;
    t: number;
    layoutOutput: LayoutEngineOutput;
    eventIndex?: EventIndex;
    directorEnabled?: boolean;
    directorDebug?: boolean;
}

export interface CameraEngineOutput {
    /** Final camera transform (after DirectorLite) */
    transform: CameraTransform;
    /** CSS style for camera wrapper */
    cameraStyle: React.CSSProperties;
    /** CSS style for device wrapper (legacy layout transforms) */
    deviceStyle: React.CSSProperties;
    /** DirectorLite output (for debugging) */
    directorOutput?: DirectorOutput;
}

// =============================================================================
// CAMERA ENGINE HOOK
// =============================================================================

export function useCameraEngine(input: CameraEngineInput): CameraEngineOutput {
    const {
        world,
        t,
        layoutOutput,
        eventIndex,
        directorEnabled = true,
        directorDebug = false,
    } = input;

    return useMemo(() => {
        const { deviceId, appId, viewKind, layout, profile, activeConversationId, effectiveViewportHeight } = layoutOutput;

        // 1. Get base camera transform from world state
        const baseCameraTransform: CameraTransform =
            (world.camera?.deviceTransforms?.[deviceId]) ||
            world.camera?.transform ||
            DEFAULT_CAMERA_TRANSFORM;

        let finalCameraTransform = baseCameraTransform;
        let directorOutput: DirectorOutput | undefined;

        // 2. DirectorLite integration (only for CHAT views with layout)
        if (directorEnabled && eventIndex && viewKind === "CHAT" && layout.kind === "CHAT") {
            // Get manual camera effects (if any active, skip director)
            const manualCameraEffects = world.camera?.activeEffects || [];

            // Signal window: past 90 frames, future 15 frames
            const windowStart = Math.max(0, t - 90);
            const windowEnd = t + 15;
            const eventsInWindow = getEventsInRange(eventIndex, windowStart, windowEnd);

            // Extract signals scoped to this device/app
            const signals = extractSignals(eventsInWindow, deviceId, appId || "");

            // Create layout model from computed layout
            const chatLayout = layout as ChatLayoutState;
            const directorLayout = createDirectorLayoutModel(
                chatLayout,
                deviceId,
                appId || "",
                activeConversationId || "",
                profile.dimensions.width,
                effectiveViewportHeight
            );

            // Derive effects (PURE FUNCTION - no state)
            const result = deriveDirectorEffects({
                t,
                signals,
                layoutModel: directorLayout,
                seed: 42, // Deterministic seed
                debug: directorDebug,
                manualCameraEffects,
            });

            directorOutput = result;

            // Log debug info if enabled
            if (directorDebug && result.debug) {
                console.log(`[CameraEngine] t=${t}`, result.debug);
            }

            // Apply director effects if not skipped and effects exist
            if (!result.skipped && result.effects.length > 0) {
                const viewport: Viewport = {
                    width: profile.dimensions.width,
                    height: profile.dimensions.height,
                    scrollY: chatLayout.scrollY,
                };
                finalCameraTransform = applyDirectorEffects(result.effects, viewport);
            }
        }

        // 3. Build camera CSS style
        const cameraTransformString = `
            translate(${finalCameraTransform.translateX + finalCameraTransform.shakeX}px, ${finalCameraTransform.translateY + finalCameraTransform.shakeY}px)
            scale(${finalCameraTransform.scale})
            rotate(${finalCameraTransform.rotation}deg)
        `.replace(/\s+/g, ' ').trim();

        const cameraStyle: React.CSSProperties = {
            width: profile.dimensions.width,
            height: profile.dimensions.height,
            transformOrigin: `${finalCameraTransform.originX * 100}% ${finalCameraTransform.originY * 100}%`,
            transform: cameraTransformString,
            transition: 'none', // Frame-perfect sync
        };

        // 4. Build device CSS style (legacy layout transforms)
        let deviceStyle: React.CSSProperties = {};

        if (layout.kind === "TRANSITION") {
            const transLayout = layout as any;
            const { deviceScale, deviceTranslateX, deviceTranslateY, deviceRotation } = transLayout;
            if (deviceScale !== 1 || deviceTranslateX !== 0 || deviceTranslateY !== 0 || deviceRotation !== 0) {
                deviceStyle = {
                    transformOrigin: "center center",
                    transform: `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`,
                };
            }
        }

        return {
            transform: finalCameraTransform,
            cameraStyle,
            deviceStyle,
            directorOutput,
        };
    }, [world, t, layoutOutput, eventIndex, directorEnabled, directorDebug]);
}
