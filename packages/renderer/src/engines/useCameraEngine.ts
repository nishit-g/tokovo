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

    // Tracking state for smooth camera transitions (persists across frames)
    // Used by both ANCHOR_TRACK and for smooth fallback when effects end
    const trackingStateRef = useRef<{
        prevOriginX: number;
        prevOriginY: number;
        prevScale: number;
        hasActiveEffect: boolean;  // Whether an effect was active last frame
    }>({ prevOriginX: 0.5, prevOriginY: 0.5, prevScale: 1.0, hasActiveEffect: false });

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
            anchorSnapshot = getAnchorsForApp(appId, world, layout, deviceId) ?? undefined;

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

            // =========================================================================
            // RESOLVE FOCUSANCHOR EFFECTS FROM DIRECTOR
            // =========================================================================
            // Convert FocusAnchor effects (semantic) to resolved effects (with rects)
            // This is where director's semantic output meets the anchor system!
            if (!result.skipped && result.effects.length > 0 && anchorSnapshot) {
                for (const effect of result.effects) {
                    if (effect.type === "FocusAnchor" && effect.anchor) {
                        // Resolve anchor to rect
                        const resolved = resolveAnchorWithFallback(effect.anchor, anchorSnapshot.anchors);
                        if (resolved) {
                            // Inject the resolved rect into the effect
                            effect.target = resolved.rect;

                            // Get scale from preset if not explicitly set
                            if (!effect.scale && effect.preset) {
                                effect.scale = getPresetScaleSimple(effect.preset);
                            }

                            if (directorDebug) {
                                console.log(`[CameraEngine] FocusAnchor resolved: ${effect.anchor} → rect`, resolved.rect);
                            }
                        }
                    }
                }
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
        // 3.5. ANCHOR_FOCUS EFFECT RESOLUTION (THE MISSING LINK!)
        // =====================================================================
        // Process manual ANCHOR_FOCUS effects from timeline and resolve their
        // anchor rects from the anchor snapshot. This is where semantic anchors
        // finally become camera origins!
        const activeEffects = world.camera?.activeEffects || [];
        const anchorFocusEffects = activeEffects.filter(
            (ae) => ae.effect.type === "ANCHOR_FOCUS" && t >= ae.startFrame && t < ae.endFrame
        );

        if (anchorFocusEffects.length > 0 && anchorSnapshot) {
            for (const ae of anchorFocusEffects) {
                const effect = ae.effect as any; // CameraAnchorFocusEffect
                const anchorId = effect.anchor;

                // Resolve anchor rect from snapshot (with fallback chain)
                const resolved = resolveAnchorWithFallback(anchorId, anchorSnapshot.anchors);

                if (resolved) {
                    const rect = resolved.rect;
                    const viewportWidth = profile.dimensions.width;
                    const viewportHeight = profile.dimensions.height;

                    // === THE KEY MATH: Convert rect → origin ===
                    // Center of the rect becomes the transform origin
                    const centerX = rect.x + rect.width / 2;
                    const centerY = rect.y + rect.height / 2;

                    // Normalize to 0-1 range
                    const originX = centerX / viewportWidth;
                    const originY = centerY / viewportHeight;

                    // Clamp to valid range (0.1 to 0.9 to avoid edge distortion)
                    const clampedOriginX = Math.max(0.1, Math.min(0.9, originX));
                    const clampedOriginY = Math.max(0.1, Math.min(0.9, originY));

                    // Calculate animation progress
                    const duration = ae.endFrame - ae.startFrame;
                    const progress = Math.min(1, (t - ae.startFrame) / duration);

                    // Apply easing
                    const easing = effect.easing || "ease-out";
                    const easedProgress = applyEasingSimple(progress, easing);

                    // Get scale from preset or effect
                    const targetScale = effect.scale || getPresetScaleSimple(effect.preset);

                    // Apply transform (blend from current to target)
                    finalCameraTransform = {
                        ...finalCameraTransform,
                        scale: 1 + (targetScale - 1) * easedProgress,
                        originX: clampedOriginX,
                        originY: clampedOriginY,
                    };

                    // Apply shake if specified
                    if (effect.shake && effect.shake > 0) {
                        const frameInEffect = t - ae.startFrame;
                        const shakeDecay = 1 - progress * 0.6;
                        const shakeX = (seededRandom(ae.startFrame + frameInEffect) - 0.5) * 2 * effect.shake * shakeDecay;
                        const shakeY = (seededRandom(ae.startFrame + frameInEffect + 1000) - 0.5) * 2 * effect.shake * shakeDecay;
                        finalCameraTransform.shakeX = shakeX;
                        finalCameraTransform.shakeY = shakeY;
                    }

                    // Update tracking state for smooth decay fallback
                    trackingStateRef.current = {
                        prevOriginX: clampedOriginX,
                        prevOriginY: clampedOriginY,
                        prevScale: finalCameraTransform.scale,
                        hasActiveEffect: true,
                    };

                    if (directorDebug) {
                        console.log(`[CameraEngine] ANCHOR_FOCUS resolved: anchor=${anchorId} rect=`, rect, `origin=(${clampedOriginX.toFixed(2)}, ${clampedOriginY.toFixed(2)})`);
                    }
                }
            }
        }

        // =====================================================================
        // 3.6. ANCHOR_TRACK PROCESSING (Webseries Camera)
        // =====================================================================
        // Unlike ANCHOR_FOCUS which sets origin once, ANCHOR_TRACK continuously
        // follows the anchor rect with exponential smoothing for cinematic feel.
        const anchorTrackEffects = activeEffects.filter(
            (ae) => ae.effect.type === "ANCHOR_TRACK" && t >= ae.startFrame && t < ae.endFrame
        );

        if (anchorTrackEffects.length > 0 && anchorSnapshot) {
            for (const ae of anchorTrackEffects) {
                const effect = ae.effect as any;  // CameraAnchorTrackEffect
                const anchorId = effect.anchor;

                // Resolve anchor rect EVERY FRAME (this is the key!)
                const resolved = resolveAnchorWithFallback(anchorId, anchorSnapshot.anchors);

                if (resolved) {
                    const rect = resolved.rect;
                    const viewportWidth = profile.dimensions.width;
                    const viewportHeight = profile.dimensions.height;

                    // Compute target origin from rect center
                    const centerX = rect.x + rect.width / 2;
                    const centerY = rect.y + rect.height / 2;
                    const targetOriginX = Math.max(0.1, Math.min(0.9, centerX / viewportWidth));
                    const targetOriginY = Math.max(0.1, Math.min(0.9, centerY / viewportHeight));

                    // Get previous origin from tracking state
                    const prev = trackingStateRef.current;

                    // Smoothing factor: lower = smoother/laggier
                    const smoothing = effect.smoothing ?? 0.18;

                    // DEADZONE: don't move if delta is tiny (prevents jitter)
                    const DEADZONE = 0.01;  // 1% of viewport
                    const deltaX = Math.abs(targetOriginX - prev.prevOriginX);
                    const deltaY = Math.abs(targetOriginY - prev.prevOriginY);

                    let smoothedOriginX = prev.prevOriginX;
                    let smoothedOriginY = prev.prevOriginY;

                    if (deltaX > DEADZONE || deltaY > DEADZONE) {
                        // EXPONENTIAL SMOOTHING (lerp toward target)
                        smoothedOriginX = lerp(prev.prevOriginX, targetOriginX, smoothing);
                        smoothedOriginY = lerp(prev.prevOriginY, targetOriginY, smoothing);
                    }

                    // Calculate animation progress
                    const duration = ae.endFrame - ae.startFrame;
                    const progress = Math.min(1, (t - ae.startFrame) / duration);

                    // Get scale from preset or effect
                    const targetScale = effect.scale || getPresetScaleSimple(effect.preset);
                    const easedProgress = applyEasingSimple(progress, effect.easing || "ease-out");
                    const scale = 1 + (targetScale - 1) * easedProgress;

                    // Apply transform with smoothed origin
                    finalCameraTransform = {
                        ...finalCameraTransform,
                        scale,
                        originX: smoothedOriginX,
                        originY: smoothedOriginY,
                    };

                    // Update tracking state for next frame
                    trackingStateRef.current = {
                        prevOriginX: smoothedOriginX,
                        prevOriginY: smoothedOriginY,
                        prevScale: scale,
                        hasActiveEffect: true,
                    };

                    if (directorDebug) {
                        console.log(`[CameraEngine] ANCHOR_TRACK: anchor=${anchorId} target=(${targetOriginX.toFixed(2)}, ${targetOriginY.toFixed(2)}) smoothed=(${smoothedOriginX.toFixed(2)}, ${smoothedOriginY.toFixed(2)})`);
                    }
                }
            }
        }

        // =====================================================================
        // 3.7. SMOOTH DECAY FALLBACK (Prevents Jerk)
        // =====================================================================
        // When no anchor effects are active, smoothly decay towards neutral
        // instead of snapping. This prevents the jerk when effects end.
        const hasAnchorEffects = anchorFocusEffects.length > 0 || anchorTrackEffects.length > 0;

        if (!hasAnchorEffects && trackingStateRef.current.hasActiveEffect) {
            // Effect just ended - smoothly decay towards neutral
            const DECAY_SMOOTHING = 0.12;  // Smooth decay rate
            const prev = trackingStateRef.current;

            // Lerp towards neutral (origin: 0.5, scale: 1.0)
            const decayedOriginX = lerp(prev.prevOriginX, 0.5, DECAY_SMOOTHING);
            const decayedOriginY = lerp(prev.prevOriginY, 0.5, DECAY_SMOOTHING);
            const decayedScale = lerp(prev.prevScale, 1.0, DECAY_SMOOTHING);

            // Check if we've essentially reached neutral
            const isAtNeutral =
                Math.abs(decayedOriginX - 0.5) < 0.01 &&
                Math.abs(decayedOriginY - 0.5) < 0.01 &&
                Math.abs(decayedScale - 1.0) < 0.01;

            if (isAtNeutral) {
                // Snap to neutral and clear tracking state
                trackingStateRef.current = {
                    prevOriginX: 0.5,
                    prevOriginY: 0.5,
                    prevScale: 1.0,
                    hasActiveEffect: false,
                };
            } else {
                // Continue decaying
                finalCameraTransform = {
                    ...finalCameraTransform,
                    scale: decayedScale,
                    originX: decayedOriginX,
                    originY: decayedOriginY,
                };

                trackingStateRef.current = {
                    prevOriginX: decayedOriginX,
                    prevOriginY: decayedOriginY,
                    prevScale: decayedScale,
                    hasActiveEffect: true,  // Keep decaying
                };
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

/**
 * Simple easing function for ANCHOR_FOCUS effects.
 */
function applyEasingSimple(t: number, easing: string): number {
    switch (easing) {
        case "linear":
            return t;
        case "ease-in":
            return t * t;
        case "ease-out":
            return 1 - (1 - t) * (1 - t);
        case "ease-in-out":
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        case "cinematic":
            // S-curve for smooth cinematic motion
            return t * t * (3 - 2 * t);
        case "expoOut":
            // Fast deceleration — used for impact/emotional hits
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        default:
            return 1 - (1 - t) * (1 - t); // Default to ease-out
    }
}

/**
 * Get scale for a preset (v1 locked values).
 */
function getPresetScaleSimple(preset?: string): number {
    switch (preset) {
        // v1 CORE (LOCKED)
        case "message": return 1.08;
        case "subtle": return 1.04;
        case "impact": return 1.35;
        case "snap": return 1.15;
        // v1 MOTION (LOCKED)
        case "operatorFollow": return 1.22;
        case "punchGlide": return 1.35;
        // v1 INTERRUPTION (LOCKED)
        case "interrupt": return 1.25;
        case "takeover": return 0.85;
        // v1 STRUCTURAL (LOCKED)
        case "reset": return 1.0;
        case "establish": return 0.9;
        // v2 (feature-flagged)
        case "suspenseHold": return 1.1;
        case "voyeur": return 0.92;
        case "isolation": return 0.88;
        case "whipSnap": return 1.18;
        case "floatFollow": return 1.15;
        case "panic": return 1.4;
        case "collapse": return 0.8;
        // Legacy (deprecated)
        case "dramatic": return 1.3;
        case "impactPunch": return 1.35;
        case "documentaryHold": return 1.05;
        case "documentary": return 1.0;
        default: return 1.15;
    }
}

/**
 * Deterministic seeded random (mulberry32).
 */
function seededRandom(seed: number): number {
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Linear interpolation.
 * The key to smooth camera tracking (exponential smoothing).
 */
function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
