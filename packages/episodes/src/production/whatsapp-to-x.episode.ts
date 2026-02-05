import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { XTrackBuilder } from "@tokovo/apps-x";
import type { TrackEvent } from "@tokovo/ir";

class InlineDeviceTrackBuilder {
  _events: TrackEvent[] = [];
  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: () => number,
  ) {}
  at(time: string | number) {
    const frame =
      typeof time === "number"
        ? Math.round(time)
        : time.trim().endsWith("ms")
          ? Math.round((parseFloat(time) / 1000) * this._fps)
          : time.trim().endsWith("s")
            ? Math.round(parseFloat(time) * this._fps)
            : Math.round(parseFloat(time));
    return {
      openApp: (appId: string) => {
        this._events.push({
          kind: "DEVICE",
          type: "OPEN_APP",
          deviceId: this._deviceId,
          payload: { appId },
          at: frame,
          _declarationOrder: this._getOrder(),
        } as unknown as TrackEvent);
      },
    };
  }
  span(start: string | number, _end: string | number) {
    return this.at(start);
  }
}

export default defineEpisode({
  meta: {
    id: "whatsapp-to-x",
    title: "WhatsApp to X Crossover",
    description:
      "Starts in WhatsApp, then transitions to X with pre-seeded state and smooth camera handoff.",
    category: "production",
    tags: ["whatsapp", "x", "transition", "camera", "crossover"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 810,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("whatsapp-to-x", {
      fps: 30,
      duration: "27s",
      title: "WhatsApp to X Crossover",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_launch",
            name: "Ava",
            avatar: "/avatars/avatar-ava.jpg",
            unreadCount: 2,
          },
        ],
        os: {
          time: new Date("2025-02-08T20:15:00"),
          battery: 71,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_launch", getOrder),
        (wa) => {
          wa.at("1s").receive("Ava", "Campaign thread is exploding 🔥");
          wa.at("2.3s").receive("Ava", "Can you jump to X and post the recap?");
          wa.span("3.6s", "4.8s").typing("me");
          wa.at("5s").send("On it. Switching now.");
          wa.at("6.4s").receive("Ava", "Pin the timeline post once live.");
        },
      )
      .track(
        "app_x",
        (getOrder) => new XTrackBuilder(30, "phone", getOrder),
        (x) => {
          x.seed(
            {
              users: [
                {
                  id: "u_me",
                  name: "Nishit",
                  handle: "nishit",
                  bio: "Building episodic engines.",
                  followers: 18240,
                  following: 510,
                  verified: "blue",
                },
                {
                  id: "u_ava",
                  name: "Ava",
                  handle: "ava_ops",
                  bio: "Launch ops + distribution",
                  followers: 9400,
                  following: 780,
                  verified: "gold",
                },
                {
                  id: "u_rin",
                  name: "Rin",
                  handle: "rin_camera",
                  bio: "Cinematic UI systems",
                  followers: 6100,
                  following: 390,
                  verified: "grey",
                },
              ],
              follows: [
                { followerId: "u_me", followingId: "u_ava" },
                { followerId: "u_me", followingId: "u_rin" },
              ],
              currentUserId: "u_me",
              tweets: [
                {
                  id: "tw_pre_1",
                  authorId: "u_ava",
                  text: "Launch thread in 10. Drop your final assets now.",
                  createdAt: new Date("2025-02-08T20:09:00").getTime(),
                  hashtags: ["launch"],
                  mentions: [],
                  viewCount: 6400,
                  shareCount: 71,
                  bookmarkCount: 124,
                },
                {
                  id: "tw_pre_2",
                  authorId: "u_rin",
                  text: "Anchor-first camera makes UI stories watchable.",
                  createdAt: new Date("2025-02-08T20:10:00").getTime(),
                  hashtags: ["camera", "ui"],
                  mentions: [],
                  viewCount: 3700,
                  shareCount: 33,
                  bookmarkCount: 61,
                },
              ],
              notifications: [
                {
                  id: "nt_pre_1",
                  type: "mention",
                  actorId: "u_ava",
                  tweetId: "tw_pre_1",
                  isMention: true,
                  createdAt: new Date("2025-02-08T20:11:00").getTime(),
                },
              ],
              screen: "timeline",
              notificationsTab: "mentions",
              composeDraft: "",
            },
            "0s",
          );

          x.at("11.2s").navigate("timeline");
          x.at("12.1s").setComposeDraft(
            "Launch recap is live: key moments, outcomes, and next steps.",
          );
          x.at("12.8s").postTweet({
            id: "tw_live_1",
            authorId: "u_me",
            text: "Launch recap is live: key moments, outcomes, and next steps. Thread below 👇",
            hashtags: ["launch", "buildinpublic"],
            mentions: [],
            createdAt: new Date("2025-02-08T20:15:30").getTime(),
            viewCount: 0,
            shareCount: 0,
            bookmarkCount: 0,
          });
          x.at("14.2s").likeTweet("tw_pre_1", "u_me");
          x.at("14.6s").bookmarkTweet("tw_pre_1", "u_me");
          x.at("15.2s").navigate("tweet", { tweetId: "tw_live_1" });
          x.at("16.8s").addNotification({
            id: "nt_live_2",
            type: "repost",
            actorId: "u_ava",
            tweetId: "tw_live_1",
          });
          x.at("17.6s").navigate("notifications");
          x.at("18.1s").setNotificationsTab("all");
          x.at("19.6s").navigate("messages");
          x.at("20.1s").createThread(["u_me", "u_ava"], "dm_launch_x");
          x.at("20.6s").sendMessage({
            id: "msg_x_1",
            threadId: "dm_launch_x",
            senderId: "u_ava",
            text: "Post is clean. Pinning now.",
          });
          x.at("21.2s").sendMessage({
            id: "msg_x_2",
            threadId: "dm_launch_x",
            senderId: "u_me",
            text: "Perfect. Monitoring mentions.",
          });
          x.at("21.8s").navigate("thread", { threadId: "dm_launch_x" });
          x.at("23.4s").navigate("profile", { userId: "u_me" });
          x.at("24.8s").navigate("timeline");
        },
      )
      .track(
        "device",
        (getOrder) => new InlineDeviceTrackBuilder(30, "phone", getOrder),
        (device: InlineDeviceTrackBuilder) => {
          device.at("10.8s").openApp("app_x");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.5s" });
        cam.span("1s", "10.6s").track("lastMessage", { scale: 1.12, lag: 0.2 });
        cam.span("3.6s", "4.8s").track("typingIndicator", { scale: 1.08, lag: 0.24 });
        cam.at("10.9s").focus("timeline_header", { scale: 1.08, duration: "0.5s" });
        cam.span("11.2s", "15.8s").track("tweet_card", { scale: 1.1, lag: 0.18 });
        cam.at("17.6s").focus("notifications_list", { scale: 1.07, duration: "0.45s" });
        cam.at("19.6s").focus("dm_thread", { scale: 1.08, duration: "0.5s" });
        cam.at("23.4s").focus("profile_header", { scale: 1.06, duration: "0.5s" });
        cam.at("24.8s").focus("timeline_feed", { scale: 1.05, duration: "0.45s" });
      })
      .build(),
});
