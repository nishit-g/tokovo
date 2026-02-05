/**
 * Multilayer Showcase Episode
 *
 * Comprehensive demo showing all layers working together:
 * - Voice narration (with automatic music ducking)
 * - Background music (cinematic ambient)
 * - WhatsApp conversation (drama story)
 * - OS notifications (multiple apps)
 * - Camera animations (shakes, zooms, focus)
 * - System updates (battery drain, time progression)
 *
 * Duration: 60 seconds @ 30fps (1800 frames)
 */

import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";
import { drama_example } from "@tokovo/voice";
import { KeyboardPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "multilayer-showcase",
    title: "Multilayer Showcase - Full Feature Demo",
    description:
      "Complete demonstration of voice + music ducking, WhatsApp, notifications, and camera effects",
    category: "production",
    tags: [
      "voice",
      "music",
      "ducking",
      "whatsapp",
      "notifications",
      "showcase",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1800, // 60s @ 30fps
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("multilayer-showcase", {
      fps: 30,
      duration: "60s",
      title: "Multilayer Showcase",
      description: "All features working together",
    })
      // ============================================
      // VOICE LAYER - Narration with music ducking
      // ============================================
      .voice(drama_example, (v) => {
        // Voice plays at these times, music will auto-duck to 15%
        v.at("2s").play("seg_0"); // "It all started with one message..."
        v.at("18s").play("seg_1"); // "Little did she know..."
        v.at("35s").play("seg_2"); // "The truth was about to surface..."
        v.at("52s").play("seg_3"); // "And nothing would ever be the same."
      })

      // ============================================
      // DEVICE SETUP
      // ============================================
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_alex",
            name: "Alex 💔",
            avatar: "/avatars/alex.png",
          },
          {
            id: "dm_unknown",
            name: "Unknown Number",
            avatar: "/avatars/unknown.png",
          },
        ],
        os: {
          time: new Date("2024-12-20T22:45:00"),
          battery: 34,
          network: "4G",
        },
      })

      // ============================================
      // WHATSAPP CONVERSATION - Drama Story
      // ============================================
      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder);
        },
        (wa) => {
          // Opening - match voice segment 1 timing
          wa.at("3s").receive("Alex", "Hey...");
          wa.at("4s").receive("Alex", "We need to talk.");

          wa.span("5.5s", "6.5s").typing("me");
          wa.at("6.5s").send("What's going on?");

          wa.span("8s", "10s").typing("them");
          wa.at("10s").receive("Alex", "I saw the screenshots.");
          wa.at("11s").receive("Alex", "From last night.");

          wa.span("12.5s", "13.5s").typing("me");
          wa.at("13.5s").send("What screenshots?? 😰");

          // Build tension - match voice segment 2
          wa.span("15s", "17s").typing("them");
          wa.at("17s").receive("Alex", "Don't play dumb with me.");

          wa.at("20s").receiveImage("Alex", "/placeholders/media.svg", {
            caption: "Explain this.",
          });

          wa.span("22s", "23s").typing("me");
          wa.at("23s").send("That's not what it looks like!");
          wa.at("24s").send("I can explain!");

          wa.at("26s").receive("Alex", "I trusted you...");

          // Switch to unknown number at peak tension
          wa.at("28s").receive("Unknown", "He found out.");
          wa.at("29s").receive("Unknown", "I tried to warn you.");

          wa.span("31s", "32s").typing("me");
          wa.at("32s").send("Who is this?!");

          // Voice segment 3 - truth surfaces
          wa.at("36s").receive("Unknown", "Check your photos.");
          wa.at("37s").receive("Unknown", "The one from Tuesday.");

          wa.span("39s", "40s").typing("me");
          wa.at("40s").send("How do you know about that?");

          wa.at("42s").receiveVoice("Unknown", 4);

          // Return to Alex
          wa.at("46s").receive("Alex", "I'm done.");
          wa.at("47s").receive("Alex", "Goodbye.");

          wa.span("48.5s", "49.5s").typing("me");
          wa.at("49.5s").send("WAIT");
          wa.at("50s").send("Please let me explain! 😢");

          // Voice segment 4 - nothing the same
          wa.at("53s").receive("Alex", "Some things can't be explained.");
          wa.at("55s").receive("Alex", "🚫 You have been blocked.");

          wa.span("57s", "58s").typing("me");
          wa.at("58s").send("...");
        },
      )

      // ============================================
      // BACKGROUND MUSIC - Cinematic Ambient
      // ============================================
      .audio((audio) => {
        audio.span("0s", "60s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.3,
          fadeIn: "3s",
          fadeOut: "4s",
        });
      })

      // ============================================
      // NOTIFICATIONS - Using NotificationTrackBuilder
      // ============================================
      .track(
        "device_notifications",
        () => new NotificationTrackBuilder(30, "phone", getOrder),
        (notif) => {
          notif.at("7s").show({
            id: "notif_instagram",
            appId: "Instagram",
            title: "Instagram",
            body: "sarah_j liked your story",
            icon: "/placeholders/app-icon.svg",
            priority: "default",
          });
          notif.at("9s").swipe("notif_instagram", "right");

          notif.at("15s").show({
            id: "notif_twitter",
            appId: "Twitter",
            title: "Twitter",
            body: "@mikejones mentioned you in a tweet",
            icon: "/placeholders/app-icon.svg",
            priority: "default",
          });
          notif.at("17s").swipe("notif_twitter", "right");

          notif.at("22s").show({
            id: "notif_wa_alex",
            appId: "app_whatsapp",
            title: "Alex 💔",
            body: "Image",
            icon: "/placeholders/app-icon.svg",
            priority: "high",
          });
          notif.at("25s").dismiss("notif_wa_alex");

          notif.at("28s").show({
            id: "notif_unknown",
            appId: "app_whatsapp",
            title: "Unknown Number",
            body: "He found out.",
            icon: "/placeholders/app-icon.svg",
            priority: "high",
          });
          notif.at("32s").dismiss("notif_unknown");

          notif.at("38s").show({
            id: "notif_email",
            appId: "Gmail",
            title: "Gmail",
            body: "Your flight is confirmed for tomorrow",
            icon: "/placeholders/app-icon.svg",
            priority: "default",
          });
          notif.at("41s").swipe("notif_email", "right");

          notif.at("47s").show({
            id: "notif_wa_goodbye",
            appId: "app_whatsapp",
            title: "Alex 💔",
            body: "Goodbye.",
            icon: "/placeholders/app-icon.svg",
            priority: "high",
          });
          notif.at("50s").dismiss("notif_wa_goodbye");

          notif.at("55s").show({
            id: "notif_battery",
            appId: "System",
            title: "Low Battery",
            body: "26% remaining. Connect to power.",
            icon: "/placeholders/app-icon.svg",
            priority: "critical",
          });
        },
      )

      // ============================================
      // OS LAYER - System Updates (no notifications)
      // ============================================
      .os((os) => {
        // Time progression (every 10s)
        os.at("0s").time(new Date("2024-12-20T22:45:00"));
        os.at("10s").time(new Date("2024-12-20T22:46:00"));
        os.at("20s").time(new Date("2024-12-20T22:47:00"));
        os.at("30s").time(new Date("2024-12-20T22:48:00"));
        os.at("40s").time(new Date("2024-12-20T22:49:00"));
        os.at("50s").time(new Date("2024-12-20T22:50:00"));

        // Battery drain (nervous checking phone)
        os.at("15s").battery(32);
        os.at("30s").battery(29);
        os.at("45s").battery(26);

        // Network fluctuation (tension)
        os.at("25s").network("3G");
        os.at("35s").network("4G");
        os.at("50s").network("none");
      })

      // ============================================
      // CAMERA LAYER - Dynamic Cinematography
      // ============================================
      .camera((cam) => {
        // Opening - calm before storm
        cam.at("0s").set({ scale: 1 });
        cam.at("0s").animate({
          scale: 1.02,
          duration: "3s",
          easing: "easeOut",
        });

        // First voice segment - slight tension
        cam.at("2s").animate({
          scale: 1.05,
          duration: "1s",
          easing: "cinematic",
        });

        // "We need to talk" - zoom in
        cam.at("4s").animate({
          scale: 1.1,
          duration: "0.5s",
          easing: "easeOut",
        });

        // Screenshot reveal - major shake
        cam.at("10s").shake({
          intensityX: 8,
          intensityY: 6,
          frequency: 25,
          decay: 0.85,
          duration: "0.5s",
        });

        // Focus on evidence
        cam.at("20s").focus("lastMessage", { scale: 1.15, duration: "0.8s" });

        // Image reaction - hard shake
        cam.at("20.5s").shake({
          intensityX: 12,
          intensityY: 10,
          frequency: 30,
          decay: 0.8,
          duration: "0.6s",
        });

        // "I trusted you" - zoom emotional
        cam.at("26s").animate({
          scale: 1.2,
          y: -20,
          duration: "0.5s",
          easing: "cinematic",
        });

        // Unknown number appears - tension
        cam.at("28s").animate({
          scale: 1.25,
          duration: "0.4s",
          easing: "easeIn",
        });

        // Voice note - pull back slightly
        cam.at("42s").animate({
          scale: 1.15,
          y: 0,
          duration: "1s",
          easing: "easeOut",
        });

        // "I'm done" - final escalation
        cam.at("46s").animate({
          scale: 1.3,
          duration: "0.5s",
          easing: "cinematic",
        });

        // Blocked - major shake
        cam.at("55s").shake({
          intensityX: 15,
          intensityY: 12,
          frequency: 35,
          decay: 0.75,
          duration: "0.8s",
        });

        // End - slow zoom out to emptiness
        cam.at("57s").animate({
          scale: 1.0,
          y: 0,
          duration: "3s",
          easing: "easeOut",
        });
      })

      // ============================================
      // MARKERS - Key Story Beats
      // ============================================
      .mark("intro", "0s")
      .mark("voice_1_start", "2s")
      .mark("we_need_to_talk", "4s")
      .mark("screenshots_mention", "10s")
      .mark("voice_2_start", "18s")
      .mark("evidence_reveal", "20s")
      .mark("unknown_appears", "28s")
      .mark("voice_3_start", "35s")
      .mark("voice_note", "42s")
      .mark("goodbye", "46s")
      .mark("voice_4_start", "52s")
      .mark("blocked", "55s")
      .mark("end", "60s")

      // ============================================
      // SECTIONS - Story Structure
      // ============================================
      .section("opening", "0s", "10s")
      .section("confrontation", "10s", "28s")
      .section("mystery", "28s", "46s")
      .section("climax", "46s", "60s").use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )


      .build(),
});
