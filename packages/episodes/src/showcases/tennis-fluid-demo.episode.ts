import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "tennis-fluid-demo",
    title: "Tennis Camera: Fluid Demo",
    description:
      "Demonstration of fluid, turn-aware camera that handles message bursts smoothly",
    category: "showcase",
    tags: ["camera", "tennis", "whatsapp", "fluid", "bursts"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 450,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("tennis-fluid-demo", {
      fps: 30,
      duration: "15s",
      title: "Fluid Tennis Camera",
      description: "Turn-aware camera with smooth burst handling",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-20T19:30:00"),
          battery: 87,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_fluid",
            name: "Alex",
            avatar: "/avatars/alex.jpg",
          },
        ],
      })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_fluid", getOrder),
        (wa) => {
          wa.switchTo("dm_fluid", "0s");
          wa.at("1s").receive("Alex", "Yo!");
          wa.at("2s").receive("Alex", "You coming to the party tonight?");
          wa.at("3s").receive("Alex", "Everyone's asking about you 😊");

          wa.at("6s").send("Yeah I'll be there!");
          wa.at("7s").send("What time?");

          wa.at("10s").receive("Alex", "Around 8pm");
          wa.at("12s").send("Perfect 👍");
        },
      )

      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.4s" });
        cam.span("0.8s", "14.4s").trackCinematic("lastMessage", {
          scale: 1.14,
          smoothing: 0.2,
          deadZonePx: 12,
          maxVelocityPxPerSec: 900,
          predictiveLookaheadFrames: 2,
        });

        cam.at("1s").focus("lastMessage", { scale: 1.2, duration: "0.35s" });
        cam.at("1s").shake({
          intensityX: 3,
          intensityY: 2,
          frequency: 15,
          decay: 0.9,
          duration: "0.35s",
        });

        cam.at("3s").focus("lastMessage", { scale: 1.22, duration: "0.28s" });
        cam.at("6s").focus("lastMessage", { scale: 1.2, duration: "0.3s" });
        cam.at("10s").focus("lastMessage", { scale: 1.2, duration: "0.3s" });
        cam.at("12s").focus("lastMessage", { scale: 1.2, duration: "0.3s" });
        cam.at("14.2s").focus("device", { scale: 1.02, duration: "0.5s" });
      })

      .build(),
});
