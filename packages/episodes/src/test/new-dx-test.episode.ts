/**
 * New DX Test Episode
 *
 * Exercises:
 * - seeded message history
 * - explicit conversation and screen navigation
 * - pause()/now()
 * - reply()
 */

import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

const getOrder = (() => {
  let order = 0;
  return () => order++;
})();

export default defineEpisode({
  meta: {
    id: "new-dx-test",
    title: "New DX Test",
    description:
      "Initial messages + context switching + relative timing (pause/now/reply)",
    category: "test",
    tags: ["whatsapp", "dx", "test"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 60 * 30,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("new-dx-test", {
      fps: 30,
      duration: "60s",
      title:
        "New DX Test - Initial Messages + Context Switching + Relative Timing",
      description:
        "Tests seeded message history and explicit conversation switching.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_alex",
            name: "Alex",
            avatar: "https://i.pravatar.cc/150?img=1",
            messages: [
              {
                id: "seed_alex_1",
                type: "text",
                from: "Alex",
                text: "Hey! See you tomorrow at 2pm?",
                timestamp: -3600,
              },
              {
                id: "seed_alex_2",
                type: "text",
                from: "Me",
                text: "Yeah sounds good!",
                timestamp: -3500,
              },
              {
                id: "seed_alex_3",
                type: "text",
                from: "Alex",
                text: "Perfect! Coffee shop on Main St",
                timestamp: -3400,
              },
            ],
            unreadCount: 1,
          },
          {
            id: "dm_sarah",
            name: "Sarah",
            avatar: "https://i.pravatar.cc/150?img=2",
            messages: [],
          },
        ],
      })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "", getOrder),
        (wa) => {
          wa.switchTo("dm_alex", "0s");
          wa.at("1.3s").receive("Alex", "I'm here!");
          wa.span("3.8s", "5.8s").typing("me");
          wa.at("5.8s").send("Coming down now!");
          wa.at("7.3s").receive("Alex", "Cool, I'm at a table inside");

          wa.openChatList("9.8s");
          wa.switchTo("dm_sarah", "11.1s");
          wa.at("12.4s").send("Hey Sarah! Long time no talk");
          wa.at("15.9s").receive("Sarah", "Hey! How are you?");
          wa.span("17.4s", "20.4s").typing("me");
          wa.at("20.4s").send("Good! Want to grab coffee sometime?");
        },
      )
      .build(),
});
