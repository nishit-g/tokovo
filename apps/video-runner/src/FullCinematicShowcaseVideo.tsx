import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    createEventIndex,
    DEFAULT_BUS_CONFIG
} from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer
import "@tokovo/devices";

/**
 * Full Cinematic Showcase - DSL Style
 * 
 * Demonstrates production-grade episode authoring:
 * - DSL helpers abstract away raw event structure
 * - Camera movements synchronized with story beats
 * - Production audio with buses and ducking
 */

// =============================================================================
// DSL HELPERS (These would be imported from @tokovo/dsl in production)
// =============================================================================

const dsl = {
    // Messages
    receiveMessage: (at: number, convoId: string, from: string, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: convoId,
        from,
        text,
    } as any),

    sendMessage: (at: number, convoId: string, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: convoId,
        from: "me",
        text,
    } as any),

    typingStart: (at: number, convoId: string, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_START",
        conversationId: convoId,
        from,
    } as any),

    typingEnd: (at: number, convoId: string, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_END",
        conversationId: convoId,
        from,
    } as any),

    // Camera
    zoom: (at: number, scale: number, duration: number, opts: { originX?: number; originY?: number; easing?: string } = {}): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ZOOM",
        scale,
        duration,
        originX: opts.originX ?? 0.5,
        originY: opts.originY ?? 0.5,
        easing: opts.easing ?? "ease-out",
    } as any),

    pan: (at: number, x: number, y: number, duration: number, easing = "ease-out"): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "PAN",
        translateX: x,
        translateY: y,
        duration,
        easing,
    } as any),

    shake: (at: number, intensity: number, duration: number, decay = 0.5): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "SHAKE",
        intensity,
        frequency: 18,
        decay,
        duration,
    } as any),

    reset: (at: number, duration: number): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "RESET",
        duration,
        easing: "ease-out",
    } as any),

    // Audio
    backgroundMusic: (at: number, soundId: string, volume = 0.3): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "BACKGROUND_MUSIC",
        soundId,
        volume,
        loop: true,
    } as any),

    playSound: (at: number, soundId: string, volume = 1.0, opts: { loop?: boolean; duration?: number; instanceId?: string } = {}): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "PLAY_SOUND",
        soundId,
        volume,
        loop: opts.loop,
        duration: opts.duration,
        instanceId: opts.instanceId,
    } as any),

    stopSound: (at: number, instanceId: string): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "STOP_SOUND",
        instanceId,
    } as any),
};

// =============================================================================
// EPISODE DEFINITION (DSL STYLE)
// =============================================================================

function createFullCinematicEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    // Initial world
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
            dm_ex: {
                id: "dm_ex",
                type: "dm",
                name: "Ex 💔",
                messages: [],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_ex",
            },
        },
        camera: {
            baseView: "APP_VIEW",
            activeDeviceId: "phone",
            layout: { mode: "SINGLE", primaryDeviceId: "phone" },
            activeEffects: [],
            transform: {
                translateX: 0, translateY: 0, scale: 1, rotation: 0,
                originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: {
            activeSounds: {},
            buses: DEFAULT_BUS_CONFIG,
        },
    };

    // -------------------------------------------------------------------------
    // EPISODE TIMELINE (DSL STYLE)
    // -------------------------------------------------------------------------
    const events: TimelineEvent[] = [
        // =====================================================================
        // ACT 1: ESTABLISHING (0-3s)
        // =====================================================================
        dsl.backgroundMusic(0, "dramatic", 0.25),
        dsl.zoom(0, 1.15, 1, { originY: 1.0 }),           // Start zoomed at bottom
        dsl.pan(1, 0, -150, 75, "ease-in-out"),            // Macro pan upward
        dsl.zoom(30, 1.0, 60, { originY: 0.5 }),           // Reveal zoom out

        // =====================================================================
        // ACT 2: FIRST MESSAGE (3s)
        // =====================================================================
        dsl.receiveMessage(90, "dm_ex", "Ex 💔", "We need to talk."),
        dsl.playSound(90, "whatsapp_received", 0.9),
        dsl.pan(90, 0, 50, 45),                            // Track to message
        dsl.zoom(100, 1.03, 35, { originY: 0.75 }),        // Subtle push

        // =====================================================================
        // ACT 3: TYPING ANTICIPATION (5s)
        // =====================================================================
        dsl.typingStart(150, "dm_ex", "Ex 💔"),
        dsl.playSound(150, "whatsapp_typing", 0.4, { loop: true, duration: 90, instanceId: "typing" }),
        dsl.zoom(150, 1.05, 75, { originY: 0.88 }),        // Tension push

        // =====================================================================
        // ACT 4: THE REVEAL (8s)
        // =====================================================================
        dsl.typingEnd(240, "dm_ex", "Ex 💔"),
        dsl.stopSound(240, "typing"),
        dsl.receiveMessage(240, "dm_ex", "Ex 💔", "I've been thinking about us a lot lately... and I don't think this is working anymore."),
        dsl.playSound(240, "whatsapp_received", 1.0),
        dsl.zoom(240, 1.12, 8, { originY: 0.7 }),          // Snap to message

        // =====================================================================
        // ACT 5: BREATHING ROOM (10s)
        // =====================================================================
        dsl.zoom(300, 0.92, 60),                           // Pull out wide

        // =====================================================================
        // ACT 6: RAPID FIRE (12-16s)
        // =====================================================================
        dsl.receiveMessage(360, "dm_ex", "Ex 💔", "Hello?"),
        dsl.playSound(360, "whatsapp_received", 0.8),
        dsl.zoom(360, 1.06, 8, { originX: 0.35, originY: 0.8 }),

        dsl.sendMessage(385, "dm_ex", "What do you mean?"),
        dsl.playSound(385, "whatsapp_sent", 0.7),
        dsl.zoom(385, 1.09, 8, { originX: 0.65, originY: 0.82 }),

        dsl.receiveMessage(410, "dm_ex", "Ex 💔", "You know exactly what I mean."),
        dsl.playSound(410, "whatsapp_received", 0.9),
        dsl.zoom(410, 1.13, 6, { originX: 0.35 }),

        dsl.sendMessage(430, "dm_ex", "I don't understand..."),
        dsl.playSound(430, "whatsapp_sent", 0.7),
        dsl.zoom(430, 1.16, 6, { originX: 0.65 }),

        // =====================================================================
        // ACT 7: THE BOMB (16s)
        // =====================================================================
        dsl.receiveMessage(480, "dm_ex", "Ex 💔", "It's over."),
        dsl.playSound(480, "notification", 1.0),
        dsl.shake(480, 12, 20, 0.5),                       // Impact shake
        dsl.zoom(480, 1.25, 12, { originX: 0.4, originY: 0.88 }),

        // =====================================================================
        // ACT 8: AFTERMATH (18-24s)
        // =====================================================================
        dsl.sendMessage(540, "dm_ex", "..."),
        dsl.playSound(540, "whatsapp_sent", 0.5),
        dsl.zoom(540, 1.0, 90),                            // Slow pull back
        dsl.reset(660, 30),                                // Final reset
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const FullCinematicShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    const episode = useMemo(() => createFullCinematicEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = replay(episode.initialWorld, episode.events, t);

    // Scale to fit
    const scale = Math.min(1080 / iPhone16Profile.dimensions.width, 1920 / iPhone16Profile.dimensions.height);

    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a1a", justifyContent: "center", alignItems: "center" }}>
            <AudioLayer world={world} t={t} />
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
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
