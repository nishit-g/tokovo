import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { XTrackBuilder } from "@tokovo/apps-x";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";
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
    id: "whatsapp-to-x-viral",
    title: "WhatsApp to X - Viral Drama Cut",
    description:
      "High-velocity WhatsApp to X crossover with rapid beats, tighter camera, and sharp notification interruptions.",
    category: "production",
    tags: ["whatsapp", "x", "viral", "drama", "camera", "fast-cut"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 720,
    apps: ["app_whatsapp", "app_x", "notifications"],
  },
  build: () =>
    episode("whatsapp-to-x-viral", {
      fps: 30,
      duration: "24s",
      title: "WhatsApp to X - Viral Drama",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_alert",
            name: "Maya",
            avatar: "/avatars/avatar-maya.jpg",
            unreadCount: 4,
          },
        ],
        os: {
          time: new Date("2025-02-10T21:08:00"),
          battery: 64,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_alert", getOrder),
        (wa) => {
          wa.at("0.8s").receive("Maya", "BRO check X NOW");
          wa.at("1.6s").receive("Maya", "your clip is blowing up");
          wa.at("2.3s").receive("Maya", "30k views in minutes");
          wa.span("3.1s", "3.9s").typing("me");
          wa.at("4s").send("Switching. Posting follow-up.");
          wa.at("4.9s").receive("Maya", "PIN IT FAST ⚡");
        },
      )
      .track(
        "notifications",
        (getOrder) => new NotificationTrackBuilder(30, "phone", getOrder),
        (notif) => {
          notif.at("2.8s").show({
            id: "x-mention-1",
            appId: "X",
            title: "New mention spike",
            body: "+124 mentions in 60s",
            mode: "headsup",
          });
          notif.at("3.7s").dismiss("x-mention-1");
          notif.at("12.2s").show({
            id: "x-repost-1",
            appId: "X",
            title: "Repost wave",
            body: "Top creator reposted your thread",
            mode: "headsup",
          });
          notif.at("13s").dismiss("x-repost-1");
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
                  bio: "Building narrative engines.",
                  followers: 25600,
                  following: 530,
                  verified: "blue",
                },
                {
                  id: "u_maya",
                  name: "Maya",
                  handle: "maya_ops",
                  bio: "Growth and distribution",
                  followers: 11800,
                  following: 640,
                  verified: "gold",
                },
                {
                  id: "u_zen",
                  name: "Zen",
                  handle: "zenclips",
                  bio: "Edits and viral cuts",
                  followers: 54000,
                  following: 420,
                  verified: "blue",
                },
              ],
              follows: [
                { followerId: "u_me", followingId: "u_maya" },
                { followerId: "u_me", followingId: "u_zen" },
              ],
              currentUserId: "u_me",
              tweets: [
                {
                  id: "tw_hot_1",
                  authorId: "u_zen",
                  text: "This UI camera pacing is CRAZY good. Who made this?",
                  createdAt: new Date("2025-02-10T21:05:10").getTime(),
                  hashtags: ["viral", "ui"],
                  mentions: ["u_me"],
                  viewCount: 32600,
                  shareCount: 330,
                  bookmarkCount: 910,
                },
                {
                  id: "tw_hot_2",
                  authorId: "u_me",
                  text: "Part 2 dropping now. Anchor-driven cuts only.",
                  createdAt: new Date("2025-02-10T21:06:00").getTime(),
                  hashtags: ["buildinpublic"],
                  mentions: [],
                  viewCount: 16200,
                  shareCount: 180,
                  bookmarkCount: 402,
                },
              ],
              notifications: [
                {
                  id: "nt_hot_1",
                  type: "mention",
                  actorId: "u_zen",
                  tweetId: "tw_hot_1",
                  isMention: true,
                  createdAt: new Date("2025-02-10T21:06:40").getTime(),
                },
              ],
              screen: "timeline",
              notificationsTab: "all",
              composeDraft: "",
            },
            "0s",
          );

          x.at("6.4s").navigate("timeline");
          x.at("7s").setComposeDraft("Part 2 live. Timeline + breakdown below.");
          x.at("7.4s").postTweet({
            id: "tw_live_viral",
            authorId: "u_me",
            text: "Part 2 live. Timeline + breakdown below. Watch till the final cut 👇",
            hashtags: ["viral", "camera"],
            mentions: [],
            createdAt: new Date("2025-02-10T21:08:20").getTime(),
            viewCount: 0,
            shareCount: 0,
            bookmarkCount: 0,
          });
          x.at("8.2s").likeTweet("tw_hot_1", "u_me");
          x.at("8.5s").bookmarkTweet("tw_hot_1", "u_me");
          x.at("9.1s").navigate("tweet", { tweetId: "tw_live_viral" });
          x.at("10.2s").replyTweet({
            id: "tw_reply_viral",
            authorId: "u_me",
            replyToId: "tw_live_viral",
            text: "Drop your favorite timestamp.",
          });
          x.at("11.6s").navigate("notifications");
          x.at("13.4s").navigate("messages");
          x.at("13.9s").createThread(["u_me", "u_maya"], "dm_viral_ops");
          x.at("14.4s").sendMessage({
            id: "msg_viral_1",
            threadId: "dm_viral_ops",
            senderId: "u_maya",
            text: "Traffic is peaking. Pin now.",
          });
          x.at("15s").sendMessage({
            id: "msg_viral_2",
            threadId: "dm_viral_ops",
            senderId: "u_me",
            text: "Pinned. Queueing next cut.",
          });
          x.at("15.5s").navigate("thread", { threadId: "dm_viral_ops" });
          x.at("17.2s").navigate("profile", { userId: "u_me" });
          x.at("18.5s").navigate("timeline");
        },
      )
      .track(
        "device",
        (getOrder) => new InlineDeviceTrackBuilder(30, "phone", getOrder),
        (device: InlineDeviceTrackBuilder) => {
          device.at("6s").openApp("app_x");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.35s" });
        cam.span("0.8s", "5.8s").trackCinematic("lastMessage", { scale: 1.15, smoothing: 0.16 });
        cam.span("3.1s", "3.9s").trackCinematic("typingIndicator", { scale: 1.1, smoothing: 0.18 });
        cam.at("2.8s").focus("headsUpNotification", { scale: 1.24, duration: "0.22s" });
        cam.at("3.75s").focus("lastMessage", { scale: 1.15, duration: "0.26s" });
        cam.at("6.1s").focus("timeline_header", { scale: 1.1, duration: "0.3s" });
        cam.span("6.4s", "11.4s").trackCinematic("tweet_card", { scale: 1.13, smoothing: 0.14 });
        cam.at("12.2s").focus("headsUpNotification", { scale: 1.22, duration: "0.2s" });
        cam.at("13s").focus("notifications_list", { scale: 1.1, duration: "0.3s" });
        cam.at("13.4s").focus("dm_thread", { scale: 1.1, duration: "0.32s" });
        cam.at("17.2s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
        cam.at("18.5s").focus("timeline_feed", { scale: 1.07, duration: "0.3s" });
      })
      .build(),
});
