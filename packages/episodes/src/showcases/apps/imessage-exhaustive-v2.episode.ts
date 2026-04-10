import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { IMessageTrackBuilder } from "@tokovo/apps-imessage";

export default defineEpisode({
  meta: {
    id: "imessage-exhaustive-v2",
    title: "iMessage Exhaustive V2",
    description:
      "Dense iMessage proof with group chat, private chat, media, voice note, tapbacks, search, and message-state transitions.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_imessage",
    visibility: "public",
    sortOrder: 710,
    tags: ["imessage", "exhaustive", "media", "audio", "tapback", "search"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1440,
    apps: ["app_imessage"],
  },
  build: () =>
    episode("imessage-exhaustive-v2", {
      fps: 30,
      duration: "48s",
      title: "iMessage Exhaustive V2",
    })
      .device("phone", "iphone16", {
        app: "app_imessage",
        os: {
          time: new Date("2026-04-10T21:10:00"),
          battery: 83,
          network: "wifi",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .track(
        "app_imessage",
        (getOrder) => new IMessageTrackBuilder(30, "phone", "group_ex_v2", getOrder),
        (im) => {
          im.at("0s").createConversation({
            id: "group_ex_v2",
            title: "Launch Weekend",
            transport: "imessage",
            isGroup: true,
            participants: [{ id: "me", name: "Me", isMe: true }, { id: "kai", name: "Kai" }, { id: "mina", name: "Mina" }],
          });
          im.at("0.2s").createConversation({
            id: "dm_mina_ex_v2",
            title: "Mina",
            transport: "imessage",
            participants: [{ id: "me", name: "Me", isMe: true }, { id: "mina", name: "Mina" }],
          });
          im.at("1.0s").openConversation("group_ex_v2");
          im.at("2.0s").receive("Kai", "Has anyone slept?");
          im.at("3.2s").send("Sleep is a post-launch luxury.", { messageId: "im_ex_msg_1" });
          im.at("5.0s").receiveMedia("Mina", [{ kind: "image", url: "/placeholders/media.svg" }], { messageId: "im_ex_media_1" });
          im.at("6.4s").tapback({ messageId: "im_ex_media_1", type: "thumbsUp" });
          im.at("8.0s").sendAudio({
            url: "/audio/voice-memo.m4a",
            duration: 9,
            waveform: [0.2, 0.5, 0.7, 0.6, 0.8, 0.4, 0.5, 0.7],
            messageId: "im_ex_audio_1",
          });
          im.at("10.2s").setScreen("list");
          im.at("11.2s").openConversation("dm_mina_ex_v2");
          im.at("12.0s").receive("Mina", "I need the honest answer, not the group answer.");
          im.at("13.4s").send("Honest answer: the work is good and the launch copy is terrible.", { messageId: "im_ex_dm_1" });
          im.at("15.2s").typing("Mina", true);
          im.at("16.6s").typing("Mina", false);
          im.at("17.0s").receive("Mina", "Perfect. That's the useful answer.");
          im.at("19.0s").search("launch");
          im.at("20.4s").clearSearch();
          im.at("22.0s").read();
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("message_list", { scale: 1.02, duration: "0.35s" });
        cam.at("5.1s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("8.1s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("11.3s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build(),
});
