import { cameraSubject, cinematicProgram, cinematicShot as shot } from "@tokovo/dsl";
import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";

const id = "the-quiet-night";
const duration = 900;
const now = Date.UTC(2026, 8, 11, 21, 30);
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
      plans: [{ id: "rally" }, { id: "reading-room" }, { id: "cinematic", default: true }],
      framings: {
        phone: { position: [0.5, 0.5], fill: 0.96, mode: "contain", padding: 12, max: 1.3 },
        receipt: { position: [0.5, 0.43], fill: 0.95, mode: "width", padding: 24, max: 1.55 },
        incoming: { position: [0.35, 0.67], mode: "width", fill: 0.9, min: 1.9, max: 1.9 },
        outgoing: { position: [0.65, 0.67], mode: "width", fill: 0.9, min: 1.9, max: 1.9 },
        banner: { position: [0.5, 0.3], mode: "width", fill: 0.9, padding: 20, max: 1.65 },
      },
      outputs: [
        {
          id: "portrait",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          compositionProfileId: "hero-device",
          coveragePolicy: "require-shots",
          travel: {
            mode: "intentional",
            reason: "One reveal between matching conversation compositions",
          },
          defaultRig: {
            id: "wide",
            subject: wa.body,
            frame: { fill: 0.88, max: 1.3 },
            motion: { type: "cut" },
          },
        },
      ],
      sequences: [
        {
          outputId: "portrait",
          end: duration,
          shots: [
            ...[
              // Both speakers, notification and app navigation share one stationary composition.
              shot("the-conversation", 465, wa.body)
                .frame("phone")
                .cut()
                .when("reading-room", false),
              shot("read-the-exchange", 330, wa.semantic("last-message"))
                .at(0)
                .frame("phone")
                .readWithin(wa.screen, {
                  scale: 1.4,
                  region: { x: 0.05, y: 0.35, width: 0.9, height: 0.45 },
                  halfLifeSeconds: 0.22,
                })
                .when("rally", false),
              shot("notification-context", 135, wa.body)
                .at(330)
                .frame("phone")
                .handoff(36)
                .when("rally", false),
              // Navigation completes before the camera moves; the settled reveal gets a reading hold.
              shot("public-evidence", 120, x.entity("tweet", "karaoke", "card"))
                .frame("receipt")
                .direct({
                  entrance: { type: "minimum-jerk", durationFrames: 45 },
                  source: "freeze",
                  framing: "hold",
                }),
              shot("the-return", 315, wa.body).frame("phone").handoff(45),
            ].map((take) => take.when("cinematic", false)),
            ...[
              // Cut after the arrival settles, not during the bubble's layout animation.
              shot("the-alibi", 84, wa.entity("message", "quiet", "bubble"))
                .at(0)
                .frame("incoming")
                .direct({ entrance: { type: "cut" }, framing: "hold" })
                .pushIn(1.08, 8, 60),
              shot("the-doubt", 84, wa.entity("message", "last-time", "bubble"))
                .frame("outgoing")
                .direct({ entrance: { type: "cut" }, framing: "hold" }),
              shot("the-library", 84, wa.entity("message", "library", "bubble"))
                .frame("incoming")
                .direct({ entrance: { type: "cut" }, framing: "hold" })
                .pushIn(1.04, 18, 64),
              shot("the-question", 84, wa.entity("message", "palace", "bubble"))
                .frame("outgoing")
                .direct({ entrance: { type: "cut" }, framing: "hold" }),
              shot("the-excuse", 42, wa.entity("message", "modern", "bubble"))
                .frame("incoming")
                .direct({ entrance: { type: "cut" }, framing: "hold" }),
              // The ping motivates one continuous move from the conversation to the OS banner.
              shot("the-interruption", 54, wa.notification)
                .frame("banner")
                .direct({
                  entrance: { type: "minimum-jerk", durationFrames: 27 },
                  source: "freeze",
                  framing: "hold",
                }),
              shot("open-the-receipt", 33, wa.body).frame("phone").cut(),
              shot("caught-in-public", 120, x.entity("tweet", "karaoke", "body"))
                .frame("receipt", { position: [0.65, 0.43], min: 1.8, max: 1.8 })
                .direct({
                  entrance: { type: "minimum-jerk", durationFrames: 24 },
                  source: "freeze",
                  framing: "hold",
                })
                .pushIn(1.16, 40, 96),
              shot("let-that-land", 51, wa.body).frame("phone").handoff(30),
              shot("too-late", 54, wa.notification)
                .frame("banner")
                .direct({
                  entrance: { type: "minimum-jerk", durationFrames: 24 },
                  source: "freeze",
                  framing: "hold",
                }),
              shot("back-to-the-chat", 30, wa.body).frame("phone").cut(),
              shot("nice-library", 90, wa.entity("message", "nice-library", "bubble"))
                .frame("outgoing")
                .direct({ entrance: { type: "cut" }, framing: "hold" }),
              shot("the-punchline", 90, wa.entity("message", "singing", "bubble"))
                .frame("incoming")
                .direct({ entrance: { type: "cut" }, framing: "hold" })
                .pushIn(1.06, 24, 78),
            ].map((take) => take.when("rally", false).when("reading-room", false)),
          ],
        },
      ],
    }),
);

