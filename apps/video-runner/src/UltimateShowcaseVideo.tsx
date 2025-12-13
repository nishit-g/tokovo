import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * Ultimate Feature Showcase
 * 
 * Demonstrates ALL DSL features:
 * - Text messages (send/receive)
 * - Media messages (image, video, GIF, voice)
 * - Navigation (showScreen, openChat, goBack)
 * - Typing indicators
 * - Concurrent actions (message storms)
 * - Semantic annotations (mood, intensity)
 */

function createUltimateShowcaseEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const fps = 30;

    // Initial world state - START ON CHATS LIST
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
            dm_work: {
                id: "dm_work",
                type: "dm" as const,
                name: "Work Group 💼",
                avatar: undefined,
                messages: [{ id: "old_1", from: "Boss", text: "Meeting at 3pm", type: "text" }],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chats-list",  // START ON CHATS LIST!
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
        audio: { activeSounds: {} },
    };

    // Timeline events - comprehensive showcase
    const events: TimelineEvent[] = [
        // =====================================================================
        // Beat 0: NAVIGATION - Show chats list then open Bob's chat
        // =====================================================================
        {
            at: 60,  // Wait 2 seconds on chats list
            kind: "APP",
            appId: "app_whatsapp",
            type: "SCREEN_NAVIGATED",
            screen: "chat",
            conversationId: "dm_bob",
        } as any,

        // =====================================================================
        // Beat 1: Opening - Text Exchange (AFTER navigation)
        // =====================================================================
        {
            at: 90,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_1",
                type: "text",
                text: "Hey Alice! Check out this vacation photo 🏖️",
                status: "delivered",
            },
        } as any,

        {
            at: 135,  // After msg_1
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bob",
            message: {
                id: "msg_2",
                type: "text",
                text: "OMG that looks amazing! ✨",
                status: "sent",
            },
        } as any,

        // =====================================================================
        // Beat 1b: React to msg_1 with ❤️
        // =====================================================================
        {
            at: 150,
            kind: "APP",
            appId: "app_whatsapp",
            type: "REACTION_ADDED",
            conversationId: "dm_bob",
            messageId: "msg_1",  // React to the TEXT message so we can verify it works
            emoji: "❤️",
            fromMe: true,
        } as any,

        // =====================================================================
        // Beat 2: Image Message
        // =====================================================================
        {
            at: 180,  // After the reaction
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_3",
                type: "image",
                imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                caption: "Sunset from the beach! 🌅",
                status: "delivered",
            },
        } as any,

        // =====================================================================
        // Beat 3: Voice Note Exchange
        // =====================================================================
        {
            at: 180,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bob",
            message: {
                id: "msg_4",
                type: "voice",
                duration: 8,
                status: "sent",
            },
        } as any,

        // =====================================================================
        // Beat 4: GIF Reaction
        // =====================================================================
        {
            at: 240,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_5",
                type: "gif",
                gifUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
                status: "delivered",
            },
        } as any,

        // =====================================================================
        // Beat 5: Typing then Video
        // =====================================================================
        {
            at: 270,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_bob",
            from: "Bob 💕",
        } as any,

        {
            at: 360,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_bob",
            from: "Bob 💕",
        } as any,

        {
            at: 365,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_6",
                type: "text",
                text: "Can't wait to show you the video!",
                status: "delivered",
            },
        } as any,

        {
            at: 400,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_7",
                type: "video",
                videoUrl: "https://example.com/dolphins.mp4",
                thumbnailUrl: "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=600",
                caption: "Swimming with dolphins! 🐬",
                duration: 15,
                status: "delivered",
            },
        } as any,

        // =====================================================================
        // Beat 6: Emotional Response
        // =====================================================================
        {
            at: 490,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bob",
            message: {
                id: "msg_8",
                type: "text",
                text: "I'm so jealous right now 😭",
                status: "sent",
            },
        } as any,

        // =====================================================================
        // Beat 7: Message Storm (Concurrent)
        // =====================================================================
        {
            at: 530,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_9",
                type: "text",
                text: "You should come next time!",
                status: "delivered",
            },
        } as any,

        {
            at: 540,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_10",
                type: "text",
                text: "It's only a 2 hour flight",
                status: "delivered",
            },
        } as any,

        {
            at: 550,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_11",
                type: "text",
                text: "I can get you a discount at the resort",
                status: "delivered",
            },
        } as any,

        // =====================================================================
        // Beat 8: Finale
        // =====================================================================
        {
            at: 620,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_bob",
            message: {
                id: "msg_12",
                type: "text",
                text: "Okay okay, I'm booking it! 🎉",
                status: "sent",
            },
        } as any,

        {
            at: 660,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob 💕",
            message: {
                id: "msg_13",
                type: "text",
                text: "YES! 🎊🎊🎊",
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
