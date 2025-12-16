import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    createEventIndex,
    PluginManagerClass
} from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsApp } from "@tokovo/apps-whatsapp";
import { Twitter } from "@tokovo/apps-twitter";

// Import device reducer
import "@tokovo/devices";

// Legacy imports removed in favor of explicit registration
// import "@tokovo/apps-twitter";
// import "@tokovo/apps-whatsapp";

/**
 * Multi-App Showcase Video
 * 
 * Demonstrates Tokovo's power by combining WhatsApp, Twitter, and notifications.
 */

function createMultiAppShowcaseEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    // Initial world state
    const initialWorld: WorldState = {
        devices: {
            MainPhone: {
                id: "MainPhone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            }
        },
        conversations: {
            dm_sarah: {
                id: "dm_sarah",
                messages: [],
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_sarah",
            },
            app_twitter: {
                screen: "timeline",
                activeTab: "for-you",
                tweets: [],
            }
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: "MainPhone",
            layout: {
                mode: "SINGLE" as const,
                primaryDeviceId: "MainPhone",
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

    // Timeline events - Multi-app flow
    const events: TimelineEvent[] = [
        // Scene 1: WhatsApp conversation
        {
            at: 30, // 1s
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_sarah",
            from: "sarah",
            text: "Hey! Did you see that tweet from Elon? 🚀",
        },
        {
            at: 75, // 2.5s
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_sarah",
            from: "me",
        },
        {
            at: 120, // 4s
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_sarah",
            from: "me",
        },
        {
            at: 125,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_sarah",
            from: "me",
            text: "No! What happened?",
        },
        {
            at: 165, // 5.5s
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_sarah",
            from: "sarah",
            text: "He just announced something massive about AI!",
        },
        {
            at: 200,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_sarah",
            from: "sarah",
            text: "Check Twitter NOW 😱",
        },

        // Scene 2: Switch to Twitter
        {
            at: 240, // 8s
            kind: "DEVICE",
            deviceId: "MainPhone",
            type: "OPEN_APP",
            appId: "app_twitter",
        },

        // Scene 3: Twitter timeline
        {
            at: 270, // 9s
            kind: "APP",
            appId: "app_twitter",
            type: "MESSAGE_RECEIVED",
            conversationId: "__twitter_timeline__",
            from: "elonmusk",
            text: "🚀 Announcing: Tesla will now accept Dogecoin for all vehicles. To the moon! 🌙",
            meta: {
                type: "tweet",
                author: { name: "Elon Musk", handle: "elonmusk", verified: "blue" },
                replyCount: 45000,
                retweetCount: 125000,
                likeCount: 890000,
                viewCount: 45000000,
            },
        } as any,
        {
            at: 330, // 11s - Like the tweet
            kind: "APP",
            appId: "app_twitter",
            type: "REACTION_ADDED",
            conversationId: "__twitter_timeline__",
            from: "me",
            emoji: "❤️",
            ref: { id: "tweet_270_0" },
        } as any,
        {
            at: 360, // 12s - Another tweet
            kind: "APP",
            appId: "app_twitter",
            type: "MESSAGE_RECEIVED",
            conversationId: "__twitter_timeline__",
            from: "CNBC",
            text: "BREAKING: Tesla stock surges 15% after Elon Musk announcement",
            meta: {
                type: "tweet",
                author: { name: "CNBC", handle: "CNBC", verified: "gold" },
                replyCount: 1200,
                retweetCount: 8500,
                likeCount: 23000,
                viewCount: 1200000,
            },
        } as any,
        {
            at: 420, // 14s - Retweet
            kind: "APP",
            appId: "app_twitter",
            type: "REACTION_ADDED",
            conversationId: "__twitter_timeline__",
            from: "me",
            emoji: "🔁",
            ref: { id: "tweet_270_0" },
        } as any,

        // Scene 4: Post own tweet
        {
            at: 480, // 16s
            kind: "APP",
            appId: "app_twitter",
            type: "MESSAGE_SENT",
            conversationId: "__twitter_timeline__",
            from: "me",
            text: "This is insane! 🚀 Dogecoin about to moon! @elonmusk just changed the game #DOGE",
            meta: {
                type: "tweet",
                author: { name: "Alex", handle: "alexdev", verified: "blue" },
            },
        } as any,

        // Scene 5: Back to WhatsApp
        {
            at: 540, // 18s
            kind: "DEVICE",
            deviceId: "MainPhone",
            type: "OPEN_APP",
            appId: "app_whatsapp",
        },
        {
            at: 570, // 19s
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_sarah",
            from: "me",
        },
        {
            at: 630,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_sarah",
            from: "me",
        },
        {
            at: 635,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_sarah",
            from: "me",
            text: "OMG you were right! 🤯",
        },
        {
            at: 680,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_SENT",
            conversationId: "dm_sarah",
            from: "me",
            text: "I just retweeted it and posted my own take",
        },
        {
            at: 720,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_sarah",
            from: "sarah",
            text: "Haha told you! 😂",
        },

        // Scene 6: Notification
        {
            at: 780, // 26s
            kind: "DEVICE",
            deviceId: "MainPhone",
            type: "SHOW_NOTIFICATION",
            appId: "app_twitter",
            title: "Your tweet is getting noticed!",
            body: "25 people liked your tweet about Dogecoin",
            mode: "headsup",
        },
    ];

    return { initialWorld, events };
}

export const MultiAppShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();

    // Create ISOLATED Engine (PluginManager)
    const pluginManager = useMemo(() => {
        const pm = new PluginManagerClass();
        pm.register(Twitter);
        pm.register(WhatsApp);
        return pm;
    }, []);

    const { initialWorld, events } = useMemo(() => createMultiAppShowcaseEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(events), [events]);

    // Replay state up to current frame
    const world = useMemo(() => replay(initialWorld, events, frame), [initialWorld, events, frame]);

    // Scale to fit composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={frame}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                    pluginManager={pluginManager}
                />
            </div>
        </AbsoluteFill>
    );
};

export default MultiAppShowcaseVideo;
