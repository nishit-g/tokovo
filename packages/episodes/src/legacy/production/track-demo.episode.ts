/**
 * Track Demo Episode V2 - Production
 * 
 * Full demonstration of the v2 track-based DSL.
 * 
 * @see docs-v2/EPISODE-ARCH.md
 */

import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";



// =============================================================================
// EPISODE DEFINITION (auto-registers via defineEpisode)
// =============================================================================

export default defineEpisode({
    meta: {
        id: "track-demo-v2",
        title: "Sarah's Big News 💕",
        description: "Complete WhatsApp drama using v2 track DSL",
        category: "production",
        tags: ["whatsapp", "drama", "demo"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 1350, // 45s * 30fps
        apps: ["app_whatsapp"],
    },
    build: () => episode("track-demo-v2", {
        fps: 30,
        duration: "45s",
        title: "Sarah's Big News 💕",
        description: "Complete WhatsApp drama using v2 track DSL",
    })
        // Configure device with WhatsApp
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            os: {
                time: new Date("2024-12-17T19:30:00"),
                battery: 87,
                network: "5G",
            },
        })
        .snapshot("app_whatsapp", "phone", {
            conversations: [
                { id: "dm_sarah", name: "Sarah ❤️", avatar: "/avatars/avatar-sarah.jpg" },
            ],
        })
        .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })

        // === WHATSAPP TRACK ===
        .track("app_whatsapp", (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder), wa => {
            // This episode is a chat drama; switch to the conversation explicitly so
            // the UI starts in the chat screen (not the chat list).
            wa.switchTo("dm_sarah", "0s");

            // Opening message
            wa.at("1s").receive("Sarah", "Hey baby! Are you free tonight? 💕");

            // User typing
            wa.span("3s", "5s").typing("me");
            wa.at("5s").send("Yeah! What did you have in mind? 😊");

            // Sarah typing...
            wa.span("7s", "10s").typing("them");
            wa.at("10s").receive("Sarah", "I have something important to tell you...");

            // Suspense - user typing
            wa.span("13s", "14s").typing("me");
            wa.at("14s").send("Omg what is it?? You're making me nervous! 😳");

            // Sarah's dramatic typing
            wa.span("16s", "20s").typing("them");
            wa.at("20s").receive("Sarah", "I GOT THE JOB OFFER! We can finally move in together! 🎉🏠");

            // Celebration
            wa.span("22s", "23s").typing("me");
            wa.at("23s").send("OMG THAT'S AMAZING!! 🎊🎊🎊 I'M SO PROUD OF YOU!!");

            // Sweet exchange
            wa.span("26s", "28s").typing("them");
            wa.at("28s").receive("Sarah", "I love you so much! Let's celebrate tonight 💕");

            // Final message
            wa.span("30s", "31s").typing("me");
            wa.at("31s").send("I love you too! Dinner at our favorite place? 🍝");

            // Sarah's happy reply
            wa.span("34s", "36s").typing("them");
            wa.at("36s").receive("Sarah", "Perfect! Can't wait! 💋❤️");

            // Read receipt
            wa.at("38s").read();
        })

        // === CAMERA TRACK ===
        .camera(cam => {
            cam.at("0s").set({ scale: 1 });
            cam.at("1s").animate({ scale: 1.08, duration: "0.5s", easing: "easeOut" });
            cam.at("10s").focus("lastMessage", { scale: 1.15, duration: "0.4s" });
            cam.span("13s", "14s").trackCinematic("inputArea", { scale: 1.05 });
            cam.at("20s").animate({ scale: 1.3, y: -40, duration: "0.8s", easing: "cinematic" });
            cam.at("20.5s").shake({ intensityX: 5, intensityY: 4, frequency: 20, decay: 0.85, duration: "0.4s" });
            cam.at("23s").focus("lastMessage", { scale: 1.2, duration: "0.5s" });
            cam.at("30s").animate({ scale: 1.05, y: 0, duration: "1s", easing: "easeOut" });
            cam.at("40s").focus("device", { scale: 1.01, duration: "1.2s", easing: "easeOut" });
        })

        // === AUDIO TRACK ===
        .audio(audio => {
            audio.span("0s", "45s").bgm("romantic_tension", { volume: 0.12, fadeIn: "3s", fadeOut: "4s" });
            audio.at("20s").crossfade("celebration", { duration: "2s", volume: 0.2 });
        })

        // === OS TRACK ===
        .os(os => {
            os.at("10s").time(new Date("2024-12-17T19:32:00"));
            os.at("20s").time(new Date("2024-12-17T19:34:00"));
            os.at("30s").time(new Date("2024-12-17T19:36:00"));
            os.at("40s").time(new Date("2024-12-17T19:38:00"));
            os.at("15s").battery(85);
            os.at("30s").battery(83);
        })

        // === MARKERS ===
        .mark("opening", "1s")
        .mark("suspense", "10s")
        .mark("reveal", "20s")
        .mark("celebration", "23s")
        .mark("finale", "36s")

        .section("intro", "0s", "10s")
        .section("suspense", "10s", "20s")
        .section("celebration", "20s", "36s")
        .section("resolution", "36s", "45s").use(
            new KeyboardPlugin({
                onlyForSentMessages: true,
                defaultCharDelay: 3,
                excludeShortMessages: 3,
            }),
        )


        .build(),
});
