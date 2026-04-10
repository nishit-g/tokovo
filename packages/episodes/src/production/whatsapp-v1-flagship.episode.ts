import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";

export default defineEpisode({
  meta: {
    id: "whatsapp-v1-flagship",
    title: "WhatsApp V1 Flagship",
    description: "Flagship WhatsApp pass covering chats, updates, calls, verified business chat, and group coordination.",
    category: "production",
    tags: ["whatsapp", "flagship", "updates", "calls", "business", "group"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1500,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-v1-flagship", {
      fps: 30,
      duration: "50s",
      title: "WhatsApp V1 Flagship",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2025-04-04T20:15:00"),
          battery: 83,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_studio",
            name: "Aster Studio",
            avatar: "/placeholders/app-icon.svg",
            unreadCount: 2,
            isVerifiedBusiness: true,
            businessLabel: "Business account",
            messages: [
              {
                id: "studio-1",
                from: "Aster Studio",
                text: "Can you send the launch preview tonight?",
                at: new Date("2025-04-04T20:03:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2025-04-04T20:03:00").getTime(),
          },
          {
            id: "group_ops",
            name: "Launch Ops",
            avatar: "/placeholders/app-icon.svg",
            type: "group",
            isPinned: true,
            description: "7 members",
            members: [
              { id: "me", name: "Nishit" },
              { id: "ava", name: "Ava" },
              { id: "leo", name: "Leo" },
            ],
            messages: [
              {
                id: "ops-1",
                from: "Ava",
                text: "Deck is approved. Waiting on final exports.",
                at: new Date("2025-04-04T20:05:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2025-04-04T20:05:00").getTime(),
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            avatar: "/avatars/avatar-mom.jpg",
            unreadCount: 1,
            hasStatus: true,
            messages: [
              {
                id: "mom-1",
                from: "Mom ❤️",
                text: "Dinner is still warm. Don’t get too late.",
                at: new Date("2025-04-04T19:56:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2025-04-04T19:56:00").getTime(),
          },
          {
            id: "channel_design",
            name: "Design Dispatch",
            avatar: "/placeholders/app-icon.svg",
            isChannel: true,
            isVerifiedBusiness: true,
            isFollowed: true,
            channelUnreadCount: 3,
            channelDescription: "Product thinking, launch notes, and design breakdowns.",
            channelLatestSnippet: "Tonight: what made the new editor feel more premium.",
            channelFollowersLabel: "146K followers",
            channelCategory: "Design",
            messages: [],
          },
          {
            id: "dm_priya",
            name: "Priya",
            avatar: "/avatars/avatar-priya.jpg",
            hasStatus: true,
            messages: [
              {
                id: "priya-1",
                from: "Priya",
                text: "Sent you the updated moodboard.",
                at: new Date("2025-04-04T19:48:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2025-04-04T19:48:00").getTime(),
          },
        ],
      })
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_studio", getOrder),
        (wa) => {
          wa.openChatList("0s");
          wa.openUpdates("5s");
          wa.openCalls("12s");
          wa.openChatList("18s");

          wa.switchTo("dm_studio", "20s");
          wa.at("21s").receive("Aster Studio", "Client loved the hero frame.");
          wa.at("22.5s").send("Perfect. I’ll send the polished export in ten.", {
            typed: true,
            charDelay: 2,
          });
          wa.at("25.6s").receiveImage("Aster Studio", "/placeholders/media.svg", {
            caption: "Using this as the first preview tile.",
          });
          wa.at("27s").react({ index: -1 }, "🔥");
          wa.goBack("29s");

          wa.switchTo("group_ops", "31s");
          wa.span("32s", "33.2s").typing("Ava");
          wa.at("33.5s").receive("Ava", "Exports landed. Shipping to client in 3.");
          wa.at("35s").send("Nice. I’ll stay on for final QA.", {
            typed: true,
            charDelay: 2,
          });
          wa.at("38s").receiveVoice("Leo", 6);
          wa.goBack("41s");

          wa.openUpdates("43s");
          wa.openChatList("47s");
        },
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 2,
          excludeShortMessages: 2,
        }),
      )
      .build(),
});
