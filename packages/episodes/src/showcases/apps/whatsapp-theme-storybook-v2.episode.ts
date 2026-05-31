import { KeyboardPlugin } from "@tokovo/compiler";
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
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-theme-storybook-v2", {
      fps: 30,
      duration: "30s",
      title: "WhatsApp Theme Storybook V2",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: "whatsapp-storybook",
        os: {
          time: new Date("2026-04-10T22:12:00"),
          battery: 68,
          network: "4G",
        },
      })
      .background({ type: "image", src: "/backgrounds/storybook-forest.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_elm_v2", name: "Elm", avatar: "/avatars/avatar-zoe.jpg", hasStatus: true, unreadCount: 1 },
          { id: "group_hill_v2", name: "Hill Sequence", type: "group", participants: ["me", "Elm", "Ren"], unreadCount: 3 },
          { id: "channel_studio_notes_v2", name: "Studio Notes", isChannel: true, isFollowed: true, channelDescription: "Soft color timing and frame notes", channelLatestSnippet: "Golden hour pass approved", channelFollowersLabel: "19K followers", channelCategory: "Art", channelUnreadCount: 2 },
        ],
      })
      .whatsapp("phone", "dm_elm_v2", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("dm_elm_v2", "1.8s");
        wa.at("3.0s").receive("Elm", "The sky finally stopped looking artificial.");
        wa.at("5.0s").send("Good. Let the grass breathe and don't sharpen the clouds.", {
          typed: true,
          charDelay: 2,
        });
        wa.openUpdates("8.8s");
        wa.openChatList("13.0s");
        wa.switchTo("group_hill_v2", "14.4s");
        wa.at("15.6s").receive("Ren", "Moonlit cut exported. It's absurdly pretty.");
        wa.at("17.6s").send("Then we leave it alone.", { typed: true, charDelay: 2 });
        wa.openUpdates("21.0s");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.35s" });
        cam.span("3.0s", "7.6s").trackCinematic("lastMessage", { scale: 1.1, smoothing: 0.2 });
        cam.at("9.0s").focus("status_row", { scale: 1.08, duration: "0.35s" });
        cam.span("15.6s", "19.2s").trackCinematic("lastMessage", { scale: 1.08, smoothing: 0.18 });
      })
      .use(new KeyboardPlugin())
      .build(),
});
