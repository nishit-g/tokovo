import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "x-exhaustive-v2",
    title: "X Exhaustive V2",
    description:
      "Dense X pass spanning timeline, tweet detail, notifications tabs, messages, profile, and compose with richer seeded state.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_x",
    visibility: "public",
    sortOrder: 210,
    tags: ["x", "exhaustive", "timeline", "thread", "notifications", "compose"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1440,
    apps: ["app_x"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T23:00:00").getTime();

    return episode("x-exhaustive-v2", {
      fps: 30,
      duration: "48s",
      title: "X Exhaustive V2",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        os: {
          time: new Date("2026-04-10T23:02:00"),
          battery: 66,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          { id: "u_me", name: "Ira", handle: "iracuts", bio: "Interfaces, cameras, and strategic overreactions.", followers: 24200, following: 601, verified: "blue" },
          { id: "u_hottake", name: "Hot Take Desk", handle: "hottakedesk", bio: "Every bad idea deserves an audience.", followers: 154000, following: 123, verified: "gold" },
          { id: "u_clip", name: "Clip Thread", handle: "clipthread", bio: "We clip the internet's worst confidence.", followers: 49100, following: 281, verified: null },
          { id: "u_vc2", name: "VC Notes", handle: "vcnotes", bio: "Reads decks so you don't have to.", followers: 38100, following: 402, verified: "grey" },
        ],
        follows: [
          { followerId: "u_me", followingId: "u_hottake" },
          { followerId: "u_me", followingId: "u_clip" },
          { followerId: "u_me", followingId: "u_vc2" },
        ],
        tweets: [
          {
            id: "tw_x_ex_1",
            authorId: "u_hottake",
            text: "Founders should be required to survive one comment section before raising a seed round.",
            createdAt: baseTs - 140000,
            viewCount: 143000,
            shareCount: 3100,
            bookmarkCount: 7200,
          },
          {
            id: "tw_x_ex_2",
            authorId: "u_clip",
            text: "This deck says 'AI-native taste layer' seven times and explains nothing once.",
            createdAt: baseTs - 80000,
            viewCount: 90100,
            shareCount: 1280,
            bookmarkCount: 4100,
            mentions: ["u_vc2"],
          },
        ],
        threads: [
          { id: "dm_x_ops_v2", participantIds: ["u_me", "u_clip", "u_vc2"] },
          { id: "dm_x_backchannel_v2", participantIds: ["u_me", "u_hottake"] },
        ],
        messages: [
          { id: "msg_x_seed_1", threadId: "dm_x_ops_v2", senderId: "u_clip", text: "Need a cleaner line before I post the screenshot.", createdAt: baseTs - 45000 },
          { id: "msg_x_seed_2", threadId: "dm_x_backchannel_v2", senderId: "u_hottake", text: "If you have context, now is the funniest possible time.", createdAt: baseTs - 30000 },
        ],
        notifications: [
          { id: "nt_x_seed_1", type: "reply", actorId: "u_clip", tweetId: "tw_x_ex_1", createdAt: baseTs - 36000 },
          { id: "nt_x_seed_2", type: "follow", actorId: "u_vc2", createdAt: baseTs - 24000 },
        ],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .x("phone", (x) => {
        x.at("1.4s").navigate("timeline");
        x.at("3.0s").navigate("tweet", { tweetId: "tw_x_ex_1" });
        x.at("5.4s").replyTweet({
          id: "tw_x_ex_reply_v2",
          authorId: "u_me",
          replyToId: "tw_x_ex_1",
          text: "Comment sections are where strategy decks go to become honest.",
          createdAt: baseTs + 15000,
          typed: true,
          charDelay: 2,
        });
        x.at("8.8s").navigate("notifications");
        x.at("9.8s").setNotificationsTab("mentions");
        x.at("11.2s").setNotificationsTab("all");
        x.at("13.0s").navigate("messages");
        x.at("14.2s").navigate("thread", { threadId: "dm_x_ops_v2" });
        x.at("15.8s").sendMessage({
          id: "msg_x_ops_v2_3",
          threadId: "dm_x_ops_v2",
          senderId: "u_me",
          text: "Post the screenshot only after we pin a better explanation.",
          createdAt: baseTs + 32000,
          typed: true,
          charDelay: 2,
        });
        x.at("19.6s").navigate("thread", { threadId: "dm_x_backchannel_v2" });
        x.at("21.0s").sendMessage({
          id: "msg_x_back_v2_2",
          threadId: "dm_x_backchannel_v2",
          senderId: "u_hottake",
          text: "Respect. Most people only arrive after the roast trendline is obvious.",
          createdAt: baseTs + 38000,
        });
        x.at("24.0s").navigate("profile", { userId: "u_me" });
        x.at("27.2s").navigate("compose");
        x.at("28.0s").setComposeDraft("If your launch depends on nobody zooming into the screenshot, it depends on fiction.");
        x.at("30.4s").postTweet({
          id: "tw_x_ex_compose_v2",
          authorId: "u_me",
          text: "If your launch depends on nobody zooming into the screenshot, it depends on fiction.",
          createdAt: baseTs + 51000,
          typed: true,
          charDelay: 2,
        });
        x.at("34.0s").navigate("tweet", { tweetId: "tw_x_ex_compose_v2" });
      })
      .camera((cam) => {
        cam.at("0s").focus("timeline", { scale: 1.03, duration: "0.35s" });
        cam.at("3.1s").focus("tweet_card", { scale: 1.1, duration: "0.35s" });
        cam.span("5.4s", "8.2s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.18 });
        cam.at("9.0s").focus("notification_card", { scale: 1.08, duration: "0.35s" });
        cam.at("14.3s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("24.1s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
        cam.span("28.0s", "30.4s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.18 });
      })
      .build();
  },
});
