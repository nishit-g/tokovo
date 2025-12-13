import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { AudioLayer } from "@tokovo/renderer";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * Full Cinematic Showcase
 * 
 * Demonstrates BOTH systems:
 * - Cinematic camera movements (PAN, ZOOM, SHAKE)
 * - Production audio (buses, ducking, envelopes)
 * 
 * Story: "The Breakup" - dramatic WhatsApp conversation
 */

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

function createFullCinematicEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    // =========================================================================
    // INITIAL WORLD STATE
    // =========================================================================
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
                type: "dm" as const,
                name: "Ex 💔",
                avatar: undefined,
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
            baseView: "APP_VIEW" as const,
            activeDeviceId: "phone",
            layout: {
                mode: "SINGLE" as const,
                primaryDeviceId: "phone",
            },
            activeEffects: [],
            transform: {
                translateX: 0,
                translateY: 0,
                scale: 1,
                rotation: 0,
                originX: 0.5,
                originY: 0.5,
                shakeX: 0,
                shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: {
            activeSounds: {},
            buses: {
                music: { baseGain: 0.3, maxConcurrent: 1 },
                ui: { baseGain: 0.9, maxConcurrent: 3 },
                sfx: { baseGain: 0.7, maxConcurrent: 4 },
                voice: { baseGain: 1.0, maxConcurrent: 1 },
            },
        },
    };

    // =========================================================================
    // TIMELINE EVENTS
    // =========================================================================
    const events: TimelineEvent[] = [
        // -----------------------------------------------------------------
        // BEAT 0: BACKGROUND MUSIC
        // Start with tense ambient music
        // -----------------------------------------------------------------
        {
            at: 0,
            kind: "AUDIO",
            type: "BACKGROUND_MUSIC",
            soundId: "dramatic",
            volume: 0.25,
            loop: true,
        } as any,

        // -----------------------------------------------------------------
        // BEAT 1: ESTABLISHING (0s - 3s)
        // Macro pan from bottom, music playing softly
        // -----------------------------------------------------------------
        {
            at: 0,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.15,
            originX: 0.5,
            originY: 1.0,
            duration: 1,
            easing: "linear",
        } as any,
        {
            at: 1,
            kind: "CAMERA",
            type: "PAN",
            translateX: 0,
            translateY: -150,
            duration: 75,
            easing: "ease-in-out",
        } as any,
        {
            at: 30,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.0,
            originX: 0.5,
            originY: 0.5,
            duration: 60,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 2: FIRST MESSAGE (3s)
        // Message + notification sound + camera track
        // -----------------------------------------------------------------
        {
            at: 90,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "We need to talk.",
        } as any,
        {
            at: 90,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_received",
            volume: 0.9,
        } as any,
        {
            at: 90,
            kind: "CAMERA",
            type: "PAN",
            translateX: 0,
            translateY: 50,
            duration: 45,
            easing: "ease-out",
        } as any,
        {
            at: 100,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.03,
            originX: 0.5,
            originY: 0.75,
            duration: 35,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 3: TYPING (5s)
        // Typing indicator + typing sound + camera push
        // -----------------------------------------------------------------
        {
            at: 150,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_ex",
            from: "Ex 💔",
        } as any,
        {
            at: 150,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_typing",
            volume: 0.4,
            instanceId: "typing_1",
            loop: true,
            duration: 90,
        } as any,
        {
            at: 150,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.05,
            originX: 0.5,
            originY: 0.88,
            duration: 75,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 4: THE REVEAL (8s)
        // Stop typing, long message, snap camera
        // -----------------------------------------------------------------
        {
            at: 240,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_ex",
            from: "Ex 💔",
        } as any,
        {
            at: 240,
            kind: "AUDIO",
            type: "STOP_SOUND",
            instanceId: "typing_1",
        } as any,
        {
            at: 240,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "I've been thinking about us a lot lately... and I don't think this is working anymore.",
        } as any,
        {
            at: 240,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_received",
            volume: 1.0,
        } as any,
        {
            at: 240,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.12,
            originX: 0.5,
            originY: 0.7,
            duration: 8,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 5: BREATHING ROOM (10s)
        // Pull out, music ducks for weight
        // -----------------------------------------------------------------
        {
            at: 300,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 0.92,
            originX: 0.5,
            originY: 0.5,
            duration: 60,
            easing: "ease-in-out",
        } as any,
        {
            at: 300,
            kind: "AUDIO",
            type: "FADE_VOLUME",
            instanceId: "background",
            toVolume: 0.15,
            duration: 30,
        } as any,

        // -----------------------------------------------------------------
        // BEAT 6: RAPID FIRE (12s - 16s)
        // Quick messages, alternating sounds + camera snaps
        // -----------------------------------------------------------------
        {
            at: 360,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "Hello?",
        } as any,
        {
            at: 360,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_received",
            volume: 0.8,
        } as any,
        {
            at: 360,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.06,
            originX: 0.35,
            originY: 0.8,
            duration: 8,
            easing: "ease-out",
        } as any,

        {
            at: 385,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "me",
            text: "What do you mean?",
        } as any,
        {
            at: 385,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_sent",
            volume: 0.7,
        } as any,
        {
            at: 385,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.09,
            originX: 0.65,
            originY: 0.82,
            duration: 8,
            easing: "ease-out",
        } as any,

        {
            at: 410,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "You know exactly what I mean.",
        } as any,
        {
            at: 410,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_received",
            volume: 0.9,
        } as any,
        {
            at: 410,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.13,
            originX: 0.35,
            originY: 0.85,
            duration: 6,
            easing: "ease-out",
        } as any,

        {
            at: 430,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "me",
            text: "I don't understand...",
        } as any,
        {
            at: 430,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_sent",
            volume: 0.7,
        } as any,
        {
            at: 430,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.16,
            originX: 0.65,
            originY: 0.87,
            duration: 6,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 7: THE BOMB (16s)
        // "It's over" - heavy shake + dramatic sound
        // -----------------------------------------------------------------
        {
            at: 480,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "It's over.",
        } as any,
        {
            at: 480,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "notification",
            volume: 1.0,
        } as any,
        {
            at: 480,
            kind: "CAMERA",
            type: "SHAKE",
            intensity: 12,
            frequency: 18,
            decay: 0.5,
            duration: 20,
        } as any,
        {
            at: 480,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.25,
            originX: 0.4,
            originY: 0.88,
            duration: 12,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 8: AFTERMATH (18s - 22s)
        // Reply, slow pull out, music swells back
        // -----------------------------------------------------------------
        {
            at: 540,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "me",
            text: "...",
        } as any,
        {
            at: 540,
            kind: "AUDIO",
            type: "PLAY_SOUND",
            soundId: "whatsapp_sent",
            volume: 0.5,
        } as any,
        {
            at: 540,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.0,
            originX: 0.5,
            originY: 0.5,
            duration: 90,
            easing: "ease-in-out",
        } as any,
        {
            at: 570,
            kind: "AUDIO",
            type: "FADE_VOLUME",
            instanceId: "background",
            toVolume: 0.35,
            duration: 60,
        } as any,
        {
            at: 630,
            kind: "CAMERA",
            type: "RESET",
            duration: 30,
            easing: "ease-out",
        } as any,
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const FullCinematicShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Get episode data
    const episode = useMemo(() => createFullCinematicEpisode(), []);

    // Create event index for DirectorLite
    const eventIndex = useMemo(
        () => createEventIndex(episode.events),
        [episode.events]
    );

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
            justifyContent: "center",
            alignItems: "center"
        }}>
            {/* Audio Layer - Global sounds */}
            <AudioLayer world={world} t={t} />

            {/* Device + Camera */}
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
