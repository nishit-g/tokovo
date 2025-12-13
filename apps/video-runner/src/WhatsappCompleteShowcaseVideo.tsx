import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * WhatsApp Complete Showcase Video
 * 
 * Comprehensive demonstration of all WhatsApp features:
 * - Chat list screen with multiple conversations
 * - Group chat navigation  
 * - Mixed media messages (image, video, gif, voice)
 * - Typing indicators and reactions
 * - Camera effects (zoom, shake)
 */

// Define episode data (cast through unknown to bypass strict type checks)
const episodeData = {
    initialWorld: {
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                ownerName: "me",
                notifications: []
            }
        },
        conversations: {
            family_group: {
                id: "family_group",
                type: "group",
                name: "Family Group 👨‍👩‍👧‍👦",
                avatar: "",
                members: [
                    { id: "mom", name: "Mom" },
                    { id: "dad", name: "Dad" },
                    { id: "sister", name: "Sister" },
                    { id: "me", name: "me" }
                ],
                messages: [
                    {
                        id: "fg1",
                        from: "Mom",
                        text: "Dinner at 7pm tonight!",
                        type: "text",
                        status: "read"
                    }
                ],
                typing: {}
            },
            bestie: {
                id: "bestie",
                type: "dm",
                name: "Best Friend 💕",
                avatar: "",
                messages: [
                    {
                        id: "b1",
                        from: "Best Friend 💕",
                        text: "Hey! Are you free?",
                        type: "text",
                        status: "read"
                    }
                ],
                typing: {}
            }
        },
        appState: {
            activeApp: "whatsapp",
            app_whatsapp: {
                screen: "chats-list"
            }
        },
        camera: {
            baseView: "APP_VIEW",
            activeDeviceId: "phone",
            layout: "SINGLE",
            deviceTransforms: {},
            activeEffects: [],
            transform: {
                translateX: 0,
                translateY: 0,
                scale: 1,
                rotation: 0,
                originX: 0.5,
                originY: 0.5,
                shakeX: 0,
                shakeY: 0
            }
        },
        audio: {
            activeSounds: {}
        }
    },
    events: [
        // Navigate to chat
        {
            at: 60,
            kind: "APP",
            appId: "app_whatsapp",
            type: "SCREEN_CHANGE",
            screen: "chat",
            conversationId: "family_group"
        },
        // Sister typing
        {
            at: 120,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "family_group",
            from: "Sister"
        },
        // Sister sends image
        {
            at: 180,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "family_group",
            from: "Sister"
        },
        {
            at: 180,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "family_group",
            from: "Sister",
            message: {
                id: "fg2",
                type: "image",
                imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
                caption: "Made this for dinner! 🍝"
            }
        },
        // I send reply
        {
            at: 300,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "family_group",
            from: "me",
            text: "OMG looks delicious! 😍"
        },
        // Dad voice message
        {
            at: 450,
            kind: "APP",
            appId: "app_whatsapp",
            type: "VOICE_MESSAGE_RECEIVED",
            conversationId: "family_group",
            from: "Dad",
            duration: 8
        },
        // Sister text
        {
            at: 600,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "family_group",
            from: "Sister",
            text: "Can't wait to see everyone! 🎉"
        },
        // Mom video
        {
            at: 750,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "family_group",
            from: "Mom",
            message: {
                id: "fg7",
                type: "video",
                thumbnailUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
                duration: 15,
                caption: "Setting up the table 🍽️"
            }
        },
        // Final message
        {
            at: 900,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "family_group",
            from: "me",
            text: "See you all soon! 🚗💨"
        }
    ]
} as unknown as { initialWorld: WorldState; events: TimelineEvent[] };

export const WhatsappCompleteShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Create event index for DirectorLite
    const eventIndex = useMemo(
        () => createEventIndex(episodeData.events),
        []
    );

    // Replay world state at current time
    const world = replay(episodeData.initialWorld, episodeData.events, t);

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
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};
