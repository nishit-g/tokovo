import { InstagramTrackBuilder } from "@tokovo/apps-instagram";
import { episode } from "@tokovo/dsl";
import { defineEpisode } from "@tokovo/episodes";

export default defineEpisode({
  meta: {
    id: "instagram-creator-drop",
    title: "Instagram Creator Drop",
    description:
      "Creator-core Instagram flow: feed post, story reply handoff, inbox escalation, notifications, and a typed composer publish.",
    category: "production",
    tags: ["instagram", "creator", "stories", "dm", "notifications"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 690,
    apps: ["app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2025-03-18T18:45:00").getTime();

    return episode("instagram-creator-drop", {
      fps: 30,
      duration: "23s",
      title: "Instagram Creator Drop",
    })
      .device("phone", "iphone16", {
        app: "app_instagram",
        installedApps: ["app_instagram"],
        os: {
          time: new Date("2025-03-18T18:48:00"),
          battery: 62,
          network: "5G",
        },
      })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_me",
        users: [
          {
            id: "ig_me",
            username: "studio.aria",
            displayName: "Aria Studio",
            bio: "Short films, soft light, and launch-week chaos.",
            avatarUrl: "/avatars/avatar-alex.jpg",
            followers: 128400,
            following: 812,
            verified: true,
          },
          {
            id: "ig_luca",
            username: "luca.frames",
            displayName: "Luca Frames",
            bio: "Edits. Moodboards. Damage control.",
            avatarUrl: "/avatars/avatar-priya.jpg",
            followers: 24100,
            following: 603,
          },
          {
            id: "ig_nova",
            username: "nova.social",
            displayName: "Nova Social",
            bio: "Community manager on espresso fumes.",
            avatarUrl: "/avatars/avatar-zoe.jpg",
            followers: 18300,
            following: 522,
          },
        ],
        follows: [
          { followerId: "ig_me", followingId: "ig_luca" },
          { followerId: "ig_me", followingId: "ig_nova" },
        ],
        posts: [
          {
            id: "post_seed_1",
            authorId: "ig_me",
            imageUrl: "/placeholders/media.svg",
            caption:
              "Tomorrow. 9PM. The studio finally drops the film we should not have survived.",
            createdAt: baseTs - 250000,
            location: "Bangalore",
            aspect: "portrait",
            likeCount: 8402,
          },
        ],
        comments: [
          {
            id: "comment_seed_1",
            postId: "post_seed_1",
            authorId: "ig_luca",
            text: "This one is going to break the internet.",
            createdAt: baseTs - 210000,
          },
        ],
        storySets: [
          {
            id: "story_launch",
            userId: "ig_me",
            items: [
              {
                id: "story_launch_1",
                authorId: "ig_me",
                mediaUrl: "/placeholders/media.svg",
                createdAt: baseTs - 120000,
              },
              {
                id: "story_launch_2",
                authorId: "ig_me",
                mediaUrl: "/placeholders/media.svg",
                createdAt: baseTs - 90000,
              },
            ],
          },
        ],
        threads: [
          {
            id: "thread_luca",
            participantIds: ["ig_me", "ig_luca"],
          },
          {
            id: "thread_nova",
            participantIds: ["ig_me", "ig_nova"],
            unreadCount: 1,
            pinned: true,
          },
        ],
        messages: [
          {
            id: "msg_seed_1",
            threadId: "thread_nova",
            senderId: "ig_nova",
            text: "When the post goes live, don’t disappear. Comments will be feral.",
            createdAt: baseTs - 70000,
          },
        ],
        notifications: [
          {
            id: "nt_seed_1",
            type: "comment",
            actorId: "ig_luca",
            postId: "post_seed_1",
            createdAt: baseTs - 65000,
          },
        ],
      })
      .view("app_instagram", "phone", { screen: "home" })
      .track(
        "app_instagram",
        (getOrder) => new InstagramTrackBuilder(30, "phone", getOrder),
        (ig) => {
          ig.at("1.0s").likePost("post_seed_1", "ig_me");
          ig.at("2.1s").openStory("story_launch", "story_launch_1");
          ig.at("4.0s").advanceStory("story_launch");
          ig.at("5.2s").replyToStory({
            id: "msg_story_reply",
            storyId: "story_launch_2",
            threadId: "thread_luca",
            senderId: "ig_luca",
            text: "Tell me this is the final export because the color grade is violent.",
            typed: true,
            charDelay: 2,
            createdAt: baseTs + 90000,
          });
          ig.at("7.4s").setThreadTyping("thread_nova", "ig_nova");
          ig.at("8.2s").addDMMessage({
            id: "msg_nova_2",
            threadId: "thread_nova",
            senderId: "ig_me",
            text: "I’m here. Schedule the comments highlight after minute ten.",
            typed: true,
            charDelay: 2,
            createdAt: baseTs + 118000,
          });
          ig.at("10.4s").navigate("notifications");
          ig.at("10.8s").notify({
            id: "nt_burst_1",
            type: "like",
            actorId: "ig_luca",
            postId: "post_seed_1",
            body: "liked your launch teaser.",
            createdAt: baseTs + 132000,
          });
          ig.at("11.1s").notify({
            id: "nt_burst_2",
            type: "follow",
            actorId: "ig_nova",
            body: "started following you.",
            createdAt: baseTs + 133000,
          });
          ig.at("12.3s").navigate("composer");
          ig.at("12.6s").setComposerDraft({
            caption: "The calm before the chaos. See you at 9PM.",
            imageUrl: "/placeholders/media.svg",
            location: "Studio Floor",
          });
          ig.at("14.2s").addPost({
            id: "post_live_2",
            authorId: "ig_me",
            imageUrl: "/placeholders/media.svg",
            caption: "The calm before the chaos. See you at 9PM.",
            location: "Studio Floor",
            typed: true,
            charDelay: 2,
            createdAt: baseTs + 180000,
            aspect: "portrait",
          });
          ig.at("16.7s").navigate("profile", { profileId: "ig_me" });
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("2.15s").focus("story_viewer", { scale: 1.04, duration: "0.35s" });
        cam.at("5.35s").focus("reply_input", { scale: 1.08, duration: "0.4s" });
        cam.at("8.3s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("10.95s").focus("notifications_row_0", { scale: 1.08, duration: "0.35s" });
        cam.span("14.2s", "15.8s").trackCinematic("keyboard", {
          scale: 1.12,
          smoothing: 0.16,
        });
        cam.at("16.9s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
