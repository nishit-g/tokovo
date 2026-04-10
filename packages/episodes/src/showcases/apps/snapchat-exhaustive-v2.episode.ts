import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { SnapchatTrackBuilder } from "@tokovo/apps-snapchat";

export default defineEpisode({
  meta: {
    id: "snapchat-exhaustive-v2",
    title: "Snapchat Exhaustive V2",
    description:
      "Dense Snapchat proof with inbox ordering, streak maintenance, group chat chaos, snap viewing, screenshots, and typing states.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_snapchat",
    visibility: "public",
    sortOrder: 610,
    tags: ["snapchat", "exhaustive", "inbox", "snap", "group", "typing"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1410,
    apps: ["app_snapchat"],
  },
  build: () =>
    episode("snapchat-exhaustive-v2", {
      fps: 30,
      duration: "47s",
      title: "Snapchat Exhaustive V2",
    })
      .device("phone", "iphone16", {
        app: "app_snapchat",
        os: {
          time: new Date("2026-04-10T23:40:00"),
          battery: 48,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .track(
        "app_snapchat",
        (getOrder) => new SnapchatTrackBuilder(30, "phone", "conv_bestie_v2", getOrder),
        (sc) => {
          sc.at("0s").createConversation({ id: "conv_bestie_v2", title: "Bestie", participants: [{ id: "bestie", name: "Bestie" }], streak: 512 });
          sc.at("0.2s").createConversation({ id: "conv_room_v2", title: "afterparty", participants: [{ id: "bestie", name: "Bestie" }, { id: "jay", name: "Jay" }, { id: "tara", name: "Tara" }], isGroup: true, streak: 93 });
          sc.at("0.4s").createConversation({ id: "conv_crush_v2", title: "Ari", participants: [{ id: "ari", name: "Ari" }], streak: 22 });
          sc.at("1.0s").openConversation("conv_bestie_v2");
          sc.at("2.0s").receive("Bestie", "you cannot freak out when you see this");
          sc.at("3.4s").typingStart("Bestie");
          sc.at("5.0s").typingEnd("Bestie");
          sc.at("5.2s").receiveSnap("Bestie", { snapType: "photo", timer: 5 });
          sc.at("7.0s").openSnap("snap-156-0");
          sc.at("9.0s").send("i am absolutely freaking out", { typed: true });
          sc.at("10.2s").openConversation("conv_room_v2");
          sc.at("11.2s").send("nobody panic but panic", { typed: true });
          sc.at("13.0s").receive("Jay", "this is already the wrong energy");
          sc.at("14.8s").receive("Tara", "post the cropped version");
          sc.at("16.4s").sendSnap({ snapType: "photo" });
          sc.at("18.0s").openConversation("conv_crush_v2");
          sc.at("19.4s").receive("Ari", "why is the group louder than my notifications");
          sc.at("21.0s").send("because bestie sent forbidden evidence", { typed: true });
          sc.at("23.2s").receive("Ari", "please tell me you didn't screenshot");
          sc.at("24.4s").send("that would be unethical", { typed: true });
          sc.at("25.0s").screenshot("snap-156-0");
          sc.at("27.0s").openConversation("conv_bestie_v2");
          sc.at("28.4s").receive("Bestie", "liar");
          sc.at("30.0s").send("i prefer historian", { typed: true });
          sc.at("33.0s").updateStreak(513);
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("chat_list", { scale: 1.02, duration: "0.35s" });
        cam.at("5.3s").focus("snap_card", { scale: 1.08, duration: "0.35s" });
        cam.at("7.1s").focus("snap_view", { scale: 1.08, duration: "0.35s" });
        cam.at("11.3s").focus("chat_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("19.5s").focus("chat_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("27.1s").focus("chat_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build(),
});
