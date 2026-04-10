import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

/**
 * Long-form v2 showcase that exercises the "enterprise v1" surface in one place:
 * - lockscreen bait + unlock
 * - screen recording indicator (Dynamic Island)
 * - heads-up notification banner (device-owned anchor)
 * - app switching transitions (WhatsApp -> X -> iMessage -> lock again)
 * - keyboard typing + camera tracking keyboard (device-owned anchor)
 * - app semantic anchors (lastMessage, tweet_card, etc.)
 *
 * This is intentionally "a bit long" so creators can fork it as a base template.
 */
export default defineEpisode({
  meta: {
    id: "v2-enterprise-long-showcase",
    title: "V2 Long: Device + Keyboard + Camera + Cross-App Roast (Baseline)",
    description:
      "One long canonical episode that showcases lockscreen -> unlock, recording indicator, heads-up notification banner, app switching, typed keyboard, and camera directing across WhatsApp, X, and iMessage.",
    category: "showcase",
    tags: [
      "v2",
      "device",
      "lockscreen",
      "unlock",
      "recording",
      "notification",
      "keyboard",
      "camera",
      "whatsapp",
      "x",
      "imessage",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2700, // 90s @ 30fps
    apps: ["app_whatsapp", "app_x", "app_imessage"],
  },
  build: () =>
    episode("v2-enterprise-long-showcase", { fps: 30, duration: "90s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        locked: true,
        screenRecording: true,
        installedApps: ["app_whatsapp", "app_x", "app_imessage", "app_camera"],
        os: {
          time: new Date("2025-06-26T21:08:00"),
          battery: 62,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "wa_grp",
            name: "Receipts Committee",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 9,
            type: "group",
            participants: ["Me", "Rhea", "Omar", "Tina", "Jay"],
          },
          {
            id: "im_dm",
            name: "Mina",
            avatar: "/avatars/avatar-maya.jpg",
            unreadCount: 1,
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .snapshot("app_x", "phone", {
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "me",
            followers: 3400,
            following: 240,
            verified: null,
          },
          {
            id: "u_op",
            name: "OP",
            handle: "op",
            followers: 98000,
            following: 600,
            verified: "blue",
          },
          {
            id: "u_1",
            name: "Rhea",
            handle: "rhea",
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
            text: "I never lie. I just remix the truth.",
            viewCount: 214000,
            shareCount: 4100,
            bookmarkCount: 18000,
          },
        ],
        replies: [
          {
            id: "tw_r1",
            authorId: "u_1",
            text: "DJ Cap back on the decks.",
            replyToId: "tw_op",
            viewCount: 82000,
            shareCount: 1100,
            bookmarkCount: 3600,
          },
          {
            id: "tw_r2",
            authorId: "u_2",
            text: "Remix is crazy. That's just lying with reverb.",
            replyToId: "tw_op",
            viewCount: 76000,
            shareCount: 900,
            bookmarkCount: 3100,
          },
        ],
        currentUserId: "u_me",
      })
      .view("app_x", "phone", { screen: "timeline" })

      .overlay((ov) => {
        ov.at("0.0s").hook("Wake up. It started.", {
          durationFrames: 120,
          intensity: 0.95,
        });
        ov.at("14.0s").caption("The banner hits while you're mid-chat.", {
          durationFrames: 120,
        });
        ov.at("29.8s").caption("Now watch the roast thread.", {
          durationFrames: 120,
        });
        ov.at("58.0s").receipt("DM: Mina (do not panic)", {
          preset: "topLeft",
          durationFrames: 180,
        });
        ov.at("86.0s").cliffhanger("He tagged your mom.", {
          durationFrames: 180,
          intensity: 1.0,
        });
      })

      // ---------------------------------------------------------------------
      // DEVICE: lockscreen bait + deterministic unlock + transitions
      // ---------------------------------------------------------------------
      .deviceTrack("phone", (d) => {
        // Lockscreen bait (rendered by lockscreen UI; not a heads-up banner)
        d.at("0.8s").notificationShow({
          id: "bait-wa",
          appId: "app_whatsapp",
          title: "Receipts Committee",
          body: "Jay: no way you still defending him 💀",
          mode: "lockscreen",
          priority: "high",
        });

        // Unlock into the app (transition is handled by device runtime)
        d.at("3.2s").unlock();

        // Open WhatsApp with manual transition
        d.at("3.8s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });

        // While in WhatsApp: show a heads-up X banner so we can demo device-owned anchor `notification_banner`.
        d.at("14.0s").notificationShow({
          id: "heads-up-x",
          appId: "app_x",
          title: "X",
          body: "Your name is trending.",
          mode: "headsup",
          priority: "high",
        });

        // Switch to X with manual transition
        d.at("28.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });

        // Switch to iMessage with manual transition
        d.at("56.0s").openApp("app_imessage", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });

        // End: go home, lock, and leave a final lockscreen cliffhanger notification.
        d.at("82.0s").goHome({
          transition: { durationFrames: 14, style: "iosZoom" },
        });
        d.at("84.0s").lock();
        d.at("86.0s").notificationShow({
          id: "cliff-1",
          appId: "app_whatsapp",
          title: "Mina",
          body: "He tagged your mom.",
          mode: "lockscreen",
          priority: "high",
        });
      })

      // ---------------------------------------------------------------------
      // WHATSAPP: group roast pacing + typed send (auto keyboard)
      // ---------------------------------------------------------------------
      .whatsapp("phone", "wa_grp", (wa) => {
        wa.switchTo("wa_grp", "0s");

        wa.at("5.0s").receive(
          "Rhea",
          "He posted a screenshot of the group chat.",
        );
        wa.at("6.0s").receive("Omar", "NOOOO 😭");
        wa.at("7.0s").receive("Tina", "Drop link.");

        wa.span("8.0s", "8.7s").typing("Jay");
        wa.at("8.8s").receive(
          "Jay",
          "He really thought he ate with that caption.",
        );

        wa.span("9.2s", "10.0s").typing("Rhea");
        wa.at("10.1s").receive("Rhea", "Caption is giving: 'I lie for sport'");

        // Creator POV: typed send (should auto keyboard via plugin lowering)
        wa.at("11.6s").send("Stop. The audacity has a subscription plan now.", {
          typed: true,
          charDelay: 2,
        });

        wa.at("16.2s").receive("Omar", "subscription plan is CRAZY 😭");
        wa.at("19.0s").receive(
          "Tina",
          "Okay but X is already cooking you btw.",
        );
        wa.at("23.0s").receive("Rhea", "Open it. I need to see this thread.");
      })

      // ---------------------------------------------------------------------
      // X: post -> replies -> compose -> quote roast (typed)
      // ---------------------------------------------------------------------
      .x("phone", (x) => {
        x.at("30.0s").navigate("timeline");
        x.at("32.0s").navigate("tweet", { tweetId: "tw_op" });
        x.at("33.0s").viewTweet("tw_op");
        x.at("39.0s").navigate("compose");

        x.at("44.0s").postTweet({
          authorId: "u_me",
          text: "He said 'remix' like honesty is a playlist.",
          typed: true,
          charDelay: 2,
          viewCount: 1800,
          shareCount: 34,
          bookmarkCount: 120,
        });
        x.at("44.2s").navigate("timeline");
      })

      // ---------------------------------------------------------------------
      // iMessage: DM tension + typed reply
      // ---------------------------------------------------------------------
      .imessage("phone", "im_dm", (im) => {
        im.at("58.0s").openConversation("im_dm");
        im.at("60.0s").receive(
          "Mina",
          "They’re quote-tweeting your messages now.",
        );
        im.at("62.0s").receive(
          "Mina",
          "Do NOT open the replies if you're fragile.",
        );

        // Typed reply: we want camera to be able to follow keyboard deterministically.
        im.at("66.0s").send("Too late. I'm already opening them.", {
          typed: true,
          charDelay: 2,
        });
        im.at("70.0s").receive("Mina", "Okay. Then at least screen record it.");
      })

      // ---------------------------------------------------------------------
      // CAMERA: prove device-owned anchors are stable across apps
      // ---------------------------------------------------------------------
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.0, duration: "0.4s" });

        // Recording indicator lives in dynamic island; anchor is device-owned.
        cam
          .at("0.9s")
          .focus("dynamicIsland", { scale: 1.25, duration: "0.35s" });
        cam.at("1.4s").focus("device", { scale: 1.06, duration: "0.35s" });

        // WhatsApp: follow the punchline as it arrives.
        cam
          .span("5.0s", "13.6s")
          .trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.2 });

        // Heads-up banner (device-owned) should exist even while WhatsApp is foreground.
        cam
          .at("14.05s")
          .focus("notification_banner", { scale: 1.18, duration: "0.45s" });
        cam
          .at("15.2s")
          .focus("lastMessage", { scale: 1.12, duration: "0.35s" });

        // X: focus tweet card and metrics; then track keyboard while composing (device-owned).
        cam.at("32.05s").focus("tweet_card", { scale: 1.1, duration: "0.45s" });
        cam
          .span("32.2s", "38.6s")
          .trackCinematic("metrics_row", { scale: 1.18, smoothing: 0.2 });
        cam
          .span("39.2s", "44.2s")
          .trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });

        // iMessage: keep the keyboard in frame during the typed reply.
        cam
          .at("58.2s")
          .focus("imessage_thread", { scale: 1.08, duration: "0.45s" });
        cam
          .span("65.8s", "67.4s")
          .trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });

        // Cliffhanger: hold the lockscreen bait.
        cam.at("84.2s").focus("device", { scale: 1.08, duration: "0.45s" });
      })
      .build(),
});
