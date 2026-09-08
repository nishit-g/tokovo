import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 720;
const OUTPUT = "portrait-main";
const DEVICE = "phone";

const imessage = cameraSubject.scope(DEVICE, "app_imessage");
const latestMessage = imessage.semantic("imessage_last_message");

const direction = {
  plans: [{ id: "calendar-story", default: true }],
  look: {
    modifiers: {
      "quiet-breath": {
        model: "lens-breathing",
        amount: 0.0009,
        periodFrames: 260,
      },
      "held-breath": {
        model: "lens-breathing",
        amount: 0.00035,
        periodFrames: 360,
      },
    },
    filters: {
      "warm-ivory": {
        model: "color-grade",
        brightness: 0.012,
        contrast: 1.035,
        saturation: 1.01,
        gamma: 1.006,
        temperature: 0.026,
        tint: 0.004,
      },
      "coral-exposure": {
        model: "color-grade",
        brightness: 0.004,
        contrast: 1.055,
        saturation: 1.035,
        gamma: 1,
        temperature: 0.018,
        tint: 0.008,
      },
      "teal-control": {
        model: "color-grade",
        brightness: 0,
        contrast: 1.06,
        saturation: 1.02,
        gamma: 0.998,
        temperature: -0.016,
        tint: 0.002,
      },
      "violet-verdict": {
        model: "color-grade",
        brightness: -0.004,
        contrast: 1.07,
        saturation: 1.02,
        gamma: 0.998,
        temperature: 0.006,
        tint: 0.022,
      },
    },
  },
  framings: {
    tableau: {
      position: [0.5, 0.43],
      fill: 0.76,
      mode: "contain",
      padding: 42,
      min: 0.5,
      max: 1.05,
    },
    conversation: {
      position: [0.5, 0.48],
      fill: 0.62,
      mode: "width",
      padding: 36,
      min: 0.5,
      max: 1.28,
    },
    invite: {
      position: [0.5, 0.57],
      fill: 0.68,
      mode: "width",
      padding: 32,
      min: 0.52,
      max: 1.34,
    },
    verdict: {
      position: [0.5, 0.54],
      fill: 0.61,
      mode: "width",
      padding: 34,
      min: 0.5,
      max: 1.3,
    },
  },
  outputs: [
    {
      id: OUTPUT,
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      coveragePolicy: "require-shots",
      compositionProfileId: "hero-device",
      travel: {
        mode: "stabilized",
        subject: imessage.body,
        maxDriftPx: [30, 44],
      },
      defaultRig: {
        id: "calendar-tableau",
        subject: imessage.body,
        frame: { fill: 0.76, padding: 42, min: 0.5, max: 1.05 },
        framingGuard: {
          subject: imessage.body,
          paddingPx: 42,
          screenPosition: [0.5, 0.43],
        },
        modifierIds: ["quiet-breath"],
        motion: { type: "minimum-jerk", durationFrames: 24 },
      },
    },
  ],
  sequences: [
    {
      outputId: OUTPUT,
      end: DURATION,
      defaults: { filters: ["warm-ivory"] },
      shots: [
        shot("calendar-notification", 90, imessage.body)
          .frame("tableau")
          .dollyIn(30, { amount: 0.018 }),
        shot("violet-calls-it-out", 90, latestMessage)
          .frame("conversation")
          .fallback(imessage.body)
          .filters("coral-exposure")
          .settle(20),
        shot("teal-takes-control", 120, latestMessage)
          .frame("conversation")
          .fallback(imessage.body)
          .filters("teal-control")
          .truckLeft(24, 0.008),
        shot("counter-invite", 150, latestMessage)
          .frame("invite")
          .fallback(imessage.semantic("imessage_thread"))
          .filters("teal-control")
          .dollyIn(50, { amount: 0.03 }),
        shot("violet-is-typing", 120, latestMessage)
          .frame("invite")
          .fallback(imessage.body)
          .filters("violet-verdict")
          .modifiers("held-breath")
          .settle(28),
        shot("accepted", 150, latestMessage)
          .frame("verdict")
          .fallback(imessage.body)
          .filters("violet-verdict")
          .dollyOut(30, { amount: 0.025 }),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const calendarInviteCamera = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1080,
      height: 1920,
      devices: [
        {
          deviceId: DEVICE,
          x: 210,
          y: 170,
          width: 660,
          height: 1413,
          zIndex: 10,
        },
      ],
    },
  },
  (cinema) => {
    cinema.planFamily(direction);
  },
);
