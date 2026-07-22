import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-creator-friends-chat-no-overlay",
    title: "V2 Creator Group Chat (No Overlay): WhatsApp → X → WhatsApp",
    description:
      "Creator room episode with WhatsApp group chat, X thread escalation, notification banner, camera direction, and no overlays.",
    category: "showcase",
    tags: ["v2", "creator", "chat", "whatsapp", "x", "no-overlay", "bgm", "keyboard", "camera"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1200, // 40s @ 30fps
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("v2-creator-friends-chat-no-overlay", {
      fps: 30,
      duration: "40s",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_x"],
        os: {
          time: new Date("2025-07-12T19:21:00Z"),
          battery: 62,
          network: "5G",
        },
      })
      .snapshot("app_x", "phone", {
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "mainCharacter",
            followers: 5100,
            following: 260,
            verified: null,
          },
          {
            id: "u_op",
            name: "Studio Watch",
            handle: "studiowatch",
            followers: 78000,
            following: 900,
            verified: "blue",
          },
          {
            id: "u_r1",
            name: "Launch Desk",
            handle: "launchdesk",
            followers: 12400,
            following: 780,
            verified: null,
          },
        ],
        tweets: [
          {
            id: "tw_op",
            authorId: "u_op",
            text: "The studio said 'minor timing adjustment' and somehow turned it into a whole launch-day cliffhanger.",
            viewCount: 310000,
            shareCount: 6200,
            bookmarkCount: 21000,
          },
        ],
        replies: [
          {
            id: "tw_r1",
            authorId: "u_r1",
            text: "Every delay becomes episode structure when the receipts are already public.",
            replyToId: "tw_op",
            viewCount: 132000,
            shareCount: 2100,
            bookmarkCount: 7200,
          },
        ],
        currentUserId: "u_me",
      })
      .view("app_x", "phone", { screen: "timeline" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "grp_creator_room",
            name: "Creator Room (Verified)",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 37,
            type: "group",
            members: [
              { id: "me", name: "You" },
              { id: "mina", name: "Mina" },
              { id: "omar", name: "Omar" },
              { id: "tess", name: "Tess" },
              { id: "jay", name: "Jay" },
            ],
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })

      // ============================================
      // AUDIO (BGM)
      // ============================================
      .audio((audio) => {
        audio.span("0s", "40s").bgm("/music/ambient-track.mp3", {
          volume: 0.18,
          fadeIn: "2s",
          fadeOut: "2s",
        });
      })

      // ============================================
      // DEVICE (banner bait + app switches)
      // ============================================
      .deviceTrack("phone", (d) => {
        d.at("9.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "platform-default" },
        });

        d.at("22.0s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "platform-default" },
        });
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("6.6s").deliver({
          id: "x_banter",
          appId: "app_x",
          content: { title: "X", body: "Your launch reply is moving fast." },
          category: "social",
          interruption: "timeSensitive",
          privacy: "public",
          threadId: "launch-reply",
        });
      })

      // ============================================
      // WHATSAPP (group chat)
      // ============================================
      .whatsapp("phone", "grp_creator_room", (wa) => {
        wa.switchTo("grp_creator_room", "0s");

        wa.at("1.0s").receive("Mina", "The schedule slipped again. Who is answering the thread?");
        wa.at("2.2s").receive("Omar", "Someone already clipped the delay into a launch-day meme.");
        wa.at("3.4s").receive("Tess", "If we reply, it has to sound intentional.");

        wa.at("4.8s").send("Call it pacing. The reveal needed tension.", {});

        wa.at("7.2s").receive("Jay", "Pacing? The quote post is already the headline.");
        wa.at("8.2s").receive("Mina", "Open X. The reply window is still open.");
      })

      // ============================================
      // X (banter thread)
      // ============================================
      .x("phone", (x) => {
        x.at("9.4s").navigate("tweet", { tweetId: "tw_op" });
        x.at("10.6s").viewTweet("tw_op");

        x.at("12.4s").navigate("compose");
        x.at("16.2s").postTweet({
          authorId: "u_me",
          text: "Launch-day timing was deliberate. The episode needed a second act.",
          viewCount: 2400,
          shareCount: 70,
          bookmarkCount: 180,
        });

        x.at("16.4s").navigate("timeline");
      })

      // ============================================
      // WHATSAPP (back to group)
      // ============================================
      .whatsapp("phone", "grp_creator_room", (wa) => {
        wa.at("23.4s").receive("Omar", "You replied. The quote graph just jumped again.");
        wa.at("24.8s").receive("Mina", "Screenshots are already in the group chat.");
        wa.at("26.2s").receive("Tess", "Next beat: controlled follow-up, not damage control.");

        wa.at("28.2s").send("One last line, then we let the clip breathe.", {});

        wa.at("32.8s").receive("Jay", "Too late. This is already the next episode.");
      })

      .build(),
});
