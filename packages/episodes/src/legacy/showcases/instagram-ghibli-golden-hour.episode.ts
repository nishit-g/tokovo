import { InstagramTrackBuilder } from "@tokovo/apps-instagram";
import { episode } from "@tokovo/dsl";
import { defineEpisode } from "@tokovo/episodes";

export default defineEpisode({
  meta: {
    id: "instagram-ghibli-golden-hour",
    title: "Instagram Ghibli Golden Hour",
    description:
      "Soft-story Instagram showcase using the Ghibli theme: golden-hour stories, profile polish, and calm creator DMs.",
    category: "showcase",
    tags: ["instagram", "ghibli", "stories", "profile", "showcase"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 600,
    apps: ["app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2025-06-11T17:10:00").getTime();

    return episode("instagram-ghibli-golden-hour", {
      fps: 30,
      duration: "20s",
      title: "Instagram Ghibli Golden Hour",
    })
      .device("phone", "iphone16", {
        app: "app_instagram",
        installedApps: ["app_instagram"],
        theme: "ghibli",
        os: {
          time: new Date("2025-06-11T17:12:00"),
          battery: 74,
          network: "5G",
        },
      })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_mira",
        users: [
          {
            id: "ig_mira",
            username: "mira.atelier",
            displayName: "Mira Atelier",
            bio: "Quiet sets, hand-painted light, and impossible sky colors.",
            avatarUrl: "/avatars/avatar-zoe.jpg",
            followers: 56200,
            following: 312,
            verified: true,
          },
          {
            id: "ig_elm",
            username: "elm.storyboard",
            displayName: "Elm Storyboard",
            bio: "Sketches between trains.",
            avatarUrl: "/avatars/avatar-priya.jpg",
            followers: 12100,
            following: 278,
          },
        ],
        follows: [{ followerId: "ig_mira", followingId: "ig_elm" }],
        posts: [
          {
            id: "ghibli_post_1",
            authorId: "ig_mira",
            imageUrl: "/placeholders/media.svg",
            caption: "Golden-hour test frames from the hill sequence.",
            createdAt: baseTs - 180000,
            location: "Shivagange",
            aspect: "portrait",
            likeCount: 4211,
          },
          {
            id: "ghibli_post_2",
            authorId: "ig_mira",
            imageUrl: "/placeholders/media.svg",
            caption: "Wind over the grass, finally behaving on camera.",
            createdAt: baseTs - 90000,
            aspect: "square",
            likeCount: 6120,
          },
        ],
        storySets: [
          {
            id: "ghibli_story_set",
            userId: "ig_mira",
            items: [
              {
                id: "ghibli_story_1",
                authorId: "ig_mira",
                mediaUrl: "/placeholders/media.svg",
                createdAt: baseTs - 30000,
              },
              {
                id: "ghibli_story_2",
                authorId: "ig_mira",
                mediaUrl: "/placeholders/media.svg",
                createdAt: baseTs - 12000,
              },
            ],
          },
        ],
        threads: [
          {
            id: "thread_elm",
            participantIds: ["ig_mira", "ig_elm"],
          },
        ],
        messages: [
          {
            id: "ghibli_msg_1",
            threadId: "thread_elm",
            senderId: "ig_elm",
            text: "The skies look hand-painted. Keep this color script forever.",
            createdAt: baseTs - 6000,
          },
        ],
      })
      .view("app_instagram", "phone", { screen: "home" })
      .track(
        "app_instagram",
        (getOrder) => new InstagramTrackBuilder(30, "phone", getOrder),
        (ig) => {
          ig.at("0.3s").setThemeMode("ghibli");
          ig.at("1.4s").openStory("ghibli_story_set", "ghibli_story_1");
          ig.at("3.8s").advanceStory("ghibli_story_set");
          ig.at("5.4s").navigate("thread", { threadId: "thread_elm" });
          ig.at("6.2s").addDMMessage({
            id: "ghibli_msg_2",
            threadId: "thread_elm",
            senderId: "ig_mira",
            text: "I kept the clouds soft on purpose. Needed the whole thing to breathe.",
            typed: true,
            charDelay: 2,
            createdAt: baseTs + 42000,
          });
          ig.at("9.4s").navigate("profile", { profileId: "ig_mira" });
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.3s" });
        cam.at("1.45s").focus("story_viewer", { scale: 1.04, duration: "0.35s" });
        cam.at("5.45s").focus("thread_header", { scale: 1.06, duration: "0.3s" });
        cam.span("6.2s", "7.6s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
        cam.at("9.5s").focus("profile_grid", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
