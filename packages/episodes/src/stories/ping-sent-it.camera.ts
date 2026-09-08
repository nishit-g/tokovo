import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 630;
const OUTPUT = "portrait-main";
const DEVICE = "phone";

const whatsapp = cameraSubject.scope(DEVICE, "app_whatsapp");

const direction = {
  plans: [{ id: "ping-pilot", default: true }],
  look: {
    lenses: {
      "quiet-wide": {
        model: "wide-angle-barrel",
        center: [0.5, 0.43],
        strength: 0.014,
        radius: 1.24,
        cropCompensation: 1.006,
      },
      "social-pressure": {
        model: "fisheye",
        center: [0.5, 0.58],
        strength: 0.019,
        radius: 1.2,
        cropCompensation: 1.008,
      },
    },
    modifiers: {
      "quiet-breath": {
        model: "lens-breathing",
        amount: 0.0014,
        periodFrames: 210,
      },
      "held-breath": {
        model: "lens-breathing",
        amount: 0.0006,
        periodFrames: 300,
      },
    },
    filters: {
      "signal-neutral": {
        model: "color-grade",
        brightness: -0.004,
        contrast: 1.06,
        saturation: 1.035,
        gamma: 1,
        temperature: 0.008,
        tint: 0.006,
      },
      "exposure-cold": {
        model: "color-grade",
        brightness: -0.009,
        contrast: 1.085,
        saturation: 1.025,
        gamma: 0.997,
        temperature: -0.025,
        tint: 0.012,
      },
      "authority-warm": {
        model: "color-grade",
        brightness: -0.003,
        contrast: 1.075,
        saturation: 1.04,
        gamma: 1.001,
        temperature: 0.032,
        tint: 0.014,
      },
    },
  },
  framings: {
    tableau: {
      position: [0.5, 0.38],
      fill: 0.7,
      mode: "contain",
      padding: 52,
      min: 0.42,
      max: 1.05,
    },
    message: {
      position: [0.5, 0.43],
      fill: 0.56,
      mode: "width",
      padding: 40,
      min: 0.46,
      max: 1.38,
    },
    keyboard: {
      position: [0.5, 0.64],
      fill: 0.7,
      mode: "width",
      padding: 32,
      min: 0.5,
      max: 1.28,
    },
    verdict: {
      position: [0.5, 0.46],
      fill: 0.49,
      mode: "width",
      padding: 42,
      min: 0.48,
      max: 1.42,
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
        subject: whatsapp.body,
        maxDriftPx: [36, 52],
      },
      defaultRig: {
        id: "ping-tableau",
        subject: whatsapp.body,
        frame: { fill: 0.7, padding: 52, min: 0.42, max: 1.05 },
        framingGuard: {
          subject: whatsapp.body,
          paddingPx: 52,
          screenPosition: [0.5, 0.38],
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
      defaults: {
        filters: ["signal-neutral"],
      },
      shots: [
        shot("already-delivered", 90, whatsapp.body)
          .frame("tableau")
          .lens("quiet-wide")
          .dollyIn(30, { amount: 0.024 }),
        shot("teal-asks-where", 90, whatsapp.entity("message", "ping_teal_where", "bubble"))
          .frame("message")
          .fallback(whatsapp.semantic("last-message"))
          .truckRight(24, 0.008),
        shot("ping-types-room", 90, whatsapp.keyboard)
          .frame("keyboard")
          .fallback(whatsapp.semantic("input_area"))
          .lens("social-pressure")
          .dollyIn(28, { amount: 0.032 }),
        shot("two-thousand-people", 90, whatsapp.entity("message", "ping_teal_scale", "bubble"))
          .frame("message")
          .fallback(whatsapp.semantic("last-message"))
          .filters("exposure-cold")
          .settle(24),
        shot("violet-says-good", 60, whatsapp.entity("message", "ping_violet_good", "bubble"))
          .frame("verdict")
          .fallback(whatsapp.semantic("last-message"))
          .filters("authority-warm")
          .modifiers("held-breath")
          .cut(),
        shot(
          "violet-corrected-file",
          90,
          whatsapp.entity("message", "ping_violet_corrected", "bubble"),
        )
          .frame("message")
          .fallback(whatsapp.semantic("last-message"))
          .filters("authority-warm")
          .dollyOut(24, { amount: 0.022 }),
        shot("ping-types-again", 60, whatsapp.keyboard)
          .frame("keyboard")
          .fallback(whatsapp.semantic("input_area"))
          .dollyIn(24, { amount: 0.024 }),
        shot("teal-asks-again", 60, whatsapp.entity("message", "ping_teal_where_again", "bubble"))
          .frame("verdict", { fill: 0.46, position: [0.5, 0.47] })
          .fallback(whatsapp.semantic("last-message"))
          .filters("exposure-cold")
          .cut(),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const pingSentItCamera = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1080,
      height: 1920,
      devices: [
        {
          deviceId: DEVICE,
          x: 270,
          y: 190,
          width: 540,
          height: 1143,
          zIndex: 10,
        },
      ],
    },
  },
  (cinema) => {
    cinema.planFamily(direction);
  },
);
