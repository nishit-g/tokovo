/**
 * Keyboard Typing Demo Episode
 * 
 * Showcases the enterprise keyboard optimization:
 * - TYPING_SEQUENCE pattern (1 event instead of N×2)
 * - Derived state in renderer (currentKey from frame + schedule)
 * - Smooth key-by-key animations
 */

import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";

// Declaration order counter
let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
    meta: {
        id: "keyboard-typing-demo",
        title: "Keyboard Typing Demo ⌨️",
        description: "WhatsApp chat with enterprise keyboard optimization",
        category: "production",
        tags: ["keyboard", "whatsapp", "typing", "enterprise"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 900, // 30s * 30fps
        apps: ["app_whatsapp", "keyboard"],
    },
    build: () => episode("keyboard-typing-demo", {
        fps: 30,
        duration: "30s",
        title: "Keyboard Typing Demo",
    })
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [
                {
                    id: "dm_alex",
                    name: "Alex 👋",
                    avatar: "/avatars/avatar-alex.jpg",
                },
            ],
            os: {
                time: new Date("2024-12-18T14:30:00"),
                battery: 85,
                network: "5G",
            },
        })

        // === WHATSAPP TRACK ===
        .track("app_whatsapp", () => {
            return new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder);
        }, wa => {
            // Opening message from Alex
            wa.at("1s").receive("Alex", "Hey! How's it going?");

            // User typing indicator (synced with keyboard)
            wa.span("3s", "5s").typing("me");
            wa.at("5s").send("Good! Just testing the new keyboard 😊");

            // Alex responds
            wa.at("7s").receive("Alex", "Nice! Does it work well?");

            // Longer typing sequence to show optimization
            wa.span("9s", "12s").typing("me");
            wa.at("12s").send("Yeah, it looks super realistic now!");

            // Quick exchange
            wa.at("14s").receive("Alex", "That's awesome! 🎉");
            wa.span("16s", "17s").typing("me");
            wa.at("17s").send("Thanks!");

            // Final interaction
            wa.at("19s").receive("Alex", "Can I see the code?");
            wa.span("21s", "25s").typing("me");
            wa.at("25s").send("Sure! It uses TYPING_SEQUENCE for efficiency 🚀");

            wa.at("27s").read();
        })

        // === KEYBOARD TRACK (Enterprise Optimized) ===
        // Uses TYPING_SEQUENCE pattern: 1 event instead of 2×N events
        .track("keyboard", () => {
            return new KeyboardTrackBuilder(30, "phone", getOrder);
        }, kb => {
            // First typing: Short message
            kb.at("3s").show();
            // This becomes 1 TYPING_SEQUENCE event (not 70+ events!)
            kb.span("3s", "5s").type("Good! Just testing the new keyboard 😊");
            kb.at("5.1s").hide();

            // Second typing: Medium message
            kb.at("9s").show();
            kb.span("9s", "12s").type("Yeah, it looks super realistic now!");
            kb.at("12.1s").hide();

            // Third typing: Quick message
            kb.at("16s").show();
            kb.span("16s", "17s").type("Thanks!");
            kb.at("17.1s").hide();

            // Fourth typing: Longer message to showcase optimization
            kb.at("21s").show();
            // 43 chars in 4 seconds - each key visible for ~3 frames
            kb.span("21s", "25s").type("Sure! It uses TYPING_SEQUENCE for efficiency 🚀");
            kb.at("25.1s").hide();
        })

        // === CAMERA TRACK ===
        .camera(cam => {
            cam.at("0s").set({ scale: 1 });
            cam.at("1s").animate({ scale: 1.05, duration: "0.3s" });
            cam.at("5s").animate({ scale: 1, duration: "0.3s" });
            cam.at("9s").animate({ scale: 1.02, duration: "0.3s" });
            cam.at("12s").animate({ scale: 1.05, duration: "0.3s" });
            cam.at("17s").animate({ scale: 1, duration: "0.3s" });
            cam.at("21s").animate({ scale: 1.02, duration: "0.3s" });
            cam.at("25s").animate({ scale: 1.05, duration: "0.5s" });
            cam.at("27s").reset({ duration: "1s" });
        })

        // === AUDIO TRACK ===
        .audio(audio => {
            audio.span("0s", "30s").bgm("lofi_chill", { volume: 0.1, fadeIn: "2s", fadeOut: "3s" });
        })

        .build(),
});
