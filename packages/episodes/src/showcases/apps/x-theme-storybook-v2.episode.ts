import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "x-theme-storybook-v2",
    title: "X Theme Storybook V2",
    description:
      "A brand-new Storybook-themed X showcase proving the softer theme pass across timeline, notifications, and DMs.",
    category: "showcase",
    catalogType: "app_showcase_theme",
    appId: "app_x",
    themeId: "storybook",
    visibility: "public",
    sortOrder: 220,
    tags: ["x", "theme", "storybook", "timeline", "soft"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 810,
    apps: ["app_x"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T19:40:00").getTime();

    return episode("x-theme-storybook-v2", {
      fps: 30,
      duration: "27s",
      title: "X Theme Storybook V2",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        os: {
          time: new Date("2026-04-10T19:42:00"),
          battery: 79,
          network: "wifi",
        },
      })
      .background({ type: "image", src: "/backgrounds/storybook-forest.png" })
      .snapshot("app_x", "phone", {
        currentUserId: "u_mira",
        users: [
          { id: "u_mira", name: "Mira", handle: "miraatelier", bio: "Quiet skies, film grain, and impossible leaves.", followers: 61200, following: 304, verified: "blue" },
          { id: "u_elm", name: "Elm", handle: "elmsketch", bio: "Storyboards between trains.", followers: 18400, following: 290, verified: null },
        ],
        follows: [{ followerId: "u_mira", followingId: "u_elm" }],
        tweets: [
          {
            id: "tw_storybook_v2_1",
            authorId: "u_mira",
            text: "A good dusk shot should feel like the air itself slowed down.",
            createdAt: baseTs - 90000,
            viewCount: 28400,
            shareCount: 340,
            bookmarkCount: 1900,
          },
        ],
        threads: [{ id: "dm_storybook_v2", participantIds: ["u_mira", "u_elm"] }],
        messages: [
          { id: "msg_storybook_v2_1", threadId: "dm_storybook_v2", senderId: "u_elm", text: "The hillside draft finally feels alive.", createdAt: baseTs - 20000 },
        ],
      })
      .x("phone", (x) => {
        x.at("0.8s").setThemeMode("storybook");
        x.at("1.2s").navigate("timeline");
        x.at("3.0s").navigate("tweet", { tweetId: "tw_storybook_v2_1" });
        x.at("5.0s").replyTweet({
          id: "tw_storybook_v2_reply",
          authorId: "u_elm",
          replyToId: "tw_storybook_v2_1",
          text: "Then don't rush it. Let the leaves keep their breathing room.",
          createdAt: baseTs + 12000,
          typed: true,
          charDelay: 2,
        });
        x.at("8.8s").addNotification({
          id: "nt_storybook_v2_1",
          type: "reply",
          actorId: "u_elm",
          tweetId: "tw_storybook_v2_1",
        });
        x.at("9.6s").navigate("notifications");
        x.at("12.0s").navigate("messages");
        x.at("13.0s").navigate("thread", { threadId: "dm_storybook_v2" });
        x.at("15.0s").sendMessage({
          id: "msg_storybook_v2_2",
          threadId: "dm_storybook_v2",
          senderId: "u_mira",
          text: "Good. Then the color script stays warm and the linework stays thin.",
          createdAt: baseTs + 25000,
          typed: true,
          charDelay: 2,
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.35s" });
        cam.at("3.1s").focus("tweet_card", { scale: 1.08, duration: "0.35s" });
        cam.span("5.0s", "8.0s").trackCinematic("keyboard", { scale: 1.1, smoothing: 0.18 });
        cam.at("9.7s").focus("notification_card", { scale: 1.08, duration: "0.35s" });
        cam.at("13.1s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
