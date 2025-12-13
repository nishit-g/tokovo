import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * CinematicCameraShowcaseVideo
 * 
 * Demonstrates the NEW cinematic camera system:
 * - Camera primitives: hold, follow, pushIn, pullOut, snap, shake, reset
 * - Device-first camera profiles
 * - Cinematic easing functions
 * - Orchestrated camera movements synced to story beats
 */

// Inline episode data for the cinematic camera showcase
// This demonstrates the full camera system with a WhatsApp drama storyline
const cinematicEpisode: { initialWorld: WorldState; events: TimelineEvent[] } = {
    initialWorld: {
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                ownerName: "me",
                notifications: [],
            },
        },
        conversations: {
            dm_ex: {
                id: "dm_ex",
                type: "dm",
                name: "Ex 💔",
                avatar: "",
                messages: [],
                typing: {},
            },
        },
        camera: {
            baseView: "APP_VIEW",
            appId: "app_whatsapp",
            activeDeviceId: "phone",
            layout: { mode: "SINGLE", primaryDeviceId: "phone" },
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
        appState: {},
    },
    events: [
        // Beat 1: Initial hold (establishing shot)
        { at: 0, kind: "CAMERA", type: "ZOOM", scale: 1.0, duration: 60, easing: "linear" },

        // Beat 2: First message arrives - camera follows
        { at: 60, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "Ex 💔", text: "We need to talk." },
        { at: 60, kind: "CAMERA", type: "ZOOM", scale: 1.02, originX: 0.5, originY: 0.85, duration: 45, easing: "ease-out" },

        // Beat 3: Typing indicator - subtle push
        { at: 105, kind: "APP", appId: "app_whatsapp", type: "TYPING_START", conversationId: "dm_ex", from: "Ex 💔" },
        { at: 105, kind: "CAMERA", type: "ZOOM", scale: 1.015, originX: 0.5, originY: 0.95, duration: 60, easing: "ease-out" },

        // Beat 4: Long message - snap to it
        { at: 195, kind: "APP", appId: "app_whatsapp", type: "TYPING_END", conversationId: "dm_ex", from: "Ex 💔" },
        { at: 195, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "Ex 💔", text: "I've been thinking about us a lot lately... and I don't think this is working anymore." },
        { at: 195, kind: "CAMERA", type: "ZOOM", scale: 1.08, originX: 0.5, originY: 0.8, duration: 10, easing: "ease-out" },

        // Beat 5: Pull out for context
        { at: 225, kind: "CAMERA", type: "ZOOM", scale: 0.95, originX: 0.5, originY: 0.5, duration: 45, easing: "ease-out" },

        // Beat 6: Escalation - rapid exchange
        { at: 285, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "Ex 💔", text: "Hello?" },
        { at: 285, kind: "CAMERA", type: "ZOOM", scale: 1.05, originX: 0.5, originY: 0.85, duration: 10, easing: "ease-in-out" },

        { at: 309, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "me", text: "What do you mean?" },
        { at: 309, kind: "CAMERA", type: "ZOOM", scale: 1.08, originX: 0.5, originY: 0.85, duration: 8, easing: "ease-in-out" },

        { at: 324, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "Ex 💔", text: "You know exactly what I mean." },
        { at: 324, kind: "CAMERA", type: "ZOOM", scale: 1.1, originX: 0.5, originY: 0.85, duration: 8, easing: "ease-in-out" },

        { at: 339, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "me", text: "I don't understand..." },

        // Beat 7: Dramatic moment - shake
        { at: 360, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "Ex 💔", text: "It's over." },
        { at: 360, kind: "CAMERA", type: "SHAKE", intensity: 8, frequency: 15, decay: 0.6, duration: 15 },
        { at: 360, kind: "CAMERA", type: "ZOOM", scale: 1.15, originX: 0.5, originY: 0.85, duration: 15, easing: "ease-out" },

        // Beat 8: Aftermath - reply and reset
        { at: 420, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED", conversationId: "dm_ex", from: "me", text: "..." },
        { at: 420, kind: "CAMERA", type: "RESET", duration: 60, easing: "ease-out" },
    ],
};

export const CinematicCameraShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Replay world state at current time
    const world = replay(cinematicEpisode.initialWorld, cinematicEpisode.events, t);

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
                />
            </div>
        </AbsoluteFill>
    );
};
