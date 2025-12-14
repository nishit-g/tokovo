import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { WorldState, TimelineEvent, createEventIndex, DEFAULT_BUS_CONFIG } from "@tokovo/core";
import { buildWorld } from "./engine";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * WhatsApp Media Showcase Episode
 * 
 * Demonstrates all new DSL media features:
 * - Image messages with captions
 * - Video messages with thumbnails
 * - GIF messages
 * - Voice notes
 * - Auto-timing (no explicit waits needed)
 */

function createMediaShowcaseEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const fps = 30;

    // Initial world state
    const initialWorld: WorldState = {
        devices: {
            MyPhone: {
                id: "MyPhone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            }
        },
        conversations: {
            dm_bestie: {
                id: "dm_bestie",
                type: "dm" as const,
                name: "Best Friend 💕",
                avatar: undefined,
                messages: [],
                typing: {},
            }
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_bestie",
            }
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: "MyPhone",
            layout: {
                mode: "SINGLE" as const,
                primaryDeviceId: "MyPhone",
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

    // Timeline events
    const events: TimelineEvent[] = [
        // Wait 1s
        // Beat 1: Opening text
        {
            at: 30,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
            message: {
                id: "msg_1",
                type: "text",
                text: "Hey! Look what I found!",
                status: "delivered",
            },
        } as any,

        // Beat 2: Receive image with caption
        {
            at: 60,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
            message: {
                id: "msg_2",
                type: "image",
                imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600",
                caption: "Sunset from the beach 🏖️",
                status: "delivered",
            },
        } as any,

        // Beat 3: React with text
        {
            at: 120,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bestie",
            message: {
                id: "msg_3",
                type: "text",
                text: "OMG that's beautiful! 😍",
                status: "sent",
            },
        } as any,

        // Beat 4: Send GIF reaction
        {
            at: 150,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bestie",
            message: {
                id: "msg_4",
                type: "gif",
                gifUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
                status: "sent",
            },
        } as any,

        // Beat 5: Receive video
        {
            at: 180,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
            message: {
                id: "msg_5",
                type: "video",
                videoUrl: "https://example.com/beach-waves.mp4",
                thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                caption: "Watch this wave! 🌊",
                duration: 15,
                status: "delivered",
            },
        } as any,

        // Beat 6: Typing before voice note
        {
            at: 240,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
        } as any,

        {
            at: 300,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
        } as any,

        // Receive voice note
        {
            at: 310,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
            message: {
                id: "msg_6",
                type: "voice",
                duration: 8,
                status: "delivered",
            },
        } as any,

        // Beat 7: Reply with voice
        {
            at: 400,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bestie",
            message: {
                id: "msg_7",
                type: "voice",
                duration: 5,
                status: "sent",
            },
        } as any,

        // Beat 8: Final exchange
        {
            at: 480,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
            message: {
                id: "msg_8",
                type: "text",
                text: "That GIF is perfect 😂",
                status: "delivered",
            },
        } as any,

        {
            at: 520,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bestie",
            message: {
                id: "msg_9",
                type: "text",
                text: "Haha yeah! Miss you! 💕",
                status: "sent",
            },
        } as any,

        // Beat 9: Final image
        {
            at: 580,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bestie",
            from: "Best Friend 💕",
            message: {
                id: "msg_10",
                type: "image",
                imageUrl: "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600",
                status: "delivered",
            },
        } as any,
    ];

    return { initialWorld, events };
}

export const WhatsappMediaShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Get episode data
    const episode = useMemo(() => createMediaShowcaseEpisode(), []);

    // Create event index for DirectorLite
    const eventIndex = useMemo(
        () => createEventIndex(episode.events),
        [episode.events]
    );

    // Replay world state at current time
    const world = buildWorld(episode.initialWorld, episode.events, t);

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
                />
            </div>
        </AbsoluteFill>
    );
};
