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
        conversations: [
          {
            id: "dm_fluid",
            name: "Alex",
            avatar: "/avatars/alex.jpg",
          },
        ],
        os: {
          time: new Date("2024-12-20T19:30:00"),
          battery: 87,
          network: "5G",
        },
      })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_fluid", getOrder),
        (wa) => {
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

        cam.at("2s").animate({
          y: -40,
          duration: "0.3s",
          easing: "easeOut",
        });

        cam.at("2s").shake({
          intensityX: 1.5,
          intensityY: 1,
          frequency: 12,
          decay: 0.9,
          duration: "0.3s",
        });

        cam.at("3s").animate({
          y: -80,
          duration: "0.3s",
          easing: "easeOut",
        });

        cam.at("3s").shake({
          intensityX: 1.5,
          intensityY: 1,
          frequency: 12,
          decay: 0.9,
          duration: "0.3s",
        });

        cam.at("5s").reset({ duration: "0.8s", easing: "easeOut" });

        cam.at("6s").focus("message-3", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("6s").shake({
          intensityX: 3,
          intensityY: 2,
          frequency: 15,
          decay: 0.9,
          duration: "0.4s",
        });

        cam.at("7s").animate({
          y: -40,
          duration: "0.3s",
          easing: "easeOut",
        });

        cam.at("7s").shake({
          intensityX: 1.5,
          intensityY: 1,
          frequency: 12,
          decay: 0.9,
          duration: "0.3s",
        });

        cam.at("9s").reset({ duration: "0.8s", easing: "easeOut" });

        cam.at("10s").focus("message-5", {
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

        cam.at("11.5s").reset({ duration: "0.5s", easing: "easeOut" });

        cam.at("12s").focus("message-6", {
          scale: 1.2,
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("12s").shake({
          intensityX: 3,
          intensityY: 2,
          frequency: 15,
          decay: 0.9,
          duration: "0.4s",
        });

        cam.at("13.5s").reset({ duration: "0.8s", easing: "easeOut" });
      })

      .build(),
});
