import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { CameraDirectorPlugin, AudioDirectorPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "tennis-casual",
    title: "Tennis Camera - Casual",
    description:
      "Smooth, relaxed tennis camera following WhatsApp conversation back-and-forth",
    category: "showcase",
    tags: ["camera", "tennis", "whatsapp", "casual"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 720,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("tennis-casual", {
      fps: 30,
      duration: "24s",
      title: "Tennis Camera - Casual",
      description:
        "Smooth camera tennis effect with subtle zoom and gentle motion",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-20T19:30:00"),
          battery: 78,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_casual",
            name: "Alex",
            avatar: "/avatars/alex.jpg",
          },
        ],
      })

      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_casual", getOrder),
        (wa) => {
          wa.switchTo("dm_casual", "0s");
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

      .use(new CameraDirectorPlugin("fluid-tennis-casual"))
      .use(new AudioDirectorPlugin({ mood: "chill", volume: 0.12 }))

      .mark("intro", "0s")
      .mark("conversation_start", "1s")
      .mark("midpoint", "12s")
      .mark("outro", "20s")

      .section("setup", "0s", "1s")
      .section("main_conversation", "1s", "20s")
      .section("closing", "20s", "24s")

      .build(),
});
