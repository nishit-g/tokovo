import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "tennis-group-organic",
    title: "Tennis Camera - Organic Group Chat",
    description:
      "Continuous anchor-follow camera for WhatsApp group episodes with smooth handoffs to notifications and typing.",
    category: "showcase",
    tags: ["camera", "tennis", "whatsapp", "group", "organic"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 960,
    apps: ["app_whatsapp", "notifications"],
  },
  build: () =>
    episode("tennis-group-organic", {
      fps: 30,
      duration: "32s",
      title: "Organic Tennis Group Chat",
      description:
        "No hard reset camera. Continuous smooth follow across messages, typing, input, and notifications.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "group_weekend_tennis",
            name: "Weekend Tennis",
            avatar: "/avatars/group-weekend.jpg",
            type: "group",
            participants: ["me", "Alex", "Nia", "Jay"],
          },
        ],
        os: {
          time: new Date("2025-02-07T18:30:00"),
          battery: 79,
          network: "5G",
        },
      })
      .track(
        "app_whatsapp",
        () =>
          new WhatsAppTrackBuilder(30, "phone", "group_weekend_tennis", getOrder),
        (wa) => {
          wa.at("1s").receive("Alex", "Court booked for Sunday 7am 🎾");
          wa.at("2.2s").receive("Nia", "I can bring balls + cones");
          wa.at("3.6s").receive("Jay", "Need one more doubles player");
          wa.span("5s", "6.4s").typing("me");
          wa.at("6.5s").send("I’ll bring Rohan. We’re 4.");
          wa.at("8.2s").receive("Alex", "Perfect. Warm-up starts 6:45.");
          wa.span("10s", "11.2s").typing("Nia");
          wa.at("11.3s").receive("Nia", "Can someone carry the tripod?");
          wa.span("13.2s", "14.2s").typing("me");
          wa.at("14.3s").send("I’ve got it. Also filming rally drills.");
          wa.at("16.4s").receive("Jay", "Then we need cinematic serves 😂");
          wa.at("18s").send("Done. Tracking from baseline to net.");
          wa.at("20.4s").receive("Alex", "Dropping lineup in 2 mins.");
          wa.span("22.2s", "24.2s").typing("Alex");
          wa.at("24.4s").receive("Alex", "Ava+Rohan vs Nia+Jay first set");
          wa.span("26.2s", "27.4s").typing("me");
          wa.at("27.6s").send("Lock it. I’ll pin this.");
          wa.at("29.4s").receive("Nia", "See you all Sunday 👊");
        },
      )
      .track(
        "notifications",
        () => new NotificationTrackBuilder(30, "phone", getOrder),
        (notif) => {
          notif.at("9.4s").show({
            id: "calendar-tennis",
            appId: "Calendar",
            title: "Tennis Practice",
            body: "Sunday 7:00 AM",
            mode: "headsup",
          });
          notif.at("10.8s").dismiss("calendar-tennis");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.5s" });
        cam.span("1s", "31s").track("lastMessage", { scale: 1.12, lag: 0.2 });
        cam.span("5s", "6.4s").track("typingIndicator", { scale: 1.08, lag: 0.24 });
        cam.span("13.2s", "14.2s").track("inputArea", { scale: 1.05, lag: 0.2 });
        cam.span("22.2s", "24.2s").track("typingIndicator", { scale: 1.08, lag: 0.24 });
        cam.at("9.4s").focus("headsUpNotification", { scale: 1.18, duration: "0.35s" });
        cam.at("10.9s").focus("lastMessage", { scale: 1.12, duration: "0.45s" });
      })
      .build(),
});

