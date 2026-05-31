import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "x-story-v2",
    title: "X Story V2",
    description:
      "A new X story where a founder's earnest thread becomes a public quote-post festival and the backchannel gets worse.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 110,
    tags: ["story", "x", "thread", "quote-post", "viral"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 960,
    apps: ["app_x"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T23:30:00").getTime();

    return episode("x-story-v2", { fps: 30, duration: "32s", title: "X Story V2" })
      .device("phone", "iphone16", {
        app: "app_x",
        os: {
          time: new Date("2026-04-10T23:32:00"),
          battery: 59,
          network: "5G",
        },
      })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          { id: "u_me", name: "Me", handle: "nadiaops", followers: 18200, following: 520, verified: "blue" },
          { id: "u_founder_story", name: "Founder", handle: "earnestfounder", followers: 84000, following: 122, verified: "gold" },
          { id: "u_banter_story", name: "Banter Thread", handle: "banterthread", followers: 47000, following: 310, verified: null },
        ],
        tweets: [
          { id: "tw_story_hook_v2", authorId: "u_founder_story", text: "If your team has work-life balance at launch, you probably do not want it badly enough.", createdAt: baseTs - 80000, viewCount: 121000, shareCount: 2600, bookmarkCount: 5100 },
        ],
        threads: [{ id: "dm_story_x_v2", participantIds: ["u_me", "u_founder_story", "u_banter_story"] }],
        messages: [{ id: "msg_story_x_1", threadId: "dm_story_x_v2", senderId: "u_founder_story", text: "Tell me honestly if this lands wrong.", createdAt: baseTs - 12000 }],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .x("phone", (x) => {
        x.at("1.2s").navigate("tweet", { tweetId: "tw_story_hook_v2" });
        x.at("3.0s").replyTweet({
          id: "tw_story_reply_v2",
          authorId: "u_me",
          replyToId: "tw_story_hook_v2",
          text: "This lands like a labor violation wearing a hoodie.",
          createdAt: baseTs + 12000,
          typed: true,
          charDelay: 2,
        });
        x.at("5.6s").addNotification({ id: "nt_story_x_1", type: "repost", actorId: "u_banter_story", tweetId: "tw_story_reply_v2" });
        x.at("6.6s").navigate("notifications");
        x.at("8.4s").navigate("messages");
        x.at("9.6s").navigate("thread", { threadId: "dm_story_x_v2" });
        x.at("10.8s").sendMessage({
          id: "msg_story_x_2",
          threadId: "dm_story_x_v2",
          senderId: "u_banter_story",
          text: "Too late. The quote posts are now unionizing.",
          createdAt: baseTs + 20000,
        });
        x.at("12.6s").sendMessage({
          id: "msg_story_x_3",
          threadId: "dm_story_x_v2",
          senderId: "u_me",
          text: "Delete the thread and pretend you were hacked by sincerity.",
          createdAt: baseTs + 26000,
          typed: true,
          charDelay: 2,
        });
      })
      .camera((cam) => {
        cam.at("1.3s").focus("tweet_card", { scale: 1.1, duration: "0.35s" });
        cam.span("3.0s", "5.2s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.18 });
        cam.at("6.7s").focus("notification_card", { scale: 1.08, duration: "0.35s" });
        cam.at("9.7s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
