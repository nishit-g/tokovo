import { defineEpisode } from "@tokovo/episodes";
import { episode } from "@tokovo/dsl";
import { XTrackBuilder } from "@tokovo/apps-x";
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";

export default defineEpisode({
  meta: {
    id: "mega-x",
    title: "Mega X",
    description: "Full X flow: timeline, engagement, compose, notifications, DMs, profile",
    category: "production",
    tags: ["x", "mega"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 600,
    apps: ["app_x"],
  },
  build: () =>
    episode("mega-x", {
      fps: 30,
      duration: "20s",
      title: "Mega X",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        os: {
          time: new Date("2024-12-18T20:45:00"),
          battery: 76,
          network: "5G",
        },
      })
      .track(
        "app_x",
        (getOrder) => new XTrackBuilder(30, "phone", getOrder),
        (x) => {
          x.seed(
            {
              users: [
                {
                  id: "u1",
                  name: "Nova",
                  handle: "nova",
                  bio: "Designing signal, one feed at a time.",
                  followers: 12500,
                  following: 342,
                  verified: "blue",
                },
                {
                  id: "u2",
                  name: "Kai",
                  handle: "kai",
                  bio: "Product + systems",
                  followers: 8900,
                  following: 611,
                  verified: "gold",
                },
                {
                  id: "u3",
                  name: "Rin",
                  handle: "rin",
                  bio: "Cameras + storytelling",
                  followers: 4300,
                  following: 222,
                  verified: "grey",
                },
              ],
              follows: [
                { followerId: "u1", followingId: "u2" },
                { followerId: "u1", followingId: "u3" },
              ],
              currentUserId: "u1",
              tweets: [
                {
                  id: "tw-1",
                  authorId: "u2",
                  text: "What if timelines were 100% signal? #product",
                  hashtags: ["product"],
                  createdAt: new Date("2024-12-18T20:40:00").getTime(),
                  viewCount: 8240,
                  shareCount: 54,
                  bookmarkCount: 120,
                },
                {
                  id: "tw-2",
                  authorId: "u1",
                  text: "Checkpoint: X UI pipeline looks sharp in dark mode. @kai",
                  mentions: ["u2"],
                  createdAt: new Date("2024-12-18T20:41:00").getTime(),
                  linkPreview: {
                    url: "https://x.com/",
                    domain: "x.com",
                    title: "X · It’s what’s happening",
                    description: "See what’s happening in the world right now.",
                  },
                  viewCount: 2200,
                  shareCount: 12,
                  bookmarkCount: 40,
                },
                {
                  id: "tw-3",
                  authorId: "u3",
                  text: "Camera anchors feel cinematic when you zoom into the tweet card.",
                  media: { type: "image", aspect: "wide" },
                  viewCount: 1800,
                  shareCount: 18,
                  bookmarkCount: 35,
                },
                {
                  id: "tw-4",
                  authorId: "u2",
                  text: "Poll: Which feature matters most?",
                  poll: {
                    options: [
                      { label: "Fidelity", votes: 64 },
                      { label: "Speed", votes: 42 },
                      { label: "Consistency", votes: 30 },
                    ],
                    totalVotes: 136,
                  },
                  viewCount: 950,
                  shareCount: 6,
                  bookmarkCount: 11,
                },
              ],
              quotes: [
                {
                  id: "tw-5",
                  authorId: "u1",
                  quoteTweetId: "tw-1",
                  text: "Constraints give you signal. Quote for later.",
                  hashtags: ["signal"],
                  viewCount: 620,
                  shareCount: 9,
                  bookmarkCount: 22,
                },
              ],
            },
            "0s",
          );

          // Engagement
          x.at("3.4s").likeTweet("tw-1", "u1");
          x.at("3.6s").bookmarkTweet("tw-1", "u1");
          x.at("3.8s").shareTweet("tw-1", "u1");
          x.at("4.2s").replyTweet({
            id: "tw-6",
            authorId: "u1",
            replyToId: "tw-1",
            text: "Signal is built on constraints + focus.",
          });

          // Navigate to tweet detail
          x.at("5.2s").navigate("tweet", { tweetId: "tw-1" });

          // Compose
          x.at("7.1s").navigate("compose");
          x.at("7.2s").setComposeDraft("Drafting a post about clean feeds...");

          // Notifications
          x.at("8.2s").addNotification({
            id: "nt-1",
            type: "like",
            actorId: "u2",
            tweetId: "tw-2",
          });
          x.at("8.4s").addNotification({
            id: "nt-2",
            type: "mention",
            actorId: "u3",
            tweetId: "tw-2",
            isMention: true,
          });
          x.at("9s").navigate("notifications");
          x.at("9.4s").setNotificationsTab("mentions");

          // DMs
          x.at("10.4s").createThread(["u1", "u2"], "dm-1");
          x.at("10.8s").sendMessage({
            id: "msg-1",
            threadId: "dm-1",
            senderId: "u2",
            text: "Ship it? The UI is fire.",
          });
          x.at("11.2s").sendMessage({
            id: "msg-2",
            threadId: "dm-1",
            senderId: "u1",
            text: "Yep. Anchors + nav are locked.",
          });
          x.at("11.8s").navigate("messages");
          x.at("12.8s").navigate("thread", { threadId: "dm-1" });

          // Profile
          x.at("14.4s").navigate("profile", { userId: "u1" });

          // Back to timeline
          x.at("16.5s").navigate("timeline");
        },
      )
      .track(
        "device_keyboard",
        (getOrder) => new KeyboardTrackBuilder(30, "phone", getOrder),
        (keyboard) => {
          keyboard.show("7.15s", { returnKeyType: "send" });
          keyboard.type("Drafting a post about clean feeds...", "7.2s", {
            speed: "natural",
          });
          keyboard.hide("8.1s");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("timeline_header", { scale: 1.06, duration: "0.5s" });
        cam.at("2s").focus("tweet_card", { scale: 1.1, duration: "0.6s" });
        cam.at("5.2s").focus("metrics_row", { scale: 1.08, duration: "0.5s" });
        cam.at("7.2s").focus("compose_fab", { scale: 1.1, duration: "0.5s" });
        cam.at("9s").focus("notifications_list", { scale: 1.05, duration: "0.6s" });
        cam.at("12.8s").focus("dm_thread", { scale: 1.07, duration: "0.6s" });
        cam.at("14.4s").focus("profile_header", { scale: 1.06, duration: "0.6s" });
        cam.at("16.5s").focus("device", { scale: 1, duration: "0.6s" });
      })
      .build(),
});
