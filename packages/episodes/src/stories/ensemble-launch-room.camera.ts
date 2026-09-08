import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 780;
const OUTPUT = "portrait-main";
const DEVICE = "phone";

const whatsapp = cameraSubject.scope(DEVICE, "app_whatsapp");

const direction = {
  plans: [{ id: "ensemble", default: true }],
  look: {
    lenses: {
      "ensemble-wide": {
        model: "wide-angle-barrel",
        center: [0.5, 0.42],
        strength: 0.018,
        radius: 1.22,
        cropCompensation: 1.008,
      },
      "confession-close": {
        model: "fisheye",
        center: [0.5, 0.62],
        strength: 0.024,
        radius: 1.18,
        cropCompensation: 1.01,
      },
    },
    modifiers: {
      "quiet-breath": {
        model: "lens-breathing",
        amount: 0.0018,
        periodFrames: 210,
      },
      "held-breath": {
        model: "lens-breathing",
        amount: 0.0007,
        periodFrames: 300,
      },
    },
    filters: {
      "ensemble-neutral": {
        model: "color-grade",
        brightness: -0.006,
        contrast: 1.065,
        saturation: 1.035,
        gamma: 1,
        temperature: 0.01,
        tint: 0.006,
      },
      "teal-control": {
        model: "color-grade",
        brightness: -0.01,
        contrast: 1.08,
        saturation: 1.02,
        gamma: 0.996,
        temperature: -0.025,
        tint: 0.002,
      },
      "mint-panic": {
        model: "color-grade",
        brightness: -0.004,
        contrast: 1.085,
        saturation: 1.055,
        gamma: 0.998,
        temperature: -0.018,
        tint: 0.018,
      },
      "violet-power": {
        model: "color-grade",
        brightness: -0.012,
        contrast: 1.09,
        saturation: 1.025,
        gamma: 0.994,
        temperature: 0.008,
        tint: 0.026,
      },
      "payoff-warm": {
        model: "color-grade",
        brightness: -0.002,
        contrast: 1.07,
        saturation: 1.045,
        gamma: 1.002,
        temperature: 0.035,
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
    accusation: {
      position: [0.5, 0.39],
      fill: 0.56,
      mode: "width",
      padding: 42,
      min: 0.46,
      max: 1.35,
    },
    keyboard: {
      position: [0.5, 0.63],
      fill: 0.7,
      mode: "width",
      padding: 32,
      min: 0.5,
      max: 1.28,
    },
    powerQuestion: {
      position: [0.5, 0.42],
      fill: 0.5,
      mode: "width",
      padding: 42,
      min: 0.48,
      max: 1.42,
    },
    heldBreath: {
      position: [0.5, 0.5],
      fill: 0.65,
      mode: "width",
      padding: 36,
      min: 0.45,
      max: 1.22,
    },
    payoff: {
      position: [0.5, 0.43],
      fill: 0.56,
      mode: "width",
      padding: 40,
      min: 0.46,
      max: 1.38,
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
        maxDriftPx: [38, 54],
      },
      defaultRig: {
        id: "ensemble-tableau",
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
        filters: ["ensemble-neutral"],
      },
      shots: [
        shot("three-person-tableau", 90, whatsapp.body)
          .frame("tableau")
          .lens("ensemble-wide")
          .dollyIn(30, { amount: 0.025 }),
        shot(
          "teal-spots-legal",
          120,
          whatsapp.entity("message", "ensemble_teal_legal", "bubble"),
        )
          .frame("accusation")
          .fallback(whatsapp.semantic("last-message"))
          .filters("teal-control")
          .truckRight(24, 0.01),
        shot("mint-types-confession", 120, whatsapp.keyboard)
          .frame("keyboard")
          .fallback(whatsapp.semantic("input_area"))
          .filters("mint-panic")
          .lens("confession-close")
          .dollyIn(30, { amount: 0.045 }),
        shot(
          "violet-asks-one-question",
          120,
          whatsapp.entity("message", "ensemble_violet_draft", "bubble"),
        )
          .frame("powerQuestion")
          .fallback(whatsapp.semantic("last-message"))
          .filters("violet-power")
          .settle(24),
        shot("violet-is-typing", 120, whatsapp.semantic("last-message"))
          .frame("heldBreath")
          .fallback(whatsapp.body)
          .filters("violet-power")
          .modifiers("held-breath")
          .dollyIn(90, { amount: 0.02 }),
        shot(
          "engagement-tripled",
          120,
          whatsapp.entity("message", "ensemble_violet_keep", "bubble"),
        )
          .frame("payoff")
          .fallback(whatsapp.semantic("last-message"))
          .filters("payoff-warm")
          .dollyOut(28, { amount: 0.035 }),
        shot(
          "rename-the-file",
          90,
          whatsapp.entity("message", "ensemble_violet_rename", "bubble"),
        )
          .frame("payoff", { fill: 0.48, position: [0.5, 0.45] })
          .fallback(whatsapp.semantic("last-message"))
          .filters("payoff-warm")
          .cut(),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const ensembleLaunchRoomCamera = cinematicProgram(
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
