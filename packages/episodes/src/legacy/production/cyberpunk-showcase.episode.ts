import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { AudioDirectorPlugin, OSDirectorPlugin, KeyboardPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "cyberpunk-showcase",
    title: "Cyberpunk Theme Showcase",
    description: "WhatsApp with neon cyberpunk aesthetic",
    category: "production",
    tags: ["whatsapp", "cyberpunk", "theme", "neon"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("cyberpunk-showcase", {
      fps: 30,
      duration: "30s",
      title: "Cyberpunk Theme Showcase",
      description: "WhatsApp with neon cyberpunk aesthetic",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: "whatsapp-cyberpunk",
        os: {
          time: new Date("2077-11-21T23:45:00"),
          battery: 77,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "netrunner_chat",
            name: "V",
            avatar: "/avatars/netrunner.jpg",
          },
        ],
      })
      .background({ type: "video", src: "/backgrounds/bokeh-loop.mp4" })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "netrunner_chat", getOrder),
        (wa) => {
          wa.switchTo("netrunner_chat", "0s");
          wa.at("1s").receive("V", "You jacked in yet, choom? 🔌");

          wa.at("3s").receive("V", "Got a gig. Big corpo. Bigger payout.");
          wa.span("4s", "5s").typing("me");
          wa.at("5s").send("I'm in. What's the target? 💀");

          wa.at("7s").receive("V", "Arasaka tower. Main subnet.");

          wa.at("9s").receiveImage("V", "/placeholders/media.svg", {
            caption: "The target. Don't flatline on me.",
          });

          wa.at("12s").send("Preem. Got my deck ready. 🖥️");

          wa.at("14s").receive("V", "Meet at Afterlife. Midnight.");

          wa.at("16s").receiveLocation("V", {
            latitude: 34.0522,
            longitude: -118.2437,
            locationName: "Afterlife",
            locationAddress: "Night City, Watson District",
            mapThumbnailUrl: "/placeholders/map.svg",
          });

          wa.at("19s").send("Nova. Bringing my best chrome. 🦾");

          wa.at("21s").receive("V", "Stay frosty out there");

          wa.at("23s").receiveSticker("V", "/placeholders/media.svg");
          wa.at("25s").sendSticker("/placeholders/media.svg");

          wa.at("27s").react({ index: 0 }, "⚡");
          wa.at("28s").react({ index: 4 }, "🔥");

          wa.at("29s").receive("V", "See you on the other side, netrunner 🌐");
        },
      )

      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });
        cam.at("9s").focus("lastMessage", { scale: 1.1, duration: "0.5s" });
        cam.at("16s").focus("lastMessage", { scale: 1.15, duration: "0.5s" });
        cam.at("23s").animate({ scale: 1.05, duration: "0.3s" });
        cam.at("29s").animate({ scale: 1, duration: "1s", easing: "easeOut" });
      })

      .use(new AudioDirectorPlugin({ mood: "dark", volume: 0.2 }))
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2077-11-21T23:46:00"),
          startBattery: 92,
          batteryDrainRate: 0.3,
          updateInterval: "15s",
        }),
      )

      .mark("intro", "1s")
      .mark("briefing", "3s")
      .mark("target", "9s")
      .mark("location", "16s")
      .mark("stickers", "23s")
      .mark("finale", "29s")

      .section("intro", "0s", "3s")
      .section("briefing", "3s", "16s")
      .section("prep", "16s", "23s")
      .section("outro", "23s", "30s").use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )


      .build(),
});
