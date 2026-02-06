import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import {
  CameraDirectorPlugin,
  AudioDirectorPlugin,
  OSDirectorPlugin,
} from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "tennis-dramatic",
    title: "Tennis Camera - Dramatic",
    description:
      "Intense cinematic tennis camera with heavy shake and punch zoom",
    category: "showcase",
    tags: ["camera", "tennis", "whatsapp", "dramatic", "cinematic"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 690,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("tennis-dramatic", {
      fps: 30,
      duration: "23s",
      title: "Tennis Camera - Dramatic",
      description: "Cinematic camera with dramatic physics and punch effects",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_dramatic",
            name: "Alex",
            avatar: "/avatars/alex.jpg",
          },
        ],
        os: {
          time: new Date("2024-12-20T19:30:00"),
          battery: 78,
          network: "5G",
        },
      })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_dramatic", getOrder),
        (wa) => {
          wa.switchTo("dm_dramatic", 1);
          wa.at("1s").receive("Alex", "Yo! Did you see that game last night?");
          wa.at("3s").send("Bro... INSANE 🔥");
          wa.at("5.5s").receive("Alex", "That final shot was unreal");
          wa.at("8s").send("I literally screamed");
          wa.at("10.5s").receive("Alex", "My neighbors probably hate me lol");
          wa.at("13s").send("SAME 😂");
          wa.at("15.5s").receive(
            "Alex",
            "We should watch the next one together",
          );
          wa.at("18s").send("100% down");
        },
      )

      .use(new CameraDirectorPlugin("fluid-tennis-dramatic"))
      .use(new AudioDirectorPlugin({ mood: "dramatic", volume: 0.15 }))
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2024-12-20T19:30:00"),
          startBattery: 78,
          batteryDrainRate: 2,
          updateInterval: "10s",
        }),
      )

      .mark("intro", "0s")
      .mark("conversation_start", "1s")
      .mark("key_moment_1", "3s")
      .mark("midpoint", "11s")
      .mark("key_moment_2", "18s")
      .mark("outro", "20s")

      .section("setup", "0s", "1s")
      .section("main_conversation", "1s", "20s")
      .section("closing", "20s", "23s")

      .build(),
});
