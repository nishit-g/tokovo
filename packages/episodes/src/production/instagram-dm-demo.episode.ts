/**
 * Instagram DM Demo Episode
 * 
 * Demonstrates the Instagram app plugin with:
 * - Home feed with posts
 * - Stories bar
 * - DM messages
 */

import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { InstagramTrackBuilder } from "@tokovo/apps-instagram";

// Declaration order counter
let orderCounter = 0;
const getOrder = () => orderCounter++;

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

export default defineEpisode({
    meta: {
        id: "instagram-dm-demo",
        title: "Instagram DM Demo 📸",
        description: "Demo of Instagram home screen and DMs",
        category: "production",
        tags: ["instagram", "dm", "social"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 300, // 10 seconds
        apps: ["app_instagram"],
    },
    build: () => episode("instagram-dm-demo", {
        fps: 30,
        duration: "10s",
        title: "Instagram DM Demo",
    })
        .device("phone", "iphone16", {
            app: "app_instagram",
            os: {
                time: new Date("2024-12-18T14:30:00"),
                battery: 85,
                network: "5G",
            },
        })
        // Instagram track
        .track("app_instagram", () => {
            return new InstagramTrackBuilder(30, "phone", getOrder);
        }, ig => {
            // Start on home
            ig.at("0s").navigate("home");

            // After 3 seconds, receive a DM
            ig.at("3s").receive(
                { username: "alex.j", avatar: "" },
                "Hey! Did you see the new update?",
                { threadId: "thread_alex" }
            );

            // After 5 seconds, open the DM thread
            ig.at("5s").openDM("thread_alex");

            // After 7 seconds, send a reply
            ig.at("7s").send(
                { username: "alex.j", avatar: "" },
                "Yeah it looks awesome! 🔥",
                { threadId: "thread_alex" }
            );
        })
        .build(),
});
