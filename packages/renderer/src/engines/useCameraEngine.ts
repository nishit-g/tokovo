/**
 * Camera Engine
 *
 * Pure computation layer that determines:
 * - Base camera transform from world state
 * - DirectorLite effects (if enabled)
 * - Semantic Anchor integration (NEW)
 * - Final CSS styles for camera wrapper
 *
 * ARCHITECTURE:
 * 1. Get base transform from world state
 * 2. Get anchors from registered anchor providers
 * 3. Derive director effects using signals + anchors
 * 4. Apply effects to produce final transform
 * 5. Build CSS styles
 */

import { useMemo, useRef } from "react";
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
    AnchorSnapshot,
    AnchorStabilityState,
    DEFAULT_ANCHOR_STABILITY,
    ANCHOR_STABILITY_FRAMES,
    SemanticAnchorId,
    resolveAnchorWithFallback,
} from "@tokovo/core";
import { LayoutEngineOutput } from "./useLayoutEngine";
import { createDirectorLayoutModel } from "../layout/director-adapter";
import { applyDirectorEffects, Viewport } from "../camera-composer";
import { getAnchorsForApp } from "../anchor-providers/registry";

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
    /** Enable semantic anchor system (NEW) */
    anchorSystemEnabled?: boolean;
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
    /** Current anchor snapshot (for debugging) */
    anchorSnapshot?: AnchorSnapshot;
    /** Anchor stability state (for debugging) */
    anchorStability?: AnchorStabilityState;
}

// =============================================================================
// ANCHOR STABILITY TRACKING
// =============================================================================

/**
 * Track anchor stability across frames.
 * Implements hysteresis: only switch anchors after N stable frames.
 */
function updateAnchorStability(
    prevState: AnchorStabilityState,
    candidateAnchor: SemanticAnchorId | null,
    t: number
): { state: AnchorStabilityState; effectiveAnchor: SemanticAnchorId | null } {
    // Same anchor as candidate → increment stable frames
    if (candidateAnchor === prevState.candidateAnchor) {
        const newStableFrames = prevState.stableFrames + 1;

        // Check if candidate has been stable long enough to become current
        if (newStableFrames >= ANCHOR_STABILITY_FRAMES && candidateAnchor !== prevState.currentAnchor) {
            return {
                state: {
                    currentAnchor: candidateAnchor,
                    candidateAnchor,
                    stableFrames: newStableFrames,
                    lastSwitchFrame: t,
                },
                effectiveAnchor: candidateAnchor,
            };
        }

        return {
            state: {
                ...prevState,
                stableFrames: newStableFrames,
            },
            effectiveAnchor: prevState.currentAnchor,
        };
    }

    // Different anchor → reset stability counter
    return {
        state: {
            ...prevState,
            candidateAnchor,
            stableFrames: 1,
        },
        effectiveAnchor: prevState.currentAnchor,
    };
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
        anchorSystemEnabled = true,
    } = input;

    // Anchor stability state (persists across frames)
    const anchorStabilityRef = useRef<AnchorStabilityState>(DEFAULT_ANCHOR_STABILITY);

    return useMemo(() => {
        const { deviceId, appId, viewKind, layout, profile, activeConversationId, effectiveViewportHeight } = layoutOutput;

        // =====================================================================
        // 1. BASE CAMERA TRANSFORM
        // =====================================================================
        const baseCameraTransform: CameraTransform =
            (world.camera?.deviceTransforms?.[deviceId]) ||
            world.camera?.transform ||
            DEFAULT_CAMERA_TRANSFORM;

        let finalCameraTransform = baseCameraTransform;
        let directorOutput: DirectorOutput | undefined;
        let anchorSnapshot: AnchorSnapshot | undefined;
        let anchorStability: AnchorStabilityState | undefined;

        // =====================================================================
        // 2. SEMANTIC ANCHOR EXTRACTION (NEW)
        // =====================================================================
        if (anchorSystemEnabled && appId) {
            anchorSnapshot = getAnchorsForApp(appId, world, layout, deviceId);

            if (directorDebug && anchorSnapshot) {
                const anchorCount = Object.keys(anchorSnapshot.anchors).length;
                console.log(`[CameraEngine] t=${t} app=${appId} anchors=${anchorCount}`, Object.keys(anchorSnapshot.anchors));
            }
        }

        // =====================================================================
        // 3. DIRECTOR LITE INTEGRATION (with anchor support)
        // =====================================================================
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

            // =========================================================================
            // ANCHOR STABILITY (Hysteresis)
            // =========================================================================
            // Determine candidate anchor from latest signal
            let candidateAnchor: SemanticAnchorId | null = null;
            if (signals.length > 0 && anchorSnapshot) {
                const latestSignal = signals[signals.length - 1];
                // Map signal type to target anchor
                candidateAnchor = mapSignalToAnchor(latestSignal.type);

                // Resolve with fallback if anchor not present
                if (candidateAnchor) {
                    const resolved = resolveAnchorWithFallback(candidateAnchor, anchorSnapshot.anchors);
                    if (resolved) {
                        candidateAnchor = resolved.anchor;
                    }
                }
            }

            // Update stability tracking
            const stabilityResult = updateAnchorStability(
                anchorStabilityRef.current,
                candidateAnchor,
                t
            );
            anchorStabilityRef.current = stabilityResult.state;
            anchorStability = stabilityResult.state;

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
                console.log(`[CameraEngine] t=${t}`, result.debug, {
                    currentAnchor: anchorStability?.currentAnchor,
                    candidateAnchor: anchorStability?.candidateAnchor,
                    stableFrames: anchorStability?.stableFrames,
                });
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

        // =====================================================================
        // 4. BUILD CAMERA CSS STYLE
        // =====================================================================
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

        // =====================================================================
        // 5. BUILD DEVICE CSS STYLE (legacy layout transforms)
        // =====================================================================
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
            anchorSnapshot,
            anchorStability,
        };
    }, [world, t, layoutOutput, eventIndex, directorEnabled, directorDebug, anchorSystemEnabled]);
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Map signal type to semantic anchor.
 * This is the "intent" mapping.
 */
function mapSignalToAnchor(signalType: string): SemanticAnchorId | null {
    switch (signalType) {
        case "TypingStarted":
        case "TypingEnded":
            return "inputArea"; // Stable anchor for typing (not typingIndicator!)
        case "NewMessage":
            return "lastMessage";
        case "MessageRead":
            return "lastMessage";
        case "CallIncoming":
            return "callPoster";
        default:
            return null;
    }
}
