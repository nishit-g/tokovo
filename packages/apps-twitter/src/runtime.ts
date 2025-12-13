/**
 * Twitter/X Runtime
 * 
 * Event reducer for Twitter timeline events.
 */

import { produce } from "immer";
import { WorldState, TimelineEvent, ReducerRegistry, APP_IDS } from "@tokovo/core";
import { TweetData } from "./components";

// =============================================================================
// APP ID
// =============================================================================

export const TWITTER_APP_ID = "app_twitter";

// =============================================================================
// TYPES
// =============================================================================

export interface TwitterState {
    screen: "timeline" | "tweet-detail" | "profile" | "notifications" | "messages";
    activeTab: "for-you" | "following";
    activeTweetId?: string;
    activeProfileId?: string;
}

export interface TwitterTweet extends TweetData {
    // Additional runtime fields
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
    // Only handle APP events for Twitter
    if (event.kind !== "APP") return;

    const appEvent = event as any;
    if (appEvent.appId !== TWITTER_APP_ID) return;

    const eventType = appEvent.type;

    // Ensure app state exists
    if (!draft.appState[TWITTER_APP_ID]) {
        draft.appState[TWITTER_APP_ID] = {
            screen: "timeline",
            activeTab: "for-you",
            tweets: [],
        };
    }

    const appState = draft.appState[TWITTER_APP_ID] as any;

    // Ensure tweets array exists
    if (!appState.tweets) {
        appState.tweets = [];
    }

    switch (eventType) {
        case "SCREEN_NAVIGATED": {
            appState.screen = appEvent.screen || "timeline";
            if (appEvent.tweetId) {
                appState.activeTweetId = appEvent.tweetId;
            }
            if (appEvent.profileId) {
                appState.activeProfileId = appEvent.profileId;
            }
            break;
        }

        case "TAB_CHANGED": {
            appState.activeTab = appEvent.tab || "for-you";
            break;
        }

        case "TWEET_POSTED": {
            const tweet: TwitterTweet = {
                id: appEvent.tweetId || `tweet_${event.at}`,
                author: appEvent.author || {
                    name: "User",
                    handle: "user",
                },
                text: appEvent.text || "",
                timestamp: generateTimestamp(event.at, 0),
                media: appEvent.media,
                quoteTweet: appEvent.quoteTweet,
                replyCount: 0,
                retweetCount: 0,
                likeCount: 0,
                viewCount: Math.floor(Math.random() * 100),
                isReply: appEvent.isReply,
                replyToHandle: appEvent.replyToHandle,
                createdAt: event.at,
            };

            // Insert at beginning for timeline ordering
            appState.tweets.unshift(tweet);
            break;
        }

        case "TWEET_RECEIVED": {
            // Another user's tweet appearing in timeline
            const tweet: TwitterTweet = {
                id: appEvent.tweetId || `tweet_${event.at}`,
                author: appEvent.author || {
                    name: "Unknown",
                    handle: "unknown",
                },
                text: appEvent.text || "",
                timestamp: generateTimestamp(event.at, appState.tweets.length),
                media: appEvent.media,
                quoteTweet: appEvent.quoteTweet,
                replyCount: appEvent.replyCount || Math.floor(Math.random() * 50),
                retweetCount: appEvent.retweetCount || Math.floor(Math.random() * 200),
                likeCount: appEvent.likeCount || Math.floor(Math.random() * 500),
                viewCount: appEvent.viewCount || Math.floor(Math.random() * 10000),
                isReply: appEvent.isReply,
                replyToHandle: appEvent.replyToHandle,
                createdAt: event.at,
            };

            appState.tweets.unshift(tweet);
            break;
        }

        case "TWEET_LIKED": {
            const tweet = appState.tweets.find((t: TwitterTweet) => t.id === appEvent.tweetId);
            if (tweet) {
                tweet.isLiked = true;
                tweet.likeCount = (tweet.likeCount || 0) + 1;
            }
            break;
        }

        case "TWEET_UNLIKED": {
            const tweet = appState.tweets.find((t: TwitterTweet) => t.id === appEvent.tweetId);
            if (tweet) {
                tweet.isLiked = false;
                tweet.likeCount = Math.max(0, (tweet.likeCount || 0) - 1);
            }
            break;
        }

        case "TWEET_RETWEETED": {
            const tweet = appState.tweets.find((t: TwitterTweet) => t.id === appEvent.tweetId);
            if (tweet) {
                tweet.isRetweeted = true;
                tweet.retweetCount = (tweet.retweetCount || 0) + 1;
            }
            break;
        }

        case "TWEET_BOOKMARKED": {
            const tweet = appState.tweets.find((t: TwitterTweet) => t.id === appEvent.tweetId);
            if (tweet) {
                tweet.isBookmarked = true;
            }
            break;
        }

        case "TWEET_QUOTED": {
            // Create a new tweet that quotes another
            const originalTweet = appState.tweets.find((t: TwitterTweet) => t.id === appEvent.originalTweetId);
            if (originalTweet) {
                const quoteTweet: TwitterTweet = {
                    id: appEvent.newTweetId || `quote_${event.at}`,
                    author: appEvent.author || { name: "User", handle: "user" },
                    text: appEvent.text || "",
                    timestamp: generateTimestamp(event.at, 0),
                    quoteTweet: originalTweet,
                    replyCount: 0,
                    retweetCount: 0,
                    likeCount: 0,
                    viewCount: 0,
                    createdAt: event.at,
                };
                appState.tweets.unshift(quoteTweet);
            }
            break;
        }

        case "TWEET_REPLIED": {
            const tweet = appState.tweets.find((t: TwitterTweet) => t.id === appEvent.tweetId);
            if (tweet) {
                tweet.replyCount = (tweet.replyCount || 0) + 1;
            }

            // Create the reply tweet
            const replyTweet: TwitterTweet = {
                id: appEvent.replyTweetId || `reply_${event.at}`,
                author: appEvent.author || { name: "User", handle: "user" },
                text: appEvent.text || "",
                timestamp: generateTimestamp(event.at, 0),
                replyCount: 0,
                retweetCount: 0,
                likeCount: 0,
                viewCount: 0,
                isReply: true,
                replyToHandle: tweet?.author.handle,
                createdAt: event.at,
            };
            appState.tweets.unshift(replyTweet);
            break;
        }

        default:
            // Unknown event type
            break;
    }
}

// =============================================================================
// REGISTRATION
// =============================================================================

// Register with the core reducer registry
ReducerRegistry.registerAppReducer(TWITTER_APP_ID, twitterReducer);

export default twitterReducer;
