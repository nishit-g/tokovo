import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    createEventIndex,
    DEFAULT_BUS_CONFIG,
} from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer
import "@tokovo/devices";

// Import phone plugin
import "@tokovo/apps-phone";

// Import DSL event factories
import { dsl, generateTyping } from "@tokovo/dsl";

/**
 * ULTIMATE SHOWCASE - "The Breakup"
 *
 * An emotionally intense story showcasing EVERY Tokovo capability:
 *
 * SCENE 1 (0-6s): Late night WhatsApp conversation
 * - Clock shows 11:47 PM
 * - Battery draining
 * - Friend types... sends cryptic message
 * - Zoom into message
 *
 * SCENE 2 (6-12s): User responds frantically
 * - Types with errors
 * - Backspaces to correct
 * - Sends message
 * - Read receipts turn blue
 *
 * SCENE 3 (12-20s): Phone call interruption
 * - Incoming call from "Her 💔"
 * - Full screen Contact Poster
 * - Answer call
 * - Mute mic, unmute
 * - End call
 *
 * SCENE 4 (20-26s): The aftermath
 * - Battery drops to 5%
 * - Low power mode activates
 * - Final dramatic message received
 * - Camera shake
 *
 * Duration: 26 seconds at 30fps = 780 frames
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const DEVICE_ID = "phone";
const CONVO_ID = "dm_maya";
const FRIEND_NAME = "Maya 🌙";
const EX_NAME = "Her 💔";

// Late night: 11:47 PM
const START_TIME = new Date();
START_TIME.setHours(23, 47, 0, 0);

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

function createUltimateEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const initialWorld: WorldState = {
        devices: {
            [DEVICE_ID]: {
                id: DEVICE_ID,
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
                os: {
                    clock: START_TIME.getTime(),
                    battery: 23,
                    charging: false,
                    network: "wifi" as const,
                    wifiStrength: 2,
                    cellStrength: 3,
                    dnd: false,
                    lowPowerMode: false,
                    airplaneMode: false,
                },
            },
        },
        conversations: {
            [CONVO_ID]: {
                id: CONVO_ID,
                type: "dm",
                name: FRIEND_NAME,
                messages: [
                    {
                        id: "msg_prev_1",
                        type: "text",
                        from: FRIEND_NAME,
                        text: "you need to see this...",
                        status: "read",
                    },
                    {
                        id: "msg_prev_2",
                        type: "text",
                        from: "me",
                        text: "what happened???",
                        status: "read",
                    },
                ],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: CONVO_ID,
            },
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: DEVICE_ID,
            layout: { mode: "SINGLE" as const, primaryDeviceId: DEVICE_ID },
            activeEffects: [],
            transform: {
                translateX: 0, translateY: 0, scale: 1, rotation: 0,
                originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: { activeSounds: {}, buses: DEFAULT_BUS_CONFIG },
    };

    // =========================================================================
    // TIMELINE EVENTS
    // =========================================================================
    const events: TimelineEvent[] = [

        // =====================================================================
        // SCENE 1: Late Night Chat (0-6s, frames 0-180)
        // =====================================================================

        // Time advances every second
        dsl.os.setTime(0, START_TIME.getTime()),
        dsl.os.setTime(30, START_TIME.getTime() + 1000),
        dsl.os.setTime(60, START_TIME.getTime() + 2000),

        // Battery slowly draining
        dsl.os.setBattery(0, 23, false),
        dsl.os.setBattery(90, 22, false),

        // Maya is typing...
        dsl.messages.typingStart(30, CONVO_ID, FRIEND_NAME),

        // Camera focuses in anticipation
        dsl.camera.zoom(45, 1.08, 20, { originY: 0.7 }),

        // Maya sends the bomb
        dsl.messages.typingEnd(90, CONVO_ID, FRIEND_NAME),
        dsl.messages.receive(90, CONVO_ID, FRIEND_NAME, "she's been seeing someone else this whole time..."),
        dsl.audio.play(90, "whatsapp_received", 1.0),

        // Dramatic zoom into the message
        dsl.camera.zoom(100, 1.18, 30, { originY: 0.85 }),

        // Time advances
        dsl.os.setTime(120, START_TIME.getTime() + 4000),
        dsl.os.setTime(150, START_TIME.getTime() + 5000),

        // =====================================================================
        // SCENE 2: Frantic Response (6-12s, frames 180-360)
        // =====================================================================

        // Camera pulls back for keyboard
        dsl.camera.zoom(175, 1.0, 15),

        // Show keyboard
        dsl.keyboard.show(180, DEVICE_ID),

        // Type frantically with a typo
        ...generateTyping(195, DEVICE_ID, "wiat what", { speed: "fast" }),

        // Pause, realize the typo (frame ~230)
        // Backspace "wiat" (4 characters)
        dsl.keyboard.backspace(240, DEVICE_ID),
        dsl.keyboard.backspace(244, DEVICE_ID),
        dsl.keyboard.backspace(248, DEVICE_ID),
        dsl.keyboard.backspace(252, DEVICE_ID),
        dsl.keyboard.backspace(256, DEVICE_ID),
        dsl.keyboard.backspace(260, DEVICE_ID),
        dsl.keyboard.backspace(264, DEVICE_ID),
        dsl.keyboard.backspace(268, DEVICE_ID),
        dsl.keyboard.backspace(272, DEVICE_ID),

        // Retype correctly
        ...generateTyping(280, DEVICE_ID, "wait WHAT", { speed: "fast" }),

        // Send message
        dsl.messages.send(320, CONVO_ID, "wait WHAT"),
        dsl.audio.play(320, "whatsapp_sent", 0.8),
        dsl.keyboard.clear(325, DEVICE_ID),

        // Time advances
        dsl.os.setTime(330, START_TIME.getTime() + 10000),

        // Hide keyboard
        dsl.keyboard.hide(340, DEVICE_ID),

        // Camera focuses on response
        dsl.camera.zoom(350, 1.1, 15, { originY: 0.8 }),

        // =====================================================================
        // SCENE 3: Phone Call Interruption (12-20s, frames 360-600)
        // =====================================================================

        // Battery drops more
        dsl.os.setBattery(360, 18, false),

        // Incoming call from "Her 💔"
        dsl.call.incoming(380, "ex_caller", EX_NAME, {
            displayMode: "fullscreen",
            isVideo: false,
            callType: "voice",
            posterImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
        }),

        // Camera zoom on call screen
        dsl.camera.zoom(390, 1.05, 20, { originY: 0.3 }),

        // Wait briefly, then answer (at 16s)
        dsl.call.answer(480),

        // Camera resets
        dsl.camera.reset(485, 15),

        // Toggle mute during awkward silence
        dsl.call.toggleMute(510),

        // Unmute to respond
        dsl.call.toggleMute(540),

        // End call abruptly
        dsl.call.end(580),

        // Time advances
        dsl.os.setTime(590, START_TIME.getTime() + 18000),

        // =====================================================================
        // SCENE 4: The Aftermath (20-26s, frames 600-780)
        // =====================================================================

        // Battery critically low
        dsl.os.setBattery(600, 5, false),

        // Low power mode activates
        dsl.os.setLowPower(610, true),

        // Maya types again
        dsl.messages.typingStart(620, CONVO_ID, FRIEND_NAME),

        // Tense zoom
        dsl.camera.zoom(630, 1.12, 20, { originY: 0.8 }),

        // Time advances - past midnight now
        dsl.os.setTime(660, new Date(START_TIME.getFullYear(), START_TIME.getMonth(), START_TIME.getDate() + 1, 0, 2, 0, 0).getTime()),

        // The final message
        dsl.messages.typingEnd(680, CONVO_ID, FRIEND_NAME),
        dsl.messages.receive(680, CONVO_ID, FRIEND_NAME, "I'm so sorry... I should have told you sooner"),
        dsl.audio.play(680, "whatsapp_received", 1.0),

        // SHAKE on impact
        dsl.camera.shake(685, 10, 25, { frequency: 15, decay: 0.6 }),

        // Final dramatic zoom
        dsl.camera.zoom(700, 1.22, 40, { originY: 0.9 }),

        // Slow reset to end
        dsl.camera.reset(750, 30),
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const UltimateShowcase: React.FC = () => {
    const frame = useCurrentFrame();

    const episode = useMemo(() => createUltimateEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = replay(episode.initialWorld, episode.events, frame);

    // Calculate scale to fit device in view
    const scale = Math.min(
        1080 / iPhone16Profile.dimensions.width,
        1920 / iPhone16Profile.dimensions.height
    ) * 0.95;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#0a0a0f",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <AudioLayer world={world} t={frame} />
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer
                    world={world}
                    t={frame}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};

// Video config
export const ultimateShowcaseConfig = {
    id: "UltimateShowcase",
    component: UltimateShowcase,
    durationInFrames: 780, // 26 seconds at 30fps
    fps: 30,
    width: 1920,
    height: 1080,
};
