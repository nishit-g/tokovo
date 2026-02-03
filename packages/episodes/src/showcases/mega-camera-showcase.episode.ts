import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";

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
        conversations: [
          {
            id: "dm_sarah",
            name: "Sarah",
            avatar: "/avatars/sarah.jpg",
          },
        ],
        os: {
          time: new Date("2024-12-20T22:15:00"),
          battery: 73,
          network: "5G",
        },
      })

      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder),
        (wa) => {
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

      .track(
        "notifications",
        (getOrder) => new NotificationTrackBuilder(30, "phone", getOrder),
        (notif) => {
          notif.at("11.5s").show({
            id: "mom-dinner",
            appId: "Messages",
            title: "Mom",
            body: "Dinner reminder! 7pm tonight",
            mode: "headsup",
          });
          notif.at("13s").dismiss("mom-dinner");

          notif.at("28s").show({
            id: "jake-tag",
            appId: "Instagram",
            title: "jake_wilson tagged you",
            body: "in a photo",
            mode: "headsup",
          });
          notif.at("29.5s").dismiss("jake-tag");
        },
      )

      .camera((cam) => {
        cam.at("1s").focus("message-0", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("1s").shake({
          intensityX: 3,
          intensityY: 2,
          frequency: 15,
          decay: 0.9,
          duration: "0.4s",
        });

        cam.at("2.5s").focus("message-3", {
          scale: 1.25,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("2.5s").shake({
          intensityX: 4,
          intensityY: 3,
          frequency: 18,
          decay: 0.85,
          duration: "0.4s",
        });

        cam.at("5.5s").reset({
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("6s").focus("message-4", {
          scale: 1.25,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("6s").shake({
          intensityX: 5,
          intensityY: 3,
          frequency: 20,
          decay: 0.85,
          duration: "0.4s",
        });

        cam.at("7.5s").reset({
          duration: "0.8s",
          easing: "easeOut",
        });

        cam.at("10s").focus("message-6", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("10s").shake({
          intensityX: 3,
          intensityY: 2,
          frequency: 15,
          decay: 0.9,
          duration: "0.4s",
        });

        cam.at("11.5s").focus("headsUpNotification", {
          scale: 1.3,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("11.5s").shake({
          intensityX: 2,
          intensityY: 1,
          frequency: 12,
          decay: 0.95,
          duration: "0.3s",
        });

        cam.at("13s").reset({
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("13.5s").focus("message-7", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("16.5s").reset({
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("17s").focus("message-8", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("18s").focus("message-10", {
          scale: 1.25,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("18s").shake({
          intensityX: 4,
          intensityY: 3,
          frequency: 16,
          decay: 0.9,
          duration: "0.4s",
        });

        cam.at("20s").reset({
          duration: "0.8s",
          easing: "easeOut",
        });

        cam.at("21s").focus("message-11", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("22.5s").reset({
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("26s").focus("message-12", {
          scale: 1.4,
          duration: "0.6s",
          easing: "easeOut",
        });
        cam.at("26s").shake({
          intensityX: 8,
          intensityY: 5,
          frequency: 22,
          decay: 0.8,
          duration: "0.6s",
        });

        cam.at("27.5s").reset({
          duration: "0.8s",
          easing: "easeOut",
        });

        cam.at("28s").focus("headsUpNotification", {
          scale: 1.3,
          duration: "0.4s",
          easing: "easeOut",
        });

        cam.at("29.5s").reset({
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("30s").focus("message-13", {
          scale: 1.25,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("30s").shake({
          intensityX: 5,
          intensityY: 3,
          frequency: 18,
          decay: 0.88,
          duration: "0.4s",
        });

        cam.at("31s").focus("message-15", {
          scale: 1.3,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("31s").shake({
          intensityX: 6,
          intensityY: 4,
          frequency: 20,
          decay: 0.85,
          duration: "0.5s",
        });

        cam.at("32.5s").reset({
          duration: "0.8s",
          easing: "easeOut",
        });

        cam.at("35s").focus("message-16", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });
        cam.at("35s").shake({
          intensityX: 3,
          intensityY: 2,
          frequency: 14,
          decay: 0.9,
          duration: "0.4s",
        });

        cam.at("37s").reset({
          duration: "1s",
          easing: "easeOut",
        });

        cam.at("38s").focus("message-18", {
          scale: 1.15,
          duration: "0.6s",
          easing: "easeOut",
        });
        cam.at("38s").shake({
          intensityX: 4,
          intensityY: 2.5,
          frequency: 16,
          decay: 0.9,
          duration: "0.5s",
        });

        cam.at("39.5s").reset({
          duration: "0.5s",
          easing: "easeOut",
        });
      })

      .build(),
});
