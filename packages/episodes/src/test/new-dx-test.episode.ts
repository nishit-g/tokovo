/**
 * New DX Test Episode
 *
 * Exercises:
 * - initialMessages
 * - openChat()/goBack()
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
      title: "New DX Test - Initial Messages + Context Switching + Relative Timing",
      description:
        "Tests: initialMessages, openChat(), pause(), now(), reply()",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_alex",
            name: "Alex",
            avatar: "https://i.pravatar.cc/150?img=1",
            initialMessages: [
              {
                from: "Alex",
                text: "Hey! See you tomorrow at 2pm?",
                timestamp: -3600,
              },
              { from: "Me", text: "Yeah sounds good!", timestamp: -3500 },
              {
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
            initialMessages: [],
          },
        ],
      })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "", getOrder),
        (wa) => {
          wa.openChat("dm_alex");
          wa.pause(1);
          wa.at("0s").receive("Alex", "I'm here!");
          wa.pause(2);
          wa.now().reply("Coming down now!");
          wa.pause(1);
          wa.at("0s").receive("Alex", "Cool, I'm at a table inside");

          wa.pause(2);
          wa.goBack();
          wa.pause(1);
          wa.now().openChat("dm_sarah");
          wa.pause(1);
          wa.at("0s").send("Hey Sarah! Long time no talk");
          wa.pause(3);
          wa.at("0s").receive("Sarah", "Hey! How are you?");
          wa.pause(1);
          wa.now().reply("Good! Want to grab coffee sometime?", 3);
        },
      )
      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });
      })
      .build(),
});

