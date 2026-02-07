import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/creator";

export default defineEpisode({
  meta: {
    id: "v2-hinglish-friends-bakchodi-no-overlay",
    title: "V2 Hinglish Friends Bakchodi (No Overlay): WhatsApp → X → WhatsApp",
    description:
      "Hinglish friends vibe. WhatsApp group bakchodi + X roast thread + auto keyboard typing + device banner. No overlays.",
    category: "showcase",
    tags: ["v2", "hinglish", "bakchodi", "whatsapp", "x", "no-overlay", "bgm", "keyboard", "camera"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1200, // 40s @ 30fps
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("v2-hinglish-friends-bakchodi-no-overlay", { fps: 30, duration: "40s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_x"],
        conversations: [
          {
            id: "grp_backchod",
            name: "Backchod Boys (Verified)",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 37,
            type: "group",
            participants: ["main", "Aman", "Riya", "Sahil", "Vivek"],
          },
        ],
        os: { time: new Date("2025-07-12T19:21:00"), battery: 62, network: "5G" },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })

      // ============================================
      // AUDIO (BGM)
      // ============================================
      .audio((audio) => {
        audio.span("0s", "40s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.18,
          fadeIn: "2s",
          fadeOut: "2s",
        });
      })

      // ============================================
      // DEVICE (banner bait + app switches)
      // ============================================
      .deviceTrack("phone", (d) => {
        // Heads-up X banner while still in WhatsApp
        d.at("6.6s").notificationShow({
          id: "x_roast",
          appId: "app_x",
          title: "X",
          body: "Bro you got cooked. Thread is trending 😭",
          mode: "headsup",
          priority: "high",
        });

        d.at("9.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });

        d.at("22.0s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })

      // ============================================
      // WHATSAPP (group bakchodi)
      // ============================================
      .whatsapp("phone", "grp_backchod", (wa) => {
        wa.switchTo("grp_backchod", "0s");

        wa.at("1.0s").receive("Aman", "Bhai tu aaj bhi late? Calendar se beef hai kya?");
        wa.at("2.2s").receive("Riya", "He thinks being late is a personality trait 😭");
        wa.at("3.4s").receive("Sahil", "Sirji entry slow-mo me karenge, time pe nahi.");

        wa.at("4.8s").send("Arre chill. Main late nahi, main 'dramatic timing' pe aata hoon.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("7.2s").receive("Vivek", "Dramatic timing? X pe tu already viral ho gaya bro 💀");
        wa.at("8.2s").receive("Aman", "Open X. Apni beizzati ka HD version dekh.");
      })

      // ============================================
      // X (roast thread)
      // ============================================
      .x("phone", (x) => {
        x.seed({
          users: [
            { id: "u_me", name: "Me", handle: "mainCharacter", followers: 5100, following: 260, verified: null },
            { id: "u_op", name: "OP", handle: "pun_ka_papa", followers: 78000, following: 900, verified: "blue" },
            { id: "u_r1", name: "Riya", handle: "riya", followers: 12400, following: 780, verified: null },
          ],
          tweets: [
            {
              id: "tw_op",
              authorId: "u_op",
              text: "‘Dramatic timing’ bolke meeting me 45 min late aaya. Main character syndrome is real 😭",
              viewCount: 310000,
              shareCount: 6200,
              bookmarkCount: 21000,
            },
          ],
          replies: [
            {
              id: "tw_r1",
              authorId: "u_r1",
              text: "Bhai ka dramatic timing = traffic + delusion 🫡",
              replyToId: "tw_op",
              viewCount: 132000,
              shareCount: 2100,
              bookmarkCount: 7200,
            },
          ],
          currentUserId: "u_me",
          screen: "timeline",
        });

        x.at("9.4s").navigate("tweet", { tweetId: "tw_op" });
        x.at("10.6s").viewTweet("tw_op");

        x.at("12.4s").navigate("compose");
        x.at("16.2s").postTweet({
          authorId: "u_me",
          text: "Ok ok. Next time time pe aa jaunga. Ab thread delete kar do yaar 😭🙏",
          typed: true,
          charDelay: 2,
          viewCount: 2400,
          shareCount: 70,
          bookmarkCount: 180,
        });

        x.at("16.4s").navigate("timeline");
      })

      // ============================================
      // WHATSAPP (back to group)
      // ============================================
      .whatsapp("phone", "grp_backchod", (wa) => {
        wa.at("23.4s").receive("Riya", "Bro you replied?? Ab toh aur milega 😭");
        wa.at("24.8s").receive("Aman", "Delete kya karega, screenshot already save.");
        wa.at("26.2s").receive("Sahil", "Next episode: apology tour on reels.");

        wa.at("28.2s").send("Ok last line. Main offline ja raha. Bye.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("32.8s").receive("Vivek", "Bye? Tu toh ab content machine hai.");
      })

      // ============================================
      // CAMERA (device-owned anchors + app semantics)
      // ============================================
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("1.0s", "6.4s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.2 });

        cam.at("6.65s").focus("notification_banner", { scale: 1.18, duration: "0.45s" });
        cam.at("7.8s").focus("lastMessage", { scale: 1.12, duration: "0.35s" });

        cam.at("9.45s").focus("tweet_card", { scale: 1.1, duration: "0.45s" });
        cam.span("12.6s", "16.4s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });

        cam.at("23.0s").focus("lastMessage", { scale: 1.12, duration: "0.35s" });
        cam.span("28.0s", "29.4s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
      })

      .build(),
});

