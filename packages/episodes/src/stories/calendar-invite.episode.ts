import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";
import { calendarInviteCamera } from "./calendar-invite.camera.js";

const FPS = 30;
const baseTime = new Date("2026-07-25T09:27:00.000Z").getTime();

const calendarVoiceSegments = {
  "violet-why": {
    id: "violet-why",
    startMs: 0,
    endMs: 884,
    speaker: "violet",
  },
  "coral-denial": {
    id: "coral-denial",
    startMs: 1064,
    endMs: 1436,
    speaker: "coral",
  },
  "teal-looking-forward": {
    id: "teal-looking-forward",
    startMs: 1596,
    endMs: 2849,
    speaker: "teal",
  },
  "coral-explain": {
    id: "coral-explain",
    startMs: 3069,
    endMs: 3447,
    speaker: "coral",
  },
  "violet-accepted": {
    id: "violet-accepted",
    startMs: 3667,
    endMs: 4095,
    speaker: "violet",
  },
  "teal-friday": {
    id: "teal-friday",
    startMs: 4355,
    endMs: 5036,
    speaker: "teal",
  },
} as const;

type CalendarVoiceSegmentId = keyof typeof calendarVoiceSegments;

const calendarVoice = {
  id: "calendar-invite",
  manifestPath: "/voice/calendar-invite/calendar-invite.json",
  audioPath: "/voice/calendar-invite/calendar-invite.wav",
  durationMs: 5036,
  segments: calendarVoiceSegments,
  start(segmentId: CalendarVoiceSegmentId, fps = FPS): number {
    return Math.round((calendarVoiceSegments[segmentId].startMs / 1000) * fps);
  },
  end(segmentId: CalendarVoiceSegmentId, fps = FPS): number {
    return Math.round((calendarVoiceSegments[segmentId].endMs / 1000) * fps);
  },
  duration(segmentId: CalendarVoiceSegmentId, fps = FPS): number {
    const segment = calendarVoiceSegments[segmentId];
    return Math.round(((segment.endMs - segment.startMs) / 1000) * fps);
  },
} as const;

