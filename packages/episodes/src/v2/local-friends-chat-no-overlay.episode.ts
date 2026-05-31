import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-local-friends-chat-no-overlay",
    title: "V2 Mysuru Friends Chat (No Overlay): WhatsApp → X → WhatsApp",
    description:
      "Friends tone, proper Mysuru-style trolling across WhatsApp and X. No overlays. Uses device banner + auto keyboard typing + BGM.",
    category: "showcase",
    tags: ["v2", "kannada", "chat", "whatsapp", "x", "no-overlay", "bgm", "keyboard", "camera"],
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
          { id: "u_me", name: "Me", handle: "naanu", followers: 3800, following: 280, verified: null },
          { id: "u_op", name: "OP", handle: "mysuru_guru", followers: 42000, following: 800, verified: "blue" },
          { id: "u_r1", name: "ಅಪ್ಪು", handle: "appu", followers: 11000, following: 900, verified: null },
        ],
        tweets: [
          {
            id: "tw_op",
            authorId: "u_op",
            text: "Bro said ‘vibe create’ and posted… THAT. Mysuru boys assemble 😂",
            viewCount: 220000,
            shareCount: 5200,
            bookmarkCount: 16000,
          },
        ],
        replies: [
          {
            id: "tw_r1",
            authorId: "u_r1",
            text: "Vibe create anthe… ninna vibe = power cut + mosquito sound 😂",
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
            id: "grp_mysuru",
            name: "Mysuru Boys (No Filter)",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 99,
            type: "group",
            participants: ["ನಾನು", "ಗುರು", "ಅಪ್ಪು", "ಶಶಿ", "ಜೋಶಿ"],
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
          body: "Ninna banter thread live. Bandu nodu maga.",
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
      // WHATSAPP (friends trolling)
      // ============================================
      .whatsapp("phone", "grp_mysuru", (wa) => {
        wa.switchTo("grp_mysuru", "0s");

        wa.at("1.0s").receive("ಗುರು", "Maga… ninna story nodde. Cringe champion da 😭");
        wa.at("2.2s").receive("ಅಪ್ಪು", "‘Cinematic build’ anthe… guru, this fellow director aa? 😂");
        wa.at("3.4s").receive("ಶಶಿ", "Yen guru… background music on madi damage control madta idya?");

        wa.at("5.0s").send("Ayyo bejar beda re. Swalpa vibe create madtiddini ashte.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("8.3s").receive("ಜೋಶಿ", "Vibe create? Ninna vibe-ige police complaint ide 😂");
        wa.at("9.3s").receive("ಗುರು", "X open maadu. Banter thread already hot hot.");
      })

      // ============================================
      // X (banter thread)
      // ============================================
      .x("phone", (x) => {
        x.at("10.4s").navigate("tweet", { tweetId: "tw_op" });
        x.at("11.6s").viewTweet("tw_op");

        // Quote banter (typed) with auto keyboard
        x.at("14.2s").navigate("compose");
        x.at("18.0s").postTweet({
          authorId: "u_me",
          text: "Mysuru boys: banter maadi. But swalpa water + bisi dose ge bandre settle 🤝",
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
      .whatsapp("phone", "grp_mysuru", (wa) => {
        wa.at("27.4s").receive("ಗುರು", "Ayyo… ni tweet maadi ‘dose’ mention madidya? 😭");
        wa.at("29.0s").receive("ಅಪ್ಪು", "Now everyone will come for dose. You created ‘vibe’ business bro 😂");
        wa.at("31.2s").receive("ಶಶಿ", "Next episode: Mysuru dosa sponsor deal 😂😂");

        wa.at("34.0s").send("Ok ok. Next time no story. Only results. Promise.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("38.6s").receive("ಜೋಶಿ", "Promise? Screenshot li safe madkondvi. Bye.");
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
