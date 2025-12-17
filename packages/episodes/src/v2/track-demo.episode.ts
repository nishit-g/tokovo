/**
 * Track Demo Episode v2 - Complete demo with WhatsApp track
 * 
 * @description Full demo using the v2 track-based DSL.
 * Shows camera, audio, OS, and WhatsApp tracks with explicit timing.
 * 
 * @see docs-v2/DSL_REVAMP.md
 */

import { episode } from "@tokovo/dsl/src/v2";
import { createWhatsAppTrackBuilder, WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/v2";

// Helper to get a declaration order counter
let orderCounter = 0;
const getOrder = () => orderCounter++;

export const trackDemoV2 = episode("track-demo-v2", {
    fps: 30,
    duration: "45s",
    title: "Track Demo V2 - Complete",
    description: "Demo of v2 track-based DSL with WhatsApp integration",
})
    // Configure device
    .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
            { id: "dm_sarah", name: "Sarah ❤️", avatar: "/avatars/sarah.jpg" },
        ],
        os: {
            time: new Date("2024-12-17T19:30:00"),
            battery: 87,
            network: "5G",
        },
    })

    // Camera track
    .camera(cam => {
        // Initial state
        cam.at("0s").set({ scale: 1 });

        // Zoom in on first message
        cam.at("2s").animate({
            scale: 1.15,
            y: -30,
            duration: "0.5s",
            easing: "easeOut",
        });

        // Focus on last message after response
        cam.at("8s").focus("lastMessage", {
            scale: 1.2,
            padding: 10,
            duration: "0.4s",
        });

        // Track input during typing
        cam.span("12s", "18s").track("inputArea", {
            scale: 1.08,
        });

        // Dramatic zoom on reveal
        cam.at("25s").animate({
            scale: 1.35,
            duration: "0.8s",
            easing: "cinematic",
        });

        // Subtle shake for impact
        cam.at("30s").shake({
            intensityX: 4,
            intensityY: 3,
            frequency: 22,
            decay: 0.85,
            duration: "0.4s",
        });

        // Reset for ending
        cam.at("40s").reset({
            duration: "1.5s",
            easing: "easeOut",
        });
    })

    // Audio track
    .audio(audio => {
        // BGM for full episode
        audio.span("0s", "45s").bgm("romantic_tension", {
            volume: 0.15,
            fadeIn: "3s",
            fadeOut: "4s",
        });

        // Crossfade at dramatic moment
        audio.at("25s").crossfade("dramatic_reveal", {
            duration: "2s",
            volume: 0.25,
        });
    })

    // OS track
    .os(os => {
        // Time progression
        os.at("15s").time(new Date("2024-12-17T19:33:00"));
        os.at("30s").time(new Date("2024-12-17T19:37:00"));
        os.at("40s").time(new Date("2024-12-17T19:40:00"));

        // Battery drain
        os.at("20s").battery(84);
        os.at("35s").battery(81);
    })

    // Markers for debugging/navigation
    .mark("opener", "0s")
    .mark("first_message", "2s")
    .mark("response", "8s")
    .mark("typing_sequence", "12s")
    .mark("dramatic_reveal", "25s")
    .mark("impact", "30s")
    .mark("resolution", "40s")

    // Sections for timeline regions
    .section("intro", "0s", "8s")
    .section("buildup", "8s", "25s")
    .section("climax", "25s", "35s")
    .section("resolution", "35s", "45s")

    // Build the IR
    .build();

/**
 * Get WhatsApp track builder for use with episode.track()
 */
export function getWhatsAppBuilder(
    fps: number,
    deviceId: string,
    conversationId: string
): WhatsAppTrackBuilder {
    return createWhatsAppTrackBuilder(fps, deviceId, conversationId, getOrder);
}
