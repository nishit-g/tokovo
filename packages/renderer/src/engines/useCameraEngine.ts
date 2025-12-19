/**
 * Camera Engine v2
 *
 * Simplified camera engine using @tokovo/device-camera processors.
 * 
 * ARCHITECTURE:
 * 1. Get base transform from world state
 * 2. Get anchors from registered anchor providers
 * 3. Convert legacy effects to new format
 * 4. Process all effects through unified processor registry
 * 5. Apply DirectorLite if no manual effects
 * 6. Build CSS styles
 */

import { useMemo, useRef } from "react";
import {
    WorldState,
    ChatLayoutState,
    EventIndex,
    getEventsInRange,
} from "@tokovo/core";
import {
    processActiveEffects,
    deriveDirectorEffects,
    extractSignals,
    CameraEffect,
    CameraTransform,
    DEFAULT_TRANSFORM,
    AnchorSnapshot,
} from "@tokovo/device-camera";
import { LayoutEngineOutput } from "./useLayoutEngine";
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
    anchorSystemEnabled?: boolean;
}

export interface CameraEngineOutput {
    transform: CameraTransform;
    cameraStyle: React.CSSProperties;
    deviceStyle: React.CSSProperties;
    directorSkipped?: string;
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
        anchorSystemEnabled = true,
    } = input;

    // Tracking state for smooth camera movement
    const trackingStateRef = useRef<{
        prevOriginX: number;
        prevOriginY: number;
        prevScale: number;
        hasActiveEffect: boolean;
    }>({ prevOriginX: 0.5, prevOriginY: 0.5, prevScale: 1.0, hasActiveEffect: false });

    return useMemo(() => {
        const { deviceId, appId, viewKind, layout, profile, activeConversationId, effectiveViewportHeight } = layoutOutput;

        // =====================================================================
        // 1. ANCHOR SNAPSHOT
        // =====================================================================
        let anchorSnapshot: AnchorSnapshot | undefined;
        if (anchorSystemEnabled && appId) {
            const snapshot = getAnchorsForApp(appId, world, layout, deviceId);
            if (snapshot) {
                anchorSnapshot = {
                    anchors: snapshot.anchors,
                    deviceId: snapshot.deviceId,
                    appId: snapshot.appId,
                };
            }
        }

        // =====================================================================
        // 2. CONVERT LEGACY EFFECTS
        // =====================================================================
        const legacyEffects = world.camera?.activeEffects || [];
        const convertedEffects = convertLegacyEffects(legacyEffects);

        // =====================================================================
        // 3. PROCESS ALL EFFECTS THROUGH DEVICE-CAMERA
        // =====================================================================
        const viewport = {
            width: profile.dimensions.width,
            height: profile.dimensions.height,
        };

        let finalTransform = processActiveEffects(
            t,
            convertedEffects,
            DEFAULT_TRANSFORM,
            anchorSnapshot,
            viewport
        );

        let directorSkipped: string | undefined;

        // =====================================================================
        // 4. DIRECTOR LITE (IF NO MANUAL EFFECTS ACTIVE)
        // =====================================================================
        const hasActiveManualEffect = convertedEffects.some(
            (e) => t >= e.startFrame && t < e.endFrame
        );

        if (directorEnabled && !hasActiveManualEffect && eventIndex && viewKind === "CHAT" && layout.kind === "CHAT") {
            const windowStart = Math.max(0, t - 90);
            const windowEnd = t + 15;
            const eventsInWindow = getEventsInRange(eventIndex, windowStart, windowEnd);

            const signals = extractSignals(eventsInWindow, t, 90);

            const chatLayout = layout as ChatLayoutState;
            const directorLayout = {
                messageRects: {},
                inputAreaRect: undefined,
                lastMessageRect: undefined,
                viewport,
            };

            const directorResult = deriveDirectorEffects({
                t,
                signals,
                layoutModel: directorLayout,
                seed: 42,
                debug: directorDebug,
                manualCameraEffects: convertedEffects,
            });

            if (directorResult.skipped) {
                directorSkipped = directorResult.skipped;
            }

            // Apply director effects to transform
            if (!directorResult.skipped && directorResult.effects.length > 0) {
                for (const effect of directorResult.effects) {
                    if (effect.category === "framing" && effect.scale) {
                        finalTransform = {
                            ...finalTransform,
                            scale: finalTransform.scale * effect.scale * effect.progress,
                        };
                    }
                    if (effect.category === "shake" && effect.intensity) {
                        const shakeAmount = (effect.intensity || 0) * (1 - effect.progress);
                        finalTransform = {
                            ...finalTransform,
                            shakeX: finalTransform.shakeX + Math.sin(t * 0.5) * shakeAmount,
                            shakeY: finalTransform.shakeY + Math.cos(t * 0.7) * shakeAmount,
                        };
                    }
                }
            }
        }

        // =====================================================================
        // 5. SMOOTH DECAY TO NEUTRAL (WHEN NO EFFECTS)
        // =====================================================================
        if (!hasActiveManualEffect && !directorEnabled) {
            const prev = trackingStateRef.current;
            if (prev.hasActiveEffect) {
                // Smooth decay
                const decayRate = 0.05;
                finalTransform = {
                    ...finalTransform,
                    scale: lerp(prev.prevScale, 1, decayRate),
                    originX: lerp(prev.prevOriginX, 0.5, decayRate),
                    originY: lerp(prev.prevOriginY, 0.5, decayRate),
                };
            }
        }

        // Update tracking state
        trackingStateRef.current = {
            prevOriginX: finalTransform.originX,
            prevOriginY: finalTransform.originY,
            prevScale: finalTransform.scale,
            hasActiveEffect: hasActiveManualEffect,
        };

        // =====================================================================
        // 6. BUILD CSS STYLES
        // =====================================================================
        const cameraTransformString = `
            translate(${finalTransform.translateX + finalTransform.shakeX}px, ${finalTransform.translateY + finalTransform.shakeY}px)
            scale(${finalTransform.scale})
            rotate(${finalTransform.rotation}deg)
        `.replace(/\s+/g, ' ').trim();

        const cameraStyle: React.CSSProperties = {
            width: profile.dimensions.width,
            height: profile.dimensions.height,
            transformOrigin: `${finalTransform.originX * 100}% ${finalTransform.originY * 100}%`,
            transform: cameraTransformString,
            transition: 'none',
        };

        // Device style for layout transitions
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
            transform: finalTransform,
            cameraStyle,
            deviceStyle,
            directorSkipped,
            anchorSnapshot,
        };
    }, [world, t, layoutOutput, eventIndex, directorEnabled, directorDebug, anchorSystemEnabled]);
}

