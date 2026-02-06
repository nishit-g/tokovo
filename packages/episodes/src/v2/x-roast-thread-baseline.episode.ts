import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/creator";

export default defineEpisode({
  meta: {
    id: "v2-x-roast-thread-baseline",
    title: "V2 Baseline: X Roast Thread",
    description:
      "Baseline episode for post → replies → quote roast pacing. Uses typed compose, deterministic camera focus, and a clean narrative beat structure without extra boilerplate.",
    category: "showcase",
    tags: ["v2", "x", "roast", "thread", "compose", "keyboard", "camera"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1050,
    apps: ["app_x"],
  },
  build: () =>
    episode("v2-x-roast-thread-baseline", { fps: 30, duration: "35s" })
      .device("phone", "iphone16", {
        app: "app_x",
        installedApps: ["app_x"],
        os: { time: new Date("2025-06-26T12:04:00"), battery: 76, network: "5G" },
      })
      .background({ type: "image", src: "/backgrounds/ambient-night.png" })
      .x("phone", (x) => {
        x.seed({
          users: [
            { id: "u_me", name: "Me", handle: "me", followers: 3400, following: 240, verified: null },
            { id: "u_op", name: "OP", handle: "op", followers: 98000, following: 600, verified: "blue" },
            { id: "u_1", name: "Rhea", handle: "rhea", followers: 12000, following: 980, verified: null },
            { id: "u_2", name: "Omar", handle: "omar", followers: 8800, following: 420, verified: null },
          ],
          tweets: [
            {
              id: "tw_op",
              authorId: "u_op",
              text: "I never lie. I just remix the truth.",
              viewCount: 214000,
              shareCount: 4100,
              bookmarkCount: 18000,
            },
          ],
          replies: [
            {
              id: "tw_r1",
              authorId: "u_1",
              text: "DJ Cap back on the decks.",
              replyToId: "tw_op",
              viewCount: 82000,
              shareCount: 1100,
              bookmarkCount: 3600,
            },
            {
              id: "tw_r2",
              authorId: "u_2",
              text: "Remix is crazy. That's just lying with reverb.",
              replyToId: "tw_op",
              viewCount: 76000,
              shareCount: 900,
              bookmarkCount: 3100,
            },
          ],
          currentUserId: "u_me",
          screen: "timeline",
        });

        x.at("4.0s").navigate("tweet", { tweetId: "tw_op" });

        // Creator enters compose and types a quote roast. (typed → keyboard events + draft sync)
        x.at("10.0s").navigate("compose");
        x.at("14.0s").postTweet({
          authorId: "u_me",
          text: "He said 'remix' like honesty is a playlist.",
          typed: true,
          charDelay: 2,
          viewCount: 1200,
          shareCount: 24,
          bookmarkCount: 80,
        });
        x.at("14.2s").navigate("timeline");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("4.05s").focus("tweet_card", { scale: 1.1, duration: "0.45s" });
        cam.span("4.1s", "9.2s").trackCinematic("metrics_row", { scale: 1.18, smoothing: 0.2 });
        cam.at("10.05s").focus("device", { scale: 1.04, duration: "0.35s" });
        cam.span("10.2s", "14.2s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
        cam.at("14.3s").focus("tweet_card", { scale: 1.08, duration: "0.45s" });
      })
      .build(),
});
