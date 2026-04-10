import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";

export default defineEpisode({
  meta: {
    id: "linkedin-theme-ghibli-v2",
    title: "LinkedIn Theme Ghibli V2",
    description:
      "A new Ghibli-toned LinkedIn showcase proving the theme system across feed, profile, notifications, and messages.",
    category: "showcase",
    catalogType: "app_showcase_theme",
    appId: "app_linkedin",
    themeId: "ghibli",
    visibility: "public",
    sortOrder: 320,
    tags: ["linkedin", "theme", "ghibli", "profile", "messages"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1050,
    apps: ["app_linkedin"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T08:00:00").getTime();

    return episode("linkedin-theme-ghibli-v2", {
      fps: 30,
      duration: "35s",
      title: "LinkedIn Theme Ghibli V2",
    })
      .device("phone", "iphone16", {
        app: "app_linkedin",
        os: {
          time: new Date("2026-04-10T08:02:00"),
          battery: 90,
          network: "wifi",
        },
      })
      .background({ type: "image", src: "/backgrounds/ghibli-forest.png" })
      .snapshot("app_linkedin", "phone", {
        currentUserId: "me",
        users: [
          { id: "me", name: "Mina Park", handle: "minapark", headline: "Brand storyteller for calmer launches", avatarUrl: "/avatars/avatar-priya.jpg", company: "Lantern", location: "Seoul", connections: 1204, followers: 21400, profileViews: 611, impressionCount: 17100 },
          { id: "u1", name: "Riku Sato", handle: "rikusato", headline: "Illustration systems lead", avatarUrl: "/avatars/avatar-alex.jpg", company: "Freelance", location: "Kyoto", connections: 610, followers: 10300 },
        ],
        posts: [
          { id: "li_ghibli_1", authorId: "me", text: "A good launch can still feel quiet if the interface knows how to breathe.", createdAt: baseTs - 100000, media: { type: "image", urls: ["/placeholders/media.svg"], aspect: "wide" } },
        ],
        notifications: [
          { id: "li_ghibli_nt_1", type: "like", actorId: "u1", postId: "li_ghibli_1", unread: true, createdAt: baseTs - 18000, title: "Riku Sato liked your post", body: "A good launch can still feel quiet..." },
        ],
        threads: [{ id: "li_ghibli_dm_1", participantIds: ["me", "u1"], title: "Riku Sato", unreadCount: 1 }],
        messages: [{ id: "li_ghibli_msg_1", threadId: "li_ghibli_dm_1", senderId: "u1", text: "The new theme makes the feed feel gentler without losing density.", createdAt: baseTs - 12000 }],
      })
      .track("app_linkedin", (getOrder) => new LinkedInTrackBuilder(30, "phone", getOrder), (li) => {
        li.at("0.5s").setThemeMode("ghibli");
        li.at("1.6s").navigate("feed", { postId: "li_ghibli_1" });
        li.at("4.0s").navigate("profile", { userId: "me" });
        li.at("8.2s").navigate("notifications");
        li.at("11.2s").navigate("messages");
        li.at("12.6s").navigate("thread", { threadId: "li_ghibli_dm_1" });
        li.at("14.0s").sendDM({
          id: "li_ghibli_msg_2",
          threadId: "li_ghibli_dm_1",
          senderId: "me",
          text: "Good. The whole point is warmth without losing seriousness.",
          createdAt: baseTs + 10000,
          typed: true,
          charDelay: 2,
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.35s" });
        cam.at("1.7s").focus("post_card", { scale: 1.08, duration: "0.35s" });
        cam.at("4.1s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
        cam.at("8.3s").focus("notification_row", { scale: 1.08, duration: "0.35s" });
        cam.at("12.7s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
