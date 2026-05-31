import { createInstagramTrackBuilder } from "@tokovo/apps-instagram";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";

export default defineEpisode({
  meta: {
    id: "instagram-theme-storybook-v2",
    title: "Instagram Theme Storybook V2",
    description:
      "A new Storybook Instagram showcase proving the theme system across stories, DMs, profile, and warm creator framing.",
    category: "showcase",
    catalogType: "app_showcase_theme",
    appId: "app_instagram",
    themeId: "storybook",
    visibility: "public",
    sortOrder: 420,
    tags: ["instagram", "theme", "storybook", "stories", "profile"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 870,
    apps: ["app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T17:00:00").getTime();

    return episode("instagram-theme-storybook-v2", {
      fps: 30,
      duration: "29s",
      title: "Instagram Theme Storybook V2",
    })
      .device("phone", "iphone16", {
        app: "app_instagram",
        os: {
          time: new Date("2026-04-10T17:02:00"),
          battery: 73,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/storybook-forest.png" })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_mira",
        users: [
          { id: "ig_mira", username: "mira.atelier", displayName: "Mira Atelier", bio: "Quiet sets and impossible skies.", avatarUrl: "/avatars/avatar-zoe.jpg", followers: 58200, following: 311, verified: true },
          { id: "ig_elm", username: "elm.storyboard", displayName: "Elm Storyboard", avatarUrl: "/avatars/avatar-priya.jpg", followers: 12600, following: 274 },
        ],
        posts: [
          { id: "ig_storybook_1", authorId: "ig_mira", imageUrl: "/placeholders/media.svg", caption: "Golden-hour notes from the hill sequence.", createdAt: baseTs - 90000, likeCount: 4320, commentCount: 122, aspect: "portrait" },
        ],
        storySets: [
          { id: "ig_storybook_storyset", userId: "ig_mira", items: [{ id: "ig_storybook_story_1", authorId: "ig_mira", mediaUrl: "/placeholders/media.svg", createdAt: baseTs - 50000 }, { id: "ig_storybook_story_2", authorId: "ig_mira", mediaUrl: "/placeholders/media.svg", createdAt: baseTs - 46000 }] },
        ],
        threads: [{ id: "ig_storybook_thread", participantIds: ["ig_mira", "ig_elm"], title: "Elm Storyboard", unreadCount: 1 }],
        messages: [{ id: "ig_storybook_msg_1", threadId: "ig_storybook_thread", senderId: "ig_elm", text: "The second story frame finally feels like wind, not blur.", createdAt: baseTs - 12000 }],
      })
      .track("app_instagram", (getOrder) => createInstagramTrackBuilder(30, "phone", getOrder), (ig) => {
        ig.at("0.6s").setThemeMode("storybook");
        ig.at("1.6s").openStory("ig_storybook_storyset", "ig_storybook_story_1");
        ig.at("3.4s").advanceStory("ig_storybook_storyset");
        ig.at("5.0s").navigate("thread", { threadId: "ig_storybook_thread" });
        ig.at("6.2s").addDMMessage({
          id: "ig_storybook_msg_2",
          threadId: "ig_storybook_thread",
          senderId: "ig_mira",
          text: "Good. Then we keep the sky soft and stop touching the grade.",
          createdAt: baseTs + 8000,
          typed: true,
          charDelay: 2,
        });
        ig.at("9.6s").navigate("profile", { profileId: "ig_mira" });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.35s" });
        cam.at("1.7s").focus("story_viewer", { scale: 1.08, duration: "0.35s" });
        cam.at("5.1s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("9.7s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
