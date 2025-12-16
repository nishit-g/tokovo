import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex, PluginManagerClass } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsApp } from "@tokovo/apps-whatsapp";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * DSL Breakup Drama Episode
 * 
 * This episode is defined using the DSL and compiled inline.
 * DirectorLite enabled - camera automatically reacts to events.
 */

// Define the episode inline (later this will come from DSL compilation)
function createBreakupDramaEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const fps = 30;

    // Initial world state
    const initialWorld: WorldState = {
        devices: {
            AlicePhone: {
                id: "AlicePhone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            }
        },
        conversations: {
            dm_bob: {
                id: "dm_bob",
                type: "dm" as const,
                name: "Bob",
                avatar: undefined,
                messages: [],
                typing: {},
            }
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_bob",
            }
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: "AlicePhone",
            layout: {
                mode: "SINGLE" as const,
                primaryDeviceId: "AlicePhone",
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
                music: { baseGain: 1, maxConcurrent: 1 },
                ui: { baseGain: 1, maxConcurrent: 5 },
                sfx: { baseGain: 1, maxConcurrent: 5 },
                voice: { baseGain: 1, maxConcurrent: 1 },
            }
        },
    };

    // Timeline events (what DSL compiler would generate)
    const events: TimelineEvent[] = [
        // Beat: silence - just wait 2s (60 frames)

        // Beat: typing-tension (starts at frame 60)
        {
            at: 60,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,

        // Concurrent: message arrives at frame 81 (0.7s after typing starts)
        {
            at: 81,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob",
            message: {
                id: "msg_1",
                type: "text",
                text: "We need to talk.",
                status: "delivered",
            },
        } as any,

        // Typing ends at frame 105 (1.5s after start)
        {
            at: 105,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,

        // Beat: aftermath (starts at frame 120)
        {
            at: 120,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob",
            message: {
                id: "msg_2",
                type: "text",
                text: "I'm sorry. It's over.",
                status: "delivered",
            },
        } as any,

        // Read message at frame 156 (1.2s later)
        {
            at: 156,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_READ",
            conversationId: "dm_bob",
            messageId: "msg_2",
        } as any,

        // Beat: panic (starts at frame 171)
        {
            at: 171,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "me",
            message: {
                id: "msg_3",
                type: "text",
                text: "Wait, what?",
                status: "sent",
            },
        } as any,

        // Second panic message at frame 195
        {
            at: 195,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "me",
            message: {
                id: "msg_4",
                type: "text",
                text: "Can we talk about this?",
                status: "sent",
            },
        } as any,

        // Beat: silence-after (starts at frame 225)
        // Wait 2s then Bob starts typing...
        {
            at: 285,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,

        // Typing ends but no message...
        {
            at: 345,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,
    ];

    return { initialWorld, events };
}

export const BreakupDramaDSLVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Create ISOLATED Engine (PluginManager)
    const pluginManager = useMemo(() => {
        const pm = new PluginManagerClass();
        pm.register(WhatsApp);
        return pm;
    }, []);

    // Get episode data
    const episode = useMemo(() => createBreakupDramaEpisode(), []);

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
            backgroundColor: "#1a1a2e",
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
                    directorDebug={true}
                    pluginManager={pluginManager}
                />
            </div>
        </AbsoluteFill>
    );
};
