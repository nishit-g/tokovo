/**
 * Notification Demo Episode
 * 
 * Showcases the device-notifications package:
 * - NotificationTrackBuilder DSL
 * - WhatsApp notifications with sound
 * - Dynamic Island interactions
 * - Notification dismiss/tap flows
 */

import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";

// Declaration order counter
let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
    meta: {
        id: "notification-demo",
        title: "Notification Demo 🔔",
        description: "WhatsApp notifications with enterprise notification system",
        category: "production",
        tags: ["notifications", "whatsapp", "dynamic-island", "enterprise"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 600, // 20s * 30fps
        apps: ["app_whatsapp"],
    },
    build: () => episode("notification-demo", {
        fps: 30,
        duration: "20s",
        title: "Notification Demo",
    })
        .device("phone", "iphone16", {
            app: "app_whatsapp", // Start with WhatsApp open
            conversations: [
                {
                    id: "dm_alex",
                    name: "Alex 👋",
                    avatar: "/avatars/avatar-alex.jpg",
                },
                {
                    id: "dm_sarah",
                    name: "Sarah 💕",
                    avatar: "/avatars/avatar-sarah.jpg",
                },
            ],
            os: {
                time: new Date("2024-12-18T14:30:00"),
                battery: 85,
                network: "5G",
            },
        })

        // === NOTIFICATIONS TRACK ===
        .track("notifications", () => {
            return new NotificationTrackBuilder(30, "phone", getOrder);
        }, noti => {
            // First notification: WhatsApp message from Alex
            noti.at("1s").show({
                id: "notif_1",
                appId: "app_whatsapp",
                title: "Alex 👋",
                body: "Hey! Are you free tonight?",
                mode: "headsup",
                preview: { kind: "text", value: "Hey! Are you free tonight?" },
            });

            // Second notification: Another message
            noti.at("4s").show({
                id: "notif_2",
                appId: "app_whatsapp",
                title: "Sarah 💕",
                body: "Check out this photo! 📸",
                mode: "headsup",
                preview: { kind: "image", value: "/images/photo-preview.jpg" },
            });

            // Dismiss first notification
            noti.at("6s").dismiss("notif_1");

            // Tap second notification to open app
            noti.at("8s").tap("notif_2");

            // After app is open, show Dynamic Island
            noti.at("10s").dynamicIsland({
                mode: "compact",
                appId: "app_music",
            });

            // Third notification while in app
            noti.at("12s").show({
                id: "notif_3",
                appId: "app_whatsapp",
                title: "Alex 👋",
                body: "Hello? 👀",
                mode: "headsup",
            });

            // Swipe to dismiss
            noti.at("15s").swipe("notif_3", "left", "dismiss");

            // Clear all at the end
            noti.at("18s").clearAll();
        })

        // === WHATSAPP TRACK (background messages) ===
        .track("app_whatsapp", () => {
            return new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder);
        }, wa => {
            // Messages received match notifications
            wa.at("1s").receive("Alex", "Hey! Are you free tonight?");
            wa.at("12s").receive("Alex", "Hello? 👀");
        })

        // Camera movements
        .camera(cam => {
            cam.at("0s").set({ scale: 1 });
            cam.at("1s").animate({ scale: 1.05, duration: "0.3s" }); // Slight zoom on notification
            cam.at("2s").animate({ scale: 1, duration: "0.5s" }); // Back to normal
            cam.at("8s").animate({ scale: 1.1, duration: "0.5s" }); // Zoom when opening app
            cam.at("10s").animate({ scale: 1, duration: "0.5s" }); // Back to normal
        })

        .build(),
});
