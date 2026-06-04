import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-creator-group-chat-multiapp",
    title: "V2 Creator Ops Chat: WhatsApp → X → iMessage (Multi-App)",
    description:
      "Multi-app creator operations episode with group chat pressure, heads-up banner bait, X thread escalation, iMessage follow-up, overlays, BGM, keyboard, and camera direction.",
    category: "showcase",
    tags: ["v2", "creator", "chat", "whatsapp", "x", "imessage", "overlay", "bgm"],
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
          {
            id: "u_me",
            name: "Me",
            handle: "studiolead",
            followers: 4200,
            following: 300,
            verified: null,
          },
          {
            id: "u_op",
            name: "Edit Desk",
            handle: "editdesk",
            followers: 54000,
            following: 900,
            verified: "blue",
          },
          {
            id: "u_1",
            name: "Mina",
            handle: "mina",
            followers: 12000,
            following: 980,
            verified: null,
          },
          {
            id: "u_2",
            name: "Omar",
            handle: "omar",
            followers: 8800,
            following: 420,
            verified: null,
          },
        ],
        tweets: [
          {
            id: "tw_op",
            authorId: "u_op",
            text: "The studio called it 'strategic timing' and now the audience is editing the recap for them.",
            viewCount: 180000,
            shareCount: 3100,
            bookmarkCount: 12000,
          },
        ],
        replies: [
          {
            id: "tw_r1",
            authorId: "u_1",
            text: "If the audience can quote the delay, it is already part of the episode.",
            replyToId: "tw_op",
            viewCount: 92000,
            shareCount: 1100,
            bookmarkCount: 3600,
          },
          {
            id: "tw_r2",
            authorId: "u_2",
            text: "The second act wrote itself. Now the team has to land the response.",
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
            name: "Launch War Room",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 21,
            type: "group",
            participants: ["Me", "Mina", "Omar", "Tess", "Jay"],
          },
          {
            id: "im_producer",
            name: "Producer",
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
        ov.at("0.0s").hook("The launch chat becomes the episode.", {
          durationFrames: 110,
          intensity: 0.95,
        });
        ov.at("5.8s").caption("Heads-up banner pulls the story sideways.", {
          durationFrames: 120,
        });
        ov.at("14.4s").receipt("Exhibit A: 'Strategic timing.'", {
          preset: "topLeft",
          durationFrames: 180,
        });
        ov.at("28.0s").caption("The X thread turns into the second act.", {
          durationFrames: 150,
        });
        ov.at("44.0s").cliffhanger("Producer message. The room goes quiet.", {
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

        // Switch to iMessage for the producer follow-up.
        d.at("34.5s").openApp("app_imessage", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })

      // ============================================
      // WHATSAPP (group chat)
      // ============================================
      .whatsapp("phone", "grp_chat", (wa) => {
        wa.switchTo("grp_chat", "0s");

        wa.at("1.2s").receive("Mina", "The teaser is out and the timing comment is everywhere.");
        wa.at("2.2s").receive("Omar", "Caption team says the audience made their own hook.");
        wa.at("3.1s").receive(
          "Tess",
          "We need one controlled reply before this becomes the whole launch.",
        );

        wa.span("3.9s", "4.6s").typing("Jay");
        wa.at("4.7s").receive("Jay", "The thread is calling it strategic timing. Lean into it.");

        // Typed reply (auto keyboard) for realism
        wa.at("7.8s").send("It was pacing. We held the reveal for the second beat.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("10.8s").receive("Omar", "That line is either brilliant or a screenshot forever.");
        wa.at("12.6s").receive("Mina", "Open X. The thread is moving faster than the edit.");
      })

      // ============================================
      // X (banter thread)
      // ============================================
      .x("phone", (x) => {
        x.at("16.4s").navigate("tweet", { tweetId: "tw_op" });
        x.at("18.0s").viewTweet("tw_op");

        // Compose a quote response (typed).
        x.at("22.0s").navigate("compose");
        x.at("26.0s").postTweet({
          authorId: "u_me",
          text: "Strategic timing means the reveal lands when the audience is already watching.",
          typed: true,
          charDelay: 2,
          viewCount: 1900,
          shareCount: 40,
          bookmarkCount: 130,
        });
        x.at("26.2s").navigate("timeline");
      })

      // ============================================
      // iMessage (producer reality check)
      // ============================================
      .imessage("phone", "im_producer", (im) => {
        im.at("35.4s").openConversation("im_producer");
        im.at("37.0s").receive("Producer", "I saw the reply. Is this planned?");
        im.at("39.0s").receive("Producer", "If it is planned, send the next beat now.");
        im.at("42.0s").send("Give me five minutes. Turning the thread into act two.", {
          typed: true,
          charDelay: 2,
        });
        im.at("46.0s").receive("Producer", "Good. Make it look intentional.");
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
