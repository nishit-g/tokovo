import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { SnapchatTrackBuilder } from "@tokovo/apps-snapchat";

export default defineEpisode({
  meta: {
    id: "snapchat-flagship-v2",
    title: "Snapchat Flagship V2",
    description:
      "Fresh Snapchat flagship covering streak chat, snap open, screenshot tension, and fast inbox pacing.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_snapchat",
    visibility: "public",
    sortOrder: 600,
    tags: ["snapchat", "flagship", "streaks", "snap", "chat"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1110,
    apps: ["app_snapchat"],
  },
  build: () =>
    episode("snapchat-flagship-v2", {
      fps: 30,
      duration: "37s",
      title: "Snapchat Flagship V2",
    })
      .device("phone", "iphone16", {
        app: "app_snapchat",
        os: {
          time: new Date("2026-04-10T23:18:00"),
          battery: 52,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .track(
        "app_snapchat",
        (getOrder) => new SnapchatTrackBuilder(30, "phone", "conv_nia_v2", getOrder),
        (sc) => {
          sc.at("0s").createConversation({
            id: "conv_nia_v2",
            title: "Nia",
            participants: [{ id: "nia", name: "Nia" }],
            streak: 418,
          });
          sc.at("0.3s").createConversation({
            id: "conv_squad_v2",
            title: "night squad",
            participants: [{ id: "nia", name: "Nia" }, { id: "luca", name: "Luca" }, { id: "maya", name: "Maya" }],
            isGroup: true,
            streak: 121,
          });
          sc.at("1.0s").openConversation("conv_nia_v2");
          sc.at("2.0s").receive("Nia", "you awake?");
          sc.at("4.0s").send("barely. why", { typed: true });
          sc.at("6.0s").receive("Nia", "sending you the thing i told you not to screenshot");
          sc.at("8.0s").receiveSnap("Nia", { snapType: "photo", timer: 6 });
          sc.at("10.0s").openSnap("snap-240-0");
          sc.at("12.0s").send("this is outrageous", { typed: true });
          sc.at("13.2s").screenshot("snap-240-0");
          sc.at("15.0s").receive("Nia", "DID YOU JUST SCREENSHOT");
          sc.at("17.0s").send("i had to for the archives", { typed: true });
          sc.at("20.0s").openConversation("conv_squad_v2");
          sc.at("21.0s").send("okay everyone act normal", { typed: true });
          sc.at("23.0s").receive("Luca", "that's the least normal opener possible");
          sc.at("25.0s").receive("Maya", "did nia send the cursed snap?");
          sc.at("27.0s").sendSnap({ snapType: "photo" });
          sc.at("30.0s").receive("Nia", "traitor");
          sc.at("33.0s").updateStreak(419);
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("chat_list", { scale: 1.02, duration: "0.35s" });
        cam.at("8.1s").focus("snap_card", { scale: 1.08, duration: "0.35s" });
        cam.at("10.1s").focus("snap_view", { scale: 1.08, duration: "0.35s" });
        cam.at("20.1s").focus("chat_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build(),
});
