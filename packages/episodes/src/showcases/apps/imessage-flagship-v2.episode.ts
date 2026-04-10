import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { IMessageTrackBuilder } from "@tokovo/apps-imessage";

export default defineEpisode({
  meta: {
    id: "imessage-flagship-v2",
    title: "iMessage Flagship V2",
    description:
      "Fresh iMessage flagship proving list-to-thread flow, effects, tapbacks, media, and private-thread realism.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_imessage",
    visibility: "public",
    sortOrder: 700,
    tags: ["imessage", "flagship", "tapback", "media", "thread"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1170,
    apps: ["app_imessage"],
  },
  build: () =>
    episode("imessage-flagship-v2", {
      fps: 30,
      duration: "39s",
      title: "iMessage Flagship V2",
    })
      .device("phone", "iphone16", {
        app: "app_imessage",
        os: {
          time: new Date("2026-04-10T20:12:00"),
          battery: 86,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .track(
        "app_imessage",
        (getOrder) => new IMessageTrackBuilder(30, "phone", "group_plan_v2", getOrder),
        (im) => {
          im.at("0s").createConversation({
            id: "group_plan_v2",
            title: "Saturday Plan",
            transport: "imessage",
            isGroup: true,
            participants: [{ id: "me", name: "Me", isMe: true }, { id: "ava", name: "Ava" }, { id: "rina", name: "Rina" }],
          });
          im.at("0.3s").createConversation({
            id: "dm_ava_v2",
            title: "Ava",
            transport: "imessage",
            participants: [{ id: "me", name: "Me", isMe: true }, { id: "ava", name: "Ava" }],
          });
          im.at("1.0s").openConversation("group_plan_v2");
          im.at("2.0s").receive("Ava", "Brunch or chaos?");
          im.at("3.4s").sendWithEffect({
            text: "Why not both",
            bubbleEffect: "loud",
            messageId: "im_flag_msg_1",
          });
          im.at("5.2s").receive("Rina", "I found a place with violent pancakes");
          im.at("6.8s").sendLink({
            url: "https://example.com/brunch",
            preview: {
              title: "Violent Pancakes Club",
              description: "Brunch with no respect for portion control.",
              domain: "example.com",
              thumbnail: "/placeholders/media.svg",
            },
            messageId: "im_flag_msg_2",
          });
          im.at("8.0s").tapback({ messageId: "im_flag_msg_2", type: "heart" });
          im.at("10.0s").setScreen("list");
          im.at("11.0s").openConversation("dm_ava_v2");
          im.at("12.0s").receive("Ava", "Real question: are you bringing the camera?");
          im.at("13.6s").typing("Ava", true);
          im.at("15.2s").typing("Ava", false);
          im.at("15.4s").send("Only if nobody makes me photograph the food before eating.", { messageId: "im_flag_msg_3" });
          im.at("18.0s").tapback({ messageId: "im_flag_msg_3", type: "haha" });
          im.at("20.4s").read();
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("message_list", { scale: 1.02, duration: "0.35s" });
        cam.at("3.5s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("6.9s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("11.1s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build(),
});
