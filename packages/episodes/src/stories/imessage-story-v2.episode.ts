import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { IMessageTrackBuilder } from "@tokovo/apps-imessage";

export default defineEpisode({
  meta: {
    id: "imessage-story-v2",
    title: "iMessage Story V2",
    description:
      "A new iMessage story where the family group sounds polite until the private thread reveals what everyone is actually thinking.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 160,
    tags: ["story", "imessage", "family", "private thread"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1020,
    apps: ["app_imessage"],
  },
  build: () =>
    episode("imessage-story-v2", { fps: 30, duration: "34s", title: "iMessage Story V2" })
      .device("phone", "iphone16", {
        app: "app_imessage",
        os: {
          time: new Date("2026-04-10T18:10:00"),
          battery: 81,
          network: "wifi",
        },
      })
      .track(
        "app_imessage",
        (getOrder) => new IMessageTrackBuilder(30, "phone", "family_story_v2", getOrder),
        (im) => {
          im.at("0s").createConversation({
            id: "family_story_v2",
            title: "Family",
            transport: "imessage",
            isGroup: true,
            participants: [{ id: "me", name: "Me", isMe: true }, { id: "mom", name: "Mom" }, { id: "sis", name: "Sis" }],
          });
          im.at("0.2s").createConversation({
            id: "dm_sis_story_v2",
            title: "Sis",
            transport: "imessage",
            participants: [{ id: "me", name: "Me", isMe: true }, { id: "sis", name: "Sis" }],
          });
          im.at("1.0s").openConversation("family_story_v2");
          im.at("2.0s").receive("Mom", "Be on time and please act normal tonight.");
          im.at("4.0s").send("Define normal in measurable terms.", { messageId: "im_story_1" });
          im.at("6.0s").setScreen("list");
          im.at("7.0s").openConversation("dm_sis_story_v2");
          im.at("8.0s").receive("Sis", "Mom means don't mention the surprise guest.");
          im.at("10.0s").send("WHY is there always a surprise guest", { messageId: "im_story_2" });
        },
      )
      .build(),
});
