import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { SnapchatTrackBuilder } from "@tokovo/apps-snapchat";

export default defineEpisode({
  meta: {
    id: "snapchat-story-v2",
    title: "Snapchat Story V2",
    description:
      "A new Snapchat story where someone promises not to screenshot and then immediately becomes a historian.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 150,
    tags: ["story", "snapchat", "screenshot", "drama"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 990,
    apps: ["app_snapchat"],
  },
  build: () =>
    episode("snapchat-story-v2", { fps: 30, duration: "33s", title: "Snapchat Story V2" })
      .device("phone", "iphone16", {
        app: "app_snapchat",
        os: {
          time: new Date("2026-04-10T23:58:00"),
          battery: 44,
          network: "5G",
        },
      })
      .track(
        "app_snapchat",
        (getOrder) => new SnapchatTrackBuilder(30, "phone", "conv_bestie_story_v2", getOrder),
        (sc) => {
          sc.at("0s").createConversation({ id: "conv_bestie_story_v2", title: "Bestie", participants: [{ id: "bestie", name: "Bestie" }], streak: 311 });
          sc.at("1.0s").openConversation("conv_bestie_story_v2");
          sc.at("2.0s").receive("Bestie", "do not screenshot this");
          sc.at("4.0s").receiveSnap("Bestie", { snapType: "photo", timer: 5 });
          sc.at("6.0s").openSnap("snap-120-0");
          sc.at("8.0s").send("i would never", { typed: true });
          sc.at("8.6s").screenshot("snap-120-0");
          sc.at("10.0s").receive("Bestie", "that was criminally fast");
          sc.at("12.0s").send("i prefer historically responsible", { typed: true });
        },
      )
      .build(),
});
