import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { AudioDirectorPlugin, OSDirectorPlugin, KeyboardPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "ghibli-showcase",
    title: "Ghibli Theme Showcase",
    description: "WhatsApp with Studio Ghibli-inspired theme",
    category: "production",
    tags: ["whatsapp", "ghibli", "theme", "aesthetic"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("ghibli-showcase", {
      fps: 30,
      duration: "30s",
      title: "Ghibli Theme Showcase",
      description: "WhatsApp with Studio Ghibli-inspired theme",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: "whatsapp-ghibli",
        conversations: [
          {
            id: "forest_spirits",
            name: "Forest Friends 🌲",
            avatar: "/avatars/totoro.jpg",
          },
        ],
        os: {
          time: new Date("2024-06-21T15:30:00"),
          battery: 92,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/ghibli-forest.png" })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "forest_spirits", getOrder),
        (wa) => {
          wa.switchTo("forest_spirits", 1);
          wa.at("1s").receive("Totoro", "The forest is beautiful today! 🌸");

          wa.at("3s").receive(
            "Totoro",
            "The camphor tree is blooming. Come visit!",
          );
          wa.span("4s", "5s").typing("me");
          wa.at("5s").send("On my way! Should I bring anything? 🍙");

          wa.at("7s").receive("Totoro", "Just bring your umbrella ☂️");

          wa.at("9s").receiveImage("Totoro", "/placeholders/media.svg", {
            caption: "The path to the tree 🌳",
          });

          wa.at("12s").sendImage("/placeholders/media.svg");

          wa.at("14s").receive("Totoro", "The soot sprites say hello!");

          wa.at("16s").receiveSticker("Totoro", "/placeholders/media.svg");
          wa.at("18s").sendSticker("/placeholders/media.svg");

          wa.at("20s").receiveLocation("Totoro", {
            latitude: 35.6585,
            longitude: 139.7454,
            locationName: "Camphor Tree",
            locationAddress: "The Heart of the Forest",
            mapThumbnailUrl: "/placeholders/map.svg",
          });

          wa.at("23s").send("I can see the tree now! 🌲");

          wa.at("25s").react({ index: 0 }, "🌸");
          wa.at("26s").react({ index: 3 }, "💚");
          wa.at("27s").react({ index: 8 }, "✨");

          wa.at("29s").receive("Totoro", "See you soon, friend! 🍃");
        },
      )

      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });
        cam.at("9s").focus("lastMessage", { scale: 1.1, duration: "0.5s" });
        cam.at("16s").animate({ scale: 1.05, duration: "0.3s" });
        cam.at("20s").focus("lastMessage", { scale: 1.15, duration: "0.5s" });
        cam.at("29s").animate({ scale: 1, duration: "1s", easing: "easeOut" });
      })

      .use(new AudioDirectorPlugin({ mood: "soft", volume: 0.1 }))
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2024-12-17T14:30:00"),
          startBattery: 78,
          batteryDrainRate: 0.4,
          updateInterval: "10s",
        }),
      )

      .mark("intro", "1s")
      .mark("conversation", "3s")
      .mark("media", "9s")
      .mark("stickers", "16s")
      .mark("location", "20s")
      .mark("reactions", "25s")
      .mark("finale", "29s")

      .section("intro", "0s", "3s")
      .section("chat", "3s", "16s")
      .section("rich_content", "16s", "25s")
      .section("outro", "25s", "30s").use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )


      .build(),
});
