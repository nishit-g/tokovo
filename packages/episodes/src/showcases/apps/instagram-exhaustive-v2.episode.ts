import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "instagram-exhaustive-v2",
    title: "Instagram Exhaustive V2",
    description:
      "Dense Instagram proof with feed scrolling, comments storm, story viewer, inbox, DM thread, notifications, profile, and composer publish.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_instagram",
    visibility: "public",
    sortOrder: 410,
    tags: ["instagram", "exhaustive", "comments", "stories", "dm", "composer"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1440,
    apps: ["app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T19:10:00Z").getTime();

    return episode("instagram-exhaustive-v2", {
      fps: 30,
      duration: "48s",
      title: "Instagram Exhaustive V2",
    })
      .device("phone", "iphone16", {
        app: "app_instagram",
        installedApps: ["app_instagram"],
        os: {
          time: new Date("2026-04-10T19:12:00Z"),
          battery: 57,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_arya",
        users: [
          {
            id: "ig_arya",
            username: "arya.cuts",
            displayName: "Arya Cuts",
            bio: "BTS edits and accidental oversharing.",
            avatarUrl: "/avatars/avatar-alex.jpg",
            followers: 189200,
            following: 511,
            verified: true,
          },
          {
            id: "ig_sam",
            username: "sam.frames",
            displayName: "Sam Frames",
            avatarUrl: "/avatars/avatar-priya.jpg",
            followers: 34200,
            following: 415,
          },
          {
            id: "ig_kai",
            username: "kai.notes",
            displayName: "Kai Notes",
            avatarUrl: "/avatars/avatar-ava.jpg",
            followers: 12000,
            following: 280,
          },
        ],
        follows: [{ followerId: "ig_arya", followingId: "ig_sam" }],
        posts: [
          {
            id: "ig_ex_1",
            authorId: "ig_sam",
            imageUrl: "/media/office-meme.png",
            caption: "The frame everyone saved and nobody understood.",
            createdAt: baseTs - 190000,
            likeCount: 12400,
            commentCount: 360,
            aspect: "portrait",
          },
          {
            id: "ig_ex_2",
            authorId: "ig_arya",
            imageUrl: "/media/office-meme.png",
            caption: "How reels are made when your editor is powered by caffeine and regret.",
            createdAt: baseTs - 140000,
            likeCount: 24100,
            commentCount: 840,
            aspect: "portrait",
          },
          {
            id: "ig_ex_3",
            authorId: "ig_kai",
            imageUrl: "/media/office-meme.png",
            caption: "Soft launch, sharp comments.",
            createdAt: baseTs - 100000,
            likeCount: 9300,
            commentCount: 110,
            aspect: "square",
          },
        ],
        storySets: [
          {
            id: "ig_ex_storyset_1",
            userId: "ig_sam",
            items: [
              {
                id: "ig_ex_story_1",
                authorId: "ig_sam",
                mediaUrl: "/media/office-meme.png",
                createdAt: baseTs - 80000,
              },
              {
                id: "ig_ex_story_2",
                authorId: "ig_sam",
                mediaUrl: "/media/office-meme.png",
                createdAt: baseTs - 76000,
              },
            ],
          },
        ],
        threads: [
          {
            id: "ig_ex_thread_1",
            participantIds: ["ig_arya", "ig_sam"],
            title: "Sam Frames",
            unreadCount: 1,
            pinned: true,
          },
        ],
        messages: [
          {
            id: "ig_ex_msg_1",
            threadId: "ig_ex_thread_1",
            senderId: "ig_sam",
            text: "Your comment section is now doing free script coverage.",
            createdAt: baseTs - 18000,
          },
        ],
      })
      .instagram("phone", (ig) => {
        ig.at("1.0s").navigate("home", { postId: "ig_ex_1" });
        ig.at("2.4s").navigate("home", { postId: "ig_ex_2" });
        ig.at("3.2s").commentOnPost({
          id: "ig_ex_comment_1",
          postId: "ig_ex_2",
          authorId: "ig_sam",
          text: "This caption sounds like the edit itself wrote it.",
          createdAt: baseTs + 8000,
        });
        ig.at("4.2s").commentOnPost({
          id: "ig_ex_comment_2",
          postId: "ig_ex_2",
          authorId: "ig_kai",
          text: "You made 'workflow' sound like a crime scene.",
          createdAt: baseTs + 12000,
        });
        ig.at("5.2s").commentOnPost({
          id: "ig_ex_comment_3",
          postId: "ig_ex_2",
          authorId: "ig_arya",
          text: "Both of you are staying because the comments are outperforming the reel.",
          createdAt: baseTs + 16000,
        });
        ig.at("7.6s").openStory("ig_ex_storyset_1", "ig_ex_story_1");
        ig.at("9.2s").advanceStory("ig_ex_storyset_1");
        ig.at("10.4s").navigate("inbox");
        ig.at("11.6s").navigate("thread", { threadId: "ig_ex_thread_1" });
        ig.at("12.6s").addDMMessage({
          id: "ig_ex_msg_2",
          threadId: "ig_ex_thread_1",
          senderId: "ig_arya",
          text: "Fine. Banter me in DMs instead of under the post.",
          createdAt: baseTs + 22000,
        });
        ig.at("15.8s").navigate("notifications");
        ig.at("16.2s").notify({
          id: "ig_ex_nt_1",
          type: "comment",
          actorId: "ig_sam",
          postId: "ig_ex_2",
          title: "Sam Frames",
          body: "This caption sounds like the edit itself wrote it.",
          createdAt: baseTs + 26000,
        });
        ig.at("18.8s").navigate("profile", { profileId: "ig_arya" });
        ig.at("21.8s").navigate("composer");
        ig.at("22.4s").setComposerDraft({
          caption: "Okay, calmer caption. Less caffeine confession. Same cut.",
          imageUrl: "/media/office-meme.png",
          location: "Mumbai",
        });
        ig.at("24.8s").addPost({
          id: "ig_ex_4",
          authorId: "ig_arya",
          imageUrl: "/media/office-meme.png",
          caption: "Okay, calmer caption. Less caffeine confession. Same cut.",
          createdAt: baseTs + 38000,
          location: "Mumbai",
          aspect: "portrait",
        });
      })
      .build();
  },
});
