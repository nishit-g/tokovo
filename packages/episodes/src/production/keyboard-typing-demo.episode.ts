/**
 * Keyboard Typing Demo Episode
 * 
 * Simple demo showing WhatsApp with keyboard typing.
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
        description: "WhatsApp chat with keyboard typing",
        category: "production",
        tags: ["keyboard", "whatsapp", "typing"],
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

        .track("app_whatsapp", () => {
            return new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder);
        }, wa => {
            wa.at("1s").receive("Alex", "Hey! How's it going?");
            wa.span("3s", "5s").typing("me");
            wa.at("5s").send("Good! Just testing the new keyboard 😊");
            wa.at("7s").receive("Alex", "Nice! Does it work well?");
            wa.span("9s", "12s").typing("me");
            wa.at("12s").send("Yeah, it looks super realistic now!");
            wa.at("14s").receive("Alex", "That's awesome! 🎉");
            wa.span("16s", "17s").typing("me");
            wa.at("17s").send("Thanks!");
            wa.at("19s").read("Alex");
        })

        // NEW: Separate Keyboard Track (Phase 7)
        .track("keyboard", () => {
            return new KeyboardTrackBuilder(30, "phone", getOrder);
        }, kb => {
            // First typing sequence
            kb.at("3s").show();
            kb.span("3s", "5s").type("Good! Just testing the new keyboard 😊");
            kb.at("5.1s").hide();

            // Second typing sequence
            kb.at("9s").show();
            kb.span("9s", "12s").type("Yeah, it looks super realistic now!");
            kb.at("12.1s").hide();

            // Third typing sequence
            kb.at("16s").show();
            kb.span("16s", "17s").type("Thanks!");
            kb.at("17.1s").hide();
        })

        .camera(cam => {
            cam.at("0s").set({ scale: 1 });
            cam.at("1s").animate({ scale: 1.05, duration: "0.3s" });
            cam.at("5s").animate({ scale: 1, duration: "0.3s" });
            cam.at("12s").animate({ scale: 1.05, duration: "0.3s" });
            cam.at("17s").animate({ scale: 1, duration: "0.3s" });
        })

        .audio(audio => {
            audio.span("0s", "30s").bgm("lofi_chill", { volume: 0.1 });
        })

        .build(),
});
