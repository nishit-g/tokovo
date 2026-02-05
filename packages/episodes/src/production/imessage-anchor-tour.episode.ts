import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { IMessageTrackBuilder } from "@tokovo/apps-imessage";

export default defineEpisode({
  meta: {
    id: "imessage-anchor-tour",
    title: "iMessage Anchor Tour",
    description: "Anchor-focused iMessage episode that moves across list, thread, info and media screens.",
    category: "production",
    tags: ["imessage", "anchors", "camera", "tour"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 570,
    apps: ["app_imessage"],
  },
  build: () =>
    episode("imessage-anchor-tour", {
      fps: 30,
      duration: "19s",
      title: "iMessage Anchor Tour",
    })
      .device("phone", "iphone16", {
        app: "app_imessage",
        os: {
          time: new Date("2025-02-11T19:30:00"),
          battery: 77,
          network: "5G",
        },
      })
      .track(
        "app_imessage",
        (getOrder) => new IMessageTrackBuilder(30, "phone", "group_plan", getOrder),
        (im) => {
          im.at("0s").createConversation({
            id: "group_plan",
            title: "Launch Crew",
            isGroup: true,
            participants: [
              { id: "me", name: "Me" },
              { id: "ava", name: "Ava" },
              { id: "sam", name: "Sam" },
            ],
          });
          im.at("0.2s").openConversation("group_plan");
          im.at("1s").receive("ava", "Timeline is set. Ready to publish?");
          im.at("2.2s").send("Yes. Final checks in 2 mins.");
          im.at("3.1s").receive("sam", "Dropping media card now.");
          im.at("4.2s").receive("ava", "Pinned message updated.");
          im.at("5.4s").typing("sam", true);
          im.at("6.2s").typing("sam", false);
          im.at("6.4s").receive("sam", "Looks perfect. Ship it.");

          im.at("8.2s").setScreen("list");
          im.at("9.4s").openConversation("group_plan");
          im.at("11s").setScreen("info");
          im.at("13.2s").setScreen("media");
          im.at("15.8s").setScreen("chat");
          im.at("16.4s").send("Live now 🚀");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("imessage_list_header", { scale: 1.06, duration: "0.45s" });
        cam.at("0.9s").focus("imessage_thread", { scale: 1.1, duration: "0.45s" });
        cam.at("2.4s").focus("imessage_composer", { scale: 1.07, duration: "0.4s" });
        cam.at("5.4s").focus("imessage_thread", { scale: 1.09, duration: "0.38s" });
        cam.at("8.2s").focus("imessage_list", { scale: 1.07, duration: "0.45s" });
        cam.at("11s").focus("imessage_info", { scale: 1.08, duration: "0.45s" });
        cam.at("13.2s").focus("imessage_media", { scale: 1.09, duration: "0.45s" });
        cam.at("15.8s").focus("imessage_thread", { scale: 1.08, duration: "0.42s" });
      })
      .build(),
});
