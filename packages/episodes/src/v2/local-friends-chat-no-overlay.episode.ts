import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-local-friends-chat-no-overlay",
    title: "V2 Local Creator Chat (No Overlay): WhatsApp → X → WhatsApp",
    description:
      "Local creator group chat across WhatsApp and X. No overlays. Uses device banner, auto keyboard typing, BGM, and camera direction.",
    category: "showcase",
    tags: ["v2", "creator", "chat", "whatsapp", "x", "no-overlay", "bgm", "keyboard", "camera"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1320, // 44s @ 30fps
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("v2-local-friends-chat-no-overlay", { fps: 30, duration: "44s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_x"],
        os: { time: new Date("2025-06-26T21:41:00"), battery: 54, network: "5G" },
      })
      .snapshot("app_x", "phone", {
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "localstudio",
            followers: 3800,
            following: 280,
            verified: null,
          },
          {
            id: "u_op",
            name: "Creator Desk",
            handle: "creatordesk",
            followers: 42000,
            following: 800,
            verified: "blue",
          },
          {
            id: "u_r1",
            name: "Mina",
            handle: "mina",
            followers: 11000,
            following: 900,
            verified: null,
          },
        ],
        tweets: [
          {
            id: "tw_op",
            authorId: "u_op",
            text: "The teaser tried to look casual, but the whole timeline noticed the edit.",
            viewCount: 220000,
            shareCount: 5200,
            bookmarkCount: 16000,
          },
        ],
        replies: [
          {
            id: "tw_r1",
            authorId: "u_r1",
            text: "When a casual post has three camera moves, it is not casual anymore.",
            replyToId: "tw_op",
            viewCount: 98000,
            shareCount: 1500,
            bookmarkCount: 5100,
          },
        ],
        currentUserId: "u_me",
      })
      .view("app_x", "phone", { screen: "timeline" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "grp_local",
            name: "Local Creator Room",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 99,
            type: "group",
            participants: ["Me", "Mina", "Omar", "Tess", "Jay"],
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })

      // ============================================
      // AUDIO (BGM from public/)
      // ============================================
      .audio((audio) => {
        audio.span("0s", "44s").bgm("/music/ambient-track.mp3", {
          volume: 0.22,
          fadeIn: "1.5s",
          fadeOut: "2.2s",
        });
      })

      // ============================================
      // DEVICE (heads-up bait + app switch)
      // ============================================
      .deviceTrack("phone", (d) => {
        // Heads-up X banner while we are still in WhatsApp (device-owned anchor: notification_banner)
        d.at("7.2s").notificationShow({
          id: "x_tag",
          appId: "app_x",
          title: "X",
          body: "Your teaser thread is live.",
          mode: "headsup",
          priority: "high",
        });

        d.at("10.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });

        d.at("26.0s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })

      // ============================================
      // WHATSAPP (creator group)
      // ============================================
      .whatsapp("phone", "grp_local", (wa) => {
        wa.switchTo("grp_local", "0s");

        wa.at("1.0s").receive("Mina", "The teaser landed. People noticed the camera move.");
        wa.at("2.2s").receive(
          "Omar",
          "Someone clipped the transition and called it over-produced.",
        );
        wa.at("3.4s").receive("Tess", "Own it. Make the reply feel like part of the plan.");

        wa.at("5.0s").send("It was a mood pass. The next clip will make it make sense.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("8.3s").receive("Jay", "The thread is already running with it.");
        wa.at("9.3s").receive("Mina", "Open X. Reply before the clip gets away from us.");
      })

      // ============================================
      // X (banter thread)
      // ============================================
      .x("phone", (x) => {
        x.at("10.4s").navigate("tweet", { tweetId: "tw_op" });
        x.at("11.6s").viewTweet("tw_op");

        // Quote reply (typed) with auto keyboard.
        x.at("14.2s").navigate("compose");
        x.at("18.0s").postTweet({
          authorId: "u_me",
          text: "The teaser was a setup. Watch the next cut before judging the first frame.",
          typed: true,
          charDelay: 2,
          viewCount: 1200,
          shareCount: 32,
          bookmarkCount: 88,
        });

        x.at("18.2s").navigate("timeline");
      })

      // ============================================
      // WHATSAPP (backfire punchline)
      // ============================================
      .whatsapp("phone", "grp_local", (wa) => {
        wa.at("27.4s").receive("Mina", "You replied. The second clip better be ready.");
        wa.at("29.0s").receive("Omar", "Comments are asking for the full sequence now.");
        wa.at("31.2s").receive("Tess", "Next episode: prove the setup was intentional.");

        wa.at("34.0s").send("Next cut goes up clean. No loose setup.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("38.6s").receive("Jay", "Good. Screenshots are forever.");
      })

      // ============================================
      // CAMERA (device-owned anchors + app semantics)
      // ============================================
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("1.0s", "7.0s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.2 });

        cam.at("7.25s").focus("notification_banner", { scale: 1.18, duration: "0.45s" });
        cam.at("8.2s").focus("lastMessage", { scale: 1.12, duration: "0.35s" });

        cam.at("10.45s").focus("tweet_card", { scale: 1.1, duration: "0.45s" });
        cam.span("14.4s", "18.2s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });

        cam.at("27.2s").focus("lastMessage", { scale: 1.12, duration: "0.35s" });
        cam.span("33.8s", "35.2s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
      })

      .build(),
});
