/**
 * Bakchodi Gang - ULTIMATE EDITION 🇮🇳🔥
 * 
 * Using EVERY DSL feature:
 * ✅ WhatsApp: receive, send, typing, reactions, dateSeparator, sendVoice, receiveImage
 * ✅ Keyboard: show, type, hide
 * ✅ Calls: incoming, answer, end
 * ✅ Notifications: show, dismiss, tap (proper DSL!)
 * ✅ Camera: focus, shake, animate, reset
 * ✅ OS: time, battery, openApp, goHome
 * 
 * Story: Boys planning party, interrupted by call from Mom, then back to planning!
 */

import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";
import { CallTrackBuilder } from "@tokovo/device-calls/src/dsl/track-builder";
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";
import { NotificationTrackBuilder } from "@tokovo/device-notifications/src/dsl/track-builder";

// Declaration order counter
let orderCounter = 0;
const getOrder = () => orderCounter++;

// =============================================================================
// BAKCHODI GANG - ULTIMATE EDITION
// =============================================================================

export default defineEpisode({
    meta: {
        id: "bakchodi-gang",
        title: "Bakchodi Gang - Ultimate 🇮🇳",
        description: "Complete showcase with calls, keyboard, navigation!",
        category: "production",
        tags: ["whatsapp", "group", "indian", "call", "keyboard", "demo"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 1200, // 40s * 30fps
        apps: ["app_whatsapp"],
    },
    build: () => episode("bakchodi-gang", {
        fps: 30,
        duration: "40s",
        title: "Bakchodi Gang - Ultimate 🇮🇳",
        description: "The boys are planning, but Mom calls...",
    })
        // Device setup
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [
                {
                    id: "group_bakchodi",
                    name: "Bakchodi Gang 🔥",
                    type: "group",
                    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=gang",
                    participants: ["Rahul", "Aditya", "Priya", "Rohan"],
                },
            ],
            os: {
                time: new Date("2024-12-20T23:30:00"),
                battery: 42,
                network: "wifi",
            },
        })

        // === WHATSAPP TRACK ===
        .track("app_whatsapp", () => {
            return new WhatsAppTrackBuilder(30, "phone", "group_bakchodi", getOrder);
        }, wa => {
            // === NAVIGATION: Start on chat list (0s) ===
            wa.openChatList("0s");

            // === NAVIGATION: Switch to conversation (1s) ===
            wa.switchTo("group_bakchodi", "1s");

            // SCENE 1: The Planning (1s - 12s)
            wa.dateSeparator("Today"); // TrackBuilder method, no at() needed
            wa.at("2s").receive("Aditya", "Bhai party kab? 🎉");

            wa.span("3s", "4s").typing("them");
            wa.at("4s").receive("Rahul", "Kal raat? Meri treat! 💰");

            wa.span("5s", "6s").typing("them");
            wa.at("6s").receive("Priya", "Rahul ne kaha treat? Screenshot le lo 📸");

            wa.at("7s").react({ index: -1 }, "😂"); // React to Priya's screenshot message

            // User types reply (keyboard will show)
            wa.span("8s", "10s").typing("me");
            wa.at("10s").send("Hahahaha bhai teri toh lag gayi! 🤣");

            // SCENE 2: After the call (25s - 38s)
            wa.at("25s").receive("Aditya", "Bhai tune phone kyun cut kiya? 😤");

            wa.span("26s", "27s").typing("me");
            wa.at("27s").send("Mom ka call tha, ghar aana hai 😅");

            wa.at("28s").receive("Rohan", "Typical 😂😂", {
                replyTo: {
                    id: "prev-msg",
                    text: "Mom ka call tha, ghar aana hai 😅",
                    from: "me"
                }
            });

            wa.at("29s").receiveImage("Priya", "https://picsum.photos/400/300", { caption: "Party vibes 🎊" });

            wa.at("30s").react({ index: -1 }, "🔥"); // React to Priya's photo

            wa.span("31s", "32s").typing("them");
            wa.at("32s").receive("Rahul", "Theek hai 11 baje pakka milte hai 🕚");

            wa.at("33s").sendVoice(3);

            // Send a GIF
            wa.at("34s").sendGif("https://media.giphy.com/media/celebration/giphy.gif");

            wa.at("35s").receive("Aditya", "DONE! Letssss goooo!!! 🚀🔥");

            wa.at("36s").react({ index: -1 }, "🙌"); // React to finale

            wa.at("37s").read();

            // === NAVIGATION: Go back to chat list (38s) ===
            wa.openChatList("38s");
        })

        // === KEYBOARD TRACK ===
        .track("keyboard", () => {
            return new KeyboardTrackBuilder(30, "phone", getOrder);
        }, kb => {
            // Keyboard appears when user types (adjusted to match new timing)
            kb.at("8s").show({ layout: "qwerty" });
            kb.span("8.5s", "10s").type("Hahahaha bhai teri toh lag gayi! 🤣", { speed: "fast" });
            kb.at("10.5s").hide();

            // Typing after call
            kb.at("26s").show();
            kb.span("26.2s", "27s").type("Mom ka call tha, ghar aana hai 😅", { speed: "normal" });
            kb.at("27.5s").hide();
        })

        // === CALL TRACK (Mom calls!) ===
        .track("calls", () => {
            return new CallTrackBuilder(30, "phone", getOrder);
        }, call => {
            // SCENE 3: Mom's call interrupts! (12s - 24s)
            call.at("12s").incoming({
                callerId: "mom",
                callerName: "Mom ❤️",
                callerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mom",
                isVideo: false,
                callType: "voice",
                displayMode: "fullscreen",
            });

            // Answer after 3 seconds
            call.at("15s").answer();

            // Short call then hang up
            call.at("22s").end({ reason: "ended" });
        })

        // === NOTIFICATION TRACK (proper DSL!) ===
        .track("notifications", () => {
            return new NotificationTrackBuilder(30, "phone", getOrder);
        }, notif => {
            // Instagram notification pops while chatting
            notif.at("8s").show({
                id: "notif_instagram_1",
                appId: "app_instagram",
                title: "Instagram",
                body: "virat.kohli liked your photo 🏏",
                icon: "https://api.dicebear.com/7.x/shapes/svg?seed=insta",
            });

            // User dismisses it after 2s
            notif.at("10s").swipe("notif_instagram_1", "left", "dismiss");

            // Another notification during call
            notif.at("18s").show({
                id: "notif_twitter_1",
                appId: "app_twitter",
                title: "Twitter",
                body: "@elonmusk replied to your tweet 🚀",
            });

            // Dismiss after call ends
            notif.at("24s").dismiss("notif_twitter_1");
        })

        // === CAMERA TRACK ===
        .camera(cam => {
            cam.at("0s").set({ scale: 1 });

            // Focus on treat message
            cam.at("3s").animate({ scale: 1.15, duration: "0.5s", easing: "easeOut" });

            // Screenshot roast - shake!
            cam.at("5s").shake({ intensityX: 4, intensityY: 3, frequency: 15, decay: 0.8, duration: "0.3s" });

            // Pull back before call
            cam.at("10s").animate({ scale: 1.0, duration: "0.5s" });

            // After call - excitement
            cam.at("25s").animate({ scale: 1.2, y: -40, duration: "0.6s", easing: "cinematic" });

            // Photo moment
            cam.at("29s").focus("lastMessage", { scale: 1.25, duration: "0.4s" });

            // Final hype shake
            cam.at("35s").shake({ intensityX: 6, intensityY: 5, frequency: 20, decay: 0.9, duration: "0.5s" });

            // Smooth end
            cam.at("37s").reset({ duration: "2s", easing: "easeOut" });
        })

        // === AUDIO TRACK ===
        .audio(audio => {
            audio.span("0s", "12s").bgm("upbeat_casual", { volume: 0.08, fadeOut: "1s" });
            audio.span("25s", "40s").bgm("celebration", { volume: 0.1, fadeIn: "1s", fadeOut: "2s" });
        })

        // === OS TRACK ===
        .os(os => {
            // Time progression
            os.at("0s").time(new Date("2024-12-20T23:30:00"));
            os.at("12s").time(new Date("2024-12-20T23:31:00"));
            os.at("25s").time(new Date("2024-12-20T23:33:00"));
            os.at("35s").time(new Date("2024-12-20T23:34:00"));

            // Battery drain
            os.at("15s").battery(40);
            os.at("30s").battery(38);

            // Instagram notification while chatting
            os.at("8s").notification({
                appId: "app_instagram",
                title: "Instagram",
                body: "virat.kohli liked your photo 🏏",
            });

            // === NAVIGATION ===
            // Call interrupts - phone app takes over (handled by call track)
            // Back to WhatsApp after call
            os.at("24s").openApp("app_whatsapp");
        })

        // === MARKERS ===
        .mark("opening", "1s")
        .mark("treat_announcement", "3s")
        .mark("screenshot_roast", "5s")
        .mark("call_incoming", "12s")
        .mark("call_answered", "15s")
        .mark("call_ended", "22s")
        .mark("back_to_chat", "25s")
        .mark("photo_shared", "29s")
        .mark("voice_message", "33s")
        .mark("finale", "35s")

        .section("planning", "0s", "12s")
        .section("mom_calls", "12s", "24s")
        .section("back_to_party", "24s", "40s")

        .build(),
});
