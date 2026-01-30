import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";
import { CameraDirectorPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "camera-director-full",
    title: "Camera Director: Enterprise System Demo",
    description:
      "Full demo: auto tennis, bursts, notifications, typing - ALL AUTO with plugin!",
    category: "showcase",
    tags: ["camera", "director", "auto", "plugin"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 600,
    apps: ["app_whatsapp"],
  },

  build: () =>
    episode("camera-director-full", { fps: 30, duration: "20s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          { id: "dm_breakup", name: "Alex", avatar: "/avatars/alex.jpg" },
        ],
        os: {
          time: new Date("2024-12-20T21:30:00"),
          battery: 87,
          network: "5G",
        },
      })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_breakup", getOrder),
        (wa) => {
          wa.at("1s").receive("Alex", "Hey");
          wa.at("2s").receive("Alex", "We need to talk");
          wa.at("3s").receive("Alex", "Can we call?");

          wa.at("7s").send("Yeah what's up?");
          wa.at("8s").send("Everything okay?");

          wa.span("10s", "13s").typing("Alex");

          wa.at("13s").receive("Alex", "I think we should break up");

          wa.at("17s").send("What??");
        },
      )

      // Plugin auto-generates all camera movements!
      // No manual event duplication needed - reads from IR
      .use(
        new CameraDirectorPlugin({
          debug: true,
          behaviors: {
            MESSAGE_RECEIVED: "fluid-tennis-dramatic", // Emotional conversation
          },
        }),
      )

      .build(),
});
