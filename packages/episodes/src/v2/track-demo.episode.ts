/**
 * Track Demo Episode V2 - Complete Demo with WhatsApp
 * 
 * Full demonstration of the v2 track-based DSL:
 * - WhatsApp messages using WhatsAppTrackBuilder
 * - Camera operations (zoom, focus, shake, reset)
 * - Audio with BGM
 * - OS state changes (time, battery)
 * 
 * @see docs-v2/DSL_REVAMP.md
 */

import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/v2/track";

// =============================================================================
// HELPER
// =============================================================================

// Declaration order counter (shared across all tracks)
let orderCounter = 0;
const getOrder = () => orderCounter++;

// =============================================================================
// DEMO EPISODE
// =============================================================================

export const trackDemoV2 = episode("track-demo-v2", {
    fps: 30,
    duration: "45s",
    title: "Sarah's Big News πŸ'•",
    description: "Complete WhatsApp drama using v2 track DSL",
})
    // Configure device with WhatsApp
    .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
            { id: "dm_sarah", name: "Sarah ❀️", avatar: "/avatars/avatar-sarah.jpg" },
        ],
        os: {
            time: new Date("2024-12-17T19:30:00"),
            battery: 87,
            network: "5G",
        },
    })

    // ==========================================================================
    // WHATSAPP TRACK - Full Conversation
    // ==========================================================================
    .track("app_whatsapp", () => {
        return new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder);
    }, wa => {
        // Opening message
        wa.at("1s").receive("Sarah", "Hey baby! Are you free tonight? πŸ'•");

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
        wa.at("20s").receive("Sarah", "I GOT THE JOB OFFER! We can finally move in together! πŸŽ‰πŸ ");

        // Celebration
        wa.span("22s", "23s").typing("me");
        wa.at("23s").send("OMG THAT'S AMAZING!! πŸŽŠπŸŽŠπŸŽŠ I'M SO PROUD OF YOU!!");

        // Sweet exchange
        wa.span("26s", "28s").typing("them");
        wa.at("28s").receive("Sarah", "I love you so much! Let's celebrate tonight πŸ'•");

        // Final message
        wa.span("30s", "31s").typing("me");
        wa.at("31s").send("I love you too! Dinner at our favorite place? 🍝");

        // Sarah's happy reply
        wa.span("34s", "36s").typing("them");
        wa.at("36s").receive("Sarah", "Perfect! Can't wait! πŸ'‹β€οΈ");

        // Read receipt
        wa.at("38s").read();
    })

    // ==========================================================================
    // CAMERA TRACK - Cinematic Movements
    // ==========================================================================
    .camera(cam => {
        // Start at default
        cam.at("0s").set({ scale: 1 });

        // Zoom in when first message arrives
        cam.at("1s").animate({
            scale: 1.08,
            duration: "0.5s",
            easing: "easeOut",
        });

        // Focus on "something important" message
        cam.at("10s").focus("lastMessage", {
            scale: 1.15,
            duration: "0.4s",
        });

        // Track input during nervous typing
        cam.span("13s", "14s").track("inputArea", {
            scale: 1.05,
        });

        // DRAMATIC ZOOM on the reveal!
        cam.at("20s").animate({
            scale: 1.3,
            y: -40,
            duration: "0.8s",
            easing: "cinematic",
        });

        // Impact shake for excitement
        cam.at("20.5s").shake({
            intensityX: 5,
            intensityY: 4,
            frequency: 20,
            decay: 0.85,
            duration: "0.4s",
        });

        // Focus on celebration messages
        cam.at("23s").focus("lastMessage", {
            scale: 1.2,
            duration: "0.5s",
        });

        // Gentle pull-back for final exchange
        cam.at("30s").animate({
            scale: 1.05,
            y: 0,
            duration: "1s",
            easing: "easeOut",
        });

        // Reset at end
        cam.at("40s").reset({
            duration: "2s",
            easing: "easeOut",
        });
    })

    // ==========================================================================
    // AUDIO TRACK
    // ==========================================================================
    .audio(audio => {
        // Romantic background music
        audio.span("0s", "45s").bgm("romantic_tension", {
            volume: 0.12,
            fadeIn: "3s",
            fadeOut: "4s",
        });

        // Crossfade to celebration music on reveal
        audio.at("20s").crossfade("celebration", {
            duration: "2s",
            volume: 0.2,
        });
    })

    // ==========================================================================
    // OS TRACK - Time Progression
    // ==========================================================================
    .os(os => {
        // Time moves forward
        os.at("10s").time(new Date("2024-12-17T19:32:00"));
        os.at("20s").time(new Date("2024-12-17T19:34:00"));
        os.at("30s").time(new Date("2024-12-17T19:36:00"));
        os.at("40s").time(new Date("2024-12-17T19:38:00"));

        // Battery drain
        os.at("15s").battery(85);
        os.at("30s").battery(83);
    })

    // ==========================================================================
    // MARKERS & SECTIONS
    // ==========================================================================
    .mark("opening", "1s")
    .mark("suspense", "10s")
    .mark("reveal", "20s")
    .mark("celebration", "23s")
    .mark("finale", "36s")

    .section("intro", "0s", "10s")
    .section("suspense", "10s", "20s")
    .section("celebration", "20s", "36s")
    .section("resolution", "36s", "45s")

    // Build the IR
    .build();

// =============================================================================
// EXPORTS
// =============================================================================

export const trackDemoMeta = {
    id: "TrackDemoV2",
    durationInFrames: trackDemoV2.durationInFrames,
    fps: trackDemoV2.fps,
    width: 1080,
    height: 1920,
};

// Log for debugging
console.log("[TrackDemoV2] Episode built:", {
    id: trackDemoV2.id,
    fps: trackDemoV2.fps,
    durationInFrames: trackDemoV2.durationInFrames,
    devices: trackDemoV2.devices.length,
    events: trackDemoV2.events.length,
    markers: trackDemoV2.markers.length,
    sections: trackDemoV2.sections.length,
});
