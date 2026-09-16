import { cameraSubject, cinematicProgram, cinematicShot as shot } from "@tokovo/dsl";
import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";

const baseTime = Date.UTC(2026, 8, 11, 18, 41);
const duration = 1260;
const wa = cameraSubject.scope("phone", "app_whatsapp");
const x = cameraSubject.scope("phone", "app_x");
const camera = cinematicProgram(
  {
    fps: 30,
    duration,
    stage: {
      width: 1080,
      height: 1920,
      devices: [{ deviceId: "phone", x: 220, y: 220, width: 640, height: 1390, zIndex: 10 }],
    },
  },
  (cinema) =>
    cinema.planFamily({
      plans: [{ id: "story", default: true }, { id: "directed" }],
      framings: {
        phone: {
          position: [0.5, 0.5],
          fill: 0.88,
          mode: "contain",
          padding: 42,
          min: 0.6,
          max: 1.3,
        },
        conversation: {
          position: [0.5, 0.5],
          fill: 0.88,
          mode: "contain",
          padding: 32,
          min: 0.6,
          max: 1.4,
        },
        post: { position: [0.5, 0.46], fill: 0.83, mode: "width", padding: 38, min: 0.6, max: 1.6 },
      },
      outputs: [
        {
          id: "portrait-main",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          coveragePolicy: "require-shots",
          compositionProfileId: "hero-device",
          travel: { mode: "stabilized", subject: wa.body, maxDriftPx: [32, 48] },
          defaultRig: {
            id: "story-phone",
            subject: wa.body,
            frame: { fill: 0.88, padding: 42, min: 0.6, max: 1.3 },
            motion: { type: "minimum-jerk", durationFrames: 24 },
          },
        },
      ],
      sequences: [
        {
          outputId: "portrait-main",
          end: duration,
          shots: [
            shot("the-secret-stacks-up", 195, wa.body).frame("phone").cut(),
            shot("the-group-realizes", 237, wa.screen).frame("conversation").settle(24),
            shot("a-public-receipt", 105, wa.body).frame("phone").settle(18),
            shot("she-created-the-group", 117, x.entity("tweet", "party-post", "card"))
              .frame("post")
              .fallback(x.screen)
              .settle(24)
              .when("directed", {
                travel: {
                  mode: "intentional",
                  reason: "Bring the public receipt into readable focus",
                },
                frame: { fill: 1, padding: 12, max: 2.2, position: [0.5, 0.42] },
                direction: {
                  entrance: { type: "minimum-jerk", durationFrames: 12 },
                  source: "freeze",
                  framing: "follow-position",
                  tracking: { halfLifeSeconds: 0.18 },
                  movement: {
                    interpolation: "minimum-jerk",
                    keyframes: [
                      {
                        frame: 0,
                        offsetX: 0,
                        offsetY: 0,
                        scaleMultiplier: 1,
                        rotationOffsetDeg: 0,
                      },
                      {
                        frame: 30,
                        offsetX: 0,
                        offsetY: 0,
                        scaleMultiplier: 1,
                        rotationOffsetDeg: 0,
                      },
                      {
                        frame: 100,
                        offsetX: 0,
                        offsetY: 0,
                        scaleMultiplier: 1.06,
                        rotationOffsetDeg: 0,
                      },
                      {
                        frame: 116,
                        offsetX: 0,
                        offsetY: 0,
                        scaleMultiplier: 1.06,
                        rotationOffsetDeg: 0,
                      },
                    ],
                  },
                },
              }),
            shot("type-the-question", 237, x.screen)
              .frame("conversation")
              .settle(24)
              .when("directed", {
                travel: {
                  mode: "intentional",
                  reason: "Return from the receipt to the conversation",
                },
                direction: {
                  entrance: { type: "minimum-jerk", durationFrames: 18 },
                  source: "freeze",
                },
              }),
            shot("back-to-the-party", 369, wa.body).frame("phone").settle(24),
          ],
        },
      ],
    }),
);

