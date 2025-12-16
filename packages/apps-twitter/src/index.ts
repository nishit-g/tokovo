/**
 * @tokovo/apps-twitter
 * 
 * Twitter/X app for Tokovo video generation.
 */

import { definePlugin, AppMetadata } from "@tokovo/core";
import { twitterReducer, TWITTER_APP_ID } from "./runtime";
import { TwitterUI } from "./ui";
import { twitterColors } from "./config";
import { TwitterBehavior } from "./behaviors";

// Exports
export * from "./config";
export * from "./components";
export * from "./runtime";
export * from "./ui";
export { TWITTER_APP_ID };

// Export behaviors (Semantic Camera System)
export * from "./behaviors";

// Metadata
export const TwitterMetadata: AppMetadata = {
    id: TWITTER_APP_ID,
    name: "X",
    icon: "https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc727a.png", // Stand-in
    color: twitterColors.brand.black,
    version: "1.0.0",
};

// Define the Unified Plugin
export const Twitter = definePlugin({
    id: TWITTER_APP_ID,
    name: "Twitter/X",
    version: "1.0.0",

    // 1. Metadata
    metadata: TwitterMetadata,

    // 2. Views
    appView: TwitterUI as any,

    // 3. Logic
    reducer: twitterReducer,

    // 4. Notifications
    // notificationAdapter: undefined, // TODO: Implement

    // 5. Camera Framing
    anchors: {}, // TODO: Implement provider

    // 6. Assets
    sounds: {},

    // 7. Event Types
    eventTypes: [
        "TWEET_RECEIVED", "TWEET_POSTED", "TWEET_LIKED", "TWEET_RETWEETED"
    ],

    // 8. Behavior
    behavior: TwitterBehavior,
});

// Default Export
export default Twitter;