// =============================================================================
// HELPERS
// =============================================================================

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Convert legacy ActiveCameraEffect format to new CameraEffect format.
 */
function convertLegacyEffects(legacyEffects: any[]): CameraEffect[] {
    return legacyEffects.map((ae) => {
        const effectType = (ae.type || ae.effect?.type || "").toLowerCase();
        const baseEffect = {
            id: ae.id || `effect_${ae.startFrame}`,
            startFrame: ae.startFrame,
            endFrame: ae.endFrame,
            easing: ae.easing || ae.effect?.easing || "ease-out",
        };

        switch (effectType) {
            case "zoom":
                return {
                    ...baseEffect,
                    type: "zoom" as const,
                    targetScale: ae.targetScale ?? ae.scale ?? 1,
                    targetX: ae.translateX ?? 0,
                    targetY: ae.translateY ?? 0,
                    originX: ae.originX,
                    originY: ae.originY,
                };

            case "shake":
                return {
                    ...baseEffect,
                    type: "shake" as const,
                    intensity: ae.intensity ?? 5,
                    intensityX: ae.intensityX,
                    intensityY: ae.intensityY,
                    frequency: ae.frequency ?? 15,
                    decay: ae.decay ?? 0.8,
                };

            case "focus":
            case "anchor_focus":
                return {
                    ...baseEffect,
                    type: "focus" as const,
                    anchorId: ae.effect?.anchor || ae.anchor || "",
                    scale: ae.scale || ae.effect?.scale,
                    preset: ae.preset || ae.effect?.preset,
                };

            case "track":
            case "anchor_track":
                return {
                    ...baseEffect,
                    type: "track" as const,
                    anchorId: ae.effect?.anchor || ae.anchor || "",
                    scale: ae.scale || ae.effect?.scale || 1.05,
                    smoothing: ae.smoothing || 0.18,
                };

            case "reset":
                return {
                    ...baseEffect,
                    type: "reset" as const,
                };

            default:
                return {
                    ...baseEffect,
                    type: "zoom" as const,
                    targetScale: 1,
                    targetX: 0,
                    targetY: 0,
                };
        }
    });
}
