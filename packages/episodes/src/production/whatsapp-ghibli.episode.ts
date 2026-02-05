import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";

export default defineEpisode({
  meta: {
    id: "whatsapp-ghibli",
    title: "WhatsApp Ghibli Daydream",
    description: "Soft, whimsical WhatsApp demo using the Ghibli theme.",
    category: "production",
    tags: ["whatsapp", "ghibli", "aesthetic", "theme"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2400,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-ghibli", {
      fps: 30,
      duration: "80s",
      title: "WhatsApp Ghibli Daydream",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: "whatsapp-ghibli",
        conversations: [
          {
            id: "dm_totoro",
            name: "Totoro",
            avatar: "/avatars/totoro.jpg",
            hasStatus: true,
            initialMessages: [
              {
                from: "system",
                type: "system",
                systemType: "encryption_notice",
                text:
                  "Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.",
              },
              {
                from: "system",
                type: "system",
                systemType: "date_change",
                text: "Yesterday",
              },
              { from: "Totoro", text: "It smells like rain 🌧️", timestamp: -5400 },
              { from: "Me", text: "Then the forest will sing.", timestamp: -5200 },
              {
                from: "Totoro",
                type: "call_missed",
                callType: "voice",
                timestamp: -4100,
              },
            ],
          },
          {
            id: "group_ghibli",
            name: "Forest Spirits",
            avatar: "/avatars/group-forest.jpg",
            type: "group",
            hasStatus: true,
            initialMessages: [
              { from: "Soot", text: "Tea at dusk?", timestamp: -3600 },
            ],
          },
        ],
        os: {
          time: new Date("2025-02-02T17:20:00"),
          battery: 76,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/ghibli-forest.png" })
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_totoro", getOrder),
        (wa) => {
          wa.openChatList("0s");
          wa.switchTo("dm_totoro", "2s");

          wa.at("2.6s").receive("Totoro", "I found a quiet hill.");
          wa.span("3s", "4.2s").typing("me");
          wa.at("4.4s").send("Bring the lanterns. I’ll bring snacks.");
          wa.at("5.6s").receiveImage("Totoro", "/placeholders/media.svg", {
            caption: "The view from here",
          });
          wa.at("6.6s").react({ index: -1 }, "✨");

          wa.at("7.8s");
          wa.dateSeparator("Yesterday");
          wa.at("8.4s").receive("Totoro", "The wind carried your note.");
          wa.at("9.4s").send("Then we’ll follow it home.");

          wa.goBack("11s");

          wa.switchTo("group_ghibli", "13s");
          wa.at("13.6s").receive("Soot", "Tea at dusk?");
          wa.at("14.2s").send("Under the big cedar, yes.");
          wa.at("15s").receiveSticker("Soot", "/placeholders/media.svg");
          wa.at("15.8s").send("See you all there.");

          wa.goBack("18s");
          wa.openChatList("20s");
        },
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )
      .build(),
});
