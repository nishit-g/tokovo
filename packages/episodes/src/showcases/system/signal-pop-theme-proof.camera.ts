import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 720;
const OUTPUT = "portrait-main";
const WHATSAPP_DEVICE = "signal_whatsapp";
const X_DEVICE = "signal_x";

const whatsapp = cameraSubject.scope(WHATSAPP_DEVICE, "app_whatsapp");
const x = cameraSubject.scope(X_DEVICE, "app_x");
const duo = cameraSubject.group(whatsapp.body, x.body);

const direction = {
  plans: [{ id: "signal-pop", default: true }],
  look: {
    lenses: {
      "tableau-wide": {
        model: "wide-angle-barrel",
        center: [0.5, 0.49],
        strength: 0.028,
        radius: 1.24,
        cropCompensation: 1.012,
      },
      "keyboard-energy": {
        model: "fisheye",
        center: [0.34, 0.74],
        strength: 0.038,
        radius: 1.22,
        cropCompensation: 1.017,
      },
    },
    modifiers: {
      "quiet-breath": {
        model: "lens-breathing",
        amount: 0.002,
        periodFrames: 180,
      },
    },
    filters: {
      "signal-balanced": {
        model: "color-grade",
        brightness: -0.008,
        contrast: 1.075,
        saturation: 1.04,
        gamma: 0.998,
        temperature: 0.015,
        tint: 0.008,
      },
      "teal-focus": {
        model: "color-grade",
        brightness: -0.004,
        contrast: 1.08,
        saturation: 1.06,
        gamma: 1,
        temperature: -0.025,
        tint: 0.005,
      },
      "violet-focus": {
        model: "color-grade",
        brightness: -0.012,
        contrast: 1.09,
        saturation: 1.03,
        gamma: 0.995,
        temperature: 0.018,
        tint: 0.024,
      },
    },
  },
  framings: {
    duo: {
      position: [0.5, 0.5],
      fill: 0.88,
      mode: "contain",
      padding: 48,
      min: 0.4,
      max: 1.05,
    },
    whatsappMessage: {
      position: [0.42, 0.54],
      fill: 0.6,
      mode: "width",
      padding: 34,
      min: 0.46,
      max: 1.3,
    },
    whatsappKeyboard: {
      position: [0.42, 0.73],
      fill: 0.78,
      mode: "width",
      padding: 28,
      min: 0.5,
      max: 1.25,
    },
    xPost: {
      position: [0.58, 0.48],
      fill: 0.66,
      mode: "width",
      padding: 34,
      min: 0.46,
      max: 1.34,
    },
    xNotification: {
      position: [0.5, 0.2],
      fill: 0.5,
      mode: "width",
      padding: 28,
      min: 0.48,
      max: 1.8,
    },
  },
  outputs: [
    {
      id: OUTPUT,
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      coveragePolicy: "require-shots",
      compositionProfileId: "duo-balanced",
      travel: {
        mode: "stabilized",
        subject: duo,
        maxDriftPx: [42, 58],
      },
      defaultRig: {
        id: "signal-tableau",
        subject: duo,
        frame: { fill: 0.88, padding: 48, min: 0.4, max: 1.05 },
        framingGuard: {
          subject: duo,
          paddingPx: 48,
          screenPosition: [0.5, 0.5],
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
        filters: ["signal-balanced"],
      },
      shots: [
        shot("bold-world-native-apps", 90, duo)
          .frame("duo")
          .lens("tableau-wide")
          .dollyIn(30, { amount: 0.035 }),
        shot("whatsapp-signal-arrives", 120, whatsapp.entity("message", "signal_brief", "bubble"))
          .frame("whatsappMessage")
          .fallback(whatsapp.semantic("last-message"))
          .filters("teal-focus")
          .dollyIn(24, { amount: 0.05 }),
        shot("keyboard-breathes", 135, whatsapp.keyboard)
          .frame("whatsappKeyboard")
          .fallback(whatsapp.semantic("input_area"))
          .filters("teal-focus")
          .lens("keyboard-energy")
          .settle(18),
        shot("x-keeps-its-identity", 150, x.entity("tweet", "x_signal_post", "card"))
          .frame("xPost")
          .fallback(x.screen)
          .filters("violet-focus")
          .truckRight(24, 0.012),
        shot("notification-has-depth", 105, x.device("notification.banner"))
          .frame("xNotification")
          .fallback(x.body)
          .filters("violet-focus")
          .dollyIn(18, { amount: 0.045 }),
        shot("one-system-final-tableau", 120, duo)
          .frame("duo")
          .lens("tableau-wide")
          .filters("signal-balanced")
          .dollyOut(30, { amount: 0.04 }),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const signalPopThemeProofCamera = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1080,
      height: 1920,
      devices: [
        {
          deviceId: WHATSAPP_DEVICE,
          x: 70,
          y: 510,
          width: 400,
          height: 846,
          zIndex: 10,
        },
        {
          deviceId: X_DEVICE,
          x: 610,
          y: 510,
          width: 400,
          height: 846,
          zIndex: 10,
        },
      ],
    },
  },
  (cinema) => {
    cinema.planFamily(direction);
  },
);
