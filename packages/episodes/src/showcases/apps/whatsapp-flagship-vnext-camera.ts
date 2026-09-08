import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 1320;
const OUTPUT = "portrait-main";
const DEVICE = "phone";
const phone = cameraSubject.scope(DEVICE, "app_whatsapp");
const EXPRESSIVE = "whatsapp-expressive-lenses";

const direction = {
  plans: [
    { id: "whatsapp-editorial", default: true },
    {
      id: EXPRESSIVE,
      look: {
        lenses: {
          "subtle-barrel": {
            model: "wide-angle-barrel",
            center: [0.5, 0.32],
            strength: 0.12,
            radius: 1.1,
            cropCompensation: 1.04,
          },
          "typing-fisheye": {
            model: "fisheye",
            center: [0.5, 0.64],
            strength: 0.1,
            radius: 1.15,
            cropCompensation: 1.04,
          },
          perspective: {
            model: "perspective-tilt",
            tiltXDeg: 3.5,
            tiltYDeg: -2.5,
            perspectivePx: 1800,
            cropCompensation: 1.025,
          },
          "edge-stretch": {
            model: "anamorphic-edge-stretch",
            axis: "horizontal",
            strength: 0.12,
            edgeStart: 0.72,
            cropCompensation: 1.035,
          },
          "directional-smear": {
            model: "directional-smear",
            direction: [-1, 0.12],
            spreadPx: 28,
            samples: 6,
            decay: 0.68,
          },
        },
        modifiers: {
          breathing: {
            model: "lens-breathing",
            amount: 0.006,
            periodFrames: 180,
          },
        },
      },
      defaultRigs: {
        [OUTPUT]: { modifierIds: ["breathing"] },
      },
    },
  ],
  framings: {
    header: {
      position: [0.5, 0.23],
      fill: 0.72,
      mode: "width",
      padding: 24,
      min: 0.52,
      max: 0.88,
    },
    message: {
      position: [0.5, 0.64],
      fill: 0.67,
      mode: "width",
      padding: 36,
      min: 0.62,
      max: 1.4,
    },
    keyboard: {
      position: [0.5, 0.7],
      fill: 0.78,
      mode: "width",
      padding: 22,
      min: 0.55,
      max: 0.82,
    },
    screen: {
      position: [0.5, 0.5],
      fill: 0.89,
      mode: "contain",
      padding: 12,
      min: 0.5,
      max: 0.76,
    },
  },
  outputs: [
    {
      id: OUTPUT,
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      compositionProfileId: "hero-device",
      editorialInsets: { top: 56, right: 48, bottom: 56, left: 48 },
      travel: {
        mode: "stabilized",
        subject: phone.body,
        maxDriftPx: [54, 72],
      },
      defaultRig: {
        id: "device-master",
        subject: phone.body,
        frame: {
          fill: 0.84,
          padding: 24,
          min: 0.45,
          max: 0.72,
        },
        motion: { type: "minimum-jerk", durationFrames: 18 },
      },
    },
  ],
  sequences: [
    {
      outputId: OUTPUT,
      end: DURATION,
      shots: [
        shot("enter-conversation", 30, phone.semantic("header"))
          .at(60)
          .frame("header")
          .fallback(phone.screen)
          .ease(16)
          .blend(14)
          .when(EXPRESSIVE, { lens: "subtle-barrel" }),
        shot("first-chat-run", 225, phone.semantic("last-message"))
          .at(90)
          .frame("message")
          .fallback(phone.screen)
          .settle(18)
          .blend(14)
          .when(EXPRESSIVE, { lens: "typing-fisheye" }),
        shot("first-real-keyboard", 78, phone.keyboard)
          .at(66)
          .frame("keyboard")
          .fallback(phone.semantic("input_area"))
          .settle(14)
          .blend(14)
          .priority(20)
          .when(EXPRESSIVE, { lens: "edge-stretch" }),
        shot("updates-and-calls", 249, phone.screen)
          .at(315)
          .frame("screen")
          .ease(20)
          .blend(14)
          .when(EXPRESSIVE, { lens: "perspective" }),
        shot("vendor-run", 210, phone.semantic("last-message"))
          .at(564)
          .frame("message")
          .fallback(phone.screen)
          .settle(18)
          .blend(14)
          .when(EXPRESSIVE, { lens: "typing-fisheye" }),
        shot("vendor-real-keyboard", 90, phone.keyboard)
          .at(570)
          .frame("keyboard")
          .fallback(phone.semantic("input_area"))
          .settle(14)
          .blend(14)
          .priority(20)
          .when(EXPRESSIVE, { lens: "edge-stretch" }),
        shot("ops-run", 219, phone.semantic("last-message"))
          .at(825)
          .frame("message")
          .fallback(phone.screen)
          .settle(18)
          .blend(14)
          .when(EXPRESSIVE, { lens: "typing-fisheye" }),
        shot("ops-real-keyboard", 90, phone.keyboard)
          .at(828)
          .frame("keyboard")
          .fallback(phone.semantic("input_area"))
          .settle(14)
          .blend(14)
          .priority(20)
          .when(EXPRESSIVE, { lens: "edge-stretch" }),
        shot("closing-navigation", 276, phone.screen)
          .at(1044)
          .frame("screen")
          .ease(20)
          .blend(14)
          .when(EXPRESSIVE, { lens: "perspective" }),
      ],
    },
    {
      outputId: OUTPUT,
      shots: [
        shot("vendor-whip", 30, phone.screen)
          .at(552)
          .frame("screen")
          .lens("directional-smear")
          .whip("left", 12)
          .blend(14)
          .priority(30)
          .when("whatsapp-editorial", false),
        shot("ops-whip", 30, phone.screen)
          .at(813)
          .frame("screen")
          .lens("directional-smear")
          .whip("left", 12)
          .blend(14)
          .priority(30)
          .when("whatsapp-editorial", false),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const whatsappFlagshipCinematics = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1350,
      height: 2856,
      devices: [{ deviceId: DEVICE, width: 1350, height: 2856 }],
    },
  },
  (cinema) => {
    cinema.planFamily(direction);
  },
);
