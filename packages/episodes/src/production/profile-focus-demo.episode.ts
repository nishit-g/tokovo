/**
 * Profile Focus Demo
 * 
 * Demonstrates camera.focus on "profile" anchor - centering the profile picture.
 * This episode shows how anchors work to target semantic UI elements.
 */

import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

// Declaration order counter
let orderCounter = 0;
const getOrder = () => orderCounter++;

// =============================================================================
// EPISODE DEFINITION (auto-registers via defineEpisode)
// =============================================================================

export default defineEpisode({
    meta: {
        id: "profile-focus-demo",
        title: "Profile Focus Demo 📷",
        description: "Demonstrates camera.focus on profile anchor",
        category: "production",
        tags: ["camera", "anchor", "demo", "profile"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 450, // 15s * 30fps
        apps: ["app_whatsapp"],
    },
    build: () => episode("profile-focus-demo", {
        fps: 30,
        duration: "15s",
        title: "Profile Focus Demo 📷",
        description: "Shows how anchors target semantic UI elements",
    })
        // Configure device with WhatsApp
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [
                { id: "dm_john", name: "John", avatar: "/avatars/avatar-john.jpg" },
            ],
            os: {
                time: new Date("2024-12-19T22:00:00"),
                battery: 85,
                network: "5G",
            },
        })

        // === WHATSAPP TRACK ===
        .track("app_whatsapp", () => {
            return new WhatsAppTrackBuilder(30, "phone", "dm_john", getOrder);
        }, wa => {
            // Initial conversation
            wa.at("0s").receive("John", "Hey! Check out my new profile pic! 📸");
            wa.at("2s").send("Looking good!");
        })

        // === CAMERA TRACK ===
        .camera(cam => {
            // At 4 seconds: Focus on profile picture
            cam.at("4s").focus("profile", {
                scale: 2.0,
                duration: "1s",
            });

        })
        .build(),
});
