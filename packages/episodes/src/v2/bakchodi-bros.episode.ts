/**
 * Bakchodi Episode - Two Friends Being Idiots πŸ€ͺ
 * 
 * A hilarious chat between two Indian friends:
 * - RAHUL - The one with a "plan"
 * - VIKRAM - The skeptic who gets dragged into it
 * 
 * Uses V2 track-based DSL for maximum chaos.
 * 
 * @see docs-v2/DSL_REVAMP.md
 */

import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";

// =============================================================================
// HELPER
// =============================================================================

let orderCounter = 0;
const getOrder = () => orderCounter++;

// =============================================================================
// BAKCHODI EPISODE
// =============================================================================

export const bakchodiEpisode = episode("bakchodi-bros", {
    fps: 30,
    duration: "60s",
    title: "Bakchodi Bros πŸ€ͺ",
    description: "Two best friends. One stupid plan. Pure chaos.",
})
    // Configure device with WhatsApp
    .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
            {
                id: "dm_rahul",
                name: "Rahul πŸ€ͺ",
                avatar: "/avatars/avatar-rahul.jpg"
            },
        ],
        os: {
            time: new Date("2024-12-17T23:30:00"),
            battery: 23, // Low battery for realism
            network: "4G",
        },
    })

    // ==========================================================================
    // WHATSAPP TRACK - The Madness Begins
    // ==========================================================================
    .track("app_whatsapp", () => {
        return new WhatsAppTrackBuilder(30, "phone", "dm_rahul", getOrder);
    }, wa => {
        // 11:30 PM - Rahul starts the chaos
        wa.at("1s").receive("Rahul", "bhai");
        wa.at("1.5s").receive("Rahul", "bhai");
        wa.at("2s").receive("Rahul", "BHAI");
        wa.at("2.5s").receive("Rahul", "BHAI UTHJA!!");

        // Vikram wakes up annoyed
        wa.span("4s", "5s").typing("me");
        wa.at("5s").send("kya hai bc? 11:30 baj rahe hain");

        // Rahul's "brilliant" idea
        wa.span("6s", "8s").typing("them");
        wa.at("8s").receive("Rahul", "bhai sun meri baat");
        wa.at("9s").receive("Rahul", "mere paas ek plan hai πŸ'€");

        // Vikram suspicious
        wa.span("11s", "12s").typing("me");
        wa.at("12s").send("tera last plan... mujhe police station le gaya tha");

        // Rahul defensive
        wa.span("14s", "16s").typing("them");
        wa.at("16s").receive("Rahul", "bhai wo galat report thi");
        wa.at("17s").receive("Rahul", "aur uncle ne sorry bol diya tha");

        // Vikram not convinced
        wa.span("19s", "20s").typing("me");
        wa.at("20s").send("uncle ne mujhe tamatar phenka tha πŸ…");

        // Rahul ignores and continues
        wa.span("22s", "25s").typing("them");
        wa.at("25s").receive("Rahul", "chod na wo sab");
        wa.at("26s").receive("Rahul", "sun");
        wa.at("27s").receive("Rahul", "aaj maggi party karein 🍜");

        // Vikram confused
        wa.span("29s", "30s").typing("me");
        wa.at("30s").send("...bas itna?");
        wa.at("31s").send("iske liye 50 baar bhai bhai kiya?");

        // Rahul's twist
        wa.span("33s", "36s").typing("them");
        wa.at("36s").receive("Rahul", "are nahi nahi");
        wa.at("37s").receive("Rahul", "maggi party");
        wa.at("38s").receive("Rahul", "CLUB mein 🏝️");

        // Vikram's reaction
        wa.span("40s", "41s").typing("me");
        wa.at("41s").send("club mein maggi? 🀨");

        // Rahul explains
        wa.span("43s", "46s").typing("them");
        wa.at("46s").receive("Rahul", "bhai mereko pata hai ek jagah");
        wa.at("47s").receive("Rahul", "bahut exclusive hai");
        wa.at("48s").receive("Rahul", "wahan maggi milti hai 500 rupay ki πŸ'€");

        // Vikram loses it
        wa.span("50s", "51s").typing("me");
        wa.at("51s").send("500 KI MAGGI???");
        wa.at("52s").send("BHAI TU PAGAL HAI KYA");

        // Rahul's final pitch
        wa.span("54s", "56s").typing("them");
        wa.at("56s").receive("Rahul", "bhai trust me");
        wa.at("57s").receive("Rahul", "pehle khana phir judge karna");
        wa.at("58s").receive("Rahul", "15 min mein neeche aa πŸš—");

        // Vikram gives in
        wa.span("59s", "60s").typing("me");
        wa.at("60s").send("chal aa raha hun... pagal πŸ€¦β€β™‚οΈ");
    })

    // ==========================================================================
    // CAMERA TRACK - Chaos Energy
    // ==========================================================================
    .camera(cam => {
        // Start normal
        cam.at("0s").set({ scale: 1 });

        // Zoom on the spam messages
        cam.at("1s").animate({
            scale: 1.1,
            duration: "0.3s",
            easing: "easeOut",
        });

        // Shake on BHAI UTHJA
        cam.at("2.5s").shake({
            intensityX: 8,
            intensityY: 6,
            frequency: 25,
            decay: 0.9,
            duration: "0.4s",
        });

        // Focus on "plan hai"
        cam.at("9s").focus("lastMessage", {
            scale: 1.15,
            duration: "0.5s",
        });

        // Zoom out for police station reveal
        cam.at("12s").animate({
            scale: 1.2,
            duration: "0.5s",
            easing: "cinematic",
        });

        // Gentle shake on tamatar
        cam.at("20s").shake({
            intensityX: 4,
            intensityY: 3,
            frequency: 15,
            decay: 0.8,
            duration: "0.3s",
        });

        // Focus on CLUB mein
        cam.at("38s").animate({
            scale: 1.25,
            y: -30,
            duration: "0.6s",
            easing: "cinematic",
        });

        // BIG shake on 500 rupay
        cam.at("51s").shake({
            intensityX: 12,
            intensityY: 10,
            frequency: 30,
            decay: 0.85,
            duration: "0.5s",
        });

        // Reset for ending
        cam.at("55s").animate({
            scale: 1.05,
            y: 0,
            duration: "1s",
            easing: "easeOut",
        });
    })

    // ==========================================================================
    // AUDIO TRACK
    // ==========================================================================
    .audio(audio => {
        // Chill lo-fi beats
        audio.span("0s", "60s").bgm("lofi_chill", {
            volume: 0.15,
            fadeIn: "2s",
            fadeOut: "3s",
        });
    })

    // ==========================================================================
    // OS TRACK - Realistic Time
    // ==========================================================================
    .os(os => {
        // Time progression (late night)
        os.at("15s").time(new Date("2024-12-17T23:32:00"));
        os.at("30s").time(new Date("2024-12-17T23:34:00"));
        os.at("45s").time(new Date("2024-12-17T23:36:00"));
        os.at("60s").time(new Date("2024-12-17T23:38:00"));

        // Battery draining
        os.at("20s").battery(21);
        os.at("40s").battery(19);
        os.at("55s").battery(17);
    })

    // ==========================================================================
    // MARKERS & SECTIONS
    // ==========================================================================
    .mark("spam", "1s")
    .mark("plan_reveal", "9s")
    .mark("police_flashback", "12s")
    .mark("tamatar_incident", "20s")
    .mark("club_reveal", "38s")
    .mark("500_rupay_shock", "51s")
    .mark("acceptance", "60s")

    .section("wake_up", "0s", "5s")
    .section("the_pitch", "5s", "27s")
    .section("club_twist", "27s", "50s")
    .section("giving_in", "50s", "60s")

    // Build the IR
    .build();

// =============================================================================
// EXPORTS
// =============================================================================

export const bakchodiMeta = {
    id: "BakchodiBros",
    durationInFrames: bakchodiEpisode.durationInFrames,
    fps: bakchodiEpisode.fps,
    width: 1080,
    height: 1920,
};

// Log for debugging
console.log("[BakchodiBros] Episode built:", {
    id: bakchodiEpisode.id,
    fps: bakchodiEpisode.fps,
    durationInFrames: bakchodiEpisode.durationInFrames,
    devices: bakchodiEpisode.devices.length,
    events: bakchodiEpisode.events.length,
    markers: bakchodiEpisode.markers.length,
    sections: bakchodiEpisode.sections.length,
});