export default defineEpisode({
  meta: {
    id: "calendar-invite",
    title: "The Calendar Invite",
    description:
      "A 24-second iPhone workplace comedy where an accidental performance-review invitation becomes a quiet calendar-powered reversal.",
    category: "production",
    catalogType: "story",
    appId: "app_imessage",
    visibility: "public",
    sortOrder: 87,
    tags: [
      "story",
      "imessage",
      "calendar",
      "notification",
      "iphone",
      "performers",
      "blurb-voice",
      "cinematography",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 720,
    apps: ["app_imessage"],
  },
  build: () =>
    episode("calendar-invite", {
      fps: FPS,
      duration: "24s",
      title: "The Calendar Invite",
      seed: "calendar-invite-v1",
    })
      .device("phone", "iphone16", {
        app: "app_imessage",
        appearance: "light",
        installedApps: ["app_imessage"],
        os: {
          time: baseTime,
          battery: 74,
          network: "5G",
        },
      })
      .background({
        type: "gradient",
        gradient:
          "radial-gradient(circle at 8% 19%, rgba(255,112,79,.18), transparent 34%), radial-gradient(circle at 90% 76%, rgba(74,54,90,.17), transparent 38%), radial-gradient(circle at 74% 18%, rgba(25,126,135,.09), transparent 32%), linear-gradient(158deg, #fff9f3 0%, #f8f0e9 54%, #f3e8e4 100%)",
        opacity: 1,
      })
      .cinematics(calendarInviteCamera)
      .imessage("phone", "calendar_room", (imessage) => {
        imessage.at("0s").createConversation({
          id: "calendar_room",
          title: "Friday Review",
          transport: "imessage",
          isGroup: true,
          participants: [
            { id: "me", name: "Coral", isMe: true },
            { id: "teal", name: "Teal" },
            { id: "violet", name: "Violet" },
          ],
        });
        imessage.at("0.08s").openConversation("calendar_room");

        imessage
          .at("3s")
          .receive("Violet", "Why did Teal get that?", {
            messageId: "calendar_violet_why",
          });
        imessage.at("5.2s").send("I didn’t add her.", {
          messageId: "calendar_coral_denial",
        });
        imessage
          .at("7.4s")
          .receive("Teal", "Looking forward to the feedback.", {
            messageId: "calendar_teal_feedback",
          });
        imessage.at("9.7s").send("I can explain.", {
          messageId: "calendar_coral_explain",
        });

        imessage.at("10.8s").typing("Teal", true);
        imessage.at("12.15s").typing("Teal", false);
        imessage.at("12.15s").receiveMedia(
          "Teal",
          [
            {
              kind: "calendar",
              title: "Discuss Coral’s attention to detail",
              startDate: "2026-07-31T15:00:00.000Z",
              endDate: "2026-07-31T15:30:00.000Z",
              location: "Review Room",
            },
          ],
          { messageId: "calendar_teal_counter_invite" },
        );

        imessage.at("15s").typing("Violet", true);
        imessage.at("16.6s").typing("Violet", false);
        imessage.at("17.15s").typing("Violet", true);
        imessage.at("18.1s").typing("Violet", false);
        imessage.at("18.2s").receive("Violet", "Accepted.", {
          messageId: "calendar_violet_accepted",
        });
        imessage.at("20.8s").receive("Teal", "See you Friday.", {
          messageId: "calendar_teal_friday",
        });
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("0.35s").deliver({
          id: "calendar-teal-accepted",
          appId: "system_calendar",
          content: {
            title: "Calendar",
            subtitle: "Teal accepted",
            body: "Discuss Teal’s performance",
          },
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "calendar-review",
          groupId: "calendar-review",
        });
        notifications.at("2.55s").dismiss("calendar-teal-accepted");
      })
      .voice(calendarVoice, (voice) => {
        voice.at("3.02s").play("violet-why", { volume: 0.82 });
        voice.at("5.2s").play("coral-denial", { volume: 0.94 });
        voice.at("7.4s").play("teal-looking-forward", { volume: 0.86 });
        voice.at("9.7s").play("coral-explain", { volume: 0.92 });
        voice.at("18.18s").play("violet-accepted", { volume: 0.88 });
        voice.at("20.8s").play("teal-friday", { volume: 0.86 });
      })
      .overlay((overlay) => {
        overlay.span("0s", "5.2s").performer(
          "/performers/calendar-invite-cast/coral/neutral.png",
          {
            lane: "coral",
            xPct: 0.86,
            yPct: 0.66,
            intensity: 0.18,
          },
        );
        overlay.span("5.2s", "16s").performer(
          "/performers/calendar-invite-cast/coral/panic.png",
          {
            lane: "coral",
            xPct: 0.86,
            yPct: 0.66,
            intensity: 0.18,
          },
        );
        overlay.span("16s", "24s").performer(
          "/performers/calendar-invite-cast/coral/panic.png",
          {
            lane: "coral",
            xPct: 0.5,
            yPct: 0.8,
            intensity: 0.04,
          },
        );

        overlay.span("3s", "7.4s").performer(
          "/performers/calendar-invite-cast/teal/observing.png",
          {
            lane: "teal",
            xPct: 0.14,
            yPct: 0.66,
            intensity: 0.2,
          },
        );
        overlay.span("7.4s", "24s").performer(
          "/performers/calendar-invite-cast/teal/peek.png",
          {
            lane: "teal",
            xPct: 0.14,
            yPct: 0.65,
            intensity: 0.22,
          },
        );

        overlay.span("14.8s", "18.2s").performer(
          "/performers/calendar-invite-cast/violet/composed.png",
          {
            lane: "violet",
            xPct: 0.86,
            yPct: 0.65,
            intensity: 0.2,
          },
        );
        overlay.span("18.2s", "24s").performer(
          "/performers/calendar-invite-cast/violet/accept.png",
          {
            lane: "violet",
            xPct: 0.86,
            yPct: 0.64,
            intensity: 0.22,
          },
        );
      })
      .audio((audio) => {
        audio.span("0s", "24s").bgm("/music/ambient-track.mp3", {
          volume: 0.055,
          fadeIn: "1.4s",
          fadeOut: "1.6s",
        });
      })
      .build(),
});
