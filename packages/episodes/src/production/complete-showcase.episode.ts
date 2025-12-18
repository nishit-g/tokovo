/**
 * Complete Showcase Episode
 * 
 * Demonstrates ALL Tokovo features in one episode:
 * - WhatsApp messages and typing
 * - Notifications (heads-up, dismiss, tap)
 * - Phone calls (incoming, answer, end)
 * - Keyboard (show, type, hide)
 * - Dynamic Island
 * - Camera movements (zoom, pan)
 * 
 * This is the ultimate demo of Tokovo's capabilities.
 */

import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";
import { CallTrackBuilder } from "@tokovo/device-calls";
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";

// Declaration order counter
let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
    meta: {
        id: "complete-showcase",
        title: "Complete Showcase 🎬",
        description: "All Tokovo features: WhatsApp, Notifications, Calls, Keyboard, Camera",
        category: "production",
        tags: ["showcase", "whatsapp", "notifications", "calls", "keyboard", "camera", "enterprise"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 1200, // 40s * 30fps
        apps: ["app_whatsapp"],
    },
    build: () => episode("complete-showcase", {
        fps: 30,
        duration: "40s",
        title: "Complete Showcase",
    })
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [
                {
                    id: "dm_mom",
                    name: "Mom ❤️",
                    avatar: "/avatars/avatar-mom.jpg",
                },
                {
                    id: "dm_alex",
                    name: "Alex 👋",
                    avatar: "/avatars/avatar-alex.jpg",
                },
            ],
            os: {
                time: new Date("2024-12-19T14:30:00"),
                battery: 85,
                network: "5G",
            },
        })

        // =================================================================
        // WHATSAPP TRACK - Main messaging flow
        // =================================================================
        .track("app_whatsapp", () => {
            return new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder);
        }, wa => {
            // Initial message from Alex
            wa.at("1s").receive("Alex", "Hey! What are you up to?");

            // User typing indicator
            wa.span("5s", "8s").typing("me");
            wa.at("8s").send("Not much, just chilling 😎");

            // Alex responds with excitement
            wa.at("12s").receive("Alex", "Cool! Want to grab dinner later?");

            // We think about it...
            wa.span("15s", "18s").typing("me");
            wa.at("18s").send("Sure! Where were you thinking?");

            // But then Mom calls! (interruption at 20s)

            // After call ends, Alex responds
            wa.at("32s").receive("Alex", "How about that new Italian place? 🍝");

            // We confirm
            wa.span("33s", "36s").typing("me");
            wa.at("36s").send("Perfect! See you at 7! 👍");
        })

        // =================================================================
        // NOTIFICATIONS TRACK - System notifications
        // =================================================================
        .track("notifications", () => {
            return new NotificationTrackBuilder(30, "phone", getOrder);
        }, (noti: NotificationTrackBuilder) => {
            // First WhatsApp notification
            noti.at("1s").show({
                id: "notif_alex_1",
                appId: "app_whatsapp",
                title: "Alex 👋",
                body: "Hey! What are you up to?",
                mode: "headsup",
                preview: { kind: "text", value: "Hey! What are you up to?" },
            });

            // Auto-dismiss after reading
            noti.at("4s").dismiss("notif_alex_1");

            // Second notification
            noti.at("12s").show({
                id: "notif_alex_2",
                appId: "app_whatsapp",
                title: "Alex 👋",
                body: "Cool! Want to grab dinner later?",
                mode: "headsup",
            });

            // Dismiss
            noti.at("14s").dismiss("notif_alex_2");

            // After call: notification from Alex
            noti.at("32s").show({
                id: "notif_alex_3",
                appId: "app_whatsapp",
                title: "Alex 👋",
                body: "How about that new Italian place? 🍝",
                mode: "headsup",
            });

            // Dismiss it
            noti.at("34s").dismiss("notif_alex_3");
        })

        // =================================================================
        // CALLS TRACK - Incoming call from Mom
        // =================================================================
        .track("calls", () => {
            return new CallTrackBuilder(30, "phone", getOrder);
        }, (call: CallTrackBuilder) => {
            // Mom calls while we're chatting!
            call.at("20s").incoming({
                callerId: "mom_123",
                callerName: "Mom ❤️",
                callerAvatar: "/avatars/avatar-mom.jpg",
                isVideo: false,
                callType: "voice",
            });

            // We answer after 2 seconds
            call.at("22s").answer();

            // Quick mute to check something
            call.at("25s").toggleMute();

            // Unmute
            call.at("26s").toggleMute();

            // End call after 8 seconds
            call.at("30s").end();
        })

        // =================================================================
        // KEYBOARD TRACK - Typing our messages
        // =================================================================
        .track("keyboard", () => {
            return new KeyboardTrackBuilder(30, "phone", getOrder);
        }, kb => {
            // Show keyboard when we start typing first reply
            kb.at("5s").show();
            kb.span("5s", "8s").type("Not much, just chilling 😎");
            kb.at("8.1s").hide();

            // Show keyboard for second reply
            kb.at("15s").show();
            kb.span("15s", "18s").type("Sure! Where were you thinking?");
            kb.at("18.1s").hide();

            // After call - type final message
            kb.at("33s").show();
            kb.span("33s", "36s").type("Perfect! See you at 7! 👍");
            kb.at("36.1s").hide();
        })

        // =================================================================
        // CAMERA TRACK - Cinematic movements
        // =================================================================
        .camera(cam => {
            // Opening shot - neutral
            cam.at("0s").set({ scale: 1 });

            // Slight zoom on first notification
            cam.at("1s").animate({ scale: 1.03, duration: "0.3s" });
            cam.at("2s").animate({ scale: 1, duration: "0.5s" });

            // Zoom when typing
            cam.at("5s").animate({ scale: 1.05, duration: "0.4s" });
            cam.at("9s").animate({ scale: 1, duration: "0.5s" });

            // Dramatic zoom for incoming call
            cam.at("20s").animate({ scale: 1.1, duration: "0.5s" });

            // Stay zoomed during call
            cam.at("22s").animate({ scale: 1.05, duration: "0.3s" });

            // Zoom out when call ends
            cam.at("30s").animate({ scale: 1, duration: "0.5s" });

            // Final message - slight zoom
            cam.at("33s").animate({ scale: 1.02, duration: "0.3s" });
            cam.at("38s").animate({ scale: 1, duration: "0.5s" });
        })

        .build(),
});
