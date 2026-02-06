import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "typed-message-demo",
    title: "Typed Message Demo",
    description: "Demonstrates auto-keyboard with typed: true flag",
    category: "production",
    tags: ["keyboard", "typing", "whatsapp", "auto"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 600,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("typed-message-demo", {
      fps: 30,
      duration: "20s",
      title: "Typed Message Demo",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-18T14:30:00"),
          battery: 85,
          network: "5G",
        },
        conversations: [
          {
            id: "dm_friend",
            name: "Friend",
            avatar: "",
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_friend", getOrder),
        (wa: WhatsAppTrackBuilder) => {
          wa.switchTo("dm_friend", 1);
          wa.at("1s").receive("Friend", "Hey! What's up?");
          wa.at("3s").send("Not much, just testing!", { typed: true });
          wa.at("8s").receive("Friend", "Cool! How's Tokovo?");
          wa.at("10s").send("Amazing! Auto-keyboard works!", {
            typed: true,
            charDelay: 2,
          });
          wa.at("17s").receive("Friend", "Nice!");
        },
      ).use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )

      .build(),
});
