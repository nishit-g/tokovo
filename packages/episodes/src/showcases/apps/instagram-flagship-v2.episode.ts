import { createInstagramTrackBuilder } from "@tokovo/apps-instagram";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";

export default defineEpisode({
  meta: {
    id: "instagram-flagship-v2",
    title: "Instagram Flagship V2",
    description:
      "Fresh Instagram creator-core flagship with feed, stories, inbox, notifications, profile, and composer flow.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_instagram",
    visibility: "public",
    sortOrder: 400,
    tags: ["instagram", "flagship", "feed", "stories", "dm", "profile"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1140,
    apps: ["app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T18:30:00").getTime();

    return episode("instagram-flagship-v2", {
      fps: 30,
      duration: "38s",
      title: "Instagram Flagship V2",
    })
      .device("phone", "iphone16", {
        app: "app_instagram",
        installedApps: ["app_instagram"],
        os: {
          time: new Date("2026-04-10T18:32:00"),
          battery: 61,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_me",
        users: [
          { id: "ig_me", username: "mira.studio", displayName: "Mira Studio", bio: "Quiet frames, louder comments.", avatarUrl: "/avatars/avatar-zoe.jpg", followers: 124000, following: 620, verified: true },
          { id: "ig_noa", username: "noa.frames", displayName: "Noa Frames", bio: "Edits and panic management.", avatarUrl: "/avatars/avatar-priya.jpg", followers: 18400, following: 240 },
        ],
        follows: [{ followerId: "ig_me", followingId: "ig_noa" }],
        posts: [
          { id: "ig_flag_1", authorId: "ig_me", imageUrl: "/placeholders/media.svg", caption: "Teaser frame. No context. Just pressure.", createdAt: baseTs - 150000, location: "Bengaluru", likeCount: 8200, commentCount: 242, aspect: "portrait" },
        ],
        storySets: [
          {
            id: "ig_storyset_flag",
            userId: "ig_noa",
            items: [
              { id: "ig_story_flag_1", authorId: "ig_noa", mediaUrl: "/placeholders/media.svg", createdAt: baseTs - 90000, accentColor: "#ff8246" },
              { id: "ig_story_flag_2", authorId: "ig_noa", mediaUrl: "/placeholders/media.svg", createdAt: baseTs - 85000, accentColor: "#f7b267" },
            ],
          },
        ],
        threads: [
          { id: "ig_dm_flag_1", participantIds: ["ig_me", "ig_noa"], title: "Noa Frames", unreadCount: 1, pinned: true },
        ],
        messages: [
          { id: "ig_dm_seed_1", threadId: "ig_dm_flag_1", senderId: "ig_noa", text: "Comments are forming factions already.", createdAt: baseTs - 20000 },
        ],
      })
      .track("app_instagram", (getOrder) => createInstagramTrackBuilder(30, "phone", getOrder), (ig) => {
        ig.at("1.4s").navigate("home", { postId: "ig_flag_1" });
        ig.at("3.0s").openStory("ig_storyset_flag", "ig_story_flag_1");
        ig.at("4.8s").advanceStory("ig_storyset_flag");
        ig.at("6.0s").replyToStory({
          id: "ig_story_reply_flag",
          storyId: "ig_story_flag_2",
          threadId: "ig_dm_flag_1",
          senderId: "ig_me",
          text: "This looks good. Please tell me the comments are exaggerating.",
          createdAt: baseTs + 10000,
          typed: true,
          charDelay: 2,
        });
        ig.at("9.2s").navigate("thread", { threadId: "ig_dm_flag_1" });
        ig.at("10.0s").addDMMessage({
          id: "ig_dm_flag_2",
          threadId: "ig_dm_flag_1",
          senderId: "ig_noa",
          text: "They are not. One guy wrote a 6-part teardown of the caption alone.",
          createdAt: baseTs + 18000,
        });
        ig.at("13.2s").navigate("notifications");
        ig.at("13.8s").notify({
          id: "ig_flag_nt_1",
          type: "comment",
          actorId: "ig_noa",
          postId: "ig_flag_1",
          title: "Noa Frames",
          body: "Pinned your post in the team share list.",
          createdAt: baseTs + 22000,
        });
        ig.at("15.8s").navigate("profile", { profileId: "ig_me" });
        ig.at("18.8s").navigate("composer");
        ig.at("19.4s").setComposerDraft({
          caption: "Second still. Calmer caption. Same launch-night pulse.",
          imageUrl: "/placeholders/media.svg",
          location: "Bengaluru",
        });
        ig.at("21.4s").addPost({
          id: "ig_flag_2",
          authorId: "ig_me",
          imageUrl: "/placeholders/media.svg",
          caption: "Second still. Calmer caption. Same launch-night pulse.",
          createdAt: baseTs + 34000,
          location: "Bengaluru",
          aspect: "portrait",
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("feed", { scale: 1.02, duration: "0.35s" });
        cam.at("3.1s").focus("story_viewer", { scale: 1.08, duration: "0.35s" });
        cam.span("6.0s", "8.8s").trackCinematic("keyboard", { scale: 1.1, smoothing: 0.18 });
        cam.at("9.3s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("13.3s").focus("notification_row", { scale: 1.08, duration: "0.35s" });
        cam.at("15.9s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
        cam.at("18.9s").focus("composer", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
