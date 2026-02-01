import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";
import { CameraDirectorPlugin } from "@tokovo/compiler";

export default defineEpisode({
  meta: {
    id: "mega-camera-director",
    title: "MEGA Camera Director Demo",
    description:
      "Same conversation as mega-camera-showcase but using AI Director for automatic choreography",
    category: "showcase",
    tags: ["camera", "director", "ai-choreography", "comparison"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1200,
    apps: ["app_whatsapp", "notifications"],
  },

  build: () =>
    episode("mega-camera-director", { fps: 30, duration: "40s" })
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

      .use(new CameraDirectorPlugin({ debug: true }))

      .build(),
});
