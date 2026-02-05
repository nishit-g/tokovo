import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { IMessageTrackBuilder } from "@tokovo/apps-imessage";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "imessage-demo",
    title: "iMessage Demo",
    description: "Showcases iMessage + SMS with group chat, tapbacks, and media",
    category: "showcase",
    tags: ["imessage", "sms", "group", "tapback"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 600,
    apps: ["app_imessage"],
  },
  build: () =>
    episode("imessage-demo", {
      fps: 30,
      duration: "20s",
      title: "iMessage Demo",
    })
      .device("phone", "iphone16", {
        app: "app_imessage",
        os: {
          time: new Date("2024-12-18T14:30:00"),
          battery: 92,
          network: "5G",
        },
      })
      .track(
        "app_imessage",
        () => new IMessageTrackBuilder(30, "phone", "group_chat", getOrder),
        (im: IMessageTrackBuilder) => {
          im.at("0s").createConversation({
            id: "group_chat",
            title: "Weekend Plan",
            transport: "imessage",
            isGroup: true,
            participants: [
              { id: "me", name: "Me", isMe: true },
              { id: "alex", name: "Alex" },
              { id: "jordan", name: "Jordan" },
            ],
          });

          im.at("0.5s").createConversation({
            id: "sms_friend",
            title: "Sam",
            transport: "sms",
            participants: [
              { id: "me", name: "Me", isMe: true },
              { id: "sam", name: "Sam" },
            ],
          });

          im.at("1s").openConversation("group_chat");
          im.at("1.3s").receive("Alex", "Brunch Saturday?", {
            messageId: "m1",
          });
          im.at("2.2s").send("Works for me!", {
            effect: "slam",
            messageId: "m2",
          });
          im.at("2.8s").setMessageStatus("m2", "delivered");
          im.at("3s").receive("Jordan", "I can do Sunday", {
            mentions: ["me"],
            messageId: "m3",
          });
          im.at("4s").tapback({ messageId: "m2", type: "thumbsUp" });
          im.at("5s").sendMedia(
            [{ kind: "image", url: "https://picsum.photos/600/400" }],
            { messageId: "m4" },
          );
          im.at("6s").setMessageStatus("m4", "delivered");

          im.at("7s").setScreen("list");
          im.at("7.3s").openConversation("sms_friend");
          im.at("7.5s").receive("Sam", "Are we still on for 6?", {
            silent: false,
            messageId: "s1",
          });
          im.at("8.5s").send("Yep, see you soon", {
            effect: "gentle",
            messageId: "s2",
          });
          im.at("10s").setScreen("list");
          im.at("11s").openConversation("group_chat");
          im.at("11.5s").typing("Jordan", true);
          im.at("12.2s").typing("Jordan", false);
          im.at("12.5s").receive("Jordan", "Sunday works", {
            replyTo: { messageId: "m2" },
            messageId: "m5",
          });
          im.at("14s").read();
        },
      )
      .build(),
});
