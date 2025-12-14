import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer, registerBuiltInAnchorProviders } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

// Register anchor providers for semantic camera system
registerBuiltInAnchorProviders();

/**
 * Semantic Camera System Showcase
 * 
 * Demonstrates the NEW Semantic Anchor-Driven Camera System:
 * 
 * Unlike the old system with hardcoded coordinates (originY: 0.8),
 * this uses SEMANTIC ANCHORS:
 * 
 *   dsl.anchorFocus(at, "lastMessage", "dramatic")
 *   dsl.anchorFocus(at, "inputArea", "subtle")
 *   dsl.anchorFocus(at, "typingIndicator", "snap")
 * 
 * The camera FOLLOWS the meaning, not the pixels.
 * DirectorLite + Anchor System resolves anchors → rects at runtime.
 */

// =============================================================================
// DSL HELPERS - Now with SEMANTIC ANCHORS
// =============================================================================

const dsl = {
    // =========================================================================
    // MESSAGES
    // =========================================================================
    receive: (at: number, from: string, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: "dm_bestie",
        from,
        text,
    } as any),

    send: (at: number, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: "dm_bestie",
        from: "me",
        text,
    } as any),

    typingStart: (at: number, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_START",
        conversationId: "dm_bestie",
        from,
    } as any),

    typingEnd: (at: number, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_END",
        conversationId: "dm_bestie",
        from,
    } as any),

    // =========================================================================
    // SEMANTIC ANCHOR CAMERA - The NEW way! 🎬
    // =========================================================================

    /**
     * ANCHOR FOCUS - Focus on a semantic anchor
     * 
     * @param at - Frame number
     * @param anchor - Semantic anchor: "lastMessage" | "inputArea" | "typingIndicator" | "device"
     * @param preset - Shot preset: "dramatic" | "subtle" | "snap" | "impact" | "message" | "reset"
     * @param shake - Optional shake intensity
     */
    anchorFocus: (at: number, anchor: string, preset?: string, shake?: number): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ANCHOR_FOCUS",
        anchor,
        preset,
        duration: getPresetDuration(preset),
        shake,
        easing: getPresetEasing(preset),
    } as any),

    // =========================================================================
    // LEGACY CAMERA (for comparison / fallback)
    // =========================================================================
    zoom: (at: number, scale: number, durationFrames: number, opts: { originX?: number; originY?: number; easing?: string } = {}): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ZOOM",
        scale,
        duration: durationFrames,
        originX: opts.originX ?? 0.5,
        originY: opts.originY ?? 0.5,
        easing: opts.easing ?? "ease-out",
    } as any),

    shake: (at: number, intensity: number, durationFrames: number): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "SHAKE",
        intensity,
        frequency: 18,
        decay: 0.6,
        duration: durationFrames,
    } as any),

    reset: (at: number, durationFrames: number): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "RESET",
        duration: durationFrames,
        easing: "ease-out",
    } as any),
};

// Preset duration defaults
function getPresetDuration(preset?: string): number {
    switch (preset) {
        case "dramatic": return 25;
        case "subtle": return 30;
        case "snap": return 10;
        case "impact": return 15;
        case "message": return 25;
        case "reset": return 20;
        default: return 25;
    }
}

// Preset easing defaults
function getPresetEasing(preset?: string): string {
    switch (preset) {
        case "dramatic": return "ease-out";
        case "subtle": return "cinematic";
        case "snap": return "ease-out";
        case "impact": return "ease-out";
        default: return "ease-out";
    }
}

// =============================================================================
// EPISODE DEFINITION - CINEMATIC ANCHOR-DRIVEN CAMERA
// =============================================================================

function createSemanticCameraEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const fps = 30;

    // Initial world state
    const initialWorld: WorldState = {
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            },
        },
        conversations: {
            dm_bestie: {
                id: "dm_bestie",
                type: "dm" as const,
                name: "Bestie 💕",
                avatar: undefined,
                messages: [],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_bestie",
            },
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: "phone",
            layout: { mode: "SINGLE" as const, primaryDeviceId: "phone" },
            activeEffects: [],
            transform: {
                translateX: 0, translateY: 0, scale: 1, rotation: 0,
                originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: { activeSounds: {} },
    };

    // =========================================================================
    // TIMELINE - CINEMATIC ANCHOR-DRIVEN CAMERA
    // 
    // Notice: NO hardcoded originY values!
    // Camera targets SEMANTIC ANCHORS that resolve at runtime.
    // =========================================================================
    const events: TimelineEvent[] = [
        // =====================================================================
        // SCENE 1: FOLLOWING MESSAGES (2s - 5s)
        // Each message → camera follows → focus on "lastMessage" anchor
        // =====================================================================
        dsl.receive(60, "Bestie 💕", "omg hi!! 👋"),
        dsl.anchorFocus(60, "lastMessage", "message"),  // 🎬 Follow the message!

        dsl.send(100, "heyyy!! what's up?"),
        dsl.anchorFocus(100, "lastMessage", "message"), // 🎬 Camera follows right

        dsl.receive(140, "Bestie 💕", "you will NOT believe what just happened 😱"),
        dsl.anchorFocus(140, "lastMessage", "subtle"),  // 🎬 Subtle anticipation

        // =====================================================================
        // SCENE 2: TYPING ANTICIPATION (5s - 9s)
        // Typing starts → camera focuses on "inputArea" (stable anchor!)
        // NOT the volatile typingIndicator
        // =====================================================================
        dsl.reset(180, 20),

        dsl.typingStart(200, "Bestie 💕"),
        dsl.anchorFocus(200, "inputArea", "subtle"),    // 🎬 Focus on stable input area

        dsl.typingEnd(270, "Bestie 💕"),

        // =====================================================================
        // SCENE 3: DRAMATIC REVEAL (9s - 13s)
        // Big news → DRAMATIC zoom with shake → "lastMessage" anchor
        // =====================================================================
        dsl.receive(280, "Bestie 💕", "I just got the job!!! 🎉🎉🎉"),
        dsl.anchorFocus(280, "lastMessage", "dramatic", 5), // 🎬 DRAMATIC + shake!

        dsl.send(340, "OMG CONGRATS!!! 🥳🎊"),
        dsl.anchorFocus(340, "lastMessage", "message"),

        // =====================================================================
        // SCENE 4: SNAP TO REACTION (13s - 16s)
        // Heart emoji → quick SNAP → focus on "lastMessage"
        // =====================================================================
        dsl.receive(400, "Bestie 💕", "I start next Monday!! So nervous 😅"),
        dsl.anchorFocus(400, "lastMessage", "subtle"),

        dsl.send(440, "❤️"),
        dsl.anchorFocus(440, "lastMessage", "snap", 2),  // 🎬 SNAP with micro-shake

        // =====================================================================
        // SCENE 5: RESET (16s - 22s)
        // Conversation wraps up → camera pulls back to neutral
        // =====================================================================
        dsl.receive(500, "Bestie 💕", "lunch tomorrow to celebrate? 🍣"),
        dsl.anchorFocus(500, "lastMessage", "message"),

        dsl.send(560, "yesss!! can't wait! 💕"),
        dsl.reset(560, 40), // 🎬 Pull back to neutral

        dsl.receive(620, "Bestie 💕", "love youuu 💛"),
        dsl.anchorFocus(620, "lastMessage", "subtle"),
        dsl.reset(650, 30),
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const SemanticCameraShowcase: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    const episode = useMemo(() => createSemanticCameraEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = replay(episode.initialWorld, episode.events, t);

    const scale = Math.min(1080 / iPhone16Profile.dimensions.width, 1920 / iPhone16Profile.dimensions.height);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
            justifyContent: "center",
            alignItems: "center"
        }}>
            {/* Demo label */}
            <div style={{
                position: "absolute",
                top: 40,
                left: 40,
                color: "#ffffff80",
                fontSize: 24,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
                zIndex: 100,
            }}>
                Semantic Anchor Camera Demo 🎬
            </div>

            {/* Scene indicator */}
            <div style={{
                position: "absolute",
                top: 80,
                left: 40,
                color: "#00ff88",
                fontSize: 18,
                fontFamily: "monospace",
                zIndex: 100,
            }}>
                {t < 60 ? "Establishing..." :
                    t < 180 ? "🎬 ANCHOR: lastMessage → following" :
                        t < 280 ? "🎬 ANCHOR: inputArea → anticipation" :
                            t < 400 ? "🎬 ANCHOR: lastMessage → DRAMATIC!" :
                                t < 500 ? "🎬 ANCHOR: lastMessage → SNAP!" :
                                    "🎬 ANCHOR: reset → pullback"}
            </div>

            {/* Anchor being targeted */}
            <div style={{
                position: "absolute",
                top: 120,
                left: 40,
                color: "#ffaa00",
                fontSize: 14,
                fontFamily: "monospace",
                zIndex: 100,
            }}>
                {t < 60 ? "" :
                    t < 180 ? 'anchorFocus("lastMessage", "message")' :
                        t < 280 ? 'anchorFocus("inputArea", "subtle")' :
                            t < 400 ? 'anchorFocus("lastMessage", "dramatic", shake=5)' :
                                t < 500 ? 'anchorFocus("lastMessage", "snap", shake=2)' :
                                    'reset()'}
            </div>

            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};