export default defineEpisode({
  meta: {
    id: "surprise-group-chat",
    title: "The Surprise Was the Group Chat",
    description:
      "Friends plan a surprise birthday in a WhatsApp group the birthday girl created. An X mention reveals how much she already knows.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 84,
    tags: ["story", "comedy", "whatsapp", "x", "group", "notifications", "keyboard"],
  },
  config: { format: "1080x1920", durationInFrames: duration, apps: ["app_whatsapp", "app_x"] },
  build: () =>
    episode("surprise-group-chat", {
      fps: 30,
      duration: "42s",
      title: "The Surprise Was the Group Chat",
      seed: "surprise-group-v1",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        locked: true,
        appearance: "light",
        notificationUX: "native",
        installedApps: ["app_whatsapp", "app_x"],
        notificationTokens: {
          card: "#f8f7f4",
          text: "#20242a",
          secondaryText: "#62666e",
          accent: "#007aff",
          border: "#e1e0db",
          radius: 22,
          padding: 14,
        },
        os: {
          time: baseTime,
          hourCycle: "h24",
          battery: 72,
          network: "5G",
          lockScreenWallpaper: "linear-gradient(145deg, #f3e6d2, #c6d9d1)",
        },
      })
      .background({
        type: "gradient",
        gradient:
          "radial-gradient(ellipse at 75% 20%, #eadbce, transparent 55%), linear-gradient(155deg, #f6f2ea, #d9e2df)",
        opacity: 1,
      })
      .cinematics(camera)
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "birthday",
            name: "Birthday committee 🎂",
            type: "group",
            isPinned: true,
            unreadCount: 0,
            members: [
              { id: "me", name: "You" },
              { id: "nora", name: "Nora" },
              { id: "leo", name: "Leo" },
              { id: "maya", name: "Maya", isAdmin: true },
            ],
            messages: [
              {
                id: "party-history-1",
                type: "text",
                from: "Nora",
                text: "Friday. 7pm. Bring balloons.",
                timestampMs: baseTime - 300000,
              },
              {
                id: "party-history-2",
                type: "text",
                from: "me",
                text: "I'll distract her until then.",
                status: "read",
                timestampMs: baseTime - 280000,
              },
            ],
          },
        ],
      })
      .view("app_whatsapp", "phone", { screen: "chats" })
      .snapshot(
        "app_x",
        "phone",
        {
          schemaVersion: 2,
          locale: "en-US",
          currentUserId: "alex",
          users: [
            {
              id: "alex",
              name: "Alex",
              handle: "alexafterhours",
              followers: 214,
              following: 187,
            },
            {
              id: "maya",
              name: "Maya",
              handle: "mayaknew",
              followers: 862,
              following: 305,
            },
          ],
          follows: [{ followerId: "alex", followingId: "maya" }],
          tweets: [
            {
              id: "party-post",
              authorId: "maya",
              text: "My friends are planning my surprise party.\n\nIn the group chat I created.",
              createdAt: baseTime - 60000,
              likeCount: 42,
              repostCount: 3,
              viewCount: 1240,
            },
          ],
        },
        { version: 2 },
      )
      .view(
        "app_x",
        "phone",
        { schemaVersion: 2, screen: "timeline", timelineTab: "following" },
        { version: 2 },
      )
      .whatsapp("phone", "birthday", (chat) => {
        chat.switchTo("birthday", "0s");
        chat.at("0.6s").receive("Nora", "Nobody tell Maya.", { messageId: "secret" });
        chat.at("1.9s").receive("Leo", "Cake is hidden.", { messageId: "cake" });
        chat.at("3.2s").receive("Nora", "Wait. Who added Maya?", { messageId: "added" });
        chat.span("6.8s", "7.5s").typing("Leo");
        chat
          .at("7.6s")
          .receive("Leo", "Please tell me she hasn't read this.", { messageId: "read-this" });
        chat.at("11.3s").send("She's in this group?", {
          messageId: "in-group",
          input: {
            duration: "1.9s",
            style: "natural",
            id: "party-question",
            keyboard: { returnKey: "send", appearance: "light" },
          },
        });
        chat.at("11.9s").markMessageRead("in-group");
        chat.span("11.9s", "12.4s").typing("Nora");
        chat.at("12.5s").receive("Nora", "She's the admin.", { messageId: "admin" });
        chat
          .at("29.8s")
          .receive("Leo", "We still shouting surprise?", { messageId: "still-surprise" });
        chat.span("32.5s", "33.2s").typing("Maya");
        chat
          .at("33.3s")
          .receive("Maya", "Yes. I practiced my reaction.", { messageId: "practiced" });
        chat.at("37.3s").send("Surprise.", {
          messageId: "surprise",
          input: {
            duration: "1.2s",
            style: "natural",
            id: "party-finale",
            keyboard: { returnKey: "send", appearance: "light" },
          },
        });
        chat.at("37.8s").markMessageRead("surprise");
        chat.at("38.4s").receive("Maya", "Omg. You shouldn't have. 🥹", { messageId: "reaction" });
        chat.at("40.1s").react("reaction", "😂");
      })
      .x("phone", (social) => {
        social.at("17s").markNotificationRead("maya-mention", 0);
        social.at("14.6s").addNotification({
          id: "maya-mention",
          type: "mention",
          actorId: "maya",
          tweetId: "party-post",
          isMention: true,
          title: "Maya mentioned you",
          body: "You might want to read this.",
          createdAt: baseTime + 14600,
        });
        social.at("24.9s").replyTweet(
          {
            id: "saw-everything",
            authorId: "alex",
            replyToId: "party-post",
            text: "You saw everything?",
            createdAt: baseTime + 24900,
          },
          {
            input: {
              duration: "2.4s",
              style: "natural",
              id: "party-x-reply",
              keyboard: { appearance: "light", returnKey: "send" },
            },
          },
        );
        social.at("26.4s").replyTweet({
          id: "booked-table",
          authorId: "maya",
          replyToId: "party-post",
          text: "I booked the table. Act surprised.",
          createdAt: baseTime + 26400,
        });
      })
      .notificationTrack("phone", (notifications) => {
        // Face ID reveals previews without leaving the Lock Screen.
        notifications.at("0.3s").authenticate();
        notifications.at("4.5s").expandGroup("added");
        notifications.at("6.1s").tap("added");
        for (const id of ["secret", "cake", "added"])
          notifications.at("6.1s").markRead(id, 0, {
            type: "CONVERSATION_OPENED",
            payload: { conversationId: "birthday" },
          });
        notifications.at("17s").tap("maya-mention");
        notifications.at("31.8s").tap("still-surprise");
        notifications.at("31.8s").markRead("still-surprise", 0, {
          type: "CONVERSATION_OPENED",
          payload: { conversationId: "birthday" },
        });
      })
      .audio((audio) => {
        audio
          .span("0s", "35.4s")
          .bgm("/music/ambient-track.mp3", { volume: 0.065, fadeIn: "1s", fadeOut: "1.2s" });
        // The final typed punchline gets room: native typing and send sounds, no sting.
      })
      .build(),
});
