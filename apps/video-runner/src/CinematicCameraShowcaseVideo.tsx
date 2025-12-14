import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex, DEFAULT_BUS_CONFIG } from "@tokovo/core";
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
        audio: { activeSounds: {}, buses: DEFAULT_BUS_CONFIG },
    };

    // =========================================================================
    // TIMELINE EVENTS - CINEMATIC CAMERA MOVEMENTS
    // 
    // Film techniques used:
    // - MACRO PAN: Slow vertical pan from bottom to top (establishing shot)
    // - TRACKING: Camera follows subject with smooth lag
    // - PUSH IN: Dolly zoom toward subject for emphasis
    // - PULL OUT: Widen frame for context/breathing room
    // - SNAP: Quick cut to new framing
    // - SHAKE: Dramatic emphasis on impact moments
    // - DRIFT: Subtle continuous movement to keep frame alive
    // =========================================================================
    const events: TimelineEvent[] = [
        // -----------------------------------------------------------------
        // BEAT 1: ESTABLISHING SHOT (0s - 3s)
        // MACRO PAN from bottom of screen to top - cinema style reveal
        // Start zoomed to bottom, slowly pan up to reveal empty chat
        // -----------------------------------------------------------------
        {
            at: 0,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.15,
            originX: 0.5,
            originY: 1.0,  // Start at very bottom
            duration: 1,
            easing: "linear",
        } as any,
        // Slow pan up (moving origin from bottom to center)
        {
            at: 1,
            kind: "CAMERA",
            type: "PAN",
            translateX: 0,
            translateY: -150,  // Pan upward
            duration: 75,      // 2.5 seconds - slow cinematic
            easing: "ease-in-out",
        } as any,
        // Simultaneously pull out slightly for reveal
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
        // BEAT 2: FIRST MESSAGE - SOFT TRACKING (3s - 5s)
        // Message arrives, camera smoothly tracks to it with lag
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
        // Subtle drift toward message (tracking shot)
        {
            at: 90,
            kind: "CAMERA",
            type: "PAN",
            translateX: 0,
            translateY: 50,  // Drift down toward new message
            duration: 45,
            easing: "ease-out",
        } as any,
        // Gentle push in to emphasize
        {
            at: 100,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.03,
            originX: 0.5,
            originY: 0.75,  // Focus on message area
            duration: 35,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 3: TYPING ANTICIPATION (5s - 8s)
        // Camera slowly drifts and tightens during typing
        // Creates tension through subtle movement
        // -----------------------------------------------------------------
        {
            at: 150,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_ex",
            from: "Ex 💔",
        } as any,
        // Very slow push toward typing indicator
        {
            at: 150,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.05,
            originX: 0.5,
            originY: 0.88,  // Near bottom where typing appears
            duration: 75,    // Slow 2.5s push
            easing: "ease-out",
        } as any,
        // Micro drift to keep frame alive
        {
            at: 165,
            kind: "CAMERA",
            type: "PAN",
            translateX: 5,   // Tiny horizontal drift
            translateY: 15,  // Subtle downward drift
            duration: 60,
            easing: "linear",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 4: THE REVEAL (8s - 10s)
        // Long message drops - SNAP to it, then push in hard
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
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_ex",
            from: "Ex 💔",
            text: "I've been thinking about us a lot lately... and I don't think this is working anymore.",
        } as any,
        // Quick snap/cut to message
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
        // Hold tight on message
        {
            at: 260,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.12,
            originX: 0.5,
            originY: 0.72,
            duration: 30,
            easing: "linear",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 5: BREATHING ROOM (10s - 12s)
        // Pull out wide - give the viewer context
        // Slow dolly out movement
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
        // Reset pan
        {
            at: 300,
            kind: "CAMERA",
            type: "PAN",
            translateX: 0,
            translateY: 0,
            duration: 45,
            easing: "ease-out",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 6: RAPID FIRE ESCALATION (12s - 16s)
        // Quick cuts between speakers, tightening each time
        // Camera gets progressively more aggressive
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
        // Quick snap right (their message)
        {
            at: 360,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.06,
            originX: 0.35,  // Left side where their messages appear
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
        // Snap to right (my message)
        {
            at: 385,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.09,
            originX: 0.65,  // Right side where my messages appear
            originY: 0.82,
            duration: 8,
            easing: "ease-out",
        } as any,
        // Micro shake for tension
        {
            at: 388,
            kind: "CAMERA",
            type: "SHAKE",
            intensity: 2,
            frequency: 20,
            decay: 0.8,
            duration: 6,
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
        // Tighter snap left
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
        // Snap right, even tighter
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
        // BEAT 7: THE BOMB DROP (16s - 18s)
        // "It's over" - DRAMATIC IMPACT
        // Hard shake + extreme tight + hold
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
        // Heavy shake for impact
        {
            at: 480,
            kind: "CAMERA",
            type: "SHAKE",
            intensity: 12,
            frequency: 18,
            decay: 0.5,
            duration: 20,
        } as any,
        // Extreme tight on the message
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
        // Hold the frame - let it linger
        {
            at: 510,
            kind: "CAMERA",
            type: "ZOOM",
            scale: 1.25,
            originX: 0.4,
            originY: 0.88,
            duration: 30,
            easing: "linear",
        } as any,

        // -----------------------------------------------------------------
        // BEAT 8: AFTERMATH (18s - 22s)
        // Slow pull out, user responds with "..."
        // Camera drifts back to neutral - breathing
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
        // Very slow pull out
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
        // Slow upward pan (reverse of opening)
        {
            at: 570,
            kind: "CAMERA",
            type: "PAN",
            translateX: 0,
            translateY: -50,
            duration: 60,
            easing: "ease-out",
        } as any,
        // Final reset
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
