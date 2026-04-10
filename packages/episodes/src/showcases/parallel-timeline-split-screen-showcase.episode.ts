import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { XTrackBuilder } from "@tokovo/apps-x";

export default defineEpisode({
  meta: {
    id: "parallel-timeline-split-screen-showcase",
    title: "Parallel Timeline (Split Screen) Showcase",
    description:
      "Two-device split-screen with deterministic camera targeting. Proves stable multi-device camera + recording + cross-app pacing.",
    category: "showcase",
    tags: [
      "multi-device",
      "split-screen",
      "camera",
      "recording",
      "whatsapp",
      "x",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 990,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("parallel-timeline-split-screen-showcase", {
      fps: 30,
      duration: "33s",
      title: "Parallel Timeline Split",
    })
      .device("phone_her", "iphone16", {
        app: "app_whatsapp",
        screenRecording: true,
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2025-02-10T22:10:00"),
          battery: 78,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone_her", {
        conversations: [
          {
            id: "dm_her",
            name: "Jay",
            avatar: "/avatars/avatar-ava.jpg",
            unreadCount: 2,
          },
        ],
      })
      .device("phone_him", "iphone16", {
        app: "app_x",
        screenRecording: true,
        installedApps: ["app_x"],
        os: {
          time: new Date("2025-02-10T22:10:00"),
          battery: 81,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .snapshot("app_x", "phone_him", {
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "me",
            followers: 5600,
            following: 320,
            verified: null,
          },
          {
            id: "u_target",
            name: "Target",
            handle: "target",
            followers: 88000,
            following: 210,
            verified: "blue",
          },
        ],
        tweets: [
          {
            id: "tw_del",
            authorId: "u_target",
            text: "Deleting this in 5 minutes.",
            createdAt: new Date("2025-02-10T22:09:58").getTime(),
            viewCount: 8200,
            shareCount: 88,
            bookmarkCount: 140,
          },
        ],
        currentUserId: "u_me",
      })
      .view("app_x", "phone_him", { screen: "timeline" })
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone_her", "dm_her", getOrder),
        (wa) => {
          wa.switchTo("dm_her", "0s");
          wa.at("1s").receive("Jay", "Don't post yet.");
          wa.at("2.4s").receive("Jay", "He’s deleting tweets.");
          wa.span("4.2s", "5.2s").typing("me");
          wa.at("5.3s").send("Too late. It's already screen recorded.");
          wa.at("7.2s").receive("Jay", "Then go to X. Now.");
        },
      )
      .track(
        "app_x",
        (getOrder) => new XTrackBuilder(30, "phone_him", getOrder),
        (x) => {
          x.at("0.8s").navigate("timeline");
          x.at("6.6s").navigate("tweet", { tweetId: "tw_del" });
          x.at("6.65s").viewTweet("tw_del");
          x.at("9.6s").repostTweet({ authorId: "u_me", repostOfId: "tw_del" });
        },
      )
      .deviceTrack("phone_her", (d) => {
        d.at("0s").screenRecording(true, { mode: "compact" });
      })
      .deviceTrack("phone_him", (d) => {
        d.at("0s").screenRecording(true, { mode: "compact" });
      })
      .camera((cam) => {
        cam.at("0s").layout({
          mode: "SPLIT_HORIZONTAL",
          primaryDeviceId: "phone_her",
          secondaryDeviceId: "phone_him",
        });

        // Focus left, then jump focus to right deterministically.
        cam.at("0.2s").focus({ deviceId: "phone_her", anchorId: "device" }, { scale: 1, duration: "0.35s" });
        cam.at("1.1s").focus({ deviceId: "phone_her", anchorId: "lastMessage" }, { scale: 1.12, duration: "0.45s" });
        cam.at("6.7s").focus({ deviceId: "phone_him", anchorId: "tweet_card" }, { scale: 1.12, duration: "0.5s" });
        cam.at("9.7s").focus({ deviceId: "phone_him", anchorId: "metrics_row" }, { scale: 1.08, duration: "0.45s" });
        cam.at("12.4s").focus({ deviceId: "phone_her", anchorId: "lastMessage" }, { scale: 1.1, duration: "0.5s" });
      })
      .build(),
});
