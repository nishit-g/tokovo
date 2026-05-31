import { KeyboardPlugin, OSDirectorPlugin } from "@tokovo/compiler";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "whatsapp-exhaustive-v2",
    title: "WhatsApp Exhaustive V2",
    description:
      "Dense WhatsApp proof with pinned chats, channels, calls, communities, settings, business messaging, and keyboard-driven replies.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 110,
    tags: ["whatsapp", "exhaustive", "channels", "calls", "communities", "keyboard"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1710,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-exhaustive-v2", {
      fps: 30,
      duration: "57s",
      title: "WhatsApp Exhaustive V2",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2026-04-10T21:05:00"),
          battery: 71,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cafe-lofi.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "group_release_ops_v2", name: "Release Ops", type: "group", unreadCount: 9, isPinned: true, participants: ["me", "Aarav", "Noor", "Mina"], description: "4 members" },
          { id: "dm_finance_v2", name: "Finance", unreadCount: 1, avatar: "/placeholders/app-icon.svg" },
          { id: "dm_support_v2", name: "Support Desk", unreadCount: 3, isVerifiedBusiness: true, businessLabel: "Business account" },
          { id: "dm_family_v2", name: "Family Core", type: "group", unreadCount: 2, hasStatus: true, participants: ["me", "Mom", "Dad", "Ria"] },
          { id: "channel_storycraft_v2", name: "Storycraft Daily", isChannel: true, isFollowed: true, channelDescription: "Narrative product notes", channelLatestSnippet: "Pinned: better notification pacing on iPhone", channelFollowersLabel: "58K followers", channelCategory: "Creator tools", channelUnreadCount: 4 },
        ],
      })
      .whatsapp("phone", "group_release_ops_v2", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("group_release_ops_v2", "1.8s");
        wa.at("2.8s").receive("Aarav", "Can we hold the rollout for 3 minutes?");
        wa.at("4.2s").receive("Mina", "LinkedIn comments are calm. Instagram is not.");
        wa.at("6.0s").send("Hold only the carousel. Stories can go.", {
          typed: true,
          charDelay: 2,
        });
        wa.openUpdates("9.5s");
        wa.openCalls("13.0s");
        wa.openCommunities("16.5s");
        wa.openSettings("20.0s");
        wa.openChatList("23.5s");
        wa.switchTo("dm_support_v2", "25.0s");
        wa.at("26.2s").receive("Support Desk", "Top issue: stale thumbnail on iPhone 15.");
        wa.at("28.0s").send("Clear CDN edge 3 and ask them to hard refresh.", {
          typed: true,
          charDelay: 2,
        });
        wa.openChatList("31.5s");
        wa.switchTo("dm_finance_v2", "33.0s");
        wa.at("34.2s").receive("Finance", "Vendor wants written approval before midnight.");
        wa.at("35.8s").send("Approved. Send the PO and cc ops.", { typed: true, charDelay: 2 });
        wa.openUpdates("39.4s");
        wa.openChatList("43.0s");
        wa.switchTo("dm_family_v2", "44.4s");
        wa.at("45.2s").receive("Mom", "Bas kaam hi karta rehna.");
        wa.at("46.8s").send("Work is temporary. Family banter is eternal.", {
          typed: true,
          charDelay: 2,
        });
        wa.openCalls("50.6s");
      })
      .camera((cam) => {
        cam.at("0s").focus("chat_list", { scale: 1.03, duration: "0.35s" });
        cam.span("2.8s", "7.8s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.18 });
        cam.at("9.6s").focus("status_row", { scale: 1.08, duration: "0.35s" });
        cam.at("13.1s").focus("calls_list", { scale: 1.08, duration: "0.35s" });
        cam.at("16.6s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("20.1s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("26.2s", "29.6s").trackCinematic("lastMessage", { scale: 1.1, smoothing: 0.16 });
        cam.span("34.2s", "37.0s").trackCinematic("lastMessage", { scale: 1.1, smoothing: 0.16 });
        cam.span("45.2s", "48.2s").trackCinematic("lastMessage", { scale: 1.1, smoothing: 0.16 });
      })
      .use(new KeyboardPlugin())
      .use(new OSDirectorPlugin())
      .build(),
});
