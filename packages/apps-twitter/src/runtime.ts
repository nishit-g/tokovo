/**
 * Twitter/X Runtime
 * 
 * Event reducer for Twitter timeline events.
 * 
 * SYNC: Uses MESSAGE_RECEIVED/MESSAGE_SENT/REACTION_ADDED events from DSL.
 * The __twitter_timeline__ conversationId is used to identify Twitter events.
 */

import { produce } from "immer";
import { WorldState, TimelineEvent, ReducerRegistry, APP_IDS } from "@tokovo/core";
import { TweetData } from "./components";

// =============================================================================
// APP ID & CONVERSATION
// =============================================================================

export const TWITTER_APP_ID = "app_twitter";
export const TWITTER_TIMELINE_CONVERSATION = "__twitter_timeline__";

// =============================================================================
// TYPES
// =============================================================================

export interface TwitterState {
    screen: "timeline" | "tweet-detail" | "profile" | "notifications" | "messages" | "search";
    activeTab: "for-you" | "following";
    activeTweetId?: string;
    activeProfileId?: string;
}

export interface TwitterTweet extends TweetData {
    createdAt?: number;  // Frame when created
}

// =============================================================================
// TIMESTAMP HELPER
// =============================================================================

function generateTimestamp(frame: number, tweetIndex: number): string {
    // Generate relative timestamps like "2m", "15m", "2h", "Dec 13"
    const minutesAgo = tweetIndex * 5 + Math.floor(frame / 60);

    if (minutesAgo < 60) {
        return `${minutesAgo}m`;
    }
    if (minutesAgo < 1440) { // 24 hours
        return `${Math.floor(minutesAgo / 60)}h`;
    }
    // Use date format for older tweets
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

// =============================================================================
// REDUCER
// =============================================================================

export function twitterReducer(draft: WorldState, event: TimelineEvent): void {
    // Only handle APP events
    if (event.kind !== "APP") return;

    // Type assertion for APP events with extended payload
    const appEvent = event as TimelineEvent & {
        appId: string;
        type: string;
        conversationId?: string;
        from?: string;
        text?: string;
        message?: any;
        // Tweet-specific meta fields (from DSL)
        meta?: {
            type?: string;
            author?: { name: string; handle: string; verified?: string; avatarUrl?: string };
            media?: { url: string; type: string }[];
            replyCount?: number;
            retweetCount?: number;
            likeCount?: number;
            viewCount?: number;
            quoteTweetRef?: any;
            replyToRef?: any;
        };
        // Reaction fields
        ref?: any;
        emoji?: string;
    };

    // Twitter events: either direct appId or __twitter_timeline__ conversation
    const isTwitterApp = appEvent.appId === TWITTER_APP_ID;
    const isTwitterConversation = appEvent.conversationId === TWITTER_TIMELINE_CONVERSATION;

    if (!isTwitterApp && !isTwitterConversation) return;

    // Use string type for event.type to allow extended event types
    const eventType = (event as any).type as string;

    // Ensure app state exists
    if (!draft.appState[TWITTER_APP_ID]) {
        draft.appState[TWITTER_APP_ID] = {
            screen: "timeline",
            activeTab: "for-you",
            tweets: [],
            notifications: [],
        };
    }

    const appState = draft.appState[TWITTER_APP_ID] as any;

    // Ensure tweets array exists
    if (!appState.tweets) {
        appState.tweets = [];
    }

    switch (eventType) {
        // =================================================================
        // MESSAGE EVENTS → TWEETS (DSL sync)
        // =================================================================

        case "MESSAGE_RECEIVED": {
            // Tweet from another user
            const meta = appEvent.meta || {};
            const author = meta.author || {
                name: appEvent.from || "Unknown",
                handle: appEvent.from || "unknown",
            };

            const tweet: TwitterTweet = {
                id: `tweet_${event.at}_${appState.tweets.length}`,
                author: {
                    name: author.name,
                    handle: author.handle,
                    avatarUrl: author.avatarUrl,
                    verified: author.verified as "blue" | "gold" | "grey" | undefined,
                },
                text: appEvent.text || "",
                timestamp: generateTimestamp(event.at, appState.tweets.length),
                media: meta.media?.map((m: any) => ({
                    url: m.url,
                    type: m.type,
                })),
                replyCount: meta.replyCount ?? Math.floor(Math.random() * 50),
                retweetCount: meta.retweetCount ?? Math.floor(Math.random() * 200),
                likeCount: meta.likeCount ?? Math.floor(Math.random() * 500),
                viewCount: meta.viewCount ?? Math.floor(Math.random() * 10000),
                createdAt: event.at,
            };

            appState.tweets.unshift(tweet);
            break;
        }

        case "MESSAGE_SENT": {
            // Tweet from the device owner (user posting)
            const meta = appEvent.meta || {};
            const isQuote = meta.type === "quote_tweet";
            const isReply = meta.type === "reply";

            const rawAuthor = meta.author || { name: "You", handle: "user" };
            const tweet: TwitterTweet = {
                id: `tweet_${event.at}_${appState.tweets.length}`,
                author: {
                    name: rawAuthor.name,
                    handle: rawAuthor.handle,
                    avatarUrl: rawAuthor.avatarUrl,
                    verified: rawAuthor.verified as "blue" | "gold" | "grey" | undefined,
                },
                text: appEvent.text || "",
                timestamp: "now",
                media: meta.media?.map((m: any) => ({
                    url: m.url,
                    type: m.type,
                })),
                replyCount: 0,
                retweetCount: 0,
                likeCount: 0,
                viewCount: Math.floor(Math.random() * 100),
                isReply,
                createdAt: event.at,
            };

            // Handle quote tweet
            if (isQuote && meta.quoteTweetRef) {
                const originalTweet = appState.tweets.find(
                    (t: TwitterTweet) => t.id === meta.quoteTweetRef?.id
                );
                if (originalTweet) {
                    tweet.quoteTweet = originalTweet;
                }
            }

            // Handle reply
            if (isReply && meta.replyToRef) {
                const originalTweet = appState.tweets.find(
                    (t: TwitterTweet) => t.id === meta.replyToRef?.id
                );
                if (originalTweet) {
                    tweet.replyToHandle = originalTweet.author.handle;
                    originalTweet.replyCount = (originalTweet.replyCount || 0) + 1;
                }
            }

            appState.tweets.unshift(tweet);
            break;
        }

        // =================================================================
        // REACTION EVENTS → LIKE/RETWEET/BOOKMARK
        // =================================================================

        case "REACTION_ADDED": {
            const emoji = appEvent.emoji;
            const ref = appEvent.ref;

            if (!ref) break;

            // Find the tweet by ref
            const tweet = appState.tweets.find(
                (t: TwitterTweet) => t.id === ref.id
            );

            if (!tweet) break;

            // Map emoji to action
            switch (emoji) {
                case "❤️":  // Like
                    tweet.isLiked = true;
                    tweet.likeCount = (tweet.likeCount || 0) + 1;
                    break;
                case "🔁":  // Retweet
                    tweet.isRetweeted = true;
                    tweet.retweetCount = (tweet.retweetCount || 0) + 1;
                    break;
                case "🔖":  // Bookmark
                    tweet.isBookmarked = true;
                    break;
            }
            break;
        }

        // =================================================================
        // NAVIGATION EVENTS
        // =================================================================

        case "SCREEN_NAVIGATED":
        case "NAVIGATE": {
            appState.screen = (appEvent as any).screen || "timeline";
            if ((appEvent as any).tweetId) {
                appState.activeTweetId = (appEvent as any).tweetId;
            }
            if ((appEvent as any).profileId) {
                appState.activeProfileId = (appEvent as any).profileId;
            }
            break;
        }

        case "TAB_CHANGED": {
            appState.activeTab = (appEvent as any).tab || "for-you";
            break;
        }

        // =================================================================
        // TYPING EVENTS (optional visual feedback)
        // =================================================================

        case "TYPING_START": {
            appState.isTyping = true;
            appState.typingUser = appEvent.from;
            break;
        }

        case "TYPING_END": {
            appState.isTyping = false;
            appState.typingUser = undefined;
            break;
        }

        default:
            // Unknown event type - no action
            break;
    }
}

// =============================================================================
// REGISTRATION
// =============================================================================

// Register with the core reducer registry
ReducerRegistry.registerAppReducer(TWITTER_APP_ID, twitterReducer);

export default twitterReducer;
