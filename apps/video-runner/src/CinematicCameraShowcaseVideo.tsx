import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * Cinematic Camera Showcase Video
 * 
 * Demonstrates the NEW cinematic camera system with DSL-style episode definition:
 * - Camera primitives: hold, follow, pushIn, pullOut, snap, shake, reset
 * - Device-first camera profiles
 * - Cinematic easing functions
 * - Orchestrated camera movements synced to story beats
 * 
 * DirectorLite ENABLED - camera automatically reacts to message events.
 */

// =============================================================================
// EPISODE DEFINITION (DSL-style)
// =============================================================================

function createCinematicCameraEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const fps = 30;

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
        audio: { activeSounds: {} },
    };

    // =========================================================================
    // TIMELINE EVENTS
    // =========================================================================
    const events: TimelineEvent[] = [
        // -----------------------------------------------------------------
        // BEAT 1: ESTABLISHING (0s - 2s)
        // Camera holds on empty chat
        // -----------------------------------------------------------------
        {
            at: 0,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.0,
            duration: 60,
            easing: "linear",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 2: TENSION BUILDS (2s - 3.5s)
        // First message arrives, camera follows with high lag
        // -----------------------------------------------------------------
        {
            at: 60,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "We need to talk.",
        } as any,
        {
            at: 60,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.02,
            originX: 0.5,
            originY: 0.85,
            duration: 45,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 3: ANTICIPATION (3.5s - 6.5s)
        // Typing indicator, camera subtly pushes in
        // -----------------------------------------------------------------
        {
            at: 105,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_ex",
            from: "Ex 💔",
        } as any,
        {
            at: 105,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.015,
            originX: 0.5,
            originY: 0.95,
            duration: 60,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 4: THE REVEAL (6.5s - 7.5s)
        // Long message, camera snaps to it
        // -----------------------------------------------------------------
        {
            at: 195,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_ex",
            from: "Ex 💔",
        } as any,
        {
            at: 195,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "I've been thinking about us a lot lately... and I don't think this is working anymore.",
        } as any,
        {
            at: 195,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.08,
            originX: 0.5,
            originY: 0.8,
            duration: 10,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 5: REACTION (7.5s - 9.5s)
        // Pull out for context
        // -----------------------------------------------------------------
        {
            at: 225,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 0.95,
            originX: 0.5,
            originY: 0.5,
            duration: 45,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 6: ESCALATION (9.5s - 12s)
        // Rapid exchange, camera gets tighter
        // -----------------------------------------------------------------
        {
            at: 285,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "Hello?",
        } as any,
        {
            at: 285,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.05,
            originX: 0.5,
            originY: 0.85,
            duration: 10,
            easing: "ease-in-out",
        } as any,

        {
            at: 309,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "me",
            text: "What do you mean?",
        } as any,
        {
            at: 309,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.08,
            originX: 0.5,
            originY: 0.85,
            duration: 8,
            easing: "ease-in-out",
        } as any,

        {
            at: 324,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "You know exactly what I mean.",
        } as any,
        {
            at: 324,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.1,
            originX: 0.5,
            originY: 0.85,
            duration: 8,
            easing: "ease-in-out",
        } as any,

        {
            at: 339,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "me",
            text: "I don't understand...",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 7: DRAMATIC MOMENT (12s - 14s)
        // Shake + tight zoom on final message
        // -----------------------------------------------------------------
        {
            at: 360,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "It's over.",
        } as any,
        {
            at: 360,
            kind: "CAMERA",
            type: "SHAKE",
            intensity: 8,
            frequency: 15,
            decay: 0.6,
            duration: 15,
        } as any,
        {
            at: 360,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.15,
            originX: 0.5,
            originY: 0.85,
            duration: 15,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 8: AFTERMATH (14s - 18s)
        // Reply and smooth reset
        // -----------------------------------------------------------------
        {
            at: 420,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "me",
            text: "...",
        } as any,
        {
            at: 420,
            kind: "CAMERA",
            type: "RESET",
            duration: 60,
            easing: "ease-out",
        } as any,
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const CinematicCameraShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Get episode data
    const episode = useMemo(() => createCinematicCameraEpisode(), []);

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
