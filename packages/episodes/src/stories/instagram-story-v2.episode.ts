import { createInstagramTrackBuilder } from "@tokovo/apps-instagram";
import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";

export default defineEpisode({
  meta: {
    id: "instagram-story-v2",
    title: "Instagram Story V2",
    description:
      "A new Instagram story where a creator tries to sound casual and accidentally writes the most comment-worthy caption on the app.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 130,
    tags: ["story", "instagram", "creator", "comments", "banter"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1020,
    apps: ["app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T20:00:00").getTime();

    return episode("instagram-story-v2", { fps: 30, duration: "34s", title: "Instagram Story V2" })
      .device("phone", "iphone16", {
        app: "app_instagram",
        installedApps: ["app_instagram"],
        os: {
          time: new Date("2026-04-10T20:02:00"),
          battery: 58,
          network: "5G",
        },
      })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_story_me",
        users: [
          { id: "ig_story_me", username: "arya.cuts", displayName: "Arya Cuts", avatarUrl: "/avatars/avatar-alex.jpg", followers: 189000, following: 510, verified: true },
          { id: "ig_story_sam", username: "sam.frames", displayName: "Sam Frames", avatarUrl: "/avatars/avatar-priya.jpg", followers: 34200, following: 415 },
        ],
        posts: [
          { id: "ig_story_post_v2", authorId: "ig_story_me", imageUrl: "/placeholders/media.svg", caption: "How reels are made when your taste is expensive but your process is chaotic.", createdAt: baseTs - 60000, likeCount: 21200, commentCount: 420, aspect: "portrait" },
        ],
      })
      .track("app_instagram", (getOrder) => createInstagramTrackBuilder(30, "phone", getOrder), (ig) => {
        ig.at("1.0s").navigate("home", { postId: "ig_story_post_v2" });
        ig.at("2.6s").commentOnPost({ id: "ig_story_comment_1", postId: "ig_story_post_v2", authorId: "ig_story_sam", text: "This reads like you lost a fight with a moodboard.", createdAt: baseTs + 6000 });
        ig.at("3.8s").commentOnPost({ id: "ig_story_comment_2", postId: "ig_story_post_v2", authorId: "ig_story_me", text: "Correct. The moodboard won.", createdAt: baseTs + 9000 });
        ig.at("5.2s").commentOnPost({ id: "ig_story_comment_3", postId: "ig_story_post_v2", authorId: "ig_story_sam", text: "At least it won in high resolution.", createdAt: baseTs + 13000 });
      })
      .camera((cam) => {
        cam.at("1.1s").focus("feed_post", { scale: 1.08, duration: "0.35s" });
        cam.span("2.6s", "5.6s").trackCinematic("comment_block", { scale: 1.08, smoothing: 0.18 });
      })
      .build();
  },
});
