import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-creator-group-chat-multiapp",
    title: "V2 Kannada Chat: WhatsApp → X → iMessage (Multi-App)",
    description:
      "Mysuru-style Kannada trolling across apps: group chat court room, heads-up banner bait, X banter thread, and an iMessage 'Amma' reality check. Includes overlays + BGM.",
    category: "showcase",
    tags: ["v2", "kannada", "chat", "whatsapp", "x", "imessage", "overlay", "bgm"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1500, // 50s @ 30fps
    apps: ["app_whatsapp", "app_x", "app_imessage"],
  },
  build: () =>
    episode("v2-creator-group-chat-multiapp", { fps: 30, duration: "50s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_x", "app_imessage"],
        os: { time: new Date("2025-06-26T21:41:00"), battery: 48, network: "5G" },
      })
      .snapshot("app_x", "phone", {
        users: [
          { id: "u_me", name: "Me", handle: "naanu", followers: 4200, following: 300, verified: null },
          { id: "u_op", name: "OP", handle: "guru_gossip", followers: 54000, following: 900, verified: "blue" },
          { id: "u_1", name: "ಅಪ್ಪು", handle: "appu", followers: 12000, following: 980, verified: null },
          { id: "u_2", name: "ಸೂಪರ್‌ಸೀನ್", handle: "superscene", followers: 8800, following: 420, verified: null },
        ],
        tweets: [
          {
            id: "tw_op",
            authorId: "u_op",
            text: "‘Timing strategic’ ಅಂತೆ. Mysuru style: late with full confidence 😂",
            viewCount: 180000,
            shareCount: 3100,
            bookmarkCount: 12000,
          },
        ],
        replies: [
          {
            id: "tw_r1",
            authorId: "u_1",
            text: "Late ಅಲ್ಲ ಅಂತೆ… clock-ne resign ಕೊಡಬೇಕು 😂",
            replyToId: "tw_op",
            viewCount: 92000,
            shareCount: 1100,
            bookmarkCount: 3600,
          },
          {
            id: "tw_r2",
            authorId: "u_2",
            text: "Confidence 100. Logic 0. Mysuru filter on 😂",
            replyToId: "tw_op",
            viewCount: 76000,
            shareCount: 900,
            bookmarkCount: 3100,
          },
        ],
        currentUserId: "u_me",
      })
      .view("app_x", "phone", { screen: "timeline" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "grp_chat",
            name: "Mysuru Majaa Mandali",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 21,
            type: "group",
            participants: ["ನಾನು", "ಗುರು", "ಅಪ್ಪು", "ಮೈಸೂರು-ಮೆಹು", "ಸೂಪರ್‌ಸೀನ್"],
          },
          {
            id: "im_amma",
            name: "ಅಮ್ಮ",
            avatar: "/avatars/avatar-maya.jpg",
            unreadCount: 1,
            type: "dm",
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })

      // ============================================
      // OVERLAY (Hook + captions + receipts)
      // ============================================
      .overlay((ov) => {
        ov.at("0.0s").hook("ಇವತ್ತು Mysuru chat full court, guru.", {
          durationFrames: 110,
          intensity: 0.95,
        });
        ov.at("5.8s").caption("Swalpa wait… heads-up banner barutte.", {
          durationFrames: 120,
        });
        ov.at("14.4s").receipt("Exhibit A: 'Late ಅಲ್ಲ… timing strategic.'", {
          preset: "topLeft",
          durationFrames: 180,
        });
        ov.at("28.0s").caption("X banter thread start. Seat belt sakkat tight.", {
          durationFrames: 150,
        });
        ov.at("44.0s").cliffhanger("ಅಮ್ಮ message ಬಂದಿದ್ರೆ… straight game over, maga.", {
          durationFrames: 180,
          intensity: 1.0,
        });
      })

      // ============================================
      // AUDIO (BGM from public/)
      // ============================================
      .audio((audio) => {
        audio.span("0s", "50s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.22,
          fadeIn: "2s",
          fadeOut: "3s",
        });
      })

      // ============================================
      // DEVICE (heads-up bait + app switches)
      // ============================================
      .deviceTrack("phone", (d) => {
        // Heads-up X banner while we're still in WhatsApp (camera target: notification_banner)
        d.at("6.2s").notificationShow({
          id: "x_banner",
          appId: "app_x",
          title: "X",
          body: "Someone tagged you. Again.",
          mode: "headsup",
          priority: "high",
        });

        // Switch to X
        d.at("16.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });

        // Switch to iMessage for the 'Amma' punch
        d.at("34.5s").openApp("app_imessage", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })

      // ============================================
      // WHATSAPP (group chat chat)
      // ============================================
      .whatsapp("phone", "grp_chat", (wa) => {
        wa.switchTo("grp_chat", "0s");

        wa.at("1.2s").receive("ಗುರು", "Ayyo maga… ನಿನ್ನ story ನೋಡಿದೆ. 😭");
        wa.at("2.2s").receive("ಅಪ್ಪು", "Caption full Mysuru silk board traffic da 😂");
        wa.at("3.1s").receive("ಮೈಸೂರು-ಮೆಹು", "ನೀನು late ಅಲ್ಲ re… ನೀನು 'swalpa adjust' specialist 😭");

        wa.span("3.9s", "4.6s").typing("ಸೂಪರ್‌ಸೀನ್");
        wa.at("4.7s").receive("ಸೂಪರ್‌ಸೀನ್", "ಇವನು 'timing strategic' ಅಂತೆ… guru, comedy piece.");

        // Typed reply (auto keyboard) for realism
        wa.at("7.8s").send("Late ಅಲ್ಲ guru. Swalpa… narrative build ಮಾಡ್ತಿದ್ದೆ.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("10.8s").receive("ಅಪ್ಪು", "Narrative build ಅಂತೆ… ninna excuse factory open 24/7 🏭");
        wa.at("12.6s").receive("ಗುರು", "X open ಮಾಡು. Banter thread already sakkat hot.");
      })

      // ============================================
      // X (banter thread)
      // ============================================
      .x("phone", (x) => {
        x.at("16.4s").navigate("tweet", { tweetId: "tw_op" });
        x.at("18.0s").viewTweet("tw_op");

        // Compose a quote banter (typed)
        x.at("22.0s").navigate("compose");
        x.at("26.0s").postTweet({
          authorId: "u_me",
          text: "Strategic timing ಅಂದ್ರೆ meeting invite accept ಮಾಡದೆ ghost ಆಗೋದು ಅಲ್ಲ guru 😭",
          typed: true,
          charDelay: 2,
          viewCount: 1900,
          shareCount: 40,
          bookmarkCount: 130,
        });
        x.at("26.2s").navigate("timeline");
      })

      // ============================================
      // iMessage (Amma reality check)
      // ============================================
      .imessage("phone", "im_amma", (im) => {
        im.at("35.4s").openConversation("im_amma");
        im.at("37.0s").receive("ಅಮ್ಮ", "ಎಲ್ಲಿ ಇದ್ದೀಯ? ಯಾಕೆ phone always silent?");
        im.at("39.0s").receive("ಅಮ್ಮ", "ನೀನು ‘strategic’ ಅಂತೆ… ಮನೆಗೆ ಬಾ ಮೊದಲು.");
        im.at("42.0s").send("ಅಮ್ಮ, 5 minutes… ನಾನು famous ಆಗ್ತಿದ್ದೀನಿ 😭", {
          typed: true,
          charDelay: 2,
        });
        im.at("46.0s").receive("ಅಮ್ಮ", "Famous ಅಲ್ಲ. Foolish. Now come.");
      })

      // ============================================
      // CAMERA (anchors: device/app/keyboard/notification_banner + app semantics)
      // ============================================
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("1.2s", "6.0s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.2 });

        // Heads-up banner focus (device-owned)
        cam.at("6.25s").focus("notification_banner", { scale: 1.18, duration: "0.45s" });
        cam.at("7.2s").focus("lastMessage", { scale: 1.12, duration: "0.35s" });

        // X: tweet card + keyboard (device-owned) during compose
        cam.at("16.45s").focus("tweet_card", { scale: 1.1, duration: "0.45s" });
        cam.span("22.2s", "26.2s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });

        // iMessage thread + keyboard
        cam.at("35.6s").focus("imessage_thread", { scale: 1.08, duration: "0.45s" });
        cam.span("41.9s", "43.3s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
      })
      .build(),
});
