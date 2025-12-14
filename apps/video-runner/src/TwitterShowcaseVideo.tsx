import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex, DEFAULT_BUS_CONFIG } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import Twitter app to ensure reducer is registered
import "@tokovo/apps-twitter";

/**
 * Twitter/X Showcase Video
 * 
 * Demonstrates the Twitter timeline with tweets, likes, retweets.
 */

function createTwitterShowcaseEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    // Initial world state
    const initialWorld: WorldState = {
        devices: {
            UserPhone: {
                id: "UserPhone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_twitter",
                notifications: [],
            }
        },
        conversations: {},
        appState: {
            app_twitter: {
                screen: "timeline",
                activeTab: "for-you",
                tweets: [],
            }
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: "UserPhone",
            layout: {
                mode: "SINGLE" as const,
                primaryDeviceId: "UserPhone",
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
        // Tweet 1: Tech influencer
        {
            at: 30,
            kind: "APP",
            appId: "app_twitter",
            type: "TWEET_RECEIVED",
            tweetId: "tweet_1",
            author: {
                name: "Elon Musk",
                handle: "elonmusk",
                verified: "blue",
            },
            text: "The future of AI is here. We're entering a new era of human-machine collaboration 🚀",
            replyCount: 5432,
            retweetCount: 12800,
            likeCount: 89000,
            viewCount: 2400000,
            media: [{ url: "https://picsum.photos/800/450", type: "image" }],
        } as any,

        // Tweet 2: Another influencer
        {
            at: 60,
            kind: "APP",
            appId: "app_twitter",
            type: "TWEET_RECEIVED",
            tweetId: "tweet_2",
            author: {
                name: "Sam Altman",
                handle: "sama",
                verified: "blue",
            },
            text: "GPT-5 coming soon. It's going to be wild.",
            replyCount: 2100,
            retweetCount: 8900,
            likeCount: 45000,
            viewCount: 890000,
        } as any,

        // Like the first tweet
        {
            at: 90,
            kind: "APP",
            appId: "app_twitter",
            type: "TWEET_LIKED",
            tweetId: "tweet_1",
        } as any,

        // Tweet 3: Organization
        {
            at: 120,
            kind: "APP",
            appId: "app_twitter",
            type: "TWEET_RECEIVED",
            tweetId: "tweet_3",
            author: {
                name: "ESPN",
                handle: "espn",
                verified: "gold",
            },
            text: "BREAKING: Historic trade shakes up the league! Full details ⬇️",
            replyCount: 890,
            retweetCount: 3200,
            likeCount: 15000,
            viewCount: 450000,
        } as any,

        // Retweet
        {
            at: 150,
            kind: "APP",
            appId: "app_twitter",
            type: "TWEET_RETWEETED",
            tweetId: "tweet_3",
        } as any,

        // Tweet 4: Meme with multiple images
        {
            at: 180,
            kind: "APP",
            appId: "app_twitter",
            type: "TWEET_RECEIVED",
            tweetId: "tweet_4",
            author: {
                name: "Internet Historian",
                handle: "historyinmemes",
                verified: "blue",
            },
            text: "The four horsemen of procrastination:",
            replyCount: 12500,
            retweetCount: 45000,
            likeCount: 234000,
            viewCount: 5600000,
            media: [
                { url: "https://picsum.photos/400/400?1", type: "image" },
                { url: "https://picsum.photos/400/400?2", type: "image" },
                { url: "https://picsum.photos/400/400?3", type: "image" },
                { url: "https://picsum.photos/400/400?4", type: "image" },
            ],
        } as any,

        // User posts their own tweet
        {
            at: 240,
            kind: "APP",
            appId: "app_twitter",
            type: "TWEET_POSTED",
            tweetId: "tweet_5",
            author: {
                name: "Alex",
                handle: "alexdev",
                verified: "blue",
            },
            text: "Just built a new app with @tokovo - the future of video generation is here! 🎬✨ #buildinpublic",
        } as any,
    ];

    return { initialWorld, events };
}

export const TwitterShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Get episode data
    const episode = useMemo(() => createTwitterShowcaseEpisode(), []);

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

export default TwitterShowcaseVideo;
