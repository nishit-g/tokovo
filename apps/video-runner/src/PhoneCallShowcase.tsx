import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    PluginManagerClass
} from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { PhonePlugin } from "@tokovo/apps-phone";

// Import device reducer
import "@tokovo/devices";

// Import DSL event factories
import { dsl } from "@tokovo/dsl";

/**
 * Phone Call Showcase
 *
 * Demonstrates the phone call simulation:
 * - iOS Contact Poster (iOS 17+) incoming call
 * - Call answer and active call screen
 * - Call controls (mute, speaker)
 * - Call end
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const DEVICE_ID = "phone";

// Starting time: 3:30 PM
const START_TIME = new Date();
START_TIME.setHours(15, 30, 0, 0);

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

function createPhoneCallEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const initialWorld: WorldState = {
        devices: {
            [DEVICE_ID]: {
                id: DEVICE_ID,
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_phone",
                notifications: [],
                os: {
                    clock: START_TIME.getTime(),
                    battery: 92,
                    charging: false,
                    network: "wifi" as const,
                    wifiStrength: 3,
                    cellStrength: 4,
                    dnd: false,
                    lowPowerMode: false,
                    airplaneMode: false,
                    notifications: [],
                    notificationHistory: [],
                },
            },
        },
        conversations: {},
        appState: {
            app_phone: {
                screen: "recents",
            },
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: DEVICE_ID,
            activeEffects: [],
            deviceTransforms: {},
            layout: {
                mode: "SINGLE" as const,
                primaryDeviceId: DEVICE_ID,
            },
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
        },
        audio: {
            activeSounds: {},
            buses: {
                music: { baseGain: 1, maxConcurrent: 1 },
                ui: { baseGain: 1, maxConcurrent: 5 },
                sfx: { baseGain: 1, maxConcurrent: 5 },
                voice: { baseGain: 1, maxConcurrent: 1 },
            },
        },
    };

    // Timeline events - Phone call story (NO camera effects)
    const events: TimelineEvent[] = [
        // Set initial time
        dsl.os.setTime(0, START_TIME.getTime()),

        // Frame 60 (2 seconds) - Incoming call arrives
        dsl.call.incoming(60, "alice_123", "Alice Johnson", {
            displayMode: "fullscreen",
            isVideo: false,
            callType: "voice",
            posterImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        }),

        // Answer after 4 seconds
        dsl.call.answer(180),

        // Toggle mute at 6 seconds
        dsl.call.toggleMute(210),

        // Toggle speaker at 7 seconds
        dsl.call.toggleSpeaker(240),

        // Unmute at 8 seconds
        dsl.call.toggleMute(270),

        // End call
        dsl.call.end(330),
    ];

    return { initialWorld, events };
}

// =============================================================================
// COMPONENT
// =============================================================================

export const PhoneCallShowcase: React.FC = () => {
    const frame = useCurrentFrame();

    // Create ISOLATED Engine (PluginManager)
    const pluginManager = useMemo(() => {
        const pm = new PluginManagerClass();
        pm.register(PhonePlugin);
        return pm;
    }, []);

    // Create episode
    const episode = useMemo(() => createPhoneCallEpisode(), []);

    // Compute world state at current frame
    const worldState = useMemo(() => {
        return replay(episode.initialWorld, episode.events, frame);
    }, [episode, frame]);

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#0a0a1a",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Audio Layer */}
            <AudioLayer world={worldState} t={frame} />

            {/* Renderer - centered like FullCinematicShowcase */}
            <div
                style={{
                    transform: "scale(0.5)",
                    transformOrigin: "center center",
                }}
            >
                <TokovoRenderer
                    world={worldState}
                    t={frame}
                    pluginManager={pluginManager}
                    debug={true}
                />
            </div>
        </AbsoluteFill>
    );
};

// Video config
export const phoneCallShowcaseConfig = {
    id: "PhoneCallShowcase",
    component: PhoneCallShowcase,
    durationInFrames: 390, // ~13 seconds at 30fps
    fps: 30,
    width: 1920,
    height: 1080,
};
