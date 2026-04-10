import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { XTrackBuilder } from "@tokovo/apps-x";

export default defineEpisode({
  meta: {
    id: "lockscreen-bait-unlock-switch-showcase",
    title: "Lockscreen Bait → Unlock → Switch Apps (Showcase)",
    description:
      "Device realism showcase: lockscreen notification bait, FaceID+swipe unlock, recording indicator, keyboard, and manual app switch transitions.",
    category: "showcase",
    tags: [
      "device",
      "lockscreen",
      "unlock",
      "recording",
      "keyboard",
      "transition",
      "whatsapp",
      "x",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1050,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("lockscreen-bait-unlock-switch-showcase", {
      fps: 30,
      duration: "35s",
      title: "Lockscreen → Unlock → Switch",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        locked: true,
        screenRecording: true,
        installedApps: ["app_whatsapp", "app_x", "app_camera"],
        os: {
          time: new Date("2025-02-10T21:08:00"),
          battery: 62,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_bait",
            name: "Mina",
            avatar: "/avatars/avatar-maya.jpg",
            unreadCount: 1,
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .snapshot("app_x", "phone", {
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "me",
            followers: 2200,
            following: 180,
            verified: null,
          },
          {
            id: "u_him",
            name: "Him",
            handle: "him",
            followers: 19000,
            following: 400,
            verified: "blue",
          },
        ],
        tweets: [
          {
            id: "tw_1",
            authorId: "u_him",
            text: "Receipts drop tonight.",
            createdAt: new Date("2025-02-10T21:07:40").getTime(),
            viewCount: 32600,
            shareCount: 330,
            bookmarkCount: 910,
          },
        ],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_bait", getOrder),
        (wa) => {
          wa.switchTo("dm_bait", "0s");
          wa.at("5s").receive("Mina", "You were right.");
          wa.at("6.2s").receive("Mina", "He posted it publicly.");
          wa.span("7.2s", "8.2s").typing("me");
          wa.at("8.3s").send("Send link. Now.");
          wa.at("9.4s").receive("Mina", "opening X...");
        },
      )
      .track(
        "app_x",
        (getOrder) => new XTrackBuilder(30, "phone", getOrder),
        (x) => {
          x.at("14.2s").navigate("timeline");
          x.at("16.0s").likeTweet("tw_1", "u_me");
          x.at("17.0s").navigate("tweet", { tweetId: "tw_1" });
          x.at("17.05s").viewTweet("tw_1");
        },
      )
      .deviceTrack("phone", (d) => {
        // Lockscreen bait
        d.at("0.8s").notificationShow({
          id: "bait-1",
          appId: "app_whatsapp",
          title: "Mina",
          body: "You were right.",
          mode: "lockscreen",
          priority: "high",
        });

        // Deterministic unlock
        d.at("3.2s").unlock();

        // Keyboard tension
        d.at("7.1s").keyboardShow({ returnKeyType: "send" });
        d.at("7.2s").keyboardType("Send link. Now.", { speed: "natural" });
        d.at("8.35s").keyboardHide();

        // Manual switch to X with transition + default SFX
        d.at("13.8s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.4s" });
        cam.at("0.9s").animate({ scale: 1.08, duration: "0.35s", easing: "easeOut" });
        cam.at("3.4s").focus("device", { scale: 1.06, duration: "0.45s" });
        cam.span("5s", "10.2s").trackCinematic("lastMessage", { scale: 1.14, smoothing: 0.18 });
        cam.at("13.9s").focus("timeline_header", { scale: 1.08, duration: "0.45s" });
        cam.span("14.2s", "18.2s").trackCinematic("tweet_card", { scale: 1.12, smoothing: 0.16 });
      })
      .build(),
});
