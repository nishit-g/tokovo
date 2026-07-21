import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "whatsapp-theme-storybook-v2",
    title: "WhatsApp Theme Storybook V2",
    description:
      "New WhatsApp Storybook theme showcase proving the token system on chats, updates, and a softer late-night pacing.",
    category: "showcase",
    catalogType: "app_showcase_theme",
    appId: "app_whatsapp",
    themeId: "whatsapp-storybook",
    visibility: "public",
    sortOrder: 120,
    tags: ["whatsapp", "theme", "storybook", "soft", "chat"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1260,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-theme-storybook-v2", {
      fps: 30,
      duration: "42s",
      title: "WhatsApp Theme Storybook V2",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: "whatsapp-storybook",
        os: {
          time: new Date("2026-04-10T22:12:00Z"),
          battery: 68,
          network: "4G",
        },
      })
      .background({ type: "image", src: "/backgrounds/storybook-forest.jpg" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_elm_v2",
            name: "Elm",
            avatar: "/avatars/avatar-zoe.jpg",
            unreadCount: 1,
            contact: {
              about: "Painting light one frame at a time.",
              phone: "+91 90000 50505",
              lastSeenLabel: "last seen today at 10:08 PM",
            },
            trust: { endToEndEncrypted: true },
            preferences: { disappearingMessages: "24 hours" },
            messages: [
              {
                id: "seed_elm_text",
                from: "Elm",
                type: "text",
                text: "The hill finally feels quiet instead of empty.",
                timestamp: new Date("2026-04-10T22:04:00Z").getTime(),
              },
              {
                id: "seed_story_image",
                from: "me",
                type: "image",
                imageUrl: "/backgrounds/storybook-forest.jpg",
                caption: "Keep the warm window. Lose the sharp cloud edge.",
                reactions: [
                  { emoji: "🌿", count: 2, fromMe: true },
                  { emoji: "✨", count: 1 },
                ],
                status: "read",
                timestamp: new Date("2026-04-10T22:06:00Z").getTime(),
              },
              {
                id: "seed_elm_reply",
                from: "Elm",
                type: "text",
                text: "Yes. That is the whole scene.",
                replyTo: { messageId: "seed_story_image" },
                timestamp: new Date("2026-04-10T22:07:00Z").getTime(),
              },
            ],
          },
          {
            id: "group_hill_v2",
            name: "Hill Sequence",
            type: "group",
            members: [
              { id: "me", name: "You" },
              { id: "elm", name: "Elm", avatar: "/avatars/avatar-zoe.jpg" },
              { id: "ren", name: "Ren" },
            ],
            unreadCount: 3,
            description: "Color, sound, and the final quiet frames",
            trust: { endToEndEncrypted: true },
          },
          {
            id: "group_hill_audio_v2",
            name: "Hill Audio",
            type: "group",
            members: [
              { id: "me", name: "You" },
              { id: "ren", name: "Ren" },
            ],
            messages: [
              {
                id: "seed_audio_1",
                from: "Ren",
                type: "text",
                text: "Night birds are tucked under the dialogue.",
                timestamp: new Date("2026-04-10T21:56:00Z").getTime(),
              },
            ],
          },
        ],
        statuses: [
          {
            id: "elm_status_1",
            authorId: "dm_elm_v2",
            authorName: "Elm",
            avatar: "/avatars/avatar-zoe.jpg",
            postedAt: new Date("2026-04-10T21:40:00Z").getTime(),
            viewed: true,
            media: { type: "image", src: "/backgrounds/storybook-forest.jpg" },
          },
          {
            id: "elm_status_2",
            authorId: "dm_elm_v2",
            authorName: "Elm",
            avatar: "/avatars/avatar-zoe.jpg",
            postedAt: new Date("2026-04-10T21:44:00Z").getTime(),
            viewed: false,
            media: { type: "text", text: "The grass can breathe now.", backgroundColor: "#607A63" },
          },
          {
            id: "elm_status_3",
            authorId: "dm_elm_v2",
            authorName: "Elm",
            avatar: "/avatars/avatar-zoe.jpg",
            postedAt: new Date("2026-04-10T21:48:00Z").getTime(),
            viewed: false,
            media: { type: "image", src: "/backgrounds/soft-gradient.png" },
          },
          {
            id: "ren_status_1",
            authorId: "ren",
            authorName: "Ren",
            postedAt: new Date("2026-04-10T21:52:00Z").getTime(),
            viewed: false,
            media: { type: "text", text: "Moonlit mix is ready.", backgroundColor: "#466178" },
          },
        ],
        channels: [
          {
            id: "channel_studio_notes_v2",
            name: "Studio Notes",
            description: "Soft color timing and frame notes",
            followersLabel: "19K followers",
            category: "Art",
            verified: true,
            followed: true,
            unreadCount: 2,
            latestUpdate: {
              id: "studio_update_1",
              text: "Golden-hour color pass approved",
              postedAt: new Date("2026-04-10T22:00:00Z").getTime(),
            },
          },
        ],
        callLog: [
          {
            id: "elm_call_1",
            conversationId: "dm_elm_v2",
            name: "Elm",
            avatar: "/avatars/avatar-zoe.jpg",
            direction: "outgoing",
            mode: "video",
            startedAt: new Date("2026-04-10T21:18:00Z").getTime(),
            durationSeconds: 368,
          },
          {
            id: "ren_call_1",
            conversationId: "group_hill_v2",
            name: "Ren",
            direction: "missed",
            mode: "voice",
            startedAt: new Date("2026-04-10T20:32:00Z").getTime(),
          },
        ],
        communities: [
          {
            id: "story_team",
            name: "Story Team",
            description: "The groups making the hillside sequence",
            announcementConversationId: "group_hill_v2",
            groupConversationIds: ["group_hill_audio_v2"],
            memberCount: 11,
            unreadCount: 3,
          },
        ],
        profile: {
          name: "Creator",
          about: "Making phone-native stories feel handmade.",
        },
        settings: {
          linkedDevicesCount: 2,
          privacy: { lastSeen: "contacts", profilePhoto: "contacts", readReceipts: true },
          chats: { theme: "light", backupLabel: "Today, 9:50 PM", defaultDisappearingMessages: "24 hours" },
          notifications: { messageTone: "Bamboo", groupTone: "Night birds", mutedChats: 1 },
          storage: { usedLabel: "1.9 GB used", autoDownloadLabel: "Wi-Fi only" },
        },
      })
      .whatsapp("phone", "dm_elm_v2", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("dm_elm_v2", "1.8s");
        wa.at("3.0s").receive("Elm", "The sky finally stopped looking artificial.");
        wa.at("5.0s").send("Good. Let the grass breathe and don't sharpen the clouds.", {
        });
        wa.openUpdates("8.8s");
        wa.openChatList("13.0s");
        wa.switchTo("group_hill_v2", "14.4s");
        wa.at("15.6s").receive("Ren", "Moonlit cut exported. It's absurdly pretty.");
        wa.at("17.6s").send("Then we leave it alone.", {});
        wa.openUpdates("21.0s");
        wa.openCalls("25.0s");
        wa.openCommunities("29.0s");
        wa.openSettings("33.0s");
        wa.switchTo("dm_elm_v2", "36.0s");
        wa.openProfile("37.0s");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.35s" });
        cam.span("3.0s", "7.6s").trackCinematic("lastMessage", { scale: 1.1, smoothing: 0.2 });
        cam.at("9.0s").focus("updates_status_strip", { scale: 1.08, duration: "0.35s" });
        cam.span("15.6s", "19.2s").trackCinematic("lastMessage", { scale: 1.08, smoothing: 0.18 });
        cam.at("25.1s").focus("calls_list", { scale: 1.06, duration: "0.35s" });
        cam.at("29.1s").focus("communities_list", { scale: 1.05, duration: "0.35s" });
        cam.at("37.2s").focus("profile_hero", { scale: 1.06, duration: "0.35s" });
      })
      .build(),
});