export default defineEpisode({
  meta: {
    id,
    title: "The Quiet Night",
    description:
      "A library alibi meets a karaoke tag. Shot/reverse-shot dialogue, a notification pan, and a slow evidence reveal.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 85,
    tags: ["story", "comedy", "camera", "whatsapp", "x", "notifications"],
  },
  config: { format: "1080x1920", durationInFrames: duration, apps: ["app_whatsapp", "app_x"] },
  build: () =>
    episode(id, { fps: 30, duration: "30s", title: "The Quiet Night", seed: "quiet-night-v1" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "light",
        notificationUX: "native",
        installedApps: ["app_whatsapp", "app_x"],
        os: { time: now, hourCycle: "h24", battery: 64, network: "5G" },
      })
      .background({
        type: "gradient",
        gradient: "linear-gradient(145deg, #f3e8d8, #d4e2dc)",
        opacity: 1,
      })
      .cinematics(camera)
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "sam",
            name: "Sam",
            unreadCount: 0,
            messages: [
              {
                id: "earlier-1",
                type: "text",
                from: "me",
                text: "Same café?",
                status: "read",
                timestampMs: now - 720000,
              },
              {
                id: "earlier-2",
                type: "text",
                from: "Sam",
                text: "The one by the station.",
                timestampMs: now - 660000,
              },
              {
                id: "earlier-3",
                type: "text",
                from: "me",
                text: "Table booked for eight.",
                status: "read",
                timestampMs: now - 600000,
              },
              {
                id: "earlier-4",
                type: "text",
                from: "Sam",
                text: "I'll be there.",
                timestampMs: now - 540000,
              },
              {
                id: "earlier-5",
                type: "text",
                from: "me",
                text: "On time this week?",
                status: "read",
                timestampMs: now - 480000,
              },
              {
                id: "history-1",
                type: "text",
                from: "me",
                text: "Still on for breakfast tomorrow?",
                status: "read",
                timestampMs: now - 120000,
              },
              {
                id: "history-2",
                type: "text",
                from: "Sam",
                text: "Absolutely. 8am.",
                timestampMs: now - 90000,
              },
              {
                id: "quiet",
                type: "text",
                from: "Sam",
                text: "Quiet night. Home by ten.",
                timestampMs: now,
              },
            ],
          },
        ],
      })
      .view("app_whatsapp", "phone", { screen: "chat", conversationId: "sam" })
      .snapshot(
        "app_x",
        "phone",
        {
          schemaVersion: 2,
          locale: "en-US",
          currentUserId: "alex",
          users: [
            { id: "alex", name: "Alex", handle: "alexafterhours" },
            { id: "venue", name: "Karaoke Palace", handle: "palaceafterdark" },
          ],
          tweets: [
            {
              id: "karaoke",
              authorId: "venue",
              text: "Sam said ONE song.\n\nThat was nine songs ago.\n\nBreakfast plans: cancelled.",
              createdAt: now + 12000,
              likeCount: 38,
              repostCount: 2,
              viewCount: 804,
            },
          ],
        },
        { version: 2 },
      )
      .view("app_x", "phone", { schemaVersion: 2, screen: "timeline" }, { version: 2 })
      .whatsapp("phone", "sam", (chat) => {
        chat.switchTo("sam", "0s");
        chat.at("2.4s").send("You said that last time.", { messageId: "last-time" });
        chat.at("5.2s").receive("Sam", "I'm at a library.", { messageId: "library" });
        chat.at("8s").send("At 9:30 on a Friday?", { messageId: "palace" });
        chat.at("10.8s").receive("Sam", "Modern library.", { messageId: "modern" });
        chat.at("21.2s").receive("Sam", "Please don't open X.", { messageId: "dont-open" });
        chat.at("23.6s").send("Nice library.", { messageId: "nice-library" });
        chat.at("26.6s").receive("Sam", "The books are singing.", { messageId: "singing" });
        chat.at("29s").react("singing", "😂");
      })
      .x("phone", (social) => {
        social.at("12.6s").addNotification({
          id: "tagged",
          type: "mention",
          actorId: "venue",
          tweetId: "karaoke",
          isMention: true,
          title: "Karaoke Palace tagged you",
          body: "Your friend is our headline act.",
          createdAt: now + 12600,
        });
        social.at("14.4s").markNotificationRead("tagged", 0);
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("14.4s").tap("tagged");
        notifications.at("23s").tap("dont-open");
        notifications.at("23s").markRead("dont-open", 0, {
          type: "CONVERSATION_OPENED",
          payload: { conversationId: "sam" },
        });
      })
      .build(),
});
