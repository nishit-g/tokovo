import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex, DEFAULT_BUS_CONFIG } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * Ultimate Feature Showcase - SIMPLIFIED for debugging reactions
 */

function createUltimateShowcaseEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    // Initial world state - START DIRECTLY ON CHAT (skip chats-list for now)
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
                name: "Bob 💕",
                avatar: undefined,
                messages: [],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",  // Start directly on chat
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
        audio: { activeSounds: {}, buses: DEFAULT_BUS_CONFIG },
    };

    // MINIMAL timeline - just 2 messages + 1 reaction
    const events: TimelineEvent[] = [
        // Message 1: Bob sends
        {
            at: 30,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_1",
                type: "text",
                text: "Hey Alice! 🏖️",
                status: "delivered",
            },
        } as any,

        // Message 2: Alice replies
        {
            at: 90,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bob",
            message: {
                id: "msg_2",
                type: "text",
                text: "OMG! ✨",
                status: "sent",
            },
        } as any,

        // Reaction: Heart on msg_1
        {
            at: 120,
            kind: "APP",
            appId: "app_whatsapp",
            type: "REACTION_ADDED",
            conversationId: "dm_bob",
            messageId: "msg_1",
            emoji: "❤️",
            fromMe: true,
        } as any,

        // Message 3: Another message
        {
            at: 180,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_3",
                type: "text",
                text: "���",
                status: "delivered",
            },
        } as any,
    ];

    return { initialWorld, events };
}

export const UltimateShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Get episode data
    const episode = useMemo(() => createUltimateShowcaseEpisode(), []);

    // Create event index for DirectorLite
    const eventIndex = useMemo(
        () => createEventIndex(episode.events),
        [episode.events]
    );

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // DEBUG: Log reactions at frame 120+
    if (t >= 120 && t < 125) {
        const conv = world.conversations?.dm_bob;
        const msg1 = conv?.messages?.find((m: any) => m.id === "msg_1");
        console.log("Frame", t, "msg_1 reactions:", msg1?.reactions);
    }

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
            backgroundColor: "#0a0a0f",
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

export default UltimateShowcaseVideo;
