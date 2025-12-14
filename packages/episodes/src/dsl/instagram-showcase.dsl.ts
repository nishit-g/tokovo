/**
 * Instagram Showcase
 * 
 * Demonstrates Instagram navigation: feed, stories, explore, reels,
 * notifications, profile, post, and DMs.
 * 
 * DSL version of instagram-test.json
 */

import { episode, iPhone } from "@tokovo/dsl";

export const instagramShowcase = episode("instagram-showcase")
    .meta({
        title: "Instagram Navigation Demo",
        fps: 30,
    })
    .device("alice_phone", {
        profile: iPhone,
        isLocked: false,
        foregroundAppId: "app_instagram",
    })
    .app("app_instagram", {
        currentView: "feed",
    })

    // Beat 1: Navigate to stories
    .beat("stories-view", (b) => {
        b.wait("1s");
        b.navigate("stories");
    })

    // Beat 2: Navigate to feed
    .beat("feed-view", (b) => {
        b.wait("1s");
        b.navigate("feed");
    })

    // Beat 3: Navigate to explore
    .beat("explore-view", (b) => {
        b.wait("1s");
        b.navigate("explore");
    })

    // Beat 4: Navigate to reels
    .beat("reels-view", (b) => {
        b.wait("1s");
        b.navigate("reels");
    })

    // Beat 5: Navigate to notifications
    .beat("notifications-view", (b) => {
        b.wait("1s");
        b.navigate("notifications");
    })

    // Beat 6: Navigate to profile
    .beat("profile-view", (b) => {
        b.wait("1s");
        b.navigate("profile");
    })

    // Beat 7: Navigate to post
    .beat("post-view", (b) => {
        b.wait("1s");
        b.navigate("post");
    })

    // Beat 8: Navigate to DMs and receive message
    .beat("dm-view", (b) => {
        b.wait("1s");
        b.navigate("dm");
        b.wait("0.7s");
        b.send("Wow, this app is huge!");
    })

    .build();

export default instagramShowcase;
