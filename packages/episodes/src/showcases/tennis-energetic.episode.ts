import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { CameraDirectorPlugin, AudioDirectorPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "tennis-energetic",
    title: "Tennis Camera - Energetic",
    description: "Bouncy, playful tennis camera with shake and quick movements",
    category: "showcase",
    tags: ["camera", "tennis", "whatsapp", "energetic"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 660,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("tennis-energetic", {
      fps: 30,
      duration: "22s",
      title: "Tennis Camera - Energetic",
      description: "Fast-paced camera with bounce and shake effects",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_energetic",
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
        () => new WhatsAppTrackBuilder(30, "phone", "dm_energetic", getOrder),
        (wa) => {
          wa.switchTo("dm_energetic", "0s");
          wa.at("1s").receive("Alex", "Yo! Did you see that game last night?");
          wa.at("2.5s").send("Bro... INSANE 🔥");
          wa.at("4.5s").receive("Alex", "That final shot was unreal");
          wa.at("6.5s").send("I literally screamed");
          wa.at("8.5s").receive("Alex", "My neighbors probably hate me lol");
          wa.at("10.5s").send("SAME 😂");
          wa.at("12.5s").receive(
            "Alex",
            "We should watch the next one together",
          );
          wa.at("14.5s").send("100% down");
        },
      )

      .use(new CameraDirectorPlugin("fluid-tennis-energetic"))
      .use(new AudioDirectorPlugin({ mood: "upbeat", volume: 0.12 }))

      .mark("intro", "0s")
      .mark("conversation_start", "1s")
      .mark("midpoint", "11s")
      .mark("outro", "17s")

      .section("setup", "0s", "1s")
      .section("main_conversation", "1s", "17s")
      .section("closing", "17s", "22s")

      .build(),
});
