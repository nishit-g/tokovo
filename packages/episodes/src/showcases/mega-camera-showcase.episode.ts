import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

export default defineEpisode({
  meta: {
    id: "mega-camera-showcase",
    title: "MEGA Camera Showcase: Everything",
    description:
      "Ultimate demo: bursts, notifications, typing, rhythm changes, dramatic moments, all camera effects",
    category: "showcase",
    tags: ["camera", "mega", "ultimate", "director", "showcase"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1200,
    apps: ["app_whatsapp", "notifications"],
  },

  build: () =>
    episode("mega-camera-showcase", { fps: 30, duration: "40s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-20T22:15:00"),
          battery: 73,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_sarah",
            name: "Sarah",
            avatar: "/avatars/sarah.jpg",
          },
        ],
      })

      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder),
        (wa) => {
          wa.switchTo("dm_sarah", "0s");
          wa.at("1s").receive("Sarah", "OMG");
          wa.at("1.5s").receive("Sarah", "You won't believe this");
          wa.at("2s").receive("Sarah", "I just saw Jake");
          wa.at("2.5s").receive("Sarah", "With ANOTHER girl!!");

          wa.span("3.5s", "6s").typing("me");

          wa.at("6s").send("WHAT");
          wa.at("6.5s").send("Where??");

          wa.span("8s", "10s").typing("Sarah");

          wa.at("10s").receive("Sarah", "At Starbucks downtown");

          wa.at("13s").send("I'm coming there NOW");

          wa.span("15s", "17s").typing("Sarah");

          wa.at("17s").receive("Sarah", "Wait no");
          wa.at("17.5s").receive("Sarah", "They just left");
          wa.at("18s").receive("Sarah", "He saw me watching");

          wa.at("21s").send("Did he say anything?");

          wa.span("23s", "26s").typing("Sarah");

          wa.at("26s").receive(
            "Sarah",
            "He looked shocked then grabbed her hand and RAN",
          );

          wa.at("30s").send("Unbelievable");
          wa.at("30.5s").send("I knew it");
          wa.at("31s").send("I KNEW something was off");

          wa.span("33s", "35s").typing("Sarah");

          wa.at("35s").receive("Sarah", "I'm so sorry babe");
          wa.at("35.5s").receive("Sarah", "You deserve better");

          wa.at("38s").send("Thank you for telling me 💔");
        },
      )

      .deviceTrack("phone", (d) => {
        d.at("11.5s").notificationShow({
          id: "mom-dinner",
          appId: "Messages",
          title: "Mom",
          body: "Dinner reminder! 7pm tonight",
          mode: "headsup",
        });
        d.at("13s").notificationDismiss("mom-dinner");

        d.at("28s").notificationShow({
          id: "jake-tag",
          appId: "Instagram",
          title: "jake_wilson tagged you",
          body: "in a photo",
          mode: "headsup",
        });
        d.at("29.5s").notificationDismiss("jake-tag");
      })

      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.4s" });
        cam.span("0.8s", "39.2s").trackCinematic("lastMessage", {
          scale: 1.14,
          smoothing: 0.2,
          deadZonePx: 12,
          maxVelocityPxPerSec: 960,
          predictiveLookaheadFrames: 2,
        });
        cam.span("3.5s", "6s").trackCinematic("typingIndicator", {
          scale: 1.08,
          smoothing: 0.24,
          deadZonePx: 10,
          maxVelocityPxPerSec: 1020,
          predictiveLookaheadFrames: 3,
        });
        cam.span("8s", "10s").trackCinematic("typingIndicator", {
          scale: 1.08,
          smoothing: 0.24,
          deadZonePx: 10,
          maxVelocityPxPerSec: 1020,
          predictiveLookaheadFrames: 3,
        });
        cam.span("15s", "17s").trackCinematic("typingIndicator", {
          scale: 1.09,
          smoothing: 0.23,
          deadZonePx: 10,
          maxVelocityPxPerSec: 1020,
          predictiveLookaheadFrames: 3,
        });
        cam.span("23s", "26s").trackCinematic("typingIndicator", {
          scale: 1.1,
          smoothing: 0.23,
          deadZonePx: 10,
          maxVelocityPxPerSec: 1020,
          predictiveLookaheadFrames: 3,
        });
        cam.span("33s", "35s").trackCinematic("typingIndicator", {
          scale: 1.08,
          smoothing: 0.24,
          deadZonePx: 10,
          maxVelocityPxPerSec: 1020,
          predictiveLookaheadFrames: 3,
        });

        cam.at("2.5s").focus("lastMessage", { scale: 1.24, duration: "0.3s" });
        cam.at("6s").focus("lastMessage", { scale: 1.24, duration: "0.28s" });
        cam.at("11.5s").focus("headsUpNotification", {
          scale: 1.24,
          duration: "0.28s",
        });
        cam.at("12.8s").focus("lastMessage", { scale: 1.16, duration: "0.34s" });
        cam.at("18s").focus("lastMessage", { scale: 1.24, duration: "0.3s" });
        cam.at("26s").focus("lastMessage", { scale: 1.3, duration: "0.34s" });
        cam.at("28s").focus("headsUpNotification", {
          scale: 1.24,
          duration: "0.28s",
        });
        cam.at("29.2s").focus("lastMessage", { scale: 1.16, duration: "0.34s" });
        cam.at("31s").focus("lastMessage", { scale: 1.25, duration: "0.3s" });
        cam.at("35s").focus("lastMessage", { scale: 1.2, duration: "0.28s" });
        cam.at("38s").focus("lastMessage", { scale: 1.16, duration: "0.3s" });
        cam.at("39.4s").focus("device", { scale: 1.03, duration: "0.4s" });
      })

      .build(),
});
